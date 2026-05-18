import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ApiRequest, ApiEndpoint } from '@/models';
import { checkEndpointAuth } from '@/lib/api-auth';
import { rateLimiter, generateRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limiter';
import { executeCode } from '@/lib/code-executor';
import { getAllGlobalHeaders, getAllGlobalHeadersFallback } from '@/lib/global-headers';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // force turbopack rebuild

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max per file
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB total
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv', 'text/html',
  'application/json',
  'application/xml', 'text/xml',
  'application/zip',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'video/mp4', 'video/webm',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
// Block dangerous extensions
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.mjs',
  '.php', '.py', '.rb', '.pl', '.jar', '.dll', '.so', '.dylib',
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await connectDB();
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await connectDB();
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'POST');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await connectDB();
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'PUT');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await connectDB();
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'DELETE');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await connectDB();
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'PATCH');
}

interface FileInfo {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  tempPath: string;
}

async function handleFileUpload(req: NextRequest): Promise<{ params: Record<string, any>; files: FileInfo[]; error?: string }> {
  const files: FileInfo[] = [];
  const params: Record<string, any> = {};
  
  try {
    const formData = await req.formData();
    const tempDir = join(tmpdir(), 'api-uploads', crypto.randomBytes(8).toString('hex'));
    await mkdir(tempDir, { recursive: true });

    let totalSize = 0;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Validate file size
        if (value.size > MAX_FILE_SIZE) {
          return { params, files, error: `File "${value.name}" exceeds max size of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
        }
        
        totalSize += value.size;
        if (totalSize > MAX_TOTAL_SIZE) {
          return { params, files, error: `Total upload size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB` };
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(value.type)) {
          return { params, files, error: `File type "${value.type}" is not allowed` };
        }

        // Validate extension
        const ext = '.' + (value.name.split('.').pop()?.toLowerCase() || '');
        if (BLOCKED_EXTENSIONS.includes(ext)) {
          return { params, files, error: `File extension "${ext}" is blocked for security reasons` };
        }

        // Sanitize filename - remove path traversal and special chars
        const safeName = value.name
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/\.{2,}/g, '.')
          .substring(0, 100);
        
        const tempPath = join(tempDir, `${crypto.randomBytes(8).toString('hex')}_${safeName}`);
        const buffer = Buffer.from(await value.arrayBuffer());
        
        await writeFile(tempPath, buffer);
        
        const fileObj = {
          fieldName: key,
          originalName: value.name,
          mimeType: value.type,
          size: value.size,
          tempPath,
        };
        files.push(fileObj);
        params[key] = fileObj; // Also make it accessible directly!
      } else {
        // Regular form field
        params[key] = value;
      }
    }

    return { params, files };
  } catch (error: any) {
    return { params, files, error: `File upload failed: ${error.message}` };
  }
}

async function cleanupFiles(files: FileInfo[]) {
  for (const file of files) {
    try {
      await unlink(file.tempPath);
    } catch {}
  }
}

async function handleDynamicAPI(
  req: NextRequest,
  params: { path: string[] },
  method: string
) {
  let uploadedFiles: FileInfo[] = [];
  
  try {
    const apiPath = '/' + (params.path?.join('/') || '');
    
    // Find the endpoint in database
    const endpoint = await ApiEndpoint.findOne({
        path: apiPath,
        method: method,
        enabled: true,
        status: 'approved',
      });

    if (!endpoint) {
      return NextResponse.json(
        { error: 'API endpoint not found or not enabled' },
        { status: 404 }
      );
    }

    // Check authentication if required
    const authResult = await checkEndpointAuth(endpoint, req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const rateLimitIdentifier = authResult.apiKey?.id || 
      req.headers.get('x-forwarded-for') || 
      req.headers.get('x-real-ip') || 
      'unknown';
    
    const rateLimitKey = generateRateLimitKey(rateLimitIdentifier, apiPath);
    const rateLimitResult = rateLimiter.check(rateLimitKey, endpoint.rateLimit || 100, 60000);
    
    if (!rateLimitResult.allowed) {
      const headers = getRateLimitHeaders(
        endpoint.rateLimit || 100,
        rateLimitResult.remaining,
        rateLimitResult.resetTime
      );
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${new Date(rateLimitResult.resetTime).toISOString()}`
        },
        { 
          status: 429,
          headers 
        }
      );
    }

    // Parse request parameters
    const { searchParams } = new URL(req.url);
    const queryParams: any = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    let bodyParams: Record<string, any> = {};
    let fileParams: FileInfo[] = [];

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Handle file upload
        const uploadResult = await handleFileUpload(req);
        
        if (uploadResult.error) {
          return NextResponse.json(
            { error: uploadResult.error },
            { status: 400 }
          );
        }
        
        bodyParams = uploadResult.params;
        fileParams = uploadResult.files;
        uploadedFiles = fileParams;
      } else {
        // Handle JSON body
        try {
          bodyParams = await req.json();
        } catch (e) {
          // No body or invalid JSON
        }
      }
    }

    const requestParams: Record<string, any> = {
      ...queryParams,
      ...bodyParams,
    };

    // Add file info to params so scripts can access them
    if (fileParams.length > 0) {
      requestParams._files = fileParams.map(f => ({
        fieldName: f.fieldName,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        path: f.tempPath,
      }));
      // Also update the direct references with 'path' instead of 'tempPath'
      for (const f of fileParams) {
        requestParams[f.fieldName] = {
          ...f,
          name: f.originalName,
          type: f.mimeType,
          path: f.tempPath
        };
      }
    }

    // Inject global headers for the user
    // Priority: 1. Authenticated user, 2. API key owner, 3. Endpoint creator
    let userEmailForHeaders = null;
    
    if (authResult.user?.email) {
      userEmailForHeaders = authResult.user.email;
    } else if (authResult.apiKey?.userId) {
      userEmailForHeaders = authResult.apiKey.userId;
    } else if ((endpoint as any).createdBy) {
      userEmailForHeaders = (endpoint as any).createdBy;
    }
    
    try {
      let globalHeaders: Record<string, Record<string, string>> = {};
      
      if (userEmailForHeaders) {
        globalHeaders = await getAllGlobalHeaders(userEmailForHeaders);
      }
      
      // Fallback: If no headers found or no user specified (public API), get any active headers
      if (Object.keys(globalHeaders).length === 0) {
        globalHeaders = await getAllGlobalHeadersFallback();
      }

      if (Object.keys(globalHeaders).length > 0) {
        requestParams._globalHeaders = globalHeaders;
      }
    } catch (error) {
      console.error('[Execute] Failed to get global headers:', error);
      // Continue without global headers
    }

    // Execute the code based on language
    const executionResult = await executeCode(
      endpoint.language,
      endpoint.code,
      requestParams,
      60000
    );

    // Clean up uploaded files after execution
    await cleanupFiles(uploadedFiles);

    // Log the request
    await ApiRequest.create({
        endpoint: apiPath,
      method: method,
      statusCode: executionResult.success ? 200 : 500,
      responseTime: executionResult.executionTime,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      apiKeyId: authResult.apiKey?.id || undefined,
      userId: authResult.user?.id || undefined,
    });

    // Add rate limit headers to response
    const rateLimitHeaders = getRateLimitHeaders(
      endpoint.rateLimit || 100,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    );

    if (!executionResult.success) {
      return NextResponse.json(
        {
          error: 'Script execution failed',
          details: executionResult.error,
        },
        { 
          status: 500,
          headers: rateLimitHeaders 
        }
      );
    }

    return NextResponse.json(executionResult.output, { headers: rateLimitHeaders });

  } catch (error: any) {
    // Clean up files on error
    await cleanupFiles(uploadedFiles);
    
    console.error('Dynamic API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkEndpointAuth } from '@/lib/api-auth';
import { rateLimiter, generateRateLimitKey, getRateLimitHeaders } from '@/lib/rate-limiter';
import { executeCode } from '@/lib/code-executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'POST');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'PUT');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'DELETE');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleDynamicAPI(req, resolvedParams, 'PATCH');
}

async function handleDynamicAPI(
  req: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const apiPath = '/' + (params.path?.join('/') || '');
    
    // Find the endpoint in database
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: {
        path: apiPath,
        method: method,
        enabled: true,
        status: 'approved',
      },
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

    let bodyParams = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        bodyParams = await req.json();
      } catch (e) {
        // No body or invalid JSON
      }
    }

    const requestParams = {
      ...queryParams,
      ...bodyParams,
    };

    // Execute the code based on language
    const executionResult = await executeCode(
      endpoint.language,
      endpoint.code,
      requestParams,
      30000
    );

    // Log the request
    await prisma.apiRequest.create({
      data: {
        endpoint: apiPath,
        method: method,
        statusCode: executionResult.success ? 200 : 500,
        responseTime: executionResult.executionTime,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || null,
        apiKeyId: authResult.apiKey?.id || null,
        userId: authResult.user?.id || null,
      },
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

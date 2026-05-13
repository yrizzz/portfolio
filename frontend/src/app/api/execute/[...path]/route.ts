import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Rate limiting check (simple implementation)
    // TODO: Implement proper rate limiting with Redis or similar

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

    // Execute the code in a sandboxed environment
    try {
      // Dynamic import of VM2
      const { VM } = await import('vm2');
      
      const vm = new VM({
        timeout: 30000, // 30 seconds timeout
        sandbox: {
          console: console,
          require: require,
          Buffer: Buffer,
          setTimeout: setTimeout,
          setInterval: setInterval,
          clearTimeout: clearTimeout,
          clearInterval: clearInterval,
          params: requestParams, // Pass params through sandbox
        },
      });

      // Wrap the code to make it executable
      const wrappedCode = `
        ${endpoint.code}
        
        // Execute the exported function
        (async () => {
          if (typeof exports.default === 'object' && exports.default.code) {
            return await exports.default.code(params);
          } else if (typeof exports.default === 'function') {
            return await exports.default(params);
          } else if (typeof code === 'function') {
            return await code(params);
          } else {
            throw new Error('No executable function found in script');
          }
        })();
      `;

      const result = await vm.run(wrappedCode);

      // Log the request
      await prisma.apiRequest.create({
        data: {
          endpoint: apiPath,
          method: method,
          statusCode: result?.code || 200,
          responseTime: 0, // TODO: Calculate actual response time
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || null,
        },
      });

      return NextResponse.json(result);

    } catch (execError: any) {
      console.error('Script execution error:', execError);
      
      await prisma.apiRequest.create({
        data: {
          endpoint: apiPath,
          method: method,
          statusCode: 500,
          responseTime: 0,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || null,
        },
      });

      return NextResponse.json(
        {
          error: 'Script execution failed',
          details: execError.message,
        },
        { status: 500 }
      );
    }

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

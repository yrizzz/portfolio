import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ApiEndpoint } from '@/models';

// GET - Generate API documentation data
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json or openapi

    // Fetch all approved and enabled endpoints
    const endpoints = await ApiEndpoint.find({
      status: 'approved',
      enabled: true,
    }).lean();

    if (format === 'openapi') {
      // Generate OpenAPI 3.0 specification
      const openApiSpec = generateOpenAPISpec(endpoints as any);
      return NextResponse.json(openApiSpec);
    }

    // Return simple JSON format
    return NextResponse.json({
      endpoints: endpoints.map((endpoint: any) => ({
        id: endpoint.id || endpoint._id?.toString(),
        name: endpoint.name,
        description: endpoint.description,
        method: endpoint.method,
        path: endpoint.path,
        category: endpoint.category,
        language: endpoint.language,
        requiresAuth: endpoint.requiresAuth,
        rateLimit: endpoint.rateLimit,
        params: endpoint.params,
        exampleCode: endpoint.exampleCode,
      })),
    });
  } catch (error) {
    console.error('Error generating API docs:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}

function generateOpenAPISpec(endpoints: any[]) {
  const paths: Record<string, any> = {};

  endpoints.forEach(endpoint => {
    const fullPath = `/api/execute${endpoint.path}`;
    
    if (!paths[fullPath]) {
      paths[fullPath] = {};
    }

    const method = endpoint.method.toLowerCase();
    
    // Parse parameters
    let parameters: any[] = [];
    let requestBody: any = undefined;
    
    if (endpoint.params) {
      try {
        const params = JSON.parse(endpoint.params);
        
        if (['get', 'delete'].includes(method)) {
          // Query parameters
          parameters = params.map((param: any) => ({
            name: param.name,
            in: 'query',
            required: param.required || false,
            schema: {
              type: param.type || 'string',
            },
            description: param.description || '',
          }));
        } else {
          // Request body
          const properties: Record<string, any> = {};
          const required: string[] = [];
          
          params.forEach((param: any) => {
            properties[param.name] = {
              type: param.type || 'string',
              description: param.description || '',
            };
            if (param.required) {
              required.push(param.name);
            }
          });
          requestBody = {
            required: required.length > 0,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties,
                  required: required.length > 0 ? required : undefined,
                },
              },
            },
          };
        }
      } catch (e) {
        // Invalid JSON params
      }
    }

    // Add authentication if required
    const security = endpoint.requiresAuth ? [{ bearerAuth: [] }] : undefined;

    paths[fullPath][method] = {
      summary: endpoint.name,
      description: endpoint.description || '',
      tags: [endpoint.category || 'default'],
      parameters,
      requestBody,
      security,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized - Invalid or missing API key',
        },
        '429': {
          description: 'Rate limit exceeded',
        },
        '500': {
          description: 'Internal server error',
        },
      },
      'x-rate-limit': endpoint.rateLimit,
      'x-language': endpoint.language,
    };
  });

  return {
    openapi: '3.0.0',
    info: {
      title: 'API Management System',
      version: '1.0.0',
      description: 'Dynamic API endpoints with multi-language support',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'Enter your API key with the "Bearer " prefix',
        },
      },
    },
    paths,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET - List all API endpoints with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only admin can view
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const enabled = searchParams.get('enabled');
    const language = searchParams.get('language');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (enabled !== null) where.enabled = enabled === 'true';
    if (language) where.language = language;

    const endpoints = await prisma.apiEndpoint.findMany({
      where,
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Parse JSON fields
    const endpointsWithParsed = endpoints.map(ep => ({
      ...ep,
      params: ep.params ? JSON.parse(ep.params) : [],
      aiAnalysis: ep.aiAnalysis ? JSON.parse(ep.aiAnalysis) : null,
    }));

    return NextResponse.json({
      success: true,
      endpoints: endpointsWithParsed,
    });
  } catch (error) {
    console.error("Error fetching endpoints:", error);
    return NextResponse.json(
      { error: "Failed to fetch endpoints" },
      { status: 500 }
    );
  }
}

// POST - Create new API endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received body:', body);

    const { 
      name, 
      description, 
      method, 
      path, 
      language, 
      code,
      category,
      params,
      exampleCode,
      requiresAuth, 
      rateLimit,
      enabled
    } = body;

    if (!name || !method || !path) {
      return NextResponse.json(
        { 
          success: false,
          error: "Name, method, and path are required",
          received: { name, method, path }
        },
        { status: 400 }
      );
    }

    // If code is provided, use it. Otherwise generate template
    const finalCode = code || generateApiCode(method, path, language || 'nodejs', name, description, requiresAuth, rateLimit);

    console.log('Creating endpoint with data:', {
      name,
      method,
      path,
      category,
      language,
      hasCode: !!finalCode
    });

    const endpoint = await prisma.apiEndpoint.create({
        name,
        description: description || "",
        method: method.toUpperCase(),
        path,
        category: category || 'custom',
        language: (language || 'nodejs').toLowerCase(),
        rawScript: finalCode,
        code: finalCode,
        params: params ? JSON.stringify(params) : null,
        exampleCode: exampleCode || null,
        enabled: enabled !== undefined ? enabled : true,
        status: 'approved',
        requiresAuth: requiresAuth || false,
        rateLimit: rateLimit || 100,
        order: 0,
        approvedAt: new Date(),
        approvedBy: session.user.email || session.user.name || 'admin',
      }
    });

    console.log('Endpoint created successfully:', endpoint.id);

    return NextResponse.json({
      success: true,
      message: 'API endpoint created successfully',
      endpoint,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating endpoint:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create endpoint",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to generate API code
function generateApiCode(
  method: string,
  path: string,
  language: string,
  name: string,
  description?: string,
  requiresAuth?: boolean,
  rateLimit?: number
): string {
  const methodUpper = method.toUpperCase();
  const methodLower = method.toLowerCase();

  switch (language.toLowerCase()) {
    case 'go':
      return generateGoCode(methodUpper, path, name, description, requiresAuth, rateLimit);
    case 'php':
      return generatePhpCode(methodUpper, path, name, description, requiresAuth, rateLimit);
    case 'nodejs':
      return generateNodeCode(methodUpper, path, name, description, requiresAuth, rateLimit);
    default:
      return `// Unsupported language: ${language}`;
  }
}

function generateGoCode(method: string, path: string, name: string, description?: string, requiresAuth?: boolean, rateLimit?: number): string {
  const funcName = name.replace(/[^a-zA-Z0-9]/g, '');
  const authMiddleware = requiresAuth ? `
// Apply authentication middleware
// router.HandleFunc("${path}", AuthMiddleware(${funcName}Handler)).Methods("${method}")
` : '';

  const rateLimitComment = rateLimit ? `
// Rate Limit: ${rateLimit} requests per minute
// Apply rate limiting middleware before this handler
` : '';

  return `package main

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// ${description || name}
${rateLimitComment}${authMiddleware}
func ${funcName}Handler(w http.ResponseWriter, r *http.Request) {
    ${requiresAuth ? `
    // Get API key from header
    apiKey := r.Header.Get("X-API-Key")
    if apiKey == "" {
        http.Error(w, "API key required", http.StatusUnauthorized)
        return
    }
    
    // TODO: Validate API key
    // if !validateAPIKey(apiKey) {
    //     http.Error(w, "Invalid API key", http.StatusUnauthorized)
    //     return
    // }
    ` : ''}
    
    // TODO: Implement ${method} ${path}
    
    ${method === 'GET' ? `
    // Example: Get data
    data := map[string]interface{}{
        "message": "Success",
        "data": []interface{}{},
    }
    ` : method === 'POST' ? `
    // Parse request body
    var body map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // TODO: Process data
    data := map[string]interface{}{
        "message": "Created successfully",
        "data": body,
    }
    ` : method === 'PUT' || method === 'PATCH' ? `
    // Get ID from URL params
    vars := mux.Vars(r)
    id := vars["id"]
    
    // Parse request body
    var body map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // TODO: Update data with id
    data := map[string]interface{}{
        "message": "Updated successfully",
        "id": id,
        "data": body,
    }
    ` : `
    // Get ID from URL params
    vars := mux.Vars(r)
    id := vars["id"]
    
    // TODO: Delete data with id
    data := map[string]interface{}{
        "message": "Deleted successfully",
        "id": id,
    }
    `}
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

// Register route${requiresAuth ? ' with auth middleware' : ''}
// router.HandleFunc("${path}", ${requiresAuth ? 'AuthMiddleware(' : ''}${funcName}Handler${requiresAuth ? ')' : ''}).Methods("${method}")
`;
}

function generatePhpCode(method: string, path: string, name: string, description?: string, requiresAuth?: boolean, rateLimit?: number): string {
  const funcName = lcfirst(str_replace([' ', '-', '_'], '', ucwords(name, ' -_')));
  const methodLower = method.toLowerCase();
  
  const authComment = requiresAuth ? `
// Authentication required
// Add middleware: Route::middleware('auth')->...
` : '';

  const rateLimitComment = rateLimit ? `
// Rate Limit: ${rateLimit} requests per minute
// Add middleware: Route::middleware('throttle:${rateLimit},1')->...
` : '';

  return `<?php
// ${description || name}
// Route: ${method} ${path}
${authComment}${rateLimitComment}

${method === 'GET' ? `
function ${funcName}() {
    // TODO: Implement GET ${path}
    
    // Example: Get data from database
    // $data = DB::table('your_table')->get();
    
    return response()->json([
        'message' => 'Success',
        'data' => []
    ]);
}
` : method === 'POST' ? `
function ${funcName}() {
    // TODO: Implement POST ${path}
    
    // Get request data
    $data = request()->all();
    
    // Validate data
    // $validator = Validator::make($data, [
    //     'field' => 'required|string',
    // ]);
    
    // TODO: Save to database
    // $result = DB::table('your_table')->insert($data);
    
    return response()->json([
        'message' => 'Created successfully',
        'data' => $data
    ], 201);
}
` : method === 'PUT' || method === 'PATCH' ? `
function ${funcName}($id) {
    // TODO: Implement ${method} ${path}
    
    // Get request data
    $data = request()->all();
    
    // TODO: Update in database
    // $result = DB::table('your_table')
    //     ->where('id', $id)
    //     ->update($data);
    
    return response()->json([
        'message' => 'Updated successfully',
        'id' => $id,
        'data' => $data
    ]);
}
` : `
function ${funcName}($id) {
    // TODO: Implement DELETE ${path}
    
    // TODO: Delete from database
    // $result = DB::table('your_table')
    //     ->where('id', $id)
    //     ->delete();
    
    return response()->json([
        'message' => 'Deleted successfully',
        'id' => $id
    ]);
}
`}

// Laravel Route Registration:
// Route::${methodLower}('${path}', '${funcName}');
?>
`;
}

function generateNodeCode(method: string, path: string, name: string, description?: string, requiresAuth?: boolean, rateLimit?: number): string {
  const funcName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const methodLower = method.toLowerCase();
  
  const authComment = requiresAuth ? `
// Authentication required
// Add middleware: app.use(authMiddleware)
` : '';

  const rateLimitComment = rateLimit ? `
// Rate Limit: ${rateLimit} requests per minute
// Add middleware: app.use(rateLimiter({ max: ${rateLimit}, windowMs: 60000 }))
` : '';

  return `// ${description || name}
// Route: ${method} ${path}
${authComment}${rateLimitComment}

${method === 'GET' ? `
async function ${funcName}(req, res) {
  try {
    // TODO: Implement GET ${path}
    
    // Example: Get data from database
    // const data = await db.collection('your_collection').find().toArray();
    
    res.json({
      message: 'Success',
      data: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
` : method === 'POST' ? `
async function ${funcName}(req, res) {
  try {
    // TODO: Implement POST ${path}
    
    const data = req.body;
    
    // Validate data
    // if (!data.field) {
    //   return res.status(400).json({ error: 'Field is required' });
    // }
    
    // TODO: Save to database
    // const result = await db.collection('your_collection').insertOne(data);
    
    res.status(201).json({
      message: 'Created successfully',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
` : method === 'PUT' || method === 'PATCH' ? `
async function ${funcName}(req, res) {
  try {
    // TODO: Implement ${method} ${path}
    
    const { id } = req.params;
    const data = req.body;
    
    // TODO: Update in database
    // const result = await db.collection('your_collection')
    //   .updateOne({ _id: id }, { $set: data });
    
    res.json({
      message: 'Updated successfully',
      id: id,
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
` : `
async function ${funcName}(req, res) {
  try {
    // TODO: Implement DELETE ${path}
    
    const { id } = req.params;
    
    // TODO: Delete from database
    // const result = await db.collection('your_collection')
    //   .deleteOne({ _id: id });
    
    res.json({
      message: 'Deleted successfully',
      id: id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
`}

// Express Route Registration:
// app.${methodLower}('${path}', ${funcName});

module.exports = { ${funcName} };
`;
}

// Helper functions for PHP
function ucwords(str: string, delimiters: string): string {
  return str.split(new RegExp(`[${delimiters}]`)).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function lcfirst(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function str_replace(search: string[], replace: string, subject: string): string {
  let result = subject;
  search.forEach(s => {
    result = result.split(s).join(replace);
  });
  return result;
}

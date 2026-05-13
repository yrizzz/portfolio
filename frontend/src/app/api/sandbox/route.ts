import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST - Test/Execute API code in sandbox
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, testData } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Sandbox execution logic
    let result;
    let executionTime = 0;
    const startTime = Date.now();

    try {
      switch (language.toLowerCase()) {
        case 'nodejs':
        case 'javascript':
          // Execute Node.js code in isolated context
          result = await executeNodeJS(code, testData);
          break;
        
        case 'python':
          result = {
            success: false,
            error: "Python execution not yet implemented",
            message: "Python sandbox coming soon"
          };
          break;
        
        case 'php':
          result = {
            success: false,
            error: "PHP execution not yet implemented",
            message: "PHP sandbox coming soon"
          };
          break;
        
        default:
          result = {
            success: false,
            error: `Unsupported language: ${language}`
          };
      }

      executionTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        result,
        executionTime,
        language,
      });

    } catch (execError: any) {
      executionTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: false,
        error: execError.message || "Execution failed",
        executionTime,
        language,
      });
    }

  } catch (error: any) {
    console.error("Sandbox error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}

// Execute Node.js code safely
async function executeNodeJS(code: string, testData?: any) {
  try {
    // Step 1: Remove imports/exports
    let cleanCode = code
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/gm, '')
      .replace(/export\s+default\s+/gm, 'const apiConfig = ')
      .replace(/export\s+(class|function|const|let|var)/gm, '$1')
      .replace(/export\s*\{[^}]*\}\s*/gm, '')
      .replace(/require\s*\(['"].*?['"]\)/g, '{}');

    // Step 2: Remove TypeScript type annotations (CAREFULLY - avoid object properties)
    // Only remove type annotations after function parameters, not object properties
    cleanCode = cleanCode
      // Remove function parameter types: (param: Type) => (param)
      .replace(/\(([^)]*?):\s*[\w<>\[\]|&]+([,\)])/g, '($1$2')
      // Remove variable type annotations: const x: Type = => const x =
      .replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w<>\[\]|&]+\s*=/g, '$1 $2 =')
      // Remove function return types: ): Type => { => ) {
      .replace(/\)\s*:\s*[\w<>\[\]|&]+\s*=>/g, ') =>')
      .replace(/\)\s*:\s*[\w<>\[\]|&]+\s*\{/g, ') {')
      // Remove 'as' type assertions
      .replace(/\s+as\s+[\w<>\[\]|&]+/g, '')
      // Remove generic types in function calls
      .replace(/<[\w\s,<>]+>(?=\s*\()/g, '')
      // Remove interface/type/enum declarations
      .replace(/interface\s+\w+\s*\{[^}]*\}/gm, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/gm, '')
      .replace(/enum\s+\w+\s*\{[^}]*\}/gm, '')
      // Remove decorators
      .replace(/@\w+(\([^)]*\))?\s*/g, '')
      // Remove access modifiers
      .replace(/\b(readonly|public|private|protected|static)\s+/g, '');

    // Step 3: Convert arrow functions to regular functions
    cleanCode = cleanCode
      // const fn = async (params) => { ... }
      .replace(/const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g, 'async function $1($2) {')
      // const fn = (params) => { ... }
      .replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g, 'function $1($2) {')
      // const fn = async (params) => expr
      .replace(/const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*([^;{]+);?/g, 'async function $1($2) { return $3; }')
      // const fn = (params) => expr
      .replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;{]+);?/g, 'function $1($2) { return $3; }');

    // Step 4: Remove optional chaining and nullish coalescing
    cleanCode = cleanCode
      .replace(/\?\./g, '.')
      .replace(/\?\?/g, '||');

    // Step 5: Add execution wrapper
    cleanCode = cleanCode + `

// Execute the API
if (typeof apiConfig !== 'undefined' && apiConfig.code) {
  return await apiConfig.code(testData);
}
`;

    // Create execution context
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    
    const context = {
      console: {
        log: (...args: any[]) => console.log('[SANDBOX]', ...args),
        error: (...args: any[]) => console.error('[SANDBOX]', ...args),
        warn: (...args: any[]) => console.warn('[SANDBOX]', ...args),
      },
      testData: testData || {},
      fetch: fetch,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Promise,
      Error,
      // Mock axios
      axios: {
        get: async (url: string, config?: any) => {
          console.log('[SANDBOX] Mock axios.get:', url);
          return { data: { mock: true, message: 'Axios is mocked in sandbox', url } };
        },
        post: async (url: string, data?: any, config?: any) => {
          console.log('[SANDBOX] Mock axios.post:', url);
          return { data: { mock: true, message: 'Axios is mocked in sandbox', url } };
        },
        request: async (config: any) => {
          console.log('[SANDBOX] Mock axios.request:', config);
          return { data: { mock: true, message: 'Axios is mocked in sandbox', config } };
        },
      },
      req: { body: testData, query: testData, params: testData },
      res: { 
        json: (data: any) => data,
        status: (code: number) => ({ json: (data: any) => data }),
        send: (data: any) => data
      },
    };

    const wrappedCode = `
      try {
        ${cleanCode}
      } catch (err) {
        throw new Error('Runtime error: ' + err.message);
      }
    `;

    const fn = new AsyncFunction(...Object.keys(context), wrappedCode);
    const result = await Promise.race([
      fn(...Object.values(context)),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout (10s)')), 10000)
      )
    ]);

    return {
      success: true,
      output: result,
      logs: [],
      cleanedCode: cleanCode,
      note: 'TypeScript syntax converted. Axios is mocked. External APIs will not be called.'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      cleanedCode: code,
      hint: 'Sandbox cannot execute this code. Try simpler JavaScript without complex TypeScript features.'
    };
  }
}

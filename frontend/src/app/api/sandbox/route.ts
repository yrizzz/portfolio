import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { executeCode } from "@/lib/code-executor";
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/json', 'application/xml',
];

// POST - Test/Execute API code in sandbox
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let code: string;
    let language: string;
    let testData: Record<string, any> = {};
    let files: { fieldName: string; originalName: string; mimeType: string; size: number; path: string }[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload in sandbox
      const formData = await request.formData();
      code = formData.get('code') as string || '';
      language = formData.get('language') as string || 'nodejs';
      
      const testDataStr = formData.get('testData') as string;
      if (testDataStr) {
        try { testData = JSON.parse(testDataStr); } catch {}
      }

      // Process files
      const tempDir = join(tmpdir(), 'api-sandbox-uploads', crypto.randomBytes(8).toString('hex'));
      await mkdir(tempDir, { recursive: true });

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && key !== 'code' && key !== 'language' && key !== 'testData') {
          if (value.size > MAX_FILE_SIZE) {
            return NextResponse.json({ 
              success: false, 
              result: { success: false, error: `File "${value.name}" exceeds 5MB limit` } 
            });
          }
          if (!ALLOWED_MIME_TYPES.includes(value.type)) {
            return NextResponse.json({ 
              success: false, 
              result: { success: false, error: `File type "${value.type}" not allowed` } 
            });
          }

          const safeName = value.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
          const tempPath = join(tempDir, `${crypto.randomBytes(8).toString('hex')}_${safeName}`);
          const buffer = Buffer.from(await value.arrayBuffer());
          await writeFile(tempPath, buffer);

          files.push({
            fieldName: key,
            originalName: value.name,
            mimeType: value.type,
            size: value.size,
            path: tempPath,
          });
        }
      }
    } else {
      // JSON body
      const body = await request.json();
      code = body.code || '';
      language = body.language || 'nodejs';
      testData = body.testData || {};
    }

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Add files to params
    const params: Record<string, any> = { ...testData };
    if (files.length > 0) {
      params._files = files.map(f => ({
        fieldName: f.fieldName,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        path: f.path,
      }));
    }

    // Execute using the same executor as /api/execute
    const startTime = Date.now();
    const result = await executeCode(language, code, params, 60000);
    const executionTime = Date.now() - startTime;

    // Cleanup uploaded files
    for (const file of files) {
      try { await unlink(file.path); } catch {}
    }

    return NextResponse.json({
      success: true,
      result: {
        success: result.success,
        output: result.output,
        error: result.error,
      },
      executionTime,
      language,
    });

  } catch (error: any) {
    console.error("Sandbox error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}

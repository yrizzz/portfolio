import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

const execAsync = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
}

/**
 * Execute Node.js code using VM2 sandbox
 */
export async function executeNodeJS(code: string, params: any, timeout: number = 30000): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  try {
    const { VM } = await import('vm2');
    
    const vm = new VM({
      timeout,
      sandbox: {
        console: console,
        require: require,
        Buffer: Buffer,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        params,
      },
    });

    // Wrap the code to make it executable
    const wrappedCode = `
      ${code}
      
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
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: result,
      executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}

/**
 * Execute PHP code
 */
export async function executePHP(code: string, params: any, timeout: number = 30000): Promise<ExecutionResult> {
  const startTime = Date.now();
  const tempId = crypto.randomBytes(16).toString('hex');
  const tempDir = join(tmpdir(), 'api-php-exec');
  const tempFile = join(tempDir, `script_${tempId}.php`);

  try {
    // Create temp directory if it doesn't exist
    await mkdir(tempDir, { recursive: true });

    // Prepare PHP code with params
    const paramsJson = JSON.stringify(params);
    const phpCode = `<?php
$params = json_decode('${paramsJson.replace(/'/g, "\\'")}', true);

${code}
?>`;

    // Write code to temp file
    await writeFile(tempFile, phpCode);

    // Execute PHP
    const { stdout, stderr } = await execAsync(`php ${tempFile}`, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Clean up
    await unlink(tempFile);

    const executionTime = Date.now() - startTime;

    if (stderr) {
      return {
        success: false,
        error: stderr,
        executionTime,
      };
    }

    // Try to parse JSON output
    let output;
    try {
      output = JSON.parse(stdout);
    } catch {
      output = stdout;
    }

    return {
      success: true,
      output,
      executionTime,
    };
  } catch (error: any) {
    // Clean up on error
    try {
      await unlink(tempFile);
    } catch {}

    const executionTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}

/**
 * Execute Python code
 */
export async function executePython(code: string, params: any, timeout: number = 30000): Promise<ExecutionResult> {
  const startTime = Date.now();
  const tempId = crypto.randomBytes(16).toString('hex');
  const tempDir = join(tmpdir(), 'api-python-exec');
  const tempFile = join(tempDir, `script_${tempId}.py`);

  try {
    // Create temp directory if it doesn't exist
    await mkdir(tempDir, { recursive: true });

    // Prepare Python code with params
    const paramsJson = JSON.stringify(params);
    const pythonCode = `import json
import sys

params = json.loads('''${paramsJson.replace(/'/g, "\\'")}''')

${code}
`;

    // Write code to temp file
    await writeFile(tempFile, pythonCode);

    // Execute Python
    const { stdout, stderr } = await execAsync(`python3 ${tempFile}`, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Clean up
    await unlink(tempFile);

    const executionTime = Date.now() - startTime;

    if (stderr && !stdout) {
      return {
        success: false,
        error: stderr,
        executionTime,
      };
    }

    // Try to parse JSON output
    let output;
    try {
      output = JSON.parse(stdout);
    } catch {
      output = stdout;
    }

    return {
      success: true,
      output,
      executionTime,
    };
  } catch (error: any) {
    // Clean up on error
    try {
      await unlink(tempFile);
    } catch {}

    const executionTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}

/**
 * Execute Go code
 */
export async function executeGo(code: string, params: any, timeout: number = 30000): Promise<ExecutionResult> {
  const startTime = Date.now();
  const tempId = crypto.randomBytes(16).toString('hex');
  const tempDir = join(tmpdir(), 'api-go-exec');
  const tempFile = join(tempDir, `script_${tempId}.go`);
  const tempBinary = join(tempDir, `script_${tempId}`);

  try {
    // Create temp directory if it doesn't exist
    await mkdir(tempDir, { recursive: true });

    // Prepare Go code with params
    const paramsJson = JSON.stringify(params);
    const goCode = `package main

import (
	"encoding/json"
	"fmt"
)

var paramsJSON = \`${paramsJson.replace(/`/g, '\\`')}\`

${code}
`;

    // Write code to temp file
    await writeFile(tempFile, goCode);

    // Compile Go code
    await execAsync(`go build -o ${tempBinary} ${tempFile}`, {
      timeout: timeout / 2,
    });

    // Execute compiled binary
    const { stdout, stderr } = await execAsync(tempBinary, {
      timeout: timeout / 2,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Clean up
    await unlink(tempFile);
    await unlink(tempBinary);

    const executionTime = Date.now() - startTime;

    if (stderr && !stdout) {
      return {
        success: false,
        error: stderr,
        executionTime,
      };
    }

    // Try to parse JSON output
    let output;
    try {
      output = JSON.parse(stdout);
    } catch {
      output = stdout;
    }

    return {
      success: true,
      output,
      executionTime,
    };
  } catch (error: any) {
    // Clean up on error
    try {
      await unlink(tempFile);
      await unlink(tempBinary);
    } catch {}

    const executionTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}

/**
 * Execute code based on language
 */
export async function executeCode(
  language: string,
  code: string,
  params: any,
  timeout: number = 30000
): Promise<ExecutionResult> {
  switch (language.toLowerCase()) {
    case 'nodejs':
    case 'javascript':
    case 'js':
      return executeNodeJS(code, params, timeout);
    
    case 'php':
      return executePHP(code, params, timeout);
    
    case 'python':
    case 'py':
      return executePython(code, params, timeout);
    
    case 'go':
    case 'golang':
      return executeGo(code, params, timeout);
    
    default:
      return {
        success: false,
        error: `Unsupported language: ${language}`,
        executionTime: 0,
      };
  }
}

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

// Security: blocked patterns in code
const BLOCKED_PATTERNS = [
  /process\.exit/i,
  /child_process/i,
  /\.exec\s*\(/i,
  /\.spawn\s*\(/i,
  /\.execSync/i,
  /\.spawnSync/i,
  /require\s*\(\s*['"]child_process['"]\s*\)/i,
  /require\s*\(\s*['"]cluster['"]\s*\)/i,
  /require\s*\(\s*['"]worker_threads['"]\s*\)/i,
  /require\s*\(\s*['"]vm['"]\s*\)/i,
  /require\s*\(\s*['"]net['"]\s*\)/i,
  /require\s*\(\s*['"]dgram['"]\s*\)/i,
  /require\s*\(\s*['"]dns['"]\s*\)/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /rm\s+-rf/i,
  /rmdir/i,
];

// Allowed require modules
const ALLOWED_MODULES = [
  'axios', 'form-data', 'sharp', 'crypto', 'path', 'fs', 'url',
  'querystring', 'buffer', 'stream', 'util', 'zlib',
  'node-fetch', 'cheerio', 'lodash', 'moment', 'dayjs',
  'uuid', 'validator', 'sanitize-html', 'marked', 'csv-parse',
  'qrcode', 'jimp', 'pdf-lib', 'qs', 'dateformat',
  '@google/generative-ai',
];

/**
 * Validate code for security issues
 */
function validateCode(code: string): { safe: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { safe: false, reason: `Blocked pattern detected: ${pattern.source}` };
    }
  }

  // Check require statements against whitelist
  const requireMatches = code.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  for (const match of requireMatches) {
    const moduleName = match[1];
    if (!moduleName.startsWith('.') && !ALLOWED_MODULES.includes(moduleName)) {
      return { safe: false, reason: `Module "${moduleName}" is not allowed. Allowed: ${ALLOWED_MODULES.join(', ')}` };
    }
  }

  return { safe: true };
}

/**
 * Execute Node.js code using child process with security restrictions
 */
export async function executeNodeJS(code: string, params: any, timeout: number = 60000): Promise<ExecutionResult> {
  const startTime = Date.now();
  const tempId = crypto.randomBytes(16).toString('hex');
  const tempDir = join(tmpdir(), 'api-node-exec');
  const tempFile = join(tempDir, `script_${tempId}.cjs`);

  try {
    // Security validation
    const validation = validateCode(code);
    if (!validation.safe) {
      return {
        success: false,
        error: `Security violation: ${validation.reason}`,
        executionTime: Date.now() - startTime,
      };
    }

    await mkdir(tempDir, { recursive: true });

    const paramsJson = JSON.stringify(params);
    const nodeCode = `
const params = JSON.parse(${JSON.stringify(paramsJson)});

${code}

// Execute the exported function
(async () => {
  let result;
  if (typeof exports.default === 'function') {
    result = await exports.default(params);
  } else if (typeof module.exports === 'function') {
    result = await module.exports(params);
  } else if (typeof module.exports.default === 'function') {
    result = await module.exports.default(params);
  } else {
    throw new Error('No executable function found in script');
  }
  process.stdout.write(JSON.stringify(result));
})().catch(err => {
  process.stderr.write(err.message);
  process.exit(1);
});
`;

    await writeFile(tempFile, nodeCode);

    // Execute with memory limits
    const { stdout, stderr } = await execAsync(`node --max-old-space-size=128 --max-semi-space-size=16 ${tempFile}`, {
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_PATH: join(process.cwd(), 'node_modules'),
        NODE_OPTIONS: '--no-warnings',
      },
      cwd: tempDir,
    });

    await unlink(tempFile);
    const executionTime = Date.now() - startTime;

    if (stderr && !stdout) {
      return { success: false, error: stderr.substring(0, 2000), executionTime };
    }

    let output;
    try { output = JSON.parse(stdout); } catch { output = stdout.substring(0, 50000); }

    return { success: true, output, executionTime };
  } catch (error: any) {
    try { await unlink(tempFile); } catch {}
    const executionTime = Date.now() - startTime;
    let errorMsg = error.message || 'Unknown error';
    if (errorMsg.includes('TIMEOUT') || error.killed) {
      errorMsg = `Execution timeout (${timeout / 1000}s limit exceeded)`;
    }
    return { success: false, error: errorMsg.substring(0, 1000), executionTime };
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
    await mkdir(tempDir, { recursive: true });

    const paramsJson = JSON.stringify(params);
    const phpCode = `<?php
$params = json_decode('${paramsJson.replace(/'/g, "\\'")}', true);

${code}
?>`;

    await writeFile(tempFile, phpCode);

    const { stdout, stderr } = await execAsync(`php -d memory_limit=64M -d max_execution_time=${Math.floor(timeout / 1000)} ${tempFile}`, {
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      cwd: tempDir,
    });

    await unlink(tempFile);
    const executionTime = Date.now() - startTime;

    if (stderr) {
      return { success: false, error: stderr.substring(0, 2000), executionTime };
    }

    let output;
    try { output = JSON.parse(stdout); } catch { output = stdout.substring(0, 50000); }

    return { success: true, output, executionTime };
  } catch (error: any) {
    try { await unlink(tempFile); } catch {}
    const executionTime = Date.now() - startTime;
    return { success: false, error: (error.message || 'Unknown error').substring(0, 1000), executionTime };
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
    await mkdir(tempDir, { recursive: true });

    const paramsJson = JSON.stringify(params);
    const pythonCode = `import json
import sys

params = json.loads('''${paramsJson.replace(/'/g, "\\'")}''')

${code}
`;

    await writeFile(tempFile, pythonCode);

    const { stdout, stderr } = await execAsync(`python3 ${tempFile}`, {
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      cwd: tempDir,
    });

    await unlink(tempFile);
    const executionTime = Date.now() - startTime;

    if (stderr && !stdout) {
      return { success: false, error: stderr.substring(0, 2000), executionTime };
    }

    let output;
    try { output = JSON.parse(stdout); } catch { output = stdout.substring(0, 50000); }

    return { success: true, output, executionTime };
  } catch (error: any) {
    try { await unlink(tempFile); } catch {}
    const executionTime = Date.now() - startTime;
    return { success: false, error: (error.message || 'Unknown error').substring(0, 1000), executionTime };
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
    await mkdir(tempDir, { recursive: true });

    const paramsJson = JSON.stringify(params);
    const goCode = `package main

import (
	"encoding/json"
	"fmt"
)

var paramsJSON = \`${paramsJson.replace(/`/g, '\\`')}\`

${code}
`;

    await writeFile(tempFile, goCode);

    await execAsync(`go build -o ${tempBinary} ${tempFile}`, {
      timeout: timeout / 2,
    });

    const { stdout, stderr } = await execAsync(tempBinary, {
      timeout: timeout / 2,
      maxBuffer: 10 * 1024 * 1024,
      cwd: tempDir,
    });

    await unlink(tempFile);
    await unlink(tempBinary);
    const executionTime = Date.now() - startTime;

    if (stderr && !stdout) {
      return { success: false, error: stderr.substring(0, 2000), executionTime };
    }

    let output;
    try { output = JSON.parse(stdout); } catch { output = stdout.substring(0, 50000); }

    return { success: true, output, executionTime };
  } catch (error: any) {
    try { await unlink(tempFile); await unlink(tempBinary); } catch {}
    const executionTime = Date.now() - startTime;
    return { success: false, error: (error.message || 'Unknown error').substring(0, 1000), executionTime };
  }
}

/**
 * Execute code based on language
 */
export async function executeCode(
  language: string,
  code: string,
  params: any,
  timeout: number = 60000
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

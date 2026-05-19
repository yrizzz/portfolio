import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir, symlink, readlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
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
  '@google/generative-ai', 'https-proxy-agent',
];

// NFT trace hints: these require.resolve() calls tell Vercel's Node File Tracing
// to include these modules + all their transitive dependencies in the serverless bundle.
// Without this, modules loaded dynamically via child_process won't be traced.
if (typeof require !== 'undefined') {
  try {
    // Modules with deep dependency trees that NFT can't auto-trace
    require.resolve('qs');
    require.resolve('side-channel');
    require.resolve('side-channel-list');
    require.resolve('side-channel-map');
    require.resolve('side-channel-weakmap');
    require.resolve('call-bound');
    require.resolve('get-intrinsic');
    require.resolve('es-errors');
    require.resolve('object-inspect');
    require.resolve('axios');
    require.resolve('form-data');
    require.resolve('cheerio');
    require.resolve('https-proxy-agent');
  } catch (_) {
    // Silently ignore - these are just hints for the bundler
  }
}

/**
 * Convert ES6 import/export statements to CommonJS require/module.exports
 */
function convertImportsToRequire(code: string): string {
  let converted = code;

  // Convert: import axios from "axios" -> const axios = require("axios")
  converted = converted.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    'const $1 = require("$2");'
  );

  // Convert: import { x, y } from "module" -> const { x, y } = require("module")
  converted = converted.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    'const {$1} = require("$2");'
  );

  // Convert: import * as name from "module" -> const name = require("module")
  converted = converted.replace(
    /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    'const $1 = require("$2");'
  );

  // Convert: export default async function -> module.exports = async function
  converted = converted.replace(
    /export\s+default\s+(async\s+)?function/g,
    'module.exports = $1function'
  );

  // Convert: export default async (...) => -> module.exports = async (...) =>
  converted = converted.replace(
    /export\s+default\s+(async\s+)?\(/g,
    'module.exports = $1('
  );

  // Convert: export default async (params) => { -> module.exports = async (params) => {
  converted = converted.replace(
    /export\s+default\s+async\s*\(/g,
    'module.exports = async ('
  );

  // Convert: export default (params) => { -> module.exports = (params) => {
  converted = converted.replace(
    /export\s+default\s+\(/g,
    'module.exports = ('
  );

  // Convert: export default -> module.exports =
  converted = converted.replace(
    /export\s+default\s+/g,
    'module.exports = '
  );

  // Convert: export const/function -> module.exports.name =
  converted = converted.replace(
    /export\s+(const|let|var|function|class)\s+(\w+)/g,
    '$1 $2; module.exports.$2 = $2'
  );

  return converted;
}

/**
 * Validate code for security issues
 */
function validateCode(code: string): { safe: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { safe: false, reason: `Blocked pattern detected: ${pattern.source}` };
    }
  }

  // Check for require() calls with non-allowed modules
  const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = requirePattern.exec(code)) !== null) {
    const moduleName = match[1];
    
    // Block relative imports (they won't work in sandbox)
    if (
      moduleName.startsWith('.') || 
      moduleName.startsWith('/') ||
      moduleName.startsWith('~')
    ) {
      return { 
        safe: false, 
        reason: `Relative imports like "${moduleName}" are not allowed in sandbox. Use only npm modules from the allowed list: ${ALLOWED_MODULES.join(', ')}` 
      };
    }
    
    // Check if it's an allowed module
    let baseModule = moduleName.split('/')[0];
    if (moduleName.startsWith('@')) {
      baseModule = moduleName.split('/').slice(0, 2).join('/');
    }
    if (!ALLOWED_MODULES.includes(baseModule) && !ALLOWED_MODULES.includes(moduleName)) {
      return { 
        safe: false, 
        reason: `Module "${moduleName}" is not allowed. Allowed modules: ${ALLOWED_MODULES.join(', ')}` 
      };
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
    // Security validation (before conversion)
    const validation = validateCode(code);
    if (!validation.safe) {
      return {
        success: false,
        error: `Security violation: ${validation.reason}`,
        executionTime: Date.now() - startTime,
      };
    }

    // Convert ES6 imports to CommonJS requires
    let convertedCode = convertImportsToRequire(code);

    // Inject absolute paths for external modules to prevent "Cannot find module" errors in spawned node process
    const nodeModulesPath = join(process.cwd(), 'node_modules');
    const builtInModules = ['crypto', 'path', 'fs', 'url', 'querystring', 'buffer', 'stream', 'util', 'zlib'];
    
    for (const mod of ALLOWED_MODULES) {
      if (!builtInModules.includes(mod)) {
        const regex = new RegExp(`require\\s*\\(\\s*['"]${mod}['"]\\s*\\)`, 'g');
        const absPath = join(nodeModulesPath, mod).replace(/\\/g, '\\\\');
        convertedCode = convertedCode.replace(regex, `require('${absPath}')`);
      }
    }

    // Debug: Log conversion for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('[Code Executor] Original code length:', code.length);
      console.log('[Code Executor] Converted code length:', convertedCode.length);
      console.log('[Code Executor] Has export default:', /export\s+default/.test(code));
      console.log('[Code Executor] Has module.exports:', /module\.exports/.test(convertedCode));
    }

    await mkdir(tempDir, { recursive: true });

    // Create symlink to project node_modules in temp dir so sub-dependencies resolve
    // (e.g., qs internally requires 'side-channel')
    const nodeModulesSymlink = join(tempDir, 'node_modules');
    const projectNodeModules = join(process.cwd(), 'node_modules');
    
    // Dynamically resolve actual node_modules path (for serverless/docker)
    let actualNodeModules = projectNodeModules;
    try {
      const axiosPath = require.resolve('axios');
      const nmIndex = axiosPath.lastIndexOf('node_modules');
      if (nmIndex !== -1) {
        actualNodeModules = axiosPath.substring(0, nmIndex + 12);
      }
    } catch {}

    // Create/update symlink if it doesn't exist or points to wrong location
    try {
      if (existsSync(nodeModulesSymlink)) {
        const target = await readlink(nodeModulesSymlink);
        if (target !== actualNodeModules) {
          await unlink(nodeModulesSymlink);
          await symlink(actualNodeModules, nodeModulesSymlink, 'dir');
        }
      } else {
        await symlink(actualNodeModules, nodeModulesSymlink, 'dir');
      }
    } catch (symlinkErr) {
      console.warn('[Code Executor] Could not create node_modules symlink:', symlinkErr);
    }

    const paramsJson = JSON.stringify(params);
    const nodeCode = `
// Patch module resolution so ALL require() calls (including internal deps like side-channel from qs)
// can resolve from the project's node_modules directory
const _Module = require('module');
const _path = require('path');
const _nmPaths = (process.env.NODE_PATH || '').split(':').filter(Boolean);
const _origResolve = _Module._resolveFilename;
_Module._resolveFilename = function(request, parent, isMain, options) {
  try {
    return _origResolve.call(this, request, parent, isMain, options);
  } catch (err) {
    if (!request.startsWith('.') && !request.startsWith('/')) {
      for (const nmPath of _nmPaths) {
        try {
          return _origResolve.call(this, _path.join(nmPath, request), parent, isMain, options);
        } catch {}
      }
    }
    throw err;
  }
};

const params = JSON.parse(${JSON.stringify(paramsJson)});

// Add polyfills for file objects to support legacy file API
const fs = require('fs');
for (const key in params) {
  if (params[key] && typeof params[key] === 'object' && params[key].path && params[key].originalName) {
    params[key].arrayBuffer = async () => {
      const buf = await fs.promises.readFile(params[key].path);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    };
  }
}
if (params._files) {
  for (const file of params._files) {
    file.arrayBuffer = async () => {
      const buf = await fs.promises.readFile(file.path);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    };
  }
}

${convertedCode}


// Execute the exported function
;(async () => {
  let result;
  let fn = null;
  
  // Try different export patterns
  if (typeof module.exports === 'function') {
    fn = module.exports;
  } else if (typeof module.exports.default === 'function') {
    fn = module.exports.default;
  } else if (typeof exports.default === 'function') {
    fn = exports.default;
  } else if (typeof exports === 'function') {
    fn = exports;
  } else if (module.exports && typeof module.exports.code === 'function') {
    fn = module.exports.code;
  } else if (module.exports.default && typeof module.exports.default.code === 'function') {
    fn = module.exports.default.code;
  }
  
  if (!fn) {
    // Debug: show what was exported
    const exportType = typeof module.exports;
    const exportKeys = Object.keys(module.exports || {});
    throw new Error(\`No executable function found. Export type: \${exportType}, Keys: \${exportKeys.join(', ') || 'none'}. Make sure to use: module.exports = async (params) => {...} or export default async (params) => {...}\`);
  }
  
  result = await fn(params);
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
        NODE_PATH: [actualNodeModules, join(tempDir, 'node_modules')].join(':'),
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

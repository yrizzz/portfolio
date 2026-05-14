import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set!');
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

function extractCodeFunction(rawScript) {
  // Try different patterns
  
  // Pattern 1: "code": async (data) => { ... }
  let match = rawScript.match(/"code":\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)\n\s*\}\s*\n\}/);
  if (match) {
    return match[1] + '\n    }';
  }
  
  // Pattern 2: 'code': async (data) => { ... }
  match = rawScript.match(/'code':\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)\n\s*\}\s*\n\}/);
  if (match) {
    return match[1] + '\n    }';
  }
  
  // Pattern 3: code: async (data) => { ... }
  match = rawScript.match(/code:\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)\n\s*\}\s*\n\}/);
  if (match) {
    return match[1] + '\n    }';
  }
  
  return null;
}

function extractImports(rawScript) {
  const imports = [];
  
  // ES6 imports
  const importMatches = rawScript.matchAll(/import\s+(?:{[^}]+}|[^from]+)\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const fullImport = match[0];
    const moduleName = match[1];
    
    // Convert ES6 imports to CommonJS for execution
    if (fullImport.includes('import {')) {
      const namedImports = fullImport.match(/import\s+{([^}]+)}/)[1].trim();
      imports.push(`const { ${namedImports} } = require('${moduleName}');`);
    } else if (fullImport.includes('import * as')) {
      const alias = fullImport.match(/import\s+\*\s+as\s+(\w+)/)[1];
      imports.push(`const ${alias} = require('${moduleName}');`);
    } else {
      const defaultImport = fullImport.match(/import\s+(\w+)/)[1];
      imports.push(`const ${defaultImport} = require('${moduleName}');`);
    }
  }
  
  // CommonJS requires
  const requireMatches = rawScript.matchAll(/const\s+(?:{[^}]+}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g);
  for (const match of requireMatches) {
    imports.push(match[0] + ';');
  }
  
  return imports;
}

async function fixApiCode() {
  console.log('🔧 Fixing API code in database...\n');
  
  const endpoints = await prisma.apiEndpoint.findMany({
    where: {
      language: 'nodejs',
      rawScript: {
        not: ''
      }
    }
  });

  console.log(`Found ${endpoints.length} endpoints to fix\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const endpoint of endpoints) {
    try {
      const rawScript = endpoint.rawScript;
      
      // Extract the code function
      const codeFunction = extractCodeFunction(rawScript);
      
      if (!codeFunction) {
        console.log(`⚠️  ${endpoint.name}: Could not extract code function - skipping`);
        skippedCount++;
        continue;
      }

      // Extract imports
      const imports = extractImports(rawScript);

      // Build the executable code
      const executableCode = `
${imports.join('\n')}

// Main execution function
module.exports = ${codeFunction};
`;

      // Update the database
      await prisma.apiEndpoint.update({
        where: { id: endpoint.id },
        data: { code: executableCode }
      });

      console.log(`✅ Fixed: ${endpoint.name}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error fixing ${endpoint.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Fix Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${endpoints.length}`);
}

fixApiCode()
  .then(() => {
    console.log('\n✨ Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

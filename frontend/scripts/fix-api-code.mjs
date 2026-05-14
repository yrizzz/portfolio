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

  for (const endpoint of endpoints) {
    try {
      const rawScript = endpoint.rawScript;
      
      // Extract the code function from the export default object
      // Match: "code": async (data) => { ... }
      const codeMatch = rawScript.match(/"code":\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)\n\s*\}\s*\n\}/);
      
      if (!codeMatch) {
        console.log(`⚠️  ${endpoint.name}: Could not extract code function`);
        console.log(`   Raw script preview: ${rawScript.substring(0, 200)}`);
        errorCount++;
        continue;
      }

      const codeFunction = codeMatch[1] + '\n    }';
      
      // Extract imports from rawScript
      const imports = [];
      const importMatches = rawScript.matchAll(/import\s+(?:{[^}]+}|[^from]+)\s+from\s+['"]([^'"]+)['"]/g);
      for (const match of importMatches) {
        imports.push(match[0]);
      }

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

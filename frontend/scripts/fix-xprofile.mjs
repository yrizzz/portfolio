import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set!');
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function fixXProfile() {
  console.log('🔧 Fixing xprofile API...\n');
  
  try {
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: { name: 'xprofile' }
    });

    if (!endpoint) {
      console.log('❌ xprofile not found in database');
      return;
    }

    // Read the original file and extract the code
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const filePath = path.join(__dirname, '../utils/api/socialmedia/xprofile.js');
    const rawScript = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the code function
    const codeMatch = rawScript.match(/"code":\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)\n\s*\}\s*,?\s*\n\}/);
    
    if (!codeMatch) {
      console.log('❌ Could not extract code function');
      return;
    }

    const codeFunction = codeMatch[1] + '\n    }';
    
    // Build the executable code
    const executableCode = `
const axios = require('axios');

// Main execution function
module.exports = ${codeFunction};
`;

    // Update the database
    await prisma.apiEndpoint.update({
      where: { id: endpoint.id },
      data: { 
        code: executableCode,
        rawScript: rawScript
      }
    });

    console.log('✅ Fixed xprofile API');

  } catch (error) {
    console.error('❌ Error fixing xprofile:', error.message);
  }
}

fixXProfile()
  .then(() => {
    console.log('\n✨ xprofile fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

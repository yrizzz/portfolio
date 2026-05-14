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

const manualFixes = {
  instagram: {
    imports: [
      "const axios = require('axios');",
      "const qs = require('qs');",
      "const { headerInstagram } = require('../../endpoint.js');"
    ],
    needsWrapper: true
  },
  facebook: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  tiktok: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  youtube: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  lens: {
    imports: [
      "const axios = require('axios');",
      "const { Buffer } = require('buffer');",
      "const FormData = require('form-data');"
    ],
    needsWrapper: true
  },
  xprofile: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  checkPlnPrabayar: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  checkPlnPascabayar: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  checkIndihome: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  },
  checkMyRepublic: {
    imports: [
      "const axios = require('axios');"
    ],
    needsWrapper: true
  }
};

async function fixManualApis() {
  console.log('🔧 Manually fixing remaining APIs...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const [name, config] of Object.entries(manualFixes)) {
    try {
      const endpoint = await prisma.apiEndpoint.findFirst({
        where: { name }
      });

      if (!endpoint) {
        console.log(`⚠️  ${name}: Not found in database`);
        continue;
      }

      let codeFunction = endpoint.code;
      
      // If it's already a function string, wrap it
      if (config.needsWrapper && !codeFunction.includes('module.exports')) {
        const executableCode = `
${config.imports.join('\n')}

// Main execution function
module.exports = ${codeFunction};
`;

        await prisma.apiEndpoint.update({
          where: { id: endpoint.id },
          data: { code: executableCode }
        });

        console.log(`✅ Fixed: ${name}`);
        successCount++;
      } else {
        console.log(`⏭️  ${name}: Already fixed`);
      }

    } catch (error) {
      console.error(`❌ Error fixing ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Manual Fix Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

fixManualApis()
  .then(() => {
    console.log('\n✨ Manual fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Manual fix failed:', error);
    process.exit(1);
  });

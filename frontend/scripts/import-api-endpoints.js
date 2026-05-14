import prisma from '../src/lib/prisma.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all API modules
const apiModules = {
  // AI
  geminiAi: await import('../utils/api/ai/geminiAi.js'),
  chatGpt: await import('../utils/api/ai/chatGpt.js'),
  blackboxAi: await import('../utils/api/ai/blackboxAi.js'),
  blackboxImageText: await import('../utils/api/ai/blackboxImageText.js'),
  
  // Downloader
  igdl: await import('../utils/api/downloader/instagram.js'),
  fbdl: await import('../utils/api/downloader/facebook.js'),
  ttdl: await import('../utils/api/downloader/tiktok.js'),
  ytdl: await import('../utils/api/downloader/youtube.js'),
  
  // Domain
  domaininfo: await import('../utils/api/domain/domaininfo.js'),
  dnsrecord: await import('../utils/api/domain/dnsrecord.js'),
  nameserver: await import('../utils/api/domain/nameserver.js'),
  whois: await import('../utils/api/domain/whois.js'),
  
  // Game
  checkUsernameMobileLegends: await import('../utils/api/game/checkUsernameMobileLegends.js'),
  checkUsernameFreeFire: await import('../utils/api/game/checkUsernameFreeFire.js'),
  checkUsernamePawRumble: await import('../utils/api/game/checkUsernamePawRumble.js'),
  checkUsernameAov: await import('../utils/api/game/checkUsernameAov.js'),
  checkUsernameHok: await import('../utils/api/game/checkUsernameHok.js'),
  checkUsernamePubg: await import('../utils/api/game/checkUsernamePubg.js'),
  
  // Random
  cekRekening: await import('../utils/api/random/cekRekening.js'),
  lens: await import('../utils/api/random/lens.js'),
  dikti: await import('../utils/api/random/dikti.js'),
  cekPlnPrabayar: await import('../utils/api/random/checkPlnPrabayar.js'),
  cekPlnPascabayar: await import('../utils/api/random/checkPlnPascabayar.js'),
  cekIndihome: await import('../utils/api/random/checkIndihome.js'),
  cekMyRepublic: await import('../utils/api/random/checkMyRepublic.js'),
  
  // Maps
  gmaps: await import('../utils/api/maps/gmaps.js'),
  
  // Social Media
  igprofile: await import('../utils/api/socialmedia/igprofile.js'),
  igpost: await import('../utils/api/socialmedia/igpost.js'),
  igstory: await import('../utils/api/socialmedia/igstory.js'),
  ighighlight: await import('../utils/api/socialmedia/ighighlight.js'),
  ttprofile: await import('../utils/api/socialmedia/ttprofile.js'),
  xprofile: await import('../utils/api/socialmedia/xprofile.js'),
  
  // Tool
  removeBg: await import('../utils/api/tool/removeBg.js'),
  imageHd: await import('../utils/api/tool/imageHd.js'),
  videoEnhancer: await import('../utils/api/tool/videoEnhancer.js'),
  ssweb: await import('../utils/api/tool/ssweb.js'),
  translate: await import('../utils/api/tool/translate.js'),
  phoneChecker: await import('../utils/api/tool/phoneChecker.js'),
  imageBg: await import('../utils/api/tool/imageBg.js'),
  imageCv: await import('../utils/api/tool/imageCv.js'),
};

async function importApiEndpoints() {
  console.log('🚀 Starting API endpoint import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const [key, module] of Object.entries(apiModules)) {
    const api = module.default;
    
    if (!api || !api.name || !api.path) {
      console.log(`⚠️  Skipping ${key}: Invalid API structure`);
      skippedCount++;
      continue;
    }

    try {
      // Check if endpoint already exists
      const existing = await prisma.apiEndpoint.findFirst({
        where: { path: api.path }
      });

      if (existing) {
        console.log(`⏭️  Skipping ${api.name}: Already exists in database`);
        skippedCount++;
        continue;
      }

      // Read the original file content as rawScript
      const filePath = path.join(__dirname, '../utils/api', api.category, `${key}.js`);
      let rawScript = '';
      try {
        rawScript = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        // Try alternative paths
        const altPaths = [
          path.join(__dirname, '../utils/api/ai', `${key}.js`),
          path.join(__dirname, '../utils/api/downloader', `${key}.js`),
          path.join(__dirname, '../utils/api/domain', `${key}.js`),
          path.join(__dirname, '../utils/api/game', `${key}.js`),
          path.join(__dirname, '../utils/api/random', `${key}.js`),
          path.join(__dirname, '../utils/api/maps', `${key}.js`),
          path.join(__dirname, '../utils/api/socialmedia', `${key}.js`),
          path.join(__dirname, '../utils/api/tool', `${key}.js`),
        ];
        
        for (const altPath of altPaths) {
          try {
            rawScript = fs.readFileSync(altPath, 'utf-8');
            break;
          } catch {}
        }
      }

      // Convert code function to string
      const codeString = api.code ? api.code.toString() : '';

      // Create the endpoint
      await prisma.apiEndpoint.create({
        data: {
          name: api.name,
          description: api.description || `API endpoint for ${api.name}`,
          method: api.method || 'GET',
          path: api.path,
          category: api.category || 'general',
          language: 'nodejs',
          rawScript: rawScript || codeString,
          code: codeString,
          enabled: true,
          status: 'approved',
          requiresAuth: false,
          rateLimit: 100,
          params: JSON.stringify(api.params || []),
          exampleCode: api.example || '',
          order: 0,
          approvedAt: new Date(),
          approvedBy: 'system',
        }
      });

      console.log(`✅ Imported: ${api.name} (${api.path})`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error importing ${api.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   📦 Total: ${Object.keys(apiModules).length}`);
}

// Run the import
importApiEndpoints()
  .then(() => {
    console.log('\n✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });

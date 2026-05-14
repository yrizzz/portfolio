import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma with MariaDB adapter
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set!');
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function loadApiModules() {
  const modules = {};
  
  // AI
  try { modules.geminiAi = (await import('../utils/api/ai/geminiAi.js')).default; } catch(e) { console.log('Skip geminiAi:', e.message); }
  try { modules.chatGpt = (await import('../utils/api/ai/chatGpt.js')).default; } catch(e) { console.log('Skip chatGpt:', e.message); }
  try { modules.blackboxAi = (await import('../utils/api/ai/blackboxAi.js')).default; } catch(e) { console.log('Skip blackboxAi:', e.message); }
  try { modules.blackboxImageText = (await import('../utils/api/ai/blackboxImageText.js')).default; } catch(e) { console.log('Skip blackboxImageText:', e.message); }
  
  // Downloader
  try { modules.igdl = (await import('../utils/api/downloader/instagram.js')).default; } catch(e) { console.log('Skip igdl:', e.message); }
  try { modules.fbdl = (await import('../utils/api/downloader/facebook.js')).default; } catch(e) { console.log('Skip fbdl:', e.message); }
  try { modules.ttdl = (await import('../utils/api/downloader/tiktok.js')).default; } catch(e) { console.log('Skip ttdl:', e.message); }
  try { modules.ytdl = (await import('../utils/api/downloader/youtube.js')).default; } catch(e) { console.log('Skip ytdl:', e.message); }
  
  // Domain
  try { modules.domaininfo = (await import('../utils/api/domain/domaininfo.js')).default; } catch(e) { console.log('Skip domaininfo:', e.message); }
  try { modules.dnsrecord = (await import('../utils/api/domain/dnsrecord.js')).default; } catch(e) { console.log('Skip dnsrecord:', e.message); }
  try { modules.nameserver = (await import('../utils/api/domain/nameserver.js')).default; } catch(e) { console.log('Skip nameserver:', e.message); }
  try { modules.whois = (await import('../utils/api/domain/whois.js')).default; } catch(e) { console.log('Skip whois:', e.message); }
  
  // Game
  try { modules.checkUsernameMobileLegends = (await import('../utils/api/game/checkUsernameMobileLegends.js')).default; } catch(e) { console.log('Skip checkUsernameMobileLegends:', e.message); }
  try { modules.checkUsernameFreeFire = (await import('../utils/api/game/checkUsernameFreeFire.js')).default; } catch(e) { console.log('Skip checkUsernameFreeFire:', e.message); }
  try { modules.checkUsernamePawRumble = (await import('../utils/api/game/checkUsernamePawRumble.js')).default; } catch(e) { console.log('Skip checkUsernamePawRumble:', e.message); }
  try { modules.checkUsernameAov = (await import('../utils/api/game/checkUsernameAov.js')).default; } catch(e) { console.log('Skip checkUsernameAov:', e.message); }
  try { modules.checkUsernameHok = (await import('../utils/api/game/checkUsernameHok.js')).default; } catch(e) { console.log('Skip checkUsernameHok:', e.message); }
  try { modules.checkUsernamePubg = (await import('../utils/api/game/checkUsernamePubg.js')).default; } catch(e) { console.log('Skip checkUsernamePubg:', e.message); }
  
  // Random
  try { modules.cekRekening = (await import('../utils/api/random/cekRekening.js')).default; } catch(e) { console.log('Skip cekRekening:', e.message); }
  try { modules.lens = (await import('../utils/api/random/lens.js')).default; } catch(e) { console.log('Skip lens:', e.message); }
  try { modules.dikti = (await import('../utils/api/random/dikti.js')).default; } catch(e) { console.log('Skip dikti:', e.message); }
  try { modules.cekPlnPrabayar = (await import('../utils/api/random/checkPlnPrabayar.js')).default; } catch(e) { console.log('Skip cekPlnPrabayar:', e.message); }
  try { modules.cekPlnPascabayar = (await import('../utils/api/random/checkPlnPascabayar.js')).default; } catch(e) { console.log('Skip cekPlnPascabayar:', e.message); }
  try { modules.cekIndihome = (await import('../utils/api/random/checkIndihome.js')).default; } catch(e) { console.log('Skip cekIndihome:', e.message); }
  try { modules.cekMyRepublic = (await import('../utils/api/random/checkMyRepublic.js')).default; } catch(e) { console.log('Skip cekMyRepublic:', e.message); }
  
  // Maps
  try { modules.gmaps = (await import('../utils/api/maps/gmaps.js')).default; } catch(e) { console.log('Skip gmaps:', e.message); }
  
  // Social Media
  try { modules.igprofile = (await import('../utils/api/socialmedia/igprofile.js')).default; } catch(e) { console.log('Skip igprofile:', e.message); }
  try { modules.igpost = (await import('../utils/api/socialmedia/igpost.js')).default; } catch(e) { console.log('Skip igpost:', e.message); }
  try { modules.igstory = (await import('../utils/api/socialmedia/igstory.js')).default; } catch(e) { console.log('Skip igstory:', e.message); }
  try { modules.ighighlight = (await import('../utils/api/socialmedia/ighighlight.js')).default; } catch(e) { console.log('Skip ighighlight:', e.message); }
  try { modules.ttprofile = (await import('../utils/api/socialmedia/ttprofile.js')).default; } catch(e) { console.log('Skip ttprofile:', e.message); }
  try { modules.xprofile = (await import('../utils/api/socialmedia/xprofile.js')).default; } catch(e) { console.log('Skip xprofile:', e.message); }
  
  // Tool
  try { modules.removeBg = (await import('../utils/api/tool/removeBg.js')).default; } catch(e) { console.log('Skip removeBg:', e.message); }
  try { modules.imageHd = (await import('../utils/api/tool/imageHd.js')).default; } catch(e) { console.log('Skip imageHd:', e.message); }
  // Skip videoEnhancer, imageBg, imageCv due to top-level await
  // try { modules.videoEnhancer = (await import('../utils/api/tool/videoEnhancer.js')).default; } catch(e) { console.log('Skip videoEnhancer:', e.message); }
  // try { modules.imageBg = (await import('../utils/api/tool/imageBg.js')).default; } catch(e) { console.log('Skip imageBg:', e.message); }
  // try { modules.imageCv = (await import('../utils/api/tool/imageCv.js')).default; } catch(e) { console.log('Skip imageCv:', e.message); }
  try { modules.ssweb = (await import('../utils/api/tool/ssweb.js')).default; } catch(e) { console.log('Skip ssweb:', e.message); }
  try { modules.translate = (await import('../utils/api/tool/translate.js')).default; } catch(e) { console.log('Skip translate:', e.message); }
  try { modules.phoneChecker = (await import('../utils/api/tool/phoneChecker.js')).default; } catch(e) { console.log('Skip phoneChecker:', e.message); }
  
  return modules;
}

async function importApiEndpoints() {
  console.log('🚀 Starting API endpoint import...\n');
  
  const apiModules = await loadApiModules();
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const [key, api] of Object.entries(apiModules)) {
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
      const categoryPaths = {
        'ai': 'ai',
        'downloader': 'downloader',
        'domain': 'domain',
        'game': 'game',
        'random': 'random',
        'maps': 'maps',
        'socialmedia': 'socialmedia',
        'tool': 'tool',
      };

      let rawScript = '';
      const category = api.category || 'general';
      const categoryPath = categoryPaths[category] || category;
      
      try {
        const filePath = path.join(__dirname, '../utils/api', categoryPath, `${key}.js`);
        rawScript = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.log(`⚠️  Could not read source file for ${key}`);
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
          category: category,
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

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

const headerInstagram = {
  'Cookie': `datr=4rFhaTk9AhgfVfHcK3iC2uDr; ig_did=C8738CA8-B84E-460F-A8CC-B6E01497A251; ds_user_id=8280630702; ps_l=1; ps_n=1; csrftoken=FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM; mid=ac4l0wALAAGCTHqIyUiGu8HxnShF; sessionid=8280630702%3AyHPZq7Yu3cRPIt%3A3%3AAYjvQUoVyGCDKWvqC5m7ZnvuvMH4zrxaluzkmTbwlA; dpr=2; rur="NHA\\0548280630702\\0541808207146:01feb2d801958722d3aa2c86767ddb7405b050b6f0598eda4fe2b9140fcb1735f986eecf"; wd=1440x2004`,
  'X-Asbd-Id': '359341',
  'X-Fb-Friendly-Name': 'PolarisStoriesV3TrayContainerQuery',
  'X-Bloks-Version-Id': '41a4871badc8ef00114860033dd42edcd50935d511345a5a37fbaa878479ad3c',
  'X-Csrftoken': 'FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM',
  'X-Fb-Lsd': 'D9mibKcyJZihK45YuXAXLd',
  'X-Ig-App-Id': '1217981644879628',
  'Content-Type': 'application/x-www-form-urlencoded',
  'x-root-field-name':'xdt_api__v1__feed__user_timeline_graphql_connection'
};

async function fixInstagramApis() {
  console.log('🔧 Fixing Instagram APIs...\n');
  
  const instagramApis = ['instagram', 'igprofile', 'igpost', 'igstory', 'ighighlight'];
  
  let successCount = 0;
  let errorCount = 0;

  for (const name of instagramApis) {
    try {
      const endpoint = await prisma.apiEndpoint.findFirst({
        where: { name }
      });

      if (!endpoint) {
        console.log(`⚠️  ${name}: Not found in database`);
        continue;
      }

      let code = endpoint.code;
      
      // Replace the endpoint.js import with inline header
      code = code.replace(
        /const\s+{\s*headerInstagram\s*}\s*=\s*require\(['"]\.\.\/\.\.\/endpoint\.js['"]\);?/g,
        `const headerInstagram = ${JSON.stringify(headerInstagram, null, 2)};`
      );

      await prisma.apiEndpoint.update({
        where: { id: endpoint.id },
        data: { code }
      });

      console.log(`✅ Fixed: ${name}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error fixing ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Fix Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

fixInstagramApis()
  .then(() => {
    console.log('\n✨ Instagram APIs fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

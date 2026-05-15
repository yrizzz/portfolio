#!/usr/bin/env tsx
/**
 * Helper script to update remaining Prisma files to Mongoose
 * Run with: npx tsx scripts/update-to-mongoose.ts
 */

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/app/api/messages/route.ts',
  'src/app/api/admin/stats/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/lib/gemini.ts',
  'src/app/api/execute/[...path]/route.ts',
  'src/app/api/contact-info/route.ts',
  'src/app/api/experiences/route.ts',
  'src/app/api/skills/route.ts',
  'src/app/api/profile/route.ts',
  'src/app/api/api-keys/route.ts',
  'src/app/api/api-keys/toggle/route.ts',
  'src/app/api/licenses/route.ts',
  'src/app/api/licenses/toggle-renew/route.ts',
  'src/app/api/logs/route.ts',
  'src/app/api/config/route.ts',
  'src/app/api/endpoints/submit/route.ts',
  'src/app/api/endpoints/review/route.ts',
  'src/app/api/analytics/route.ts',
  'src/app/api/docs/route.ts',
];

// Model name mapping
const modelMap: Record<string, string> = {
  user: 'User',
  apiKey: 'ApiKey',
  license: 'License',
  apiRequest: 'ApiRequest',
  project: 'Project',
  experience: 'Experience',
  education: 'Education',
  skill: 'Skill',
  article: 'Article',
  socialMedia: 'SocialMedia',
  siteConfig: 'SiteConfig',
  account: 'Account',
  session: 'Session',
  verificationToken: 'VerificationToken',
  contact: 'Contact',
  apiEndpoint: 'ApiEndpoint',
};

function updateFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  // Step 1: Replace import statement
  if (content.includes("from '@/lib/prisma'")) {
    // Detect which models are used
    const usedModels = new Set<string>();
    
    Object.keys(modelMap).forEach(prismaModel => {
      const regex = new RegExp(`prisma\\.${prismaModel}\\.`, 'g');
      if (regex.test(content)) {
        usedModels.add(modelMap[prismaModel]);
      }
    });

    const modelsImport = Array.from(usedModels).join(', ');
    
    content = content.replace(
      /import\s+{\s*prisma\s*}\s+from\s+['"]@\/lib\/prisma['"]/,
      `import { connectDB } from '@/lib/mongodb';\nimport { ${modelsImport} } from '@/models'`
    );
    modified = true;
  }

  // Step 2: Add connectDB() calls at the start of handler functions
  const handlerRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/g;
  content = content.replace(handlerRegex, (match) => {
    if (!match.includes('await connectDB()')) {
      return match + '\n  await connectDB();';
    }
    return match;
  });

  // Step 3: Convert Prisma queries to Mongoose
  Object.entries(modelMap).forEach(([prismaModel, mongooseModel]) => {
    // findMany -> find
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.findMany\\(`, 'g'),
      `${mongooseModel}.find(`
    );

    // findUnique with id -> findById
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.findUnique\\(\\s*{\\s*where:\\s*{\\s*id:`, 'g'),
      `${mongooseModel}.findById(`
    );

    // findUnique -> findOne
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.findUnique\\(`, 'g'),
      `${mongooseModel}.findOne(`
    );

    // findFirst -> findOne
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.findFirst\\(`, 'g'),
      `${mongooseModel}.findOne(`
    );

    // create -> create
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.create\\(`, 'g'),
      `${mongooseModel}.create(`
    );

    // update -> findByIdAndUpdate
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.update\\(`, 'g'),
      `${mongooseModel}.findByIdAndUpdate(`
    );

    // updateMany -> updateMany
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.updateMany\\(`, 'g'),
      `${mongooseModel}.updateMany(`
    );

    // delete -> findByIdAndDelete
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.delete\\(`, 'g'),
      `${mongooseModel}.findByIdAndDelete(`
    );

    // deleteMany -> deleteMany
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.deleteMany\\(`, 'g'),
      `${mongooseModel}.deleteMany(`
    );

    // count -> countDocuments
    content = content.replace(
      new RegExp(`prisma\\.${prismaModel}\\.count\\(`, 'g'),
      `${mongooseModel}.countDocuments(`
    );
  });

  // Step 4: Convert query syntax
  // where: { } -> filter object
  content = content.replace(/where:\s*{/g, '{');
  
  // orderBy: { field: 'asc' } -> .sort({ field: 1 })
  content = content.replace(/orderBy:\s*{\s*(\w+):\s*['"]asc['"]\s*}/g, '.sort({ $1: 1 })');
  content = content.replace(/orderBy:\s*{\s*(\w+):\s*['"]desc['"]\s*}/g, '.sort({ $1: -1 })');

  // include: -> populate (needs manual review)
  if (content.includes('include:')) {
    console.log(`⚠️  File ${filePath} contains 'include:' - needs manual review for populate()`);
  }

  // Step 5: Convert field references
  // .id -> ._id (in results)
  // This is tricky and might need manual review

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
  }
}

console.log('🚀 Starting Prisma to Mongoose migration...\n');

filesToUpdate.forEach(file => {
  try {
    updateFile(file);
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error);
  }
});

console.log('\n✨ Migration script completed!');
console.log('\n⚠️  IMPORTANT: Please review all changes manually, especially:');
console.log('   - Files with include/populate');
console.log('   - ID field references (id vs _id)');
console.log('   - Complex query conditions');
console.log('   - Transaction logic');

#!/usr/bin/env tsx
/**
 * Clean MongoDB Script
 * 
 * This script cleans all data from MongoDB
 * Useful if you need to re-run migration
 * 
 * Run with: npx tsx scripts/clean-mongodb.ts
 */

import mongoose from 'mongoose';
import * as Models from '../src/models';
import readline from 'readline';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porto-db';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('⚠️  WARNING: This will DELETE ALL DATA from MongoDB!');
  console.log(`Database: ${MONGODB_URI}\n`);

  const answer = await question('Are you sure you want to continue? (yes/no): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  const confirm = await question('Type "DELETE ALL DATA" to confirm: ');

  if (confirm !== 'DELETE ALL DATA') {
    console.log('❌ Confirmation failed. Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Deleting all collections...\n');

    const collections = [
      { name: 'User', model: Models.User },
      { name: 'ApiKey', model: Models.ApiKey },
      { name: 'License', model: Models.License },
      { name: 'ApiRequest', model: Models.ApiRequest },
      { name: 'Project', model: Models.Project },
      { name: 'Experience', model: Models.Experience },
      { name: 'Education', model: Models.Education },
      { name: 'Skill', model: Models.Skill },
      { name: 'Article', model: Models.Article },
      { name: 'SocialMedia', model: Models.SocialMedia },
      { name: 'SiteConfig', model: Models.SiteConfig },
      { name: 'Account', model: Models.Account },
      { name: 'Session', model: Models.Session },
      { name: 'VerificationToken', model: Models.VerificationToken },
      { name: 'Contact', model: Models.Contact },
      { name: 'ApiEndpoint', model: Models.ApiEndpoint },
    ];

    let totalDeleted = 0;

    for (const { name, model } of collections) {
      try {
        const result = await model.deleteMany({});
        console.log(`✅ ${name.padEnd(20)} ${result.deletedCount} records deleted`);
        totalDeleted += result.deletedCount || 0;
      } catch (error: any) {
        console.log(`⚠️  ${name.padEnd(20)} Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Total records deleted: ${totalDeleted}`);
    console.log('='.repeat(60));
    console.log('\n✅ MongoDB cleaned successfully!');
    console.log('You can now re-run the migration script.\n');
  } catch (error) {
    console.error('\n❌ Error cleaning MongoDB:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();

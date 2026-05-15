#!/usr/bin/env tsx
/**
 * Verification Script: Compare MySQL and MongoDB data
 * 
 * This script verifies that data migration was successful
 * Run with: npx tsx scripts/verify-migration.ts
 * 
 * IMPORTANT: Make sure DATABASE_URL is set in .env for MySQL connection
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import * as Models from '../src/models';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('   Please add: DATABASE_URL=mysql://user:password@localhost:3306/database');
  process.exit(1);
}

// Initialize Prisma - it will use DATABASE_URL from .env
const prisma = new PrismaClient();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porto-db';

interface VerificationResult {
  model: string;
  mysqlCount: number;
  mongoCount: number;
  match: boolean;
  difference: number;
}

const results: VerificationResult[] = [];

async function connectMongoDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function verifyModel(
  modelName: string,
  getMySQLCount: () => Promise<number>,
  getMongoCount: () => Promise<number>
) {
  try {
    const mysqlCount = await getMySQLCount();
    const mongoCount = await getMongoCount();
    const match = mysqlCount === mongoCount;
    const difference = Math.abs(mysqlCount - mongoCount);

    results.push({
      model: modelName,
      mysqlCount,
      mongoCount,
      match,
      difference,
    });

    const status = match ? '✅' : '❌';
    console.log(
      `${status} ${modelName.padEnd(20)} MySQL: ${mysqlCount.toString().padStart(5)} | MongoDB: ${mongoCount.toString().padStart(5)} ${!match ? `| Diff: ${difference}` : ''}`
    );
  } catch (error: any) {
    console.error(`❌ Error verifying ${modelName}:`, error.message);
    results.push({
      model: modelName,
      mysqlCount: 0,
      mongoCount: 0,
      match: false,
      difference: 0,
    });
  }
}

async function main() {
  console.log('🔍 Starting Migration Verification');
  console.log('='.repeat(70));

  try {
    await connectMongoDB();
    await prisma.$connect();
    console.log('✅ Connected to MySQL (Prisma)\n');

    console.log('📊 Comparing Record Counts:');
    console.log('-'.repeat(70));

    // Verify all models
    await verifyModel(
      'User',
      () => prisma.user.count(),
      () => Models.User.countDocuments()
    );

    await verifyModel(
      'ApiKey',
      () => prisma.apiKey.count(),
      () => Models.ApiKey.countDocuments()
    );

    await verifyModel(
      'License',
      () => prisma.license.count(),
      () => Models.License.countDocuments()
    );

    await verifyModel(
      'ApiRequest',
      () => prisma.apiRequest.count(),
      () => Models.ApiRequest.countDocuments()
    );

    await verifyModel(
      'Project',
      () => prisma.project.count(),
      () => Models.Project.countDocuments()
    );

    await verifyModel(
      'Experience',
      () => prisma.experience.count(),
      () => Models.Experience.countDocuments()
    );

    await verifyModel(
      'Education',
      () => prisma.education.count(),
      () => Models.Education.countDocuments()
    );

    await verifyModel(
      'Skill',
      () => prisma.skill.count(),
      () => Models.Skill.countDocuments()
    );

    await verifyModel(
      'Article',
      () => prisma.article.count(),
      () => Models.Article.countDocuments()
    );

    await verifyModel(
      'SocialMedia',
      () => prisma.socialMedia.count(),
      () => Models.SocialMedia.countDocuments()
    );

    await verifyModel(
      'SiteConfig',
      () => prisma.siteConfig.count(),
      () => Models.SiteConfig.countDocuments()
    );

    await verifyModel(
      'Account',
      () => prisma.account.count(),
      () => Models.Account.countDocuments()
    );

    await verifyModel(
      'Session',
      () => prisma.session.count(),
      () => Models.Session.countDocuments()
    );

    await verifyModel(
      'VerificationToken',
      () => prisma.verificationToken.count(),
      () => Models.VerificationToken.countDocuments()
    );

    await verifyModel(
      'Contact',
      () => prisma.contact.count(),
      () => Models.Contact.countDocuments()
    );

    await verifyModel(
      'ApiEndpoint',
      () => prisma.apiEndpoint.count(),
      () => Models.ApiEndpoint.countDocuments()
    );

    // Print summary
    console.log('='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));

    const totalModels = results.length;
    const matchedModels = results.filter(r => r.match).length;
    const mismatchedModels = results.filter(r => !r.match).length;
    const totalMySQLRecords = results.reduce((sum, r) => sum + r.mysqlCount, 0);
    const totalMongoRecords = results.reduce((sum, r) => sum + r.mongoCount, 0);

    console.log(`Total Models Checked: ${totalModels}`);
    console.log(`✅ Matched: ${matchedModels}`);
    console.log(`❌ Mismatched: ${mismatchedModels}`);
    console.log(`\nTotal MySQL Records: ${totalMySQLRecords}`);
    console.log(`Total MongoDB Records: ${totalMongoRecords}`);
    console.log(`Difference: ${Math.abs(totalMySQLRecords - totalMongoRecords)}`);

    if (mismatchedModels > 0) {
      console.log('\n⚠️  MISMATCHED MODELS:');
      results
        .filter(r => !r.match)
        .forEach(r => {
          console.log(
            `   ${r.model}: MySQL=${r.mysqlCount}, MongoDB=${r.mongoCount}, Diff=${r.difference}`
          );
        });
      console.log('\n❌ Migration verification FAILED!');
      console.log('   Please check the mismatched models and re-run migration if needed.');
    } else {
      console.log('\n✅ Migration verification PASSED!');
      console.log('   All data has been successfully migrated to MongoDB.');
    }

    console.log('='.repeat(70));

    // Sample data comparison
    console.log('\n🔍 Sample Data Comparison:');
    console.log('-'.repeat(70));

    // Compare first user
    const mysqlUser = await prisma.user.findFirst();
    const mongoUser = await Models.User.findOne().lean();

    if (mysqlUser && mongoUser) {
      console.log('\n👤 User Sample:');
      console.log('MySQL:', {
        id: mysqlUser.id,
        email: mysqlUser.email,
        name: mysqlUser.name,
        role: mysqlUser.role,
      });
      console.log('MongoDB:', {
        id: mongoUser._id.toString(),
        email: mongoUser.email,
        name: mongoUser.name,
        role: mongoUser.role,
      });
    }

    // Compare first project
    const mysqlProject = await prisma.project.findFirst();
    const mongoProject = await Models.Project.findOne().lean();

    if (mysqlProject && mongoProject) {
      console.log('\n📦 Project Sample:');
      console.log('MySQL:', {
        id: mysqlProject.id,
        title: mysqlProject.title,
        published: mysqlProject.published,
      });
      console.log('MongoDB:', {
        id: mongoProject._id.toString(),
        title: mongoProject.title,
        published: mongoProject.published,
      });
    }

    console.log('\n✨ Verification completed!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from databases');
  }
}

main();

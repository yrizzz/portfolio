#!/usr/bin/env tsx
/**
 * Data Migration Script: MySQL (Prisma) to MongoDB (Mongoose)
 * 
 * This script migrates all data from MySQL to MongoDB
 * Run with: npx tsx scripts/migrate-data.ts
 * 
 * IMPORTANT: Make sure DATABASE_URL is set in .env for MySQL connection
 */

// Load environment variables first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

// Import Prisma Client and MariaDB adapter
import { PrismaClient as PrismaClientBase } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mongoose from 'mongoose';
import * as Models from '../src/models/index.js';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('   Please add: DATABASE_URL=mysql://user:password@localhost:3306/database');
  process.exit(1);
}

// Create Prisma client with MariaDB adapter
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClientBase({ adapter } as any);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porto-db';

interface MigrationStats {
  model: string;
  count: number;
  success: boolean;
  error?: string;
}

const stats: MigrationStats[] = [];

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function migrateUsers() {
  console.log('\n📦 Migrating Users...');
  try {
    const users = await prisma.user.findMany();
    console.log(`   Found ${users.length} users`);

    for (const user of users) {
      await Models.User.create({
        // Don't set _id, let MongoDB generate it
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
        role: user.role,
        emailVerified: user.emailVerified || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as any);
    }

    stats.push({ model: 'User', count: users.length, success: true });
    console.log(`   ✅ Migrated ${users.length} users`);
  } catch (error: any) {
    console.error('   ❌ Error migrating users:', error.message);
    stats.push({ model: 'User', count: 0, success: false, error: error.message });
  }
}

async function migrateApiKeys() {
  console.log('\n📦 Migrating API Keys...');
  try {
    const apiKeys = await prisma.apiKey.findMany();
    console.log(`   Found ${apiKeys.length} API keys`);

    for (const key of apiKeys) {
      await Models.ApiKey.create({
        _id: key.id,
        key: key.key,
        userId: key.userId,
        name: key.name,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
      });
    }

    stats.push({ model: 'ApiKey', count: apiKeys.length, success: true });
    console.log(`   ✅ Migrated ${apiKeys.length} API keys`);
  } catch (error: any) {
    console.error('   ❌ Error migrating API keys:', error.message);
    stats.push({ model: 'ApiKey', count: 0, success: false, error: error.message });
  }
}

async function migrateLicenses() {
  console.log('\n📦 Migrating Licenses...');
  try {
    const licenses = await prisma.license.findMany();
    console.log(`   Found ${licenses.length} licenses`);

    for (const license of licenses) {
      await Models.License.create({
        _id: license.id,
        userId: license.userId,
        type: license.type,
        price: license.price,
        startDate: license.startDate,
        endDate: license.endDate,
        isActive: license.isActive,
        autoRenew: license.autoRenew,
        createdAt: license.createdAt,
      });
    }

    stats.push({ model: 'License', count: licenses.length, success: true });
    console.log(`   ✅ Migrated ${licenses.length} licenses`);
  } catch (error: any) {
    console.error('   ❌ Error migrating licenses:', error.message);
    stats.push({ model: 'License', count: 0, success: false, error: error.message });
  }
}

async function migrateApiRequests() {
  console.log('\n📦 Migrating API Requests...');
  try {
    const requests = await prisma.apiRequest.findMany();
    console.log(`   Found ${requests.length} API requests`);

    // Migrate in batches for better performance
    const batchSize = 1000;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      await Models.ApiRequest.insertMany(
        batch.map(req => ({
          _id: req.id,
          apiKeyId: req.apiKeyId,
          userId: req.userId,
          endpoint: req.endpoint,
          method: req.method,
          statusCode: req.statusCode,
          responseTime: req.responseTime,
          ipAddress: req.ipAddress,
          userAgent: req.userAgent,
          createdAt: req.createdAt,
        }))
      );
      console.log(`   Progress: ${Math.min(i + batchSize, requests.length)}/${requests.length}`);
    }

    stats.push({ model: 'ApiRequest', count: requests.length, success: true });
    console.log(`   ✅ Migrated ${requests.length} API requests`);
  } catch (error: any) {
    console.error('   ❌ Error migrating API requests:', error.message);
    stats.push({ model: 'ApiRequest', count: 0, success: false, error: error.message });
  }
}

async function migrateProjects() {
  console.log('\n📦 Migrating Projects...');
  try {
    const projects = await prisma.project.findMany();
    console.log(`   Found ${projects.length} projects`);

    for (const project of projects) {
      await Models.Project.create({
        _id: project.id,
        title: project.title,
        description: project.description,
        image: project.image,
        techStack: project.techStack,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        featured: project.featured,
        order: project.order,
        published: project.published,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    }

    stats.push({ model: 'Project', count: projects.length, success: true });
    console.log(`   ✅ Migrated ${projects.length} projects`);
  } catch (error: any) {
    console.error('   ❌ Error migrating projects:', error.message);
    stats.push({ model: 'Project', count: 0, success: false, error: error.message });
  }
}

async function migrateExperiences() {
  console.log('\n📦 Migrating Experiences...');
  try {
    const experiences = await prisma.experience.findMany();
    console.log(`   Found ${experiences.length} experiences`);

    for (const exp of experiences) {
      await Models.Experience.create({
        _id: exp.id,
        title: exp.title,
        company: exp.company,
        location: exp.location,
        period: exp.period,
        description: exp.description,
        current: exp.current,
        order: exp.order,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
      });
    }

    stats.push({ model: 'Experience', count: experiences.length, success: true });
    console.log(`   ✅ Migrated ${experiences.length} experiences`);
  } catch (error: any) {
    console.error('   ❌ Error migrating experiences:', error.message);
    stats.push({ model: 'Experience', count: 0, success: false, error: error.message });
  }
}

async function migrateEducation() {
  console.log('\n📦 Migrating Education...');
  try {
    const education = await prisma.education.findMany();
    console.log(`   Found ${education.length} education records`);

    for (const edu of education) {
      await Models.Education.create({
        _id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        period: edu.period,
        order: edu.order,
        createdAt: edu.createdAt,
        updatedAt: edu.updatedAt,
      });
    }

    stats.push({ model: 'Education', count: education.length, success: true });
    console.log(`   ✅ Migrated ${education.length} education records`);
  } catch (error: any) {
    console.error('   ❌ Error migrating education:', error.message);
    stats.push({ model: 'Education', count: 0, success: false, error: error.message });
  }
}

async function migrateSkills() {
  console.log('\n📦 Migrating Skills...');
  try {
    const skills = await prisma.skill.findMany();
    console.log(`   Found ${skills.length} skills`);

    for (const skill of skills) {
      await Models.Skill.create({
        _id: skill.id,
        name: skill.name,
        slug: skill.slug,
        category: skill.category,
        order: skill.order,
        createdAt: skill.createdAt,
      });
    }

    stats.push({ model: 'Skill', count: skills.length, success: true });
    console.log(`   ✅ Migrated ${skills.length} skills`);
  } catch (error: any) {
    console.error('   ❌ Error migrating skills:', error.message);
    stats.push({ model: 'Skill', count: 0, success: false, error: error.message });
  }
}

async function migrateArticles() {
  console.log('\n📦 Migrating Articles...');
  try {
    const articles = await prisma.article.findMany();
    console.log(`   Found ${articles.length} articles`);

    for (const article of articles) {
      await Models.Article.create({
        _id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        published: article.published,
        publishedAt: article.publishedAt,
        views: article.views,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      });
    }

    stats.push({ model: 'Article', count: articles.length, success: true });
    console.log(`   ✅ Migrated ${articles.length} articles`);
  } catch (error: any) {
    console.error('   ❌ Error migrating articles:', error.message);
    stats.push({ model: 'Article', count: 0, success: false, error: error.message });
  }
}

async function migrateSocialMedia() {
  console.log('\n📦 Migrating Social Media...');
  try {
    const socialMedia = await prisma.socialMedia.findMany();
    console.log(`   Found ${socialMedia.length} social media records`);

    for (const social of socialMedia) {
      await Models.SocialMedia.create({
        _id: social.id,
        platform: social.platform,
        url: social.url,
        icon: social.icon,
        order: social.order,
        visible: social.visible,
      });
    }

    stats.push({ model: 'SocialMedia', count: socialMedia.length, success: true });
    console.log(`   ✅ Migrated ${socialMedia.length} social media records`);
  } catch (error: any) {
    console.error('   ❌ Error migrating social media:', error.message);
    stats.push({ model: 'SocialMedia', count: 0, success: false, error: error.message });
  }
}

async function migrateSiteConfig() {
  console.log('\n📦 Migrating Site Config...');
  try {
    const configs = await prisma.siteConfig.findMany();
    console.log(`   Found ${configs.length} config records`);

    for (const config of configs) {
      await Models.SiteConfig.create({
        _id: config.id,
        key: config.key,
        value: config.value,
        updatedAt: config.updatedAt,
      });
    }

    stats.push({ model: 'SiteConfig', count: configs.length, success: true });
    console.log(`   ✅ Migrated ${configs.length} config records`);
  } catch (error: any) {
    console.error('   ❌ Error migrating site config:', error.message);
    stats.push({ model: 'SiteConfig', count: 0, success: false, error: error.message });
  }
}

async function migrateAccounts() {
  console.log('\n📦 Migrating Accounts...');
  try {
    const accounts = await prisma.account.findMany();
    console.log(`   Found ${accounts.length} accounts`);

    for (const account of accounts) {
      await Models.Account.create({
        _id: account.id,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    }

    stats.push({ model: 'Account', count: accounts.length, success: true });
    console.log(`   ✅ Migrated ${accounts.length} accounts`);
  } catch (error: any) {
    console.error('   ❌ Error migrating accounts:', error.message);
    stats.push({ model: 'Account', count: 0, success: false, error: error.message });
  }
}

async function migrateSessions() {
  console.log('\n📦 Migrating Sessions...');
  try {
    const sessions = await prisma.session.findMany();
    console.log(`   Found ${sessions.length} sessions`);

    for (const session of sessions) {
      await Models.Session.create({
        _id: session.id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      });
    }

    stats.push({ model: 'Session', count: sessions.length, success: true });
    console.log(`   ✅ Migrated ${sessions.length} sessions`);
  } catch (error: any) {
    console.error('   ❌ Error migrating sessions:', error.message);
    stats.push({ model: 'Session', count: 0, success: false, error: error.message });
  }
}

async function migrateVerificationTokens() {
  console.log('\n📦 Migrating Verification Tokens...');
  try {
    const tokens = await prisma.verificationToken.findMany();
    console.log(`   Found ${tokens.length} verification tokens`);

    for (const token of tokens) {
      await Models.VerificationToken.create({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      });
    }

    stats.push({ model: 'VerificationToken', count: tokens.length, success: true });
    console.log(`   ✅ Migrated ${tokens.length} verification tokens`);
  } catch (error: any) {
    console.error('   ❌ Error migrating verification tokens:', error.message);
    stats.push({ model: 'VerificationToken', count: 0, success: false, error: error.message });
  }
}

async function migrateContacts() {
  console.log('\n📦 Migrating Contacts...');
  try {
    const contacts = await prisma.contact.findMany();
    console.log(`   Found ${contacts.length} contacts`);

    for (const contact of contacts) {
      await Models.Contact.create({
        _id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        read: contact.read,
        createdAt: contact.createdAt,
      });
    }

    stats.push({ model: 'Contact', count: contacts.length, success: true });
    console.log(`   ✅ Migrated ${contacts.length} contacts`);
  } catch (error: any) {
    console.error('   ❌ Error migrating contacts:', error.message);
    stats.push({ model: 'Contact', count: 0, success: false, error: error.message });
  }
}

async function migrateApiEndpoints() {
  console.log('\n📦 Migrating API Endpoints...');
  try {
    const endpoints = await prisma.apiEndpoint.findMany();
    console.log(`   Found ${endpoints.length} API endpoints`);

    for (const endpoint of endpoints) {
      await Models.ApiEndpoint.create({
        _id: endpoint.id,
        name: endpoint.name,
        description: endpoint.description,
        method: endpoint.method,
        path: endpoint.path,
        category: endpoint.category,
        language: endpoint.language,
        rawScript: endpoint.rawScript,
        code: endpoint.code,
        aiAnalysis: endpoint.aiAnalysis,
        enabled: endpoint.enabled,
        status: endpoint.status,
        requiresAuth: endpoint.requiresAuth,
        rateLimit: endpoint.rateLimit,
        params: endpoint.params,
        exampleCode: endpoint.exampleCode,
        order: endpoint.order,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt,
        approvedAt: endpoint.approvedAt,
        approvedBy: endpoint.approvedBy,
        rejectedReason: endpoint.rejectedReason,
      });
    }

    stats.push({ model: 'ApiEndpoint', count: endpoints.length, success: true });
    console.log(`   ✅ Migrated ${endpoints.length} API endpoints`);
  } catch (error: any) {
    console.error('   ❌ Error migrating API endpoints:', error.message);
    stats.push({ model: 'ApiEndpoint', count: 0, success: false, error: error.message });
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  let totalRecords = 0;
  let successCount = 0;
  let failCount = 0;

  stats.forEach(stat => {
    const status = stat.success ? '✅' : '❌';
    console.log(`${status} ${stat.model.padEnd(20)} ${stat.count.toString().padStart(6)} records`);
    if (stat.error) {
      console.log(`   Error: ${stat.error}`);
    }
    totalRecords += stat.count;
    if (stat.success) successCount++;
    else failCount++;
  });

  console.log('='.repeat(60));
  console.log(`Total Records Migrated: ${totalRecords}`);
  console.log(`Successful Models: ${successCount}/${stats.length}`);
  console.log(`Failed Models: ${failCount}/${stats.length}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Starting Data Migration: MySQL → MongoDB');
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Connect to MySQL (Prisma)
    await prisma.$connect();
    console.log('✅ Connected to MySQL (Prisma)');

    // Run migrations in order (respecting foreign key relationships)
    await migrateUsers();
    await migrateApiKeys();
    await migrateLicenses();
    await migrateApiRequests();
    await migrateProjects();
    await migrateExperiences();
    await migrateEducation();
    await migrateSkills();
    await migrateArticles();
    await migrateSocialMedia();
    await migrateSiteConfig();
    await migrateAccounts();
    await migrateSessions();
    await migrateVerificationTokens();
    await migrateContacts();
    await migrateApiEndpoints();

    // Print summary
    await printSummary();

    console.log('\n✨ Migration completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await prisma.$disconnect();
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from databases');
  }
}

// Run migration
main();

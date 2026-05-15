#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mongoose from 'mongoose';
import * as Models from '../src/models/index.js';

if (!process.env.DATABASE_URL || !process.env.MONGODB_URI) {
  console.error('❌ ERROR: DATABASE_URL and MONGODB_URI must be set in .env');
  process.exit(1);
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter } as any);
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  console.log('🚀 Starting Data Migration: MySQL → MongoDB\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await prisma.$connect();
    console.log('✅ Connected to MySQL\n');

    // Users
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      await Models.User.insertMany(users.map(u => ({
        email: u.email, name: u.name, image: u.image, role: u.role,
        emailVerified: u.emailVerified, createdAt: u.createdAt, updatedAt: u.updatedAt,
      })));
      console.log(`✅ Users: ${users.length}`);
    }

    // Projects
    const projects = await prisma.project.findMany();
    if (projects.length > 0) {
      await Models.Project.insertMany(projects.map(p => ({
        title: p.title, description: p.description, image: p.image, techStack: p.techStack,
        demoUrl: p.demoUrl, githubUrl: p.githubUrl, featured: p.featured, order: p.order,
        published: p.published, createdAt: p.createdAt, updatedAt: p.updatedAt,
      })));
      console.log(`✅ Projects: ${projects.length}`);
    }

    // Experiences
    const experiences = await prisma.experience.findMany();
    if (experiences.length > 0) {
      await Models.Experience.insertMany(experiences.map(e => ({
        title: e.title, company: e.company, location: e.location, period: e.period,
        description: e.description, current: e.current, order: e.order,
        createdAt: e.createdAt, updatedAt: e.updatedAt,
      })));
      console.log(`✅ Experiences: ${experiences.length}`);
    }

    // Education
    const education = await prisma.education.findMany();
    if (education.length > 0) {
      await Models.Education.insertMany(education.map(e => ({
        degree: e.degree, institution: e.institution, location: e.location, period: e.period,
        order: e.order, createdAt: e.createdAt, updatedAt: e.updatedAt,
      })));
      console.log(`✅ Education: ${education.length}`);
    }

    // Skills
    const skills = await prisma.skill.findMany();
    if (skills.length > 0) {
      await Models.Skill.insertMany(skills.map(s => ({
        name: s.name, slug: s.slug, category: s.category, order: s.order, createdAt: s.createdAt,
      })));
      console.log(`✅ Skills: ${skills.length}`);
    }

    // Social Media
    const socialMedia = await prisma.socialMedia.findMany();
    if (socialMedia.length > 0) {
      await Models.SocialMedia.insertMany(socialMedia.map(s => ({
        platform: s.platform, url: s.url, icon: s.icon, order: s.order, visible: s.visible,
      })));
      console.log(`✅ Social Media: ${socialMedia.length}`);
    }

    // Site Config
    const configs = await prisma.siteConfig.findMany();
    if (configs.length > 0) {
      await Models.SiteConfig.insertMany(configs.map(c => ({
        key: c.key, value: c.value, updatedAt: c.updatedAt,
      })));
      console.log(`✅ Site Config: ${configs.length}`);
    }

    // API Endpoints - filter out invalid ones
    const endpoints = await prisma.apiEndpoint.findMany();
    if (endpoints.length > 0) {
      const validEndpoints = endpoints.filter(e => e.rawScript && e.code);
      if (validEndpoints.length > 0) {
        await Models.ApiEndpoint.insertMany(validEndpoints.map(e => ({
          name: e.name, description: e.description, method: e.method, path: e.path,
          category: e.category, language: e.language, rawScript: e.rawScript, code: e.code,
          aiAnalysis: e.aiAnalysis, enabled: e.enabled, status: e.status,
          requiresAuth: e.requiresAuth, rateLimit: e.rateLimit, params: e.params,
          exampleCode: e.exampleCode, order: e.order, createdAt: e.createdAt,
          updatedAt: e.updatedAt, approvedAt: e.approvedAt, approvedBy: e.approvedBy,
          rejectedReason: e.rejectedReason,
        })));
      }
      console.log(`✅ API Endpoints: ${validEndpoints.length}/${endpoints.length}`);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Test your application');
    console.log('   3. Update remaining API routes with: npm run migrate:update-routes');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

main();

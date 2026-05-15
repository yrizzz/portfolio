#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import * as Models from '../src/models/index.js';

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
  
  console.log('📊 Data in MongoDB:\n');
  console.log('Users:', await Models.User.countDocuments());
  console.log('Projects:', await Models.Project.countDocuments());
  console.log('Experiences:', await Models.Experience.countDocuments());
  console.log('Education:', await Models.Education.countDocuments());
  console.log('Skills:', await Models.Skill.countDocuments());
  console.log('Social Media:', await Models.SocialMedia.countDocuments());
  console.log('Site Config:', await Models.SiteConfig.countDocuments());
  console.log('API Endpoints:', await Models.ApiEndpoint.countDocuments());
  
  console.log('\n📝 Sample Data:\n');
  const user = await Models.User.findOne();
  if (user) {
    console.log('User:', { email: user.email, name: user.name, role: user.role });
  }
  
  const projects = await Models.Project.find().limit(3);
  console.log('\nProjects:');
  projects.forEach(p => console.log(`  - ${p.title}`));
  
  const skills = await Models.Skill.find().limit(5);
  console.log('\nSkills:');
  skills.forEach(s => console.log(`  - ${s.name} (${s.category})`));
  
  await mongoose.disconnect();
}

main();

#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI);
  
  const dbName = mongoose.connection.db.databaseName;
  const collections = await mongoose.connection.db.listCollections().toArray();
  
  console.log('✅ Connected to MongoDB\n');
  console.log('📊 Database Information:\n');
  console.log(`Database Name: ${dbName}`);
  console.log(`Connection URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`\nCollections (${collections.length}):`);
  
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`  - ${col.name}: ${count} documents`);
  }
  
  await mongoose.disconnect();
}

main();

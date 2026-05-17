#!/usr/bin/env node

/**
 * Script to rewrite all API endpoints in database
 * This will update all endpoints to match the correct codebase format
 */

const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rekberariez:ammyam10@cluster0.kyuaitx.mongodb.net/portfolio?appName=Cluster0';

// Define ApiEndpoint model
const ApiEndpointSchema = new mongoose.Schema({}, { strict: false, collection: 'apiendpoints' });
const ApiEndpoint = mongoose.model('ApiEndpoint', ApiEndpointSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function rewriteAllAPIs() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 API Endpoints Rewrite Script');
    console.log('='.repeat(60));
    console.log('\nThis script will:');
    console.log('1. Fetch all API endpoints from database');
    console.log('2. Standardize code format');
    console.log('3. Fix params structure');
    console.log('4. Ensure all fields are properly formatted');
    console.log('\n⚠️  WARNING: This will modify all API endpoints in database!');
    console.log('='.repeat(60) + '\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all endpoints
    const endpoints = await ApiEndpoint.find({}).lean();
    console.log(`📊 Found ${endpoints.length} API endpoints\n`);

    if (endpoints.length === 0) {
      console.log('ℹ️  No endpoints to process');
      return;
    }

    // Ask for confirmation

    console.log('\n' + '='.repeat(60));
    console.log('🔄 Processing endpoints...');
    console.log('='.repeat(60) + '\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const endpoint of endpoints) {
      try {
        const updates = {};
        let needsUpdate = false;

        // 1. Ensure code field exists (use rawScript if code is empty)
        if (!endpoint.code && endpoint.rawScript) {
          updates.code = endpoint.rawScript;
          needsUpdate = true;
        }

        // 2. Ensure rawScript exists (use code if rawScript is empty)
        if (!endpoint.rawScript && endpoint.code) {
          updates.rawScript = endpoint.code;
          needsUpdate = true;
        }

        // 3. Standardize params format
        if (endpoint.params) {
          try {
            let params;
            if (typeof endpoint.params === 'string') {
              params = JSON.parse(endpoint.params);
            } else {
              params = endpoint.params;
            }

            // Ensure params is array and has correct structure
            if (Array.isArray(params)) {
              const standardizedParams = params.map(p => ({
                name: p.name || '',
                type: p.type || 'string',
                required: p.required !== undefined ? p.required : false,
                description: p.description || '',
                default: p.default || ''
              }));
              updates.params = JSON.stringify(standardizedParams);
              needsUpdate = true;
            }
          } catch (e) {
            console.log(`  ⚠️  ${endpoint.name}: Failed to parse params`);
          }
        }

        // 4. Ensure required fields exist
        if (!endpoint.method) {
          updates.method = 'GET';
          needsUpdate = true;
        }

        if (!endpoint.category) {
          updates.category = 'custom';
          needsUpdate = true;
        }

        if (!endpoint.language) {
          updates.language = 'nodejs';
          needsUpdate = true;
        }

        if (endpoint.requiresAuth === undefined) {
          updates.requiresAuth = false;
          needsUpdate = true;
        }

        if (!endpoint.rateLimit) {
          updates.rateLimit = 100;
          needsUpdate = true;
        }

        if (endpoint.enabled === undefined) {
          updates.enabled = true;
          needsUpdate = true;
        }

        if (!endpoint.status) {
          updates.status = 'approved';
          needsUpdate = true;
        }

        // 5. Update timestamp
        updates.updatedAt = new Date();

        // Apply updates if needed
        if (needsUpdate) {
          await ApiEndpoint.updateOne(
            { _id: endpoint._id },
            { $set: updates }
          );
          console.log(`  ✅ ${endpoint.name.padEnd(40)} - Updated`);
          updated++;
        } else {
          console.log(`  ⏭️  ${endpoint.name.padEnd(40)} - No changes needed`);
          skipped++;
        }

      } catch (error) {
        console.log(`  ❌ ${endpoint.name.padEnd(40)} - Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated:  ${updated}`);
    console.log(`⏭️  Skipped:  ${skipped}`);
    console.log(`❌ Errors:   ${errors}`);
    console.log(`📊 Total:    ${endpoints.length}`);
    console.log('='.repeat(60));
    console.log('\n✨ API endpoints rewrite completed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Run the script
rewriteAllAPIs().catch(console.error);

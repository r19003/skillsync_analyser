const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('⚠️ Could not set custom DNS servers:', e.message);
}

const LearningResource = require('../models/LearningResource');

// Check CLI arguments for --uri=...
const cliUriArg = process.argv.find(arg => arg.startsWith('--uri='));
const CLI_URI = cliUriArg ? cliUriArg.replace('--uri=', '').trim() : null;

const MONGO_URI = CLI_URI || process.env.MONGO_URI || 
  'mongodb+srv://rainaarora09_db_user:miomLBgRVKEWMQPJ@cluster0.2qcl6vg.mongodb.net/skillsync?retryWrites=true&w=majority&appName=Cluster0';

async function importResources() {
  console.log(`🚀 Connecting to MongoDB Atlas (${MONGO_URI.replace(/:([^:@]+)@/, ':****@')})...`);
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Locate the json file
    const pathsToTry = [
      path.join(__dirname, '../data/skillsync_learning_resources.json'),
      path.join(__dirname, '../../skillsync_learning_resources.json'),
      path.join(process.cwd(), 'skillsync_learning_resources.json')
    ];

    let filePath = pathsToTry.find(p => fs.existsSync(p));
    if (!filePath) {
      throw new Error(`skillsync_learning_resources.json not found in paths: ${pathsToTry.join(', ')}`);
    }

    console.log(`📂 Reading resources from: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const resources = JSON.parse(rawData);

    if (!Array.isArray(resources) || resources.length === 0) {
      throw new Error('JSON file is empty or not an array of objects.');
    }

    console.log(`📊 Found ${resources.length} resources to import.`);

    // Perform bulk upsert
    const bulkOps = resources.map(resource => ({
      updateOne: {
        filter: { resourceId: resource.resourceId },
        update: { $set: resource },
        upsert: true
      }
    }));

    const result = await LearningResource.bulkWrite(bulkOps);
    console.log(`✨ BulkWrite completed:`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
    console.log(`   - Upserted: ${result.upsertedCount}`);

    const totalCount = await LearningResource.countDocuments();
    console.log(`📚 Total documents in 'learningresources' collection: ${totalCount}`);

    await mongoose.disconnect();
    console.log('🔒 Database connection closed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

importResources();

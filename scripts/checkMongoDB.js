require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in your .env.local file');
  process.exit(1);
}

async function checkMongoDBConnection() {
  console.log('🔄 Checking MongoDB connection before starting the application...');

  try {
    const client = new MongoClient(uri);
    await client.connect();

    // Test the connection by attempting to use a command
    const db = client.db();
    await db.command({ ping: 1 });

    console.log('✅ MongoDB connection successful!');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

checkMongoDBConnection();

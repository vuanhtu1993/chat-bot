import clientPromise from "./mongodb";

// Flag to track if initialization has been performed
let isInitialized = false;

/**
 * Initialize MongoDB connection for API routes
 * Only runs the check once and logs the result to console
 */
export async function initializeMongoDBForAPI() {
  if (isInitialized) {
    return clientPromise;
  }

  // Check connection and log the result
  console.log('🔄 Checking MongoDB connection...');

  try {
    // Test the connection by attempting to connect
    const client = await clientPromise;
    const db = client.db();

    // Try a simple command to verify the connection
    await db.command({ ping: 1 });

    console.log('✅ MongoDB connection successful!');
    isInitialized = true;
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

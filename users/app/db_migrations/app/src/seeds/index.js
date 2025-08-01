const { MongoClient } = require('mongodb');
const { seedUsers, clearUsers } = require('./users');

const config = require('../migrate-mongo-config');

async function connectDB() {
  const client = new MongoClient(config.mongodb.url);
  await client.connect();
  return { client, db: client.db() };
}

async function runSeeds() {
  let client;
  
  try {
    const { client: dbClient, db } = await connectDB();
    client = dbClient;
    
    await seedUsers(db);
    
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function clearSeeds() {
  let client;
  
  try {
    const { client: dbClient, db } = await connectDB();
    client = dbClient;
    
    await clearUsers(db);
    
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

const command = process.argv[2];

if (command === 'clear' || command === 'reset') {
  clearSeeds();
} else {
  runSeeds();
}

module.exports = {
  runSeeds,
  clearSeeds
}; 
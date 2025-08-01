const { MongoClient } = require('mongodb');

function generateUsers(count = 10000) {
  const users = [];
  
  for (let i = 1; i <= count; i++) {
    users.push({
      name: `User ${i.toString().padStart(5, '0')}`,
      email: `user${i.toString().padStart(5, '0')}@example.com`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
    });
  }
  
  return users;
}

async function seedUsers(db) {
  const users = generateUsers(10000);
  const batchSize = 1000;
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await db.collection('users').insertMany(batch);
  }

  console.log(`Seeded ${users.length} users`);
}

async function clearUsers(db) {
  const result = await db.collection('users').deleteMany({
    email: { $regex: /^user\d{5}@example\.com$/ }
  });

  console.log(`Cleared ${result.deletedCount} users`);
}

module.exports = {
  seedUsers,
  clearUsers,
  generateUsers
}; 
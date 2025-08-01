try {
  rs.initiate({
    _id: "rs0",
    members: [
      {
        _id: 0,
        host: "mongo-primary:27017",
        priority: 2
      },
      {
        _id: 1,
        host: "mongo-secondary1:27017",
        priority: 1
      },
      {
        _id: 2,
        host: "mongo-secondary2:27017",
        priority: 1
      }
    ]
  });
  
  console.log('Replica set initiated successfully');
} catch (error) {
  if (error.code === 23) { 
    console.warn('Replica set already initialized');
  } else {
    console.error('Error initializing replica set:', error);
  }
}

console.log('Waiting for replica set to be ready...');
while (rs.status().ok !== 1) {
  sleep(1000);
}

console.log('Replica set is ready!');
console.log('Current status:', JSON.stringify(rs.status(), null, 2));
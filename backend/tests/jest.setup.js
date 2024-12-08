// tests/jest.setup.js
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables for tests
dotenv.config({ path: '../.env' });

let replSet;

beforeAll(async () => {
  // Start MongoMemoryReplSet
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ storageEngine: 'wiredTiger' }],
  });

  const uri = replSet.getUri();

  // Set MONGO_URI for Mongoose
  process.env.MONGO_URI = uri;

  // Set JWT secrets for tests
  process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';

  // Ensure logs directory exists inside tests
  const logDir = path.resolve(__dirname, 'logs'); // 'tests/logs'

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    // Odeberte nebo opravte následující řádek, pokud používáte logger
    // logger.info(`Created upload directory at ${uploadDir}`);
  }

  // Connect to in-memory MongoDB
  await mongoose.connect(uri); // Odebráno: useNewUrlParser a useUnifiedTopology
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await replSet.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
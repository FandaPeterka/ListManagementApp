const dotenv = require('dotenv');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const app = require('./app');

// Load environment variables
dotenv.config({ path: './.env' });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Connect to the database
const connectDB = require('./config/db');
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`, { promise });
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
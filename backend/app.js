const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');
const logger = require('./middleware/logger');

const userRoutes = require('./features/users/userRoutes');
const tokenRoutes = require('./features/tokens/tokenRoutes');
const listRoutes = require('./features/lists/listRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with logging
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
logger.info('CORS enabled for http://localhost:3000');

// HTTP request logging using morgan and winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Parse JSON and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs
app.use(sanitizeMiddleware);

// Rate limiter
app.use(rateLimiter);

// Serve static files (for profile pictures) with CORP header
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);
logger.info(`Serving static files from ${path.join(__dirname, 'uploads')}`);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/lists', listRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
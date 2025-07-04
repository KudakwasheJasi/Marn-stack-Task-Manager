import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConnection } from './utils/index.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { protectRoute } from './middlewares/authMiddlewave.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Check for essential env vars
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not set!');
  process.exit(1);
}

// === CORS CONFIGURATION ===
const allowedOrigins = [
  'http://localhost:3000',
  'https://marn-stack-task-manager.vercel.app',
  'https://marn-stack-task-manager.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS Allowed: ${origin}`);
      return callback(null, true);
    } else {
      console.warn(`❌ CORS Blocked: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count', 'Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
  preflightContinue: false, // Changed to false
  allowCredentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// === MIDDLEWARE ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === STATIC FILES ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === LOGGING ===
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// === ROUTES ===
// Add middleware for all API routes
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
});

// Use the router middleware
app.use('/api/auth', authRoutes);
app.use('/api/tasks', protectRoute, taskRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        status: false,
        message: 'Internal server error'
    });
});

// === ROOT INFO ROUTE ===
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      users: '/api/users',
      health: '/api/health'
    },
    version: process.env.npm_package_version || '1.0.0'
  });
});

// === 404 HANDLER ===
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    timestamp: new Date(),
    path: req.originalUrl
  });
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal Server Error'
  });
});

// === UNHANDLED ERRORS ===
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// === GRACEFUL SHUTDOWN ===
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Server shut down.');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// === START SERVER ===
const startServer = async () => {
  try {
    await dbConnection();

    const server = app.listen(port, () => {
      const baseURL = process.env.RENDER_EXTERNAL_URL
        ? `${process.env.RENDER_EXTERNAL_URL}/api`
        : `http://localhost:${port}/api`;

      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌐 API Base: ${baseURL}`);
      console.log(`✅ Health Check: ${baseURL}/health`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

startServer();

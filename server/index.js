/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 02/07/2025 - 07:31:07
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 02/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : Update import paths to use correct relative paths
**/
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

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Ensure environment variables are set
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set!');
    process.exit(1);
}

// Mount API routes with prefix
app.use('/api', (req, res, next) => {
    next();
});

// Enhanced CORS configuration
// CORS middleware with detailed logging
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        url: req.url,
        origin: req.headers.origin,
        headers: Object.keys(req.headers).length > 0 ? Object.fromEntries(
            Object.entries(req.headers).filter(([key]) => key.toLowerCase() !== 'authorization')
        ) : {}
    });
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://marn-stack-task-manager.onrender.com',
            'https://task-manager-frontend-kudakwashe.vercel.app'
        ];
        
        if (!origin) {
            console.log('CORS request from undefined origin - allowing');
            callback(null, true);
            return;
        }
        
        if (allowedOrigins.includes(origin)) {
            console.log('CORS request from allowed origin:', origin);
            callback(null, true);
        } else {
            console.log('CORS request from blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 600, // Cache preflight requests for 10 minutes
    optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes with API prefix
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root path handler
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

app.get('/api', (req, res) => {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', protectRoute, taskRoutes);
app.use('/api/users', userRoutes);

// 404 handler for non-existent routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        timestamp: new Date(),
        path: req.path
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date(),
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 8800;
    res.status(statusCode).json({
        status: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err.details || null
        } : 'Internal Server Error'
    });
});

// 404 handler with more details
app.use((req, res) => {
    console.error('404 Error:', {
        path: req.path,
        method: req.method,
        timestamp: new Date()
    });
    
    res.status(404).json({
        status: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date()
    });
});

// Enhanced global error handlers
process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled Rejection:', {
        error: error,
        promise: promise,
        timestamp: new Date()
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', {
        error: error,
        timestamp: new Date()
    });
    // Give the server time to send any pending responses before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// Database connection and server startup with enhanced error handling
const startServer = async () => {
    try {
        // Connect to database
        await dbConnection();
        
        // Start server
        const server = app.listen(port, () => {
            console.log(`
==========================================
🚀 Server is running on port ${port}
📱 API: http://localhost:${port}/api
🔐 Auth Routes: http://localhost:${port}/api/auth
📋 Task Routes: http://localhost:${port}/api/tasks
🏥 Health Check: http://localhost:${port}/api/health
==========================================
            `);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });

        // Handle unhandled rejections
        process.on('unhandledRejection', (error) => {
            console.error('Unhandled rejection:', error);
            process.exit(1);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught exception:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start server:', {
            error: error,
            timestamp: new Date()
        });
        process.exit(1);
    }
};

// Graceful shutdown handler
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Add any cleanup operations here (close database connections, etc.)
    try {
        // Give server time to finish pending requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Shutting down server...');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle different termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
startServer();

export default app;
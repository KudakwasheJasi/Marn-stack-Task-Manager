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
    * - Modification    : 
**/
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnection } from './utils/index.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { protectRoute } from './middlewares/authMiddlewave.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Changed to 8000 to match client config

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Test route with enhanced response
app.get('/api/test', (req, res) => {
    res.json({
        status: true,
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', protectRoute, taskRoutes);

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
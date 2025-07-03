const config = {
    // API configuration
    apiEndpoint: 'https://api.render.com', // Use Render's public API endpoint

    // MongoDB URI - Using environment variables
    mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI,

    // API URL - This will be set after deployment
    apiUrl: '',

    // Server configuration
    jwtSecret: process.env.JWT_SECRET || 'kjewhuhewhugheygy',
    clientUrl: process.env.CLIENT_URL || 'https://client-7s4kn5agh-kudakwashejasis-projects.vercel.app',
    port: process.env.PORT || 8800,
    nodeEnv: process.env.NODE_ENV || 'production'
};

module.exports = config;

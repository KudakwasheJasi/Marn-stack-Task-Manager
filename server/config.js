const config = {
    // API configuration
    apiEndpoint: 'https://api.render.com', // Use Render's public API endpoint

    // MongoDB URI - Using the one from your .env.production
    mongodbUri: 'mongodb+srv://jasikudakwashe42:XSsVs9VzDlBqkzzT@cluster0.rksmdnu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',

    // API URL - This will be set after deployment
    apiUrl: '',

    // Server configuration
    jwtSecret: 'kjewhuhewhugheygy',
    clientUrl: 'https://client-7s4kn5agh-kudakwashejasis-projects.vercel.app',
    port: 8800,
    nodeEnv: 'production'
};

module.exports = config;

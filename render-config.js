const config = {
    renderApiToken: process.env.RENDER_API_TOKEN || 'your-render-api-token-here',
    mongodbUri: process.env.MONGODB_URI || 'your-mongodb-uri-here',
    apiUrl: process.env.API_URL || 'your-api-url-here'
};

module.exports = config;

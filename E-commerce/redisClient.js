const redis = require('redis');

const redisClient = redis.createClient({
    host: 'redis', // Assuming 'redis' is the service name in Docker Compose
    port: 6379,
    // Other options...
});

// Handle Redis client connection events
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
    console.log("Redis client state:", redisClient.connected);

    setTimeout(() => {
        startApplication();
    }, 1000);
    
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

function startApplication() {
    // Import necessary modules and perform any additional setup here
    const express = require('express');
    const bodyParser = require('body-parser');
    const ProductController = require('./path-to-your/ProductController'); // Update the path
    const app = express();

    // Middleware
    app.use(bodyParser.json());

    // Routes
    app.post('/addProducts', ProductController.addProducts);
    app.get('/getProducts', ProductController.getProducts);

    // Start the server
    const PORT = 4005;
    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
}

module.exports = redisClient;

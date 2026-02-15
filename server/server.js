const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Security & Utilities
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan'); // Logging
const swaggerUi = require('swagger-ui-express'); // Documentation UI
const YAML = require('yamljs'); // To load the yaml file

// Middleware Imports
const errorHandler = require('./middleware/errorHandler');

// Environment Setup
// Fix for potential SSL issues in dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
    console.warn("Warning: .env file not found or failed to load.");
}

const app = express();

// 1. Documentation (Swagger)
try {
    const swaggerDocument = YAML.load('./swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log("Documentation available at /api-docs");
} catch (err) {
    console.error("Could not load swagger.yaml", err);
}

// 2. Security Middleware (Headers)
app.use(helmet()); 

// 3. Logging ---
app.use(morgan('dev'));

// 4. Standard Middleware (Parsing)
app.use(express.json()); // מפענח JSON
app.use(express.urlencoded({ extended: true })); 

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 5. Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'יותר מדי בקשות מה-IP הזה, אנא נסו שוב מאוחר יותר.'
});
app.use('/api/', limiter);

// 5. Security Middleware (Data Sanitization)
app.use(mongoSanitize()); 

// 6. Database Connection
const dbURI = process.env.MORIYA_DB;
if (!dbURI) {
    console.error("Error: MORIYA_DB variable is missing!");
    throw new Error("Configuration Error: Missing DB URI");
}

mongoose.connect(dbURI)
    .then(() => console.log("--- SUCCESS: DB connected! ---"))
    .catch(err => console.error("DB Connection Error:", err));

// 7. Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 8. Global Error Handler (Must be last!)
app.use(errorHandler);

// 9. Server Startup & Graceful Shutdown
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
        });
    });
});
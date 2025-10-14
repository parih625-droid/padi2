const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/mongodb');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://87.107.12.71:5000',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/assets', express.static(path.join(__dirname, '../frontend/dist/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// For SPA routing, serve index.html for all non-API routes
// This should come after static file serving but BEFORE the 404 handler
app.get('/', (req, res) => {
  console.log('Root route hit');
  if (fs.existsSync(frontendDistPath)) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Serving index.html for root route');
      res.sendFile(indexPath);
    } else {
      console.log('index.html NOT found for root route');
      res.status(404).send('Frontend files found but index.html is missing');
    }
  } else {
    // Fallback API response
    res.json({ 
      message: 'Frontend not built yet. API is working correctly.',
      api_docs: '/api/health',
      timestamp: new Date().toISOString()
    });
  }
});

// Add a 404 handler for unmatched routes (should come after all other routes)
app.use((req, res, next) => {
  console.log('404 handler hit for:', req.url);
  res.status(404).json({
    message: 'Route not found',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware - CORS-friendly version
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error timestamp:', new Date().toISOString());
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  console.error('Error name:', err.name);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  console.error('Request body:', req.body);
  
  // Ensure CORS headers are set even for error responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle specific error types with more detail
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    console.error('Database error details:', {
      code: err.code,
      message: err.message,
      name: err.name
    });
    return res.status(500).json({ 
      message: 'Database connection error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'ValidationError') {
    console.error('Validation error:', err.message);
    return res.status(400).json({ 
      message: 'Validation error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Bad request',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle timeout errors specifically
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    console.error('Socket timeout error:', err.message);
    return res.status(408).json({ 
      message: 'Request timeout', 
      error: 'The server timed out waiting for the request',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error response with timestamp
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Use Render's PORT or default to 5000
const PORT = process.env.PORT || 5000;

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server running on port ${PORT} (HTTP)`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

module.exports = app;
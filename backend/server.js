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

// Security middleware with completely disabled CSP for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Completely disable CSP for development
}));

// CORS configuration - Allow local access
app.use(cors({
  origin: [
    'http://87.107.12.71:5000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://87.107.12.71'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Add explicit CORS headers for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// Serve frontend static files with correct path
const frontendDistPath = path.join(__dirname, '../frontend/dist');
console.log('Frontend dist path:', frontendDistPath);

// Check if frontend dist directory exists
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  console.log('Frontend dist directory exists');
  const files = fs.readdirSync(frontendDistPath);
  console.log('Frontend dist directory contents (first 10):', files.slice(0, 10));
  
  // Check if index.html exists specifically
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('index.html found at:', indexPath);
  } else {
    console.log('index.html NOT found at:', indexPath);
  }
  
  // Serve static files
  app.use(express.static(frontendDistPath, {
    maxAge: '1h',
    etag: false
  }));
  
  // SPA routing - serve index.html for all non-API routes
  // This handles all frontend routes including /admin, /products, /cart, etc.
  app.get(/^(?!\/(api|uploads|assets)).*$/, (req, res) => {
    console.log('SPA route hit for:', req.url);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).json({ 
          message: 'Failed to serve frontend', 
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  console.log('Serving static files from:', frontendDistPath);
} else {
  console.log('WARNING: Frontend dist directory does not exist at:', frontendDistPath);
  console.log('Current directory:', __dirname);
  console.log('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
  
  // Fallback for when frontend is not built
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Frontend not built yet. API is working correctly.',
      api_docs: '/api/health',
      timestamp: new Date().toISOString()
    });
  });
}

// Add a 404 handler for unmatched API routes (should come after all other routes but before error handler)
app.use((req, res, next) => {
  console.log('404 handler hit for:', req.url);
  res.status(404).json({
    message: 'Route not found',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Add a route to test if static files are accessible
app.get('/test-frontend', (req, res) => {
  console.log('Test frontend route hit');
  console.log('Frontend dist path:', frontendDistPath);
  console.log('Frontend dist exists:', fs.existsSync(frontendDistPath));
  
  if (fs.existsSync(frontendDistPath)) {
    const files = fs.readdirSync(frontendDistPath);
    console.log('Frontend files:', files);
    res.json({ 
      message: 'Frontend directory accessible',
      files: files,
      path: frontendDistPath,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ 
      message: 'Frontend directory not found',
      path: frontendDistPath,
      timestamp: new Date().toISOString()
    });
  }
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

// Use port 5000 for testing
const PORT = process.env.PORT || 5000;

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server running on port ${PORT} (HTTP)`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

module.exports = app;
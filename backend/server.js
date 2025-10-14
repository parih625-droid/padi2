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

// Add debug logging for environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set (defaulting to 5000)');
console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('====================================');

// Validate required environment variables
const requiredEnvVars = ['DB_CONNECTION_STRING', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.log('\n⚠️  Warning: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('   Please set these variables in your Render environment settings.');
}

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware with relaxed CSP for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "http:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "data:", "http:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "http:", "https:"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      fontSrc: ["'self'", "https:", "data:", "http:"],
      connectSrc: ["'self'", "http:", "https:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));

// CORS configuration - Allow local access
app.use(cors({
  origin: [
    'http://87.107.12.71:5000',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting - Disabled for local development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // limit each IP to 500 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//     retryAfter: 900 // 15 minutes in seconds
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req, res) => {
//     // Skip rate limiting for OPTIONS requests and health check
//     return req.method === 'OPTIONS' || req.url === '/api/health' || req.url === '/api/test' || req.url === '/api/test-orders';
//   }
// });

// Apply rate limiting to all requests
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });
}

// Static files for uploaded images with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  next();
}, express.static(path.join(__dirname, 'uploads')));

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
  app.use(express.static(frontendDistPath));
  console.log('Serving static files from:', frontendDistPath);
} else {
  console.log('WARNING: Frontend dist directory does not exist at:', frontendDistPath);
  console.log('Current directory:', __dirname);
  console.log('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
}

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));

// For SPA routing, serve index.html for all non-API routes
app.get(/^(?!\/api).+/, (req, res) => {
  if (fs.existsSync(frontendDistPath)) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    console.log('Health check endpoint hit');
    console.log('Request headers:', req.headers);
    
    // Check if required environment variables are set
    const requiredEnvVars = ['DB_CONNECTION_STRING', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    // Check database connection status
    const dbConnected = mongoose.connection.readyState === 1;
    const dbConnectionStatus = {
      readyState: mongoose.connection.readyState,
      readyStateDescription: getConnectionStateDescription(mongoose.connection.readyState),
      host: dbConnected ? mongoose.connection.host : null,
      name: dbConnected ? mongoose.connection.name : null
    };
    
    const response = { 
      status: 'OK', 
      message: 'E-commerce API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      database: dbConnectionStatus,
      configuration: {
        missingEnvVars: missingEnvVars,
        frontendUrl: process.env.FRONTEND_URL || null
      }
    };
    
    console.log('Health check response:', response);
    res.json(response);
  } catch (error) {
    console.error('Health check error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to describe connection states
function getConnectionStateDescription(state) {
  switch(state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

// Enhanced database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Check connection state first
    const connectionState = mongoose.connection.readyState;
    if (connectionState !== 1) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database not connected',
        connectionState: getConnectionStateDescription(connectionState),
        timestamp: new Date().toISOString()
      });
    }
    
    // Simple test to check if we can access the database
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.json({ 
      status: 'success', 
      message: 'Database connection is working properly',
      userCount: count,
      connectionState: getConnectionStateDescription(connectionState),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve a simple frontend page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>E-commerce API</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>E-commerce Backend API</h1>
            <p>Your backend API is running successfully!</p>
            <p><a href="/api/health">Health Check</a> | <a href="/api/test-db">Database Test</a></p>
            <p>Make sure to set up your database connection in Render environment variables.</p>
        </div>
    </body>
    </html>
  `);
});

// Test endpoint for orders (outside of /api/orders to avoid middleware)
app.get('/api/test-orders', (req, res) => {
  console.log('=== TEST ENDPOINT HIT ===');
  res.json({ message: 'Test endpoint working' });
});

// Simple test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  console.log('=== SIMPLE TEST ENDPOINT HIT ===');
  res.json({ message: 'Server is working' });
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

// Check if SSL certificates are available
const hasSSLCerts = process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH && 
                   fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH);

if (hasSSLCerts) {
  // Start HTTPS server
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 HTTPS Server running on port ${PORT}`);
    console.log(`📱 Health check: https://localhost:${PORT}/api/health`);
    console.log(`📊 API Documentation: https://localhost:${PORT}/api`);
    console.log('='.repeat(50));
    
    // Show warning if required environment variables are missing
    const requiredEnvVars = ['DB_CONNECTION_STRING', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      console.log('\n⚠️  Warning: Application may not function correctly due to missing environment variables');
      console.log('   Missing variables:', missingEnvVars.join(', '));
    }
    
    console.log('\n✅ HTTPS Server startup completed');
  });
} else {
  // Start HTTP server (fallback)
  console.log('Starting HTTP server (no SSL certificates found)');
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
    console.log('='.repeat(50));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n💡 Development Tips:');
      console.log('   - Make sure MongoDB is running');
      console.log('   - Update database connection string in .env');
      console.log('   - Frontend will run at http://localhost:5173');
    }
    
    // Show warning if required environment variables are missing
    const requiredEnvVars = ['DB_CONNECTION_STRING', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      console.log('\n⚠️  Warning: Application may not function correctly due to missing environment variables');
      console.log('   Missing variables:', missingEnvVars.join(', '));
    }
    
    console.log('\n✅ Server startup completed');
  });
}

module.exports = app;
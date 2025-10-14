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
// This should come after static file serving
app.get(/^(?!\/(api|uploads|assets)).*$/, (req, res) => {
  console.log('SPA route hit for:', req.url);
  if (fs.existsSync(frontendDistPath)) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Serving index.html for SPA route');
      res.sendFile(indexPath);
    } else {
      console.log('index.html NOT found for SPA route');
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

// Start HTTP server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server running on port ${PORT} (HTTP)`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

module.exports = app;
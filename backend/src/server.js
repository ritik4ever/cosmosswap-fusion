const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Simple logging function
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

// Import routes
const swapRoutes = require('./routes/swap');
const oneInchRoutes = require('./routes/oneInch');

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins (local dev + deployed frontend)
const allowedOrigins = [
  'http://localhost:5173', // Vite dev
  'http://localhost:3000', // CRA/Next dev
  process.env.FRONTEND_URL // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  log.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/swap', swapRoutes);
app.use('/api/1inch', oneInchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    contract: process.env.ETHEREUM_CONTRACT_ADDRESS,
    services: {
      oneInch: !!process.env.ONEINCH_API_KEY,
      ethereum: !!process.env.ETHEREUM_RPC_URL,
      cosmos: !!process.env.COSMOS_RPC_URL
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CosmosSwap - 1inch Fusion+ Extension API',
    version: '1.0.0',
    description: 'Cross-chain atomic swaps powered by 1inch + Cosmos HTLC',
    endpoints: {
      health: '/health',
      swap: '/api/swap',
      oneInch: '/api/1inch'
    },
    contract: process.env.ETHEREUM_CONTRACT_ADDRESS,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  log.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  log.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server — always bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  log.info(`🚀 CosmosSwap - 1inch Fusion+ Extension Backend running on http://0.0.0.0:${PORT}`);
  log.info(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  log.info(`📍 Contract: ${process.env.ETHEREUM_CONTRACT_ADDRESS}`);
  log.info(`🔗 1inch Integration: ${process.env.ONEINCH_API_KEY ? 'Enabled' : 'Disabled'}`);
});

module.exports = app;

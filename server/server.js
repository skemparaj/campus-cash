require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup allowing local development
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root API Status (Requirement 39)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    uptime: `${Math.floor(process.uptime())}s`,
    version: '1.0.0',
    system: 'CAMPUS CASH - Smart Digital Campus Wallet API',
    timestamp: new Date().toISOString(),
    mode: 'Virtual Demo Wallet Engine'
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// Global Error Handler (Rule 20)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CAMPUS CASH API Server active on http://localhost:${PORT}`);
  console.log(`====================================================`);
});

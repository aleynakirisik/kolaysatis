const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'KolaySatış Backend API çalışıyor!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint test başarılı!',
    status: 'success'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KolaySatış Backend ${PORT} portunda çalışıyor!`);
  console.log(`📋 API Test: http://localhost:${PORT}/api/test`);
});
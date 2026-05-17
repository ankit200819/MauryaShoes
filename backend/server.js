require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./models/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: "Maurya's Shoe API running" }));

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Error handler
app.use(errorHandler);

// Initialize DB and start server
const PORT = process.env.PORT || 5000;
initDB();
app.listen(PORT, () => {
  console.log(`\n🚀 Maurya's Shoe Server running on http://localhost:${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}\n`);
});

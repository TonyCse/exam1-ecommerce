// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./logger');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Middleware de journalisation des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Health check pour la supervision (E26)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl });
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Serveur en écoute sur le port ${PORT}`));
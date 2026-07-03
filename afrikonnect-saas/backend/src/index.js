// ===== AFRIKONNECT — SERVEUR PRINCIPAL =====
// Fichier: src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
// FRONTEND_URL accepte plusieurs origines séparées par des virgules
// ex: "https://afrikonnect.vercel.app,http://localhost:4310"
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return cb(null, true);
    }
    cb(new Error('Origine non autorisée par CORS'));
  },
  credentials: true
}));

// Stripe webhooks ont besoin du raw body AVANT express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ===== ROUTES =====
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/produits',   require('./routes/produits'));
app.use('/api/commandes',  require('./routes/commandes'));
app.use('/api/conformite', require('./routes/conformite'));
app.use('/api/tontines',   require('./routes/tontines'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/stripe',     require('./routes/stripe'));
app.use('/api/groupes',    require('./routes/groupes'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/chatbot',    require('./routes/chatbot'));

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'Afrikonnect API' });
});

// ===== GESTION DES ERREURS =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== DÉMARRAGE =====
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Connecté à la base de données PostgreSQL');
    app.listen(PORT, () => {
      console.log(`🚀 Afrikonnect API démarrée sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la DB:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, prisma };

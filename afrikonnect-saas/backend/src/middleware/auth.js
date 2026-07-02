// ===== MIDDLEWARE D'AUTHENTIFICATION =====
// Fichier: src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Vérifie le token JWT et charge l'utilisateur
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, email: true, firstName: true,
        lastName: true, role: true, plan: true,
        isVerified: true
      }
    });

    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Vérifie que l'utilisateur a un plan Pro ou supérieur
const requirePro = (req, res, next) => {
  if (req.user.plan === 'FREE') {
    return res.status(403).json({
      error: 'Fonctionnalité réservée au plan Pro',
      upgrade: true
    });
  }
  next();
};

// Vérifie le rôle
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
};

module.exports = { auth, requirePro, requireRole };

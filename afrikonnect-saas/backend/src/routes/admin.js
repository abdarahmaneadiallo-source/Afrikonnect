// ===== ROUTES ADMIN — STATISTIQUES PLATEFORME =====
// Fichier: src/routes/admin.js
// Accès : rôle ADMIN, ou email listé dans ADMIN_EMAIL (séparés par des virgules)

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const requireAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (req.user.role === 'ADMIN' || adminEmails.includes(req.user.email.toLowerCase())) {
    return next();
  }
  res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
};

// ===== GET /api/admin/stats =====
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const il7jours = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [
      totalUsers, commercants, fournisseurs,
      nouveaux7j, nouveauxAujourdhui,
      totalCommandes, commandesAujourdhui,
      derniersInscrits, dernieresCommandes
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'COMMERCANT' } }),
      prisma.user.count({ where: { role: 'FOURNISSEUR' } }),
      prisma.user.count({ where: { createdAt: { gte: il7jours } } }),
      prisma.user.count({ where: { createdAt: { gte: debutJour } } }),
      prisma.commande.count(),
      prisma.commande.count({ where: { createdAt: { gte: debutJour } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, plan: true, createdAt: true,
          boutique: { select: { nom: true, ville: true } },
          fournisseur: { select: { nomEntreprise: true, pays: true } }
        }
      }),
      prisma.commande.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, statut: true, coutTotal: true, createdAt: true,
          user: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    res.json({
      utilisateurs: {
        total: totalUsers,
        commercants,
        fournisseurs,
        nouveaux7j,
        nouveauxAujourdhui
      },
      commandes: {
        total: totalCommandes,
        aujourdhui: commandesAujourdhui
      },
      derniersInscrits,
      dernieresCommandes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

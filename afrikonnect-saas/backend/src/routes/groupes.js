// ===== ROUTES COMMANDES GROUPÉES =====
// Fichier: src/routes/groupes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ===== GET /api/groupes — Groupes ouverts =====
router.get('/', auth, async (req, res) => {
  try {
    const groupes = await prisma.commandeGroupe.findMany({
      where: { statut: 'OUVERT' },
      include: { _count: { select: { commandes: true } } },
      orderBy: { dateDepart: 'asc' }
    });
    res.json(groupes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== POST /api/groupes — Créer un groupe =====
router.post('/', auth, async (req, res) => {
  try {
    const { titre, origine, destination, dateDepart, maxBoutiques } = req.body;
    const groupe = await prisma.commandeGroupe.create({
      data: {
        titre, origine, destination,
        dateDepart: new Date(dateDepart),
        maxBoutiques: parseInt(maxBoutiques) || 5,
        economie: 60
      }
    });
    res.status(201).json(groupe);
  } catch (error) {
    res.status(500).json({ error: 'Erreur création groupe' });
  }
});

module.exports = router;

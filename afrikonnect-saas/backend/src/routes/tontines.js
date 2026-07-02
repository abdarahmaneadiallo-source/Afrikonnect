// ===== ROUTES TONTINES =====
// Fichier: src/routes/tontines.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ===== GET /api/tontines — Mes tontines =====
router.get('/', auth, async (req, res) => {
  try {
    const tontines = await prisma.tontine.findMany({
      where: { membres: { some: { userId: req.user.id } } },
      include: {
        membres: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { tourOrdre: 'asc' }
        },
        versements: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json(tontines);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== POST /api/tontines — Créer une tontine =====
router.post('/', auth, async (req, res) => {
  try {
    const { nom, montantPart, frequence } = req.body;
    const tontine = await prisma.tontine.create({
      data: {
        nom,
        montantPart: parseFloat(montantPart),
        frequence: frequence || 'MENSUEL',
        membres: { create: { userId: req.user.id, tourOrdre: 1 } }
      },
      include: { membres: true }
    });
    res.status(201).json(tontine);
  } catch (error) {
    res.status(500).json({ error: 'Erreur création tontine' });
  }
});

// ===== POST /api/tontines/:id/rejoindre =====
router.post('/:id/rejoindre', auth, async (req, res) => {
  try {
    const tontine = await prisma.tontine.findUnique({
      where: { id: req.params.id },
      include: { membres: true }
    });
    if (!tontine) return res.status(404).json({ error: 'Tontine introuvable' });

    const dejaMembre = tontine.membres.some(m => m.userId === req.user.id);
    if (dejaMembre) return res.status(400).json({ error: 'Vous êtes déjà membre' });

    const membre = await prisma.tontineMembre.create({
      data: {
        tontineId: tontine.id,
        userId: req.user.id,
        tourOrdre: tontine.membres.length + 1
      }
    });
    res.status(201).json(membre);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

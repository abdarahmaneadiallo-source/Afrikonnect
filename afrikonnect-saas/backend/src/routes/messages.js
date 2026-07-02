// ===== ROUTES MESSAGES =====
// Fichier: src/routes/messages.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ===== GET /api/messages — Mes messages =====
router.get('/', auth, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { expediteurId: req.user.id },
      include: {
        expediteur: { select: { firstName: true, lastName: true, role: true } },
        commande: { select: { id: true, statut: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== POST /api/messages — Envoyer un message =====
router.post('/', auth, async (req, res) => {
  try {
    const { contenu, commandeId } = req.body;
    if (!contenu?.trim()) return res.status(400).json({ error: 'Message vide' });

    const message = await prisma.message.create({
      data: {
        expediteurId: req.user.id,
        commandeId: commandeId || null,
        contenu: contenu.trim()
      },
      include: {
        expediteur: { select: { firstName: true, lastName: true, role: true } }
      }
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erreur envoi message' });
  }
});

// ===== PATCH /api/messages/:id/lu =====
router.patch('/:id/lu', auth, async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { lu: true }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

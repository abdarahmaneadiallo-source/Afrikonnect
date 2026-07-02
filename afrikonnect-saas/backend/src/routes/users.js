// ===== ROUTES UTILISATEURS =====
// Fichier: src/routes/users.js

const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const updateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional()
});

// ===== PATCH /api/users/me — Mettre à jour mon profil =====
router.patch('/me', auth, async (req, res) => {
  try {
    const data = updateSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true, email: true, firstName: true,
        lastName: true, phone: true, role: true, plan: true
      }
    });
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== PATCH /api/users/me/boutique — Mettre à jour ma boutique =====
router.patch('/me/boutique', auth, async (req, res) => {
  try {
    const { nom, adresse, ville, codePostal, description, categories, paysSource } = req.body;
    const boutique = await prisma.boutique.update({
      where: { userId: req.user.id },
      data: {
        ...(nom && { nom }),
        ...(adresse !== undefined && { adresse }),
        ...(ville !== undefined && { ville }),
        ...(codePostal !== undefined && { codePostal }),
        ...(description !== undefined && { description }),
        ...(categories && { categories: JSON.stringify(categories) }),
        ...(paysSource && { paysSource: JSON.stringify(paysSource) })
      }
    });
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour boutique' });
  }
});

// ===== GET /api/users/me/notifications =====
router.get('/me/notifications', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== PATCH /api/users/me/notifications/:id/lu =====
router.patch('/me/notifications/:id/lu', auth, async (req, res) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { lu: true }
    });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

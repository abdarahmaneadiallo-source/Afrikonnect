// ===== ROUTES COMMANDES =====
// Fichier: src/routes/commandes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requirePro } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ===== GET /api/commandes — Mes commandes =====
router.get('/', auth, async (req, res) => {
  try {
    const boutique = await prisma.boutique.findUnique({
      where: { userId: req.user.id }
    });
    if (!boutique) return res.status(404).json({ error: 'Boutique introuvable' });

    const commandes = await prisma.commande.findMany({
      where: { boutiqueId: boutique.id },
      include: {
        lignes: { include: { produit: { include: { fournisseur: true } } } },
        suivis: { orderBy: { createdAt: 'desc' } },
        alertes: { where: { isResolu: false } },
        groupe: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== POST /api/commandes — Créer une commande =====
router.post('/', auth, async (req, res) => {
  try {
    const { produits, modeTransport, groupeId, notes } = req.body;
    // produits: [{ produitId, quantite }]

    const boutique = await prisma.boutique.findUnique({
      where: { userId: req.user.id }
    });
    if (!boutique) return res.status(404).json({ error: 'Boutique introuvable' });

    // Vérifier limite plan FREE
    if (req.user.plan === 'FREE') {
      const count = await prisma.commande.count({
        where: {
          boutiqueId: boutique.id,
          createdAt: {
            gte: new Date(new Date().setDate(1)) // depuis le 1er du mois
          }
        }
      });
      if (count >= 5) {
        return res.status(403).json({
          error: 'Limite de 5 commandes/mois atteinte avec le plan Gratuit',
          upgrade: true
        });
      }
    }

    // Récupérer les produits et calculer le total
    let coutTotal = 0;
    let poids = 0;
    const lignesData = [];

    for (const item of produits) {
      const produit = await prisma.produit.findUnique({ where: { id: item.produitId } });
      if (!produit) return res.status(404).json({ error: `Produit ${item.produitId} introuvable` });

      const sousTotal = produit.prix * item.quantite;
      coutTotal += sousTotal;
      poids += item.quantite; // simplifié

      lignesData.push({
        produitId: produit.id,
        quantite: item.quantite,
        prixUnitaire: produit.prix,
        sousTotal
      });
    }

    // Calculer le coût de fret
    const tauxFret = { MARITIME: 1.8, AERIEN: 12, ROUTIER: 3.2 };
    const coutFret = Math.round(poids * (tauxFret[modeTransport] || 1.8));

    // Créer la commande
    const commande = await prisma.commande.create({
      data: {
        boutiqueId: boutique.id,
        userId: req.user.id,
        modeTransport: modeTransport || 'MARITIME',
        coutTotal: coutTotal + coutFret,
        coutFret,
        poids,
        paysOrigine: 'CI', // à déduire des produits
        groupeId,
        notes,
        lignes: { create: lignesData },
        suivis: {
          create: {
            statut: 'EN_ATTENTE',
            description: 'Commande créée et en attente de confirmation fournisseur'
          }
        }
      },
      include: { lignes: true, suivis: true }
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'COMMANDE',
        titre: 'Commande créée',
        message: `Votre commande #${commande.id.slice(-6).toUpperCase()} a été envoyée aux fournisseurs.`
      }
    });

    res.status(201).json(commande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur création commande' });
  }
});

// ===== GET /api/commandes/:id — Détail commande =====
router.get('/:id', auth, async (req, res) => {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: req.params.id },
      include: {
        boutique: true,
        lignes: { include: { produit: { include: { fournisseur: true } } } },
        suivis: { orderBy: { createdAt: 'asc' } },
        alertes: true,
        messages: { include: { expediteur: { select: { firstName: true, lastName: true, role: true } } } },
        groupe: true
      }
    });

    if (!commande) return res.status(404).json({ error: 'Commande introuvable' });
    if (commande.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== PATCH /api/commandes/:id/statut — Mettre à jour le statut =====
router.patch('/:id/statut', auth, async (req, res) => {
  try {
    const { statut, description, lieu } = req.body;

    const commande = await prisma.commande.update({
      where: { id: req.params.id },
      data: {
        statut,
        suivis: {
          create: { statut, description: description || `Statut mis à jour: ${statut}`, lieu }
        }
      }
    });

    // Alerter le commerçant si blocage douane
    if (statut === 'BLOQUE') {
      await prisma.alerteDouane.create({
        data: {
          commandeId: commande.id,
          type: 'LOT_BLOQUE',
          description: description || 'Lot bloqué en douane'
        }
      });
      await prisma.notification.create({
        data: {
          userId: commande.userId,
          type: 'ALERTE_DOUANE',
          titre: '⚠ Lot bloqué en douane',
          message: `Votre commande #${commande.id.slice(-6).toUpperCase()} est bloquée. Action requise sous 48h.`
        }
      });
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

module.exports = router;

// ===== ROUTES PRODUITS (MARKETPLACE) =====
// Fichier: src/routes/produits.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Parse les champs JSON stockés en String (SQLite)
const parseProduit = (p) => ({
  ...p,
  certifications: JSON.parse(p.certifications || '[]'),
  photos: JSON.parse(p.photos || '[]'),
  fournisseur: p.fournisseur
    ? { ...p.fournisseur, certifications: JSON.parse(p.fournisseur.certifications || '[]') }
    : undefined
});

// ===== GET /api/produits — Catalogue avec filtres =====
router.get('/', auth, async (req, res) => {
  try {
    const { categorie, pays, q } = req.query;

    const produits = await prisma.produit.findMany({
      where: {
        isActif: true,
        ...(categorie && { categorie }),
        ...(q && { nom: { contains: q } }),
        ...(pays && { fournisseur: { pays } })
      },
      include: { fournisseur: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(produits.map(parseProduit));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET /api/produits/fournisseurs — Liste des fournisseurs =====
router.get('/fournisseurs', auth, async (req, res) => {
  try {
    const fournisseurs = await prisma.fournisseur.findMany({
      where: { isVerified: true },
      include: { _count: { select: { produits: true } } },
      orderBy: { noteGlobale: 'desc' }
    });
    res.json(fournisseurs.map(f => ({
      ...f,
      certifications: JSON.parse(f.certifications || '[]')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET /api/produits/:id — Détail produit =====
router.get('/:id', auth, async (req, res) => {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: req.params.id },
      include: { fournisseur: { include: { avis: true } } }
    });
    if (!produit) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(parseProduit(produit));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== POST /api/produits — Créer un produit (fournisseur) =====
router.post('/', auth, requireRole('FOURNISSEUR', 'ADMIN'), async (req, res) => {
  try {
    const fournisseur = await prisma.fournisseur.findUnique({
      where: { userId: req.user.id }
    });
    if (!fournisseur) return res.status(404).json({ error: 'Profil fournisseur introuvable' });

    const { nom, description, categorie, prix, prixUnite, stockDisponible, codeDouanier, certifications, etiquettageFR } = req.body;

    const produit = await prisma.produit.create({
      data: {
        fournisseurId: fournisseur.id,
        nom, description, categorie,
        prix: parseFloat(prix),
        prixUnite,
        stockDisponible: parseInt(stockDisponible) || 0,
        codeDouanier,
        certifications: JSON.stringify(certifications || []),
        etiquettageFR: !!etiquettageFR
      }
    });
    res.status(201).json(parseProduit(produit));
  } catch (error) {
    res.status(500).json({ error: 'Erreur création produit' });
  }
});

module.exports = router;

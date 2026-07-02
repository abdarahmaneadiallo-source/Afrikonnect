// ===== ROUTE CONFORMITÉ IA =====
// Fichier: src/routes/conformite.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requirePro } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Base de codes douaniers français
const CODES_DOUANIERS = {
  'huile de palme': { code: '1511 10 90', tva: 5.5, droit: 0, certificat: false },
  'farine de manioc': { code: '1108 14 00', tva: 5.5, droit: 0, certificat: false },
  'poisson fumé': { code: '0305 41 00', tva: 5.5, droit: 0, certificat: true },
  'beurre de karite': { code: '1515 90 91', tva: 20, droit: 0, certificat: false },
  'piment seche': { code: '0904 21 10', tva: 5.5, droit: 0, certificat: false },
  'tissus wax': { code: '5208', tva: 20, droit: 12, certificat: false },
  'gari': { code: '1108 14 00', tva: 5.5, droit: 0, certificat: false },
  'attiéké': { code: '1904 10 10', tva: 5.5, droit: 0, certificat: false }
};

// ===== POST /api/conformite/verifier =====
// Vérifie la conformité d'un produit (Pro uniquement)
router.post('/verifier', auth, requirePro, async (req, res) => {
  try {
    const { produit, details } = req.body;
    const produitLower = produit.toLowerCase().trim();

    // Recherche du code douanier
    let codeInfo = null;
    for (const [key, val] of Object.entries(CODES_DOUANIERS)) {
      if (produitLower.includes(key)) {
        codeInfo = val;
        break;
      }
    }

    // Vérification via Anthropic API pour une analyse détaillée
    let analyseIA = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: `Tu es un expert en réglementation douanière française et UE pour les produits alimentaires africains.
              
Analyse la conformité de ce produit pour l'import en France :
Produit: "${produit}"
Détails: "${details || 'Non précisé'}"

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "score": 0-100,
  "etiquettageFR": true/false,
  "datePeremption": true/false,
  "certificatSanitaire": true/false,
  "tracabilite": true/false,
  "problemes": ["problème 1", "problème 2"],
  "recommandations": ["action 1", "action 2"],
  "risque": "FAIBLE/MOYEN/ELEVE"
}`
            }]
          })
        });

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        analyseIA = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
        console.error('Anthropic API error:', e);
        // Fallback sans IA
      }
    }

    // Résultat final
    const resultat = {
      produit,
      codeDouanier: codeInfo?.code || 'À vérifier sur douane.fr',
      tvaTaux: codeInfo?.tva || 20,
      droitDouane: codeInfo?.droit || 0,
      certificatObligatoire: codeInfo?.certificat || false,
      analyse: analyseIA || {
        score: 60,
        etiquettageFR: false,
        datePeremption: true,
        certificatSanitaire: codeInfo?.certificat || false,
        tracabilite: false,
        problemes: ['Étiquetage en français à vérifier', 'Certificat sanitaire à demander si requis'],
        recommandations: [
          'Demander l\'étiquetage en français au fournisseur',
          'Vérifier le besoin de certificat sanitaire DGCCRF',
          'S\'assurer que le numéro de lot est visible'
        ],
        risque: 'MOYEN'
      }
    };

    // Sauvegarder en base
    await prisma.conformite.create({
      data: {
        produitNom: produit,
        codeDouanier: resultat.codeDouanier,
        etiquettageFR: resultat.analyse.etiquettageFR,
        datePeremption: resultat.analyse.datePeremption,
        certificatSanitaire: resultat.analyse.certificatSanitaire,
        tracabilite: resultat.analyse.tracabilite,
        score: resultat.analyse.score,
        recommandations: JSON.stringify(resultat.analyse.recommandations || [])
      }
    });

    res.json(resultat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur vérification conformité' });
  }
});

// ===== GET /api/conformite/codes =====
// Liste des codes douaniers fréquents
router.get('/codes', auth, async (req, res) => {
  res.json(Object.entries(CODES_DOUANIERS).map(([nom, info]) => ({
    nom, ...info
  })));
});

// ===== GET /api/conformite/historique =====
router.get('/historique', auth, requirePro, async (req, res) => {
  const historique = await prisma.conformite.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json(historique.map(h => ({
    ...h,
    recommandations: JSON.parse(h.recommandations || '[]')
  })));
});

module.exports = router;

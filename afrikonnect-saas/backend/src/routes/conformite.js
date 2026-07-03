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

// ===== AGENT IA CONFORMITÉ =====
// Base d'expertise réglementaire par catégorie (fallback sans clé API,
// et contexte injecté dans le prompt quand l'IA est active).
const EXPERTISE = {
  alimentaire_sec: {
    label: 'Épicerie sèche (farines, gari, attiéké, céréales)',
    commercant: [
      'Étiquetage INCO (règlement UE 1169/2011) : dénomination, ingrédients, allergènes en gras, poids net, DDM, coordonnées de l\'importateur — tout en français',
      'Numéro de lot visible pour la traçabilité (règlement CE 178/2002)',
      'TVA réduite 5,5 % (produit alimentaire de base)',
      'Contrôle aflatoxines possible sur farines et arachides (règlement UE 2023/915) — demander le rapport d\'analyse au fournisseur',
      'Enregistrement comme exploitant du secteur alimentaire auprès de la DDPP de votre département'
    ],
    fournisseur: [
      'Certificat phytosanitaire délivré par l\'autorité du pays d\'origine',
      'Rapport d\'analyse mycotoxines/aflatoxines d\'un laboratoire accrédité (exigé au premier contrôle)',
      'Certificat d\'origine (formule A / EUR.1) pour bénéficier des préférences tarifaires SPG ou APE',
      'Emballages neufs, palettes traitées norme NIMP15',
      'Facture commerciale + packing list détaillée (poids brut/net par lot)'
    ]
  },
  poisson_viande: {
    label: 'Poisson fumé, viandes, produits animaux',
    commercant: [
      '⚠ Catégorie la plus contrôlée : les produits d\'origine animale ne peuvent entrer que par un poste de contrôle frontalier (PCF) agréé',
      'Le pays ET l\'établissement du fournisseur doivent figurer sur la liste des établissements agréés UE (consultable sur webgate.ec.europa.eu/tracesnt)',
      'Document sanitaire commun d\'entrée (DSCE) à pré-notifier dans TRACES avant l\'arrivée',
      'Chaîne du froid documentée, DLC (pas DDM) obligatoire',
      'Étiquetage : zone de capture FAO pour le poisson, mention "décongelé" le cas échéant'
    ],
    fournisseur: [
      'Agrément export UE de votre établissement (numéro d\'agrément sanitaire) — sans lui, aucun envoi ne passera',
      'Certificat sanitaire vétérinaire signé par l\'autorité compétente du pays d\'origine',
      'Analyses histamine et métaux lourds pour le poisson fumé (règlement CE 1881/2006)',
      'Température de transport enregistrée (data logger recommandé)',
      'Enregistrement TRACES NT de chaque expédition'
    ]
  },
  cosmetiques: {
    label: 'Cosmétiques (karité, savon noir, huiles)',
    commercant: [
      'Chaque produit doit avoir une Personne Responsable établie dans l\'UE (vous, ou un mandataire) — règlement CE 1223/2009',
      'Notification sur le portail CPNP avant mise sur le marché',
      'Dossier d\'information produit (DIP) avec rapport de sécurité disponible 10 ans',
      'Étiquetage : liste INCI des ingrédients, PAO (période après ouverture), lot',
      'Le beurre de karité brut alimentaire suit le régime alimentaire (TVA 5,5 %) ; en cosmétique, TVA 20 %'
    ],
    fournisseur: [
      'Fiche technique et composition INCI complète de chaque produit',
      'Rapport d\'évaluation de sécurité (CPSR) si vous visez le marché UE directement',
      'Certificats BIO (Ecocert, Cosmos) si revendication biologique',
      'Bonnes pratiques de fabrication ISO 22716 — de plus en plus exigée par les importateurs',
      'Échantillons de chaque lot conservés 5 ans'
    ]
  },
  textile: {
    label: 'Textile (wax, bazin, prêt-à-porter)',
    commercant: [
      'Droits de douane 12 % (chapitre 52-63) sauf certificat d\'origine préférentiel APE/SPG → 0 %',
      'TVA 20 %',
      'Étiquetage obligatoire : composition des fibres en français (règlement UE 1007/2011)',
      'Vigilance REACH : azocolorants interdits (test à demander au fournisseur)',
      'Marquage d\'entretien recommandé (non obligatoire mais attendu)'
    ],
    fournisseur: [
      'Certificat d\'origine EUR.1 ou déclaration d\'origine sur facture (statut exportateur enregistré REX) → économise 12 % de droits à votre client',
      'Test azocolorants (REACH annexe XVII) d\'un laboratoire accrédité',
      'Composition exacte des fibres par référence',
      'Étiquettes de composition cousues en français avant expédition (service très apprécié des importateurs)',
      'Photos et nuancier par lot (les litiges couleur sont la 1ère cause de retour)'
    ]
  }
};

const CATEGORIE_MAP = [
  { mots: ['poisson', 'crevette', 'viande', 'fumé', 'fume', 'kong', 'machoiron'], cat: 'poisson_viande' },
  { mots: ['karité', 'karite', 'savon', 'cosmét', 'cosmet', 'huile de coco', 'beurre corporel', 'pommade'], cat: 'cosmetiques' },
  { mots: ['wax', 'tissu', 'bazin', 'pagne', 'textile', 'vêtement', 'vetement'], cat: 'textile' },
];

const detecterCategorie = (texte) => {
  const t = (texte || '').toLowerCase();
  for (const { mots, cat } of CATEGORIE_MAP) {
    if (mots.some(m => t.includes(m))) return cat;
  }
  return 'alimentaire_sec';
};

// ===== POST /api/conformite/agent =====
// Agent conversationnel expert conformité (adapté au rôle de l'utilisateur)
router.post('/agent', auth, async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: 'user'|'assistant', content }]
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages manquants' });
    }

    const role = req.user.role === 'FOURNISSEUR' ? 'FOURNISSEUR' : 'COMMERCANT';
    const derniereQuestion = messages[messages.length - 1]?.content || '';
    const cat = detecterCategorie(derniereQuestion);
    const fiche = EXPERTISE[cat];
    const codesConnus = Object.entries(CODES_DOUANIERS)
      .map(([nom, i]) => `${nom}: NC ${i.code}, TVA ${i.tva}%, droit ${i.droit}%, certificat sanitaire ${i.certificat ? 'requis' : 'non requis'}`)
      .join('\n');

    // ===== Mode IA (clé Anthropic présente) =====
    if (process.env.ANTHROPIC_API_KEY) {
      const systemPrompt = `Tu es l'Agent Conformité d'Afrikonnect, expert reconnu en réglementation douanière et sanitaire pour l'importation de produits africains vers la France et l'UE.

L'utilisateur est un ${role === 'FOURNISSEUR' ? 'FOURNISSEUR basé en Afrique qui exporte vers la France' : 'COMMERÇANT en France qui importe des produits africains'}. Adapte chaque réponse à SON rôle et SES obligations (pas celles de l'autre partie, sauf s'il le demande).

Références clés : règlement INCO UE 1169/2011 (étiquetage alimentaire), CE 178/2002 (traçabilité), UE 2023/915 (contaminants), CE 1223/2009 (cosmétiques), UE 1007/2011 (textile), REACH, TRACES NT et postes de contrôle frontaliers pour les produits d'origine animale, préférences tarifaires SPG/APE (certificats EUR.1, formule A, système REX).

Codes douaniers de référence de la plateforme :
${codesConnus}

Règles de réponse :
- Réponds en français, de façon structurée et actionnable (listes à puces, étapes numérotées)
- Cite les documents exacts à obtenir et auprès de quelle autorité
- Signale les taux (TVA, droits de douane) quand pertinent
- Si un produit présente un risque de blocage en douane, dis-le clairement dès la première ligne avec ⚠
- Reste dans ton domaine : conformité, douane, étiquetage, certificats, logistique réglementaire. Pour le reste, redirige vers le support Afrikonnect
- Termine par une prochaine étape concrète quand c'est utile`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: messages.slice(-10).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 4000)
          }))
        })
      });

      const data = await response.json();
      if (data.content?.[0]?.text) {
        return res.json({ reponse: data.content[0].text, source: 'ia', categorie: fiche.label });
      }
      console.error('Anthropic API réponse inattendue:', JSON.stringify(data).slice(0, 300));
      // continue vers le fallback
    }

    // ===== Mode base d'expertise (sans clé API) =====
    const exigences = fiche[role.toLowerCase()] || fiche.commercant;
    const intro = role === 'FOURNISSEUR'
      ? `En tant que fournisseur exportant vers la France, voici vos obligations pour la catégorie **${fiche.label}** :`
      : `En tant que commerçant important en France, voici vos points de vigilance pour la catégorie **${fiche.label}** :`;

    const reponse = [
      intro,
      '',
      ...exigences.map((e, i) => `${i + 1}. ${e}`),
      '',
      '💡 Réponse issue de la base d\'expertise Afrikonnect. Pour une analyse personnalisée de votre cas précis, l\'agent IA complet sera bientôt activé.'
    ].join('\n');

    res.json({ reponse, source: 'base', categorie: fiche.label });
  } catch (error) {
    console.error('Agent conformité:', error);
    res.status(500).json({ error: 'Erreur de l\'agent conformité' });
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

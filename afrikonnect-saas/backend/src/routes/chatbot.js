// ===== CHATBOT PUBLIC — PAGE D'ACCUEIL =====
// Fichier: src/routes/chatbot.js
// Répond aux questions des visiteurs (non connectés) sur Afrikonnect.
// Mode IA si ANTHROPIC_API_KEY, sinon FAQ par mots-clés.

const express = require('express');
const router = express.Router();

// Anti-abus très simple : 20 messages / 10 min / IP
const hits = new Map();
const rateLimit = (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > 10 * 60 * 1000) { rec.count = 0; rec.start = now; }
  rec.count++;
  hits.set(ip, rec);
  if (rec.count > 20) {
    return res.status(429).json({ error: 'Trop de messages, réessayez dans quelques minutes.' });
  }
  next();
};

const FAQ = [
  {
    mots: ['marche', 'fonctionne', 'ça marche', 'ca marche', 'comment ça', 'comment ca', 'principe'],
    reponse: `Afrikonnect en 4 étapes simples 🚀

1️⃣ Créez votre profil gratuit — commerçant (boutique en France) ou fournisseur (export depuis l'Afrique)
2️⃣ Parcourez la marketplace : produits africains certifiés, prix directs fournisseurs
3️⃣ Commandez seul, ou rejoignez un conteneur groupé avec d'autres boutiques (jusqu'à -60 % sur le fret)
4️⃣ Suivez votre import en temps réel, avec la conformité douanière vérifiée par notre IA

Le tout depuis une seule application. Voulez-vous en savoir plus sur les tarifs ou les commandes groupées ?`
  },
  {
    mots: ['prix', 'tarif', 'coût', 'cout', 'abonnement', 'payant', 'gratuit', 'combien'],
    reponse: `Nos tarifs sont simples :

Commerçants 🏪
• Gratuit — 5 commandes/mois, accès marketplace, 1 conteneur groupé
• Pro : 29 €/mois — commandes illimitées, conformité IA, priorité conteneurs

Fournisseurs 🚚
• Starter — gratuit, 5 produits au catalogue
• Vérifié : 49 €/mois — badge vérifié, produits illimités, mise en avant

🎁 Offre de lancement : les 15 premiers fournisseurs ont le plan Vérifié gratuit 3 mois. L'inscription est gratuite et sans engagement !`
  },
  {
    mots: ['conteneur', 'groupé', 'groupe', 'fret', 'partage', 'économi', 'economi', '60'],
    reponse: `Les commandes groupées sont notre spécialité ! 🚢

Le principe : plusieurs boutiques d'une même région partagent un conteneur depuis l'Afrique (ex. Abidjan → Lyon). Chacun ne paie que sa part du fret.

✅ Jusqu'à 60 % d'économie sur les frais de transport
✅ Vous suivez le remplissage du conteneur en temps réel dans l'app
✅ Chaque expédition est trackée du départ à la livraison

Inscrivez-vous gratuitement pour voir les conteneurs en formation près de chez vous !`
  },
  {
    mots: ['douane', 'conformité', 'conformite', 'bloqué', 'bloque', 'certificat', 'norme', 'étiquet', 'etiquet'],
    reponse: `La conformité douanière est notre point fort 🛡️

Notre Agent Conformité IA vous dit, pour chaque produit :
• Le code douanier NC et les taux (TVA, droits)
• Les certificats exigés (sanitaire, phytosanitaire, origine...)
• Les règles d'étiquetage français (règlement UE 1169/2011)
• Les démarches selon votre profil (importateur ou exportateur)

Fini les lots bloqués à Marseille ! Cette fonctionnalité est incluse dans le plan Pro (29 €/mois).`
  },
  {
    mots: ['fournisseur', 'vendre', 'exporter', 'export', 'afrique', 'catalogue'],
    reponse: `Vous êtes fournisseur en Afrique ? Bienvenue ! 🌍

Afrikonnect vous connecte directement à des centaines de boutiques africaines en France :
• Créez votre catalogue produits gratuitement (plan Starter)
• Recevez des commandes agrégées de plusieurs boutiques à la fois
• Le badge « Vérifié » (certifications ISO 22000, HACCP, BIO) renforce votre crédibilité

🎁 Les 15 premiers fournisseurs inscrits ont le plan Vérifié offert 3 mois. Inscrivez-vous avec le rôle « Fournisseur » !`
  },
  {
    mots: ['inscri', 'compte', 'commencer', 'demarrer', 'démarrer', 'essai'],
    reponse: `L'inscription prend 2 minutes et c'est gratuit ! ✨

1. Cliquez sur « Essayer gratuitement »
2. Choisissez votre profil : Commerçant (boutique en France) ou Fournisseur (export depuis l'Afrique)
3. Renseignez nom, email, mot de passe
4. C'est parti — marketplace, conteneurs groupés et suivi de commandes vous attendent !

Aucune carte bancaire demandée pour le plan gratuit.`
  },
  {
    mots: ['tontine', 'épargne', 'epargne', 'financement', 'crédit', 'credit'],
    reponse: `La tontine numérique est une exclusivité Afrikonnect 🏦

C'est le système d'épargne rotative traditionnel, sécurisé et digitalisé :
• Créez ou rejoignez une tontine entre commerçants de confiance
• Chacun verse une part fixe (ex. 200 €/mois)
• Chaque membre reçoit la cagnotte à tour de rôle

Un financement communautaire pour vos gros achats, sans passer par les banques.`
  },
  {
    mots: ['produit', 'marketplace', 'acheter', 'quoi', 'vend'],
    reponse: `Notre marketplace propose des produits africains authentiques, directement des fournisseurs vérifiés 🛒

Catégories disponibles :
• Épicerie sèche : huile de palme, farine de manioc, gari, attiéké, piment
• Poisson & viande : poisson fumé, crevettes séchées
• Cosmétiques : beurre de karité, savon noir (certifiés BIO)
• Textile : wax, bazin

Tous les produits affichent leur code douanier, certifications et le délai moyen du fournisseur. Créez un compte gratuit pour voir les prix !`
  },
  {
    mots: ['contact', 'aide', 'support', 'parler', 'humain', 'téléphone', 'telephone'],
    reponse: `Notre équipe est là pour vous aider ! 💬

• Email : contact@afrikonnect.fr
• Support WhatsApp pour les membres (plan Pro et Fournisseur Vérifié)
• Une fois inscrit, la messagerie intégrée vous met en contact direct avec les fournisseurs

Et je reste disponible ici pour toute question sur la plateforme !`
  }
];

const SALUTATIONS = ['bonjour', 'salut', 'hello', 'bonsoir', 'hey', 'coucou'];

// ===== POST /api/chatbot =====
router.post('/', rateLimit, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages manquants' });
    }
    const question = String(messages[messages.length - 1]?.content || '').toLowerCase();

    // ===== Mode IA =====
    if (process.env.ANTHROPIC_API_KEY) {
      const systemPrompt = `Tu es Kora, l'assistant d'accueil d'Afrikonnect — la marketplace B2B qui connecte les boutiques africaines en France avec des fournisseurs vérifiés en Afrique.

Ton rôle : renseigner les visiteurs du site et les encourager à s'inscrire gratuitement.

Ce que tu sais :
- Fonctionnalités : marketplace B2B (produits africains : huile de palme, gari, poisson fumé, karité, wax...), commandes groupées de conteneurs (jusqu'à -60 % sur le fret), Agent Conformité IA (codes douaniers, certificats, étiquetage UE), suivi logistique temps réel (maritime/aérien/routier), tontines numériques, messagerie intégrée.
- Tarifs commerçants : Gratuit (5 commandes/mois) ou Pro 29 €/mois (illimité + conformité IA).
- Tarifs fournisseurs : Starter gratuit (5 produits) ou Vérifié 49 €/mois (badge, illimité, mise en avant). Offre de lancement : 3 mois offerts aux 15 premiers fournisseurs.
- Inscription gratuite en 2 minutes sur /register, sans carte bancaire.

Règles : réponds en français, chaleureux et concis (max 150 mots), termine souvent par une invitation à s'inscrire. Si la question sort du sujet Afrikonnect, ramène poliment la conversation à la plateforme. Ne donne jamais de conseil juridique ou médical.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL_CHAT || 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: systemPrompt,
          messages: messages.slice(-8).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 1000)
          }))
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) {
        return res.json({ reponse: data.content[0].text, source: 'ia' });
      }
    }

    // ===== Mode FAQ =====
    if (SALUTATIONS.some(s => question.trim().startsWith(s))) {
      return res.json({
        reponse: `Bonjour ! 👋 Je suis Kora, l'assistant Afrikonnect.

Je peux vous renseigner sur :
• 🚢 Les commandes groupées de conteneurs (-60 % de fret)
• 🛡️ La conformité douanière
• 💰 Nos tarifs
• 🌍 Comment vendre vos produits depuis l'Afrique

Que voulez-vous savoir ?`,
        source: 'faq'
      });
    }

    const match = FAQ.find(f => f.mots.some(m => question.includes(m)));
    if (match) {
      return res.json({ reponse: match.reponse, source: 'faq' });
    }

    res.json({
      reponse: `Bonne question ! Je n'ai pas la réponse exacte, mais voici ce que je peux vous expliquer :

• Les commandes groupées 🚢 (partagez un conteneur, économisez 60 %)
• La conformité douanière 🛡️ (ne plus jamais avoir un lot bloqué)
• Nos tarifs 💰 (gratuit pour commencer)
• Comment vendre depuis l'Afrique 🌍 en tant que fournisseur

Ou écrivez-nous : contact@afrikonnect.fr 😊`,
      source: 'faq'
    });
  } catch (error) {
    console.error('Chatbot:', error);
    res.status(500).json({ error: 'Erreur du chatbot' });
  }
});

module.exports = router;

// ===== ROUTES STRIPE — ABONNEMENTS SAAS =====
// Fichier: src/routes/stripe.js

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Prix Stripe (à créer dans votre dashboard Stripe)
const PLANS = {
  PRO: process.env.STRIPE_PRICE_PRO,           // 29€/mois
  FOURNISSEUR: process.env.STRIPE_PRICE_FOURNISSEUR // 49€/mois
};

// ===== POST /api/stripe/create-checkout =====
// Crée une session de paiement Stripe Checkout
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const priceId = PLANS[plan];

    if (!priceId) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    // Créer ou récupérer le customer Stripe
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user.id }
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: req.user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/app?payment=success&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/app/parametres?payment=cancelled`,
      metadata: { userId: req.user.id, plan }
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Erreur de paiement' });
  }
});

// ===== POST /api/stripe/portal =====
// Portail client pour gérer l'abonnement
router.post('/portal', auth, async (req, res) => {
  try {
    if (!req.user.stripeCustomerId) {
      return res.status(400).json({ error: 'Aucun abonnement actif' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/app/parametres`
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Erreur portail' });
  }
});

// ===== POST /api/stripe/webhook =====
// Webhooks Stripe (subscription.created, invoice.paid, etc.)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook invalide: ${err.message}` });
  }

  try {
    switch (event.type) {
      // Abonnement activé
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;
        const plan = sub.metadata?.plan || 'PRO';

        if (sub.status === 'active') {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan,
              stripeSubId: sub.id
            }
          });
          // Créer une notification
          await prisma.notification.create({
            data: {
              userId,
              type: 'ABONNEMENT',
              titre: `Plan ${plan} activé`,
              message: `Votre abonnement ${plan} est maintenant actif. Profitez de toutes les fonctionnalités !`
            }
          });
        }
        break;
      }

      // Abonnement annulé
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        await prisma.user.update({
          where: { id: customer.metadata.userId },
          data: { plan: 'FREE', stripeSubId: null }
        });
        break;
      }

      // Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        await prisma.notification.create({
          data: {
            userId: customer.metadata.userId,
            type: 'PAIEMENT',
            titre: 'Échec de paiement',
            message: 'Votre paiement a échoué. Mettez à jour votre moyen de paiement pour continuer à utiliser Afrikonnect Pro.'
          }
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// ===== GET /api/stripe/subscription =====
router.get('/subscription', auth, async (req, res) => {
  try {
    if (!req.user.stripeSubId) {
      return res.json({ plan: 'FREE', status: null });
    }
    const sub = await stripe.subscriptions.retrieve(req.user.stripeSubId);
    res.json({
      plan: req.user.plan,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération abonnement' });
  }
});

module.exports = router;

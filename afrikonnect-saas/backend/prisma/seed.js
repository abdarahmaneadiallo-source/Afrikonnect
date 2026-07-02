// ===== AFRIKONNECT — DONNÉES DE DÉMONSTRATION =====
// Usage: node prisma/seed.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed Afrikonnect...');

  // ===== UTILISATEUR DÉMO (commerçant) =====
  const password = await bcrypt.hash('demo1234', 12);
  const mamadou = await prisma.user.upsert({
    where: { email: 'demo@afrikonnect.fr' },
    update: {},
    create: {
      email: 'demo@afrikonnect.fr',
      password,
      firstName: 'Mamadou',
      lastName: 'Koné',
      role: 'COMMERCANT',
      plan: 'PRO',
      isVerified: true,
      boutique: {
        create: {
          nom: 'Épicerie Sahel',
          adresse: '14 rue de la République',
          ville: 'Lyon',
          codePostal: '69002',
          description: 'Épicerie africaine au cœur de Lyon',
          categories: JSON.stringify(['epicerie_seche', 'poisson', 'cosmetiques']),
          paysSource: JSON.stringify(['CI', 'SN', 'NG'])
        }
      }
    },
    include: { boutique: true }
  });
  const boutique = mamadou.boutique || await prisma.boutique.findUnique({ where: { userId: mamadou.id } });

  // ===== FOURNISSEURS =====
  const fournisseursData = [
    { email: 'kofi@exports.ci', firstName: 'Kofi', lastName: 'Assamoah', entreprise: 'Kofi Exports', pays: 'CI', ville: 'Abidjan', note: 5, delai: 18, certs: ['ISO22000', 'HACCP'], desc: 'Épicerie sèche et huiles, export depuis 2012' },
    { email: 'awa@dakarspices.sn', firstName: 'Awa', lastName: 'Diop', entreprise: 'Dakar Spices', pays: 'SN', ville: 'Dakar', note: 4.2, delai: 22, certs: ['HACCP'], desc: 'Épices et condiments du Sénégal' },
    { email: 'tunde@lagosfoods.ng', firstName: 'Tunde', lastName: 'Okafor', entreprise: 'Lagos Foods', pays: 'NG', ville: 'Lagos', note: 4.1, delai: 25, certs: ['ISO22000'], desc: 'Poisson et viandes fumées' },
    { email: 'salif@burkinanaturel.bf', firstName: 'Salif', lastName: 'Ouédraogo', entreprise: 'Burkina Naturel', pays: 'BF', ville: 'Ouagadougou', note: 4.8, delai: 30, certs: ['BIO', 'HACCP'], desc: 'Cosmétiques bio et karité' }
  ];

  const fournisseurs = [];
  for (const f of fournisseursData) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        email: f.email,
        password,
        firstName: f.firstName,
        lastName: f.lastName,
        role: 'FOURNISSEUR',
        plan: 'FOURNISSEUR',
        isVerified: true,
        fournisseur: {
          create: {
            nomEntreprise: f.entreprise,
            pays: f.pays,
            ville: f.ville,
            description: f.desc,
            certifications: JSON.stringify(f.certs),
            noteGlobale: f.note,
            delaiMoyen: f.delai,
            isVerified: true
          }
        }
      },
      include: { fournisseur: true }
    });
    fournisseurs.push(user.fournisseur || await prisma.fournisseur.findUnique({ where: { userId: user.id } }));
  }
  const [kofi, dakar, lagos, burkina] = fournisseurs;

  // ===== PRODUITS =====
  const produitsData = [
    { f: kofi, nom: 'Huile de palme rouge 20L', cat: 'epicerie_seche', prix: 68, unite: 'lot', stock: 120, code: '1511 10 90', etiq: true },
    { f: kofi, nom: 'Attiéké séché 10kg', cat: 'epicerie_seche', prix: 42, unite: 'lot', stock: 85, code: '1904 10 10', etiq: true },
    { f: dakar, nom: 'Farine de manioc 50kg', cat: 'epicerie_seche', prix: 95, unite: 'lot', stock: 60, code: '1108 14 00', etiq: false },
    { f: dakar, nom: 'Piment séché 5kg', cat: 'epicerie_seche', prix: 55, unite: 'lot', stock: 200, code: '0904 21 10', etiq: true },
    { f: dakar, nom: 'Gari fin 25kg', cat: 'epicerie_seche', prix: 48, unite: 'lot', stock: 8, code: '1108 14 00', etiq: true },
    { f: lagos, nom: 'Poisson fumé (lot 15kg)', cat: 'poisson', prix: 185, unite: 'lot', stock: 40, code: '0305 41 00', etiq: false },
    { f: lagos, nom: 'Crevettes séchées 5kg', cat: 'poisson', prix: 120, unite: 'lot', stock: 55, code: '0306 95 00', etiq: true },
    { f: burkina, nom: 'Beurre de karité brut 10kg', cat: 'cosmetiques', prix: 78, unite: 'lot', stock: 150, code: '1515 90 91', etiq: true },
    { f: burkina, nom: 'Savon noir 24 unités', cat: 'cosmetiques', prix: 36, unite: 'lot', stock: 90, code: '3401 19 00', etiq: true }
  ];

  const produits = [];
  for (const p of produitsData) {
    const produit = await prisma.produit.create({
      data: {
        fournisseurId: p.f.id,
        nom: p.nom,
        categorie: p.cat,
        prix: p.prix,
        prixUnite: p.unite,
        stockDisponible: p.stock,
        codeDouanier: p.code,
        etiquettageFR: p.etiq,
        certifications: JSON.stringify(['HACCP'])
      }
    });
    produits.push(produit);
  }

  // ===== COMMANDE GROUPÉE =====
  const groupe = await prisma.commandeGroupe.create({
    data: {
      titre: 'Conteneur Abidjan → Lyon (juin)',
      origine: 'Abidjan',
      destination: 'Lyon',
      dateDepart: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      maxBoutiques: 5,
      economie: 60
    }
  });

  // ===== COMMANDES =====
  const cmdTransit = await prisma.commande.create({
    data: {
      boutiqueId: boutique.id,
      userId: mamadou.id,
      statut: 'EN_TRANSIT',
      modeTransport: 'MARITIME',
      coutTotal: 1360 + 216,
      coutFret: 216,
      poids: 120,
      paysOrigine: 'CI',
      dateExpedition: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      groupeId: groupe.id,
      lignes: { create: { produitId: produits[0].id, quantite: 20, prixUnitaire: 68, sousTotal: 1360 } },
      suivis: {
        create: [
          { statut: 'EN_ATTENTE', description: 'Commande créée', lieu: 'Lyon' },
          { statut: 'CONFIRME', description: 'Confirmée par Kofi Exports', lieu: 'Abidjan' },
          { statut: 'CHARGE', description: 'Conteneur chargé au port', lieu: 'Port d\'Abidjan' },
          { statut: 'EN_TRANSIT', description: 'En mer — arrivée prévue à Marseille le 28', lieu: 'Océan Atlantique' }
        ]
      }
    }
  });

  const cmdBloquee = await prisma.commande.create({
    data: {
      boutiqueId: boutique.id,
      userId: mamadou.id,
      statut: 'BLOQUE',
      modeTransport: 'MARITIME',
      coutTotal: 950 + 108,
      coutFret: 108,
      poids: 60,
      paysOrigine: 'SN',
      dateExpedition: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      lignes: { create: { produitId: produits[2].id, quantite: 10, prixUnitaire: 95, sousTotal: 950 } },
      suivis: {
        create: [
          { statut: 'EN_ATTENTE', description: 'Commande créée', lieu: 'Lyon' },
          { statut: 'CONFIRME', description: 'Confirmée par Dakar Spices', lieu: 'Dakar' },
          { statut: 'EN_TRANSIT', description: 'En mer', lieu: 'Océan Atlantique' },
          { statut: 'DOUANE', description: 'Arrivée au port de Marseille — contrôle douanier', lieu: 'Marseille' },
          { statut: 'BLOQUE', description: 'Certificat sanitaire manquant', lieu: 'Douane Marseille' }
        ]
      },
      alertes: {
        create: {
          type: 'CERTIFICAT_MANQUANT',
          description: 'Certificat sanitaire manquant — action requise sous 48h'
        }
      }
    }
  });

  await prisma.commande.create({
    data: {
      boutiqueId: boutique.id,
      userId: mamadou.id,
      statut: 'CONFIRME',
      modeTransport: 'AERIEN',
      coutTotal: 1850 + 180,
      coutFret: 180,
      poids: 15,
      paysOrigine: 'NG',
      lignes: { create: { produitId: produits[5].id, quantite: 10, prixUnitaire: 185, sousTotal: 1850 } },
      suivis: {
        create: [
          { statut: 'EN_ATTENTE', description: 'Commande créée', lieu: 'Lyon' },
          { statut: 'CONFIRME', description: 'Confirmée — départ Lagos prévu sous 5 jours', lieu: 'Lagos' }
        ]
      }
    }
  });

  // ===== NOTIFICATIONS =====
  await prisma.notification.createMany({
    data: [
      { userId: mamadou.id, type: 'ALERTE_DOUANE', titre: '⚠ Lot bloqué en douane', message: `Commande #${cmdBloquee.id.slice(-6).toUpperCase()} bloquée à Marseille. Certificat sanitaire manquant.` },
      { userId: mamadou.id, type: 'STOCK', titre: 'Stock faible — Gari 25kg', message: '8 unités restantes chez Dakar Spices (seuil : 10).' },
      { userId: mamadou.id, type: 'COMMANDE', titre: 'Commande en transit', message: `Commande #${cmdTransit.id.slice(-6).toUpperCase()} en mer — arrivée à Marseille le 28.` }
    ]
  });

  // ===== TONTINE =====
  await prisma.tontine.create({
    data: {
      nom: 'Tontine des commerçants de Lyon',
      montantPart: 200,
      frequence: 'MENSUEL',
      membres: { create: { userId: mamadou.id, tourOrdre: 1 } },
      versements: {
        create: [
          { montant: 200, statut: 'PAYE' },
          { montant: 200, statut: 'EN_ATTENTE' }
        ]
      }
    }
  });

  // ===== AVIS =====
  await prisma.avis.createMany({
    data: [
      { fournisseurId: kofi.id, note: 5, commentaire: 'Livraison rapide, produits de qualité.' },
      { fournisseurId: kofi.id, note: 5, commentaire: 'Très fiable, je recommande.' },
      { fournisseurId: dakar.id, note: 4, commentaire: 'Bon rapport qualité/prix.' },
      { fournisseurId: lagos.id, note: 4, commentaire: 'Bien mais délais un peu longs.' },
      { fournisseurId: burkina.id, note: 5, commentaire: 'Karité excellent, certifié bio.' }
    ]
  });

  console.log('✅ Seed terminé.');
  console.log('   Compte démo : demo@afrikonnect.fr / demo1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

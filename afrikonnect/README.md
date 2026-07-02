# ===== AFRIKONNECT — GUIDE DE DÉPLOIEMENT OVH =====

## Structure des fichiers à uploader sur OVH

afrikonnect/
├── index.html          ← Site vitrine (page d'accueil)
├── css/
│   └── style.css       ← Styles du site vitrine
├── js/
│   └── main.js         ← JavaScript du site vitrine
├── app/
│   └── index.html      ← Application web complète
├── .htaccess           ← Configuration Apache OVH
└── README.md           ← Ce fichier

## Étapes de déploiement sur OVH

### 1. Choisir votre hébergement OVH
- Hébergement mutualisé Pro ou Performance (recommandé)
- Ou VPS Cloud pour plus de contrôle
- URL du panneau OVH : https://www.ovh.com/manager/

### 2. Accéder au FTP OVH
- Hôte FTP : ftp.cluster0XX.hosting.ovh.net (visible dans votre manager)
- Login : votre identifiant OVH
- Mot de passe : votre mot de passe FTP (à créer dans le manager)
- Port : 21

### 3. Uploader les fichiers
Via FTP (FileZilla recommandé) :
- Connectez-vous à votre espace FTP OVH
- Naviguez vers le dossier www/ (ou public_html/)
- Uploadez TOUS les fichiers en conservant la structure des dossiers

### 4. Configurer votre domaine
- Dans le manager OVH : Noms de domaine → votre-domaine.fr
- Pointez vers votre hébergement mutualisé
- Activez le certificat SSL gratuit (Let's Encrypt) : 
  Hébergement → Certificat SSL → Commander un certificat

### 5. Tester votre site
- https://votre-domaine.fr → Site vitrine
- https://votre-domaine.fr/app/ → Application web

## Notes importantes

- Pas de PHP ni base de données nécessaire pour cette version statique
- Pour une version avec backend (base de données, comptes utilisateurs),
  il faudra ajouter : PHP 8.x, MySQL (disponibles sur OVH Pro)
- Le site est 100% statique HTML/CSS/JS = très rapide sur OVH

## Performance OVH recommandée

- Activer le CDN OVH (inclus dans certains plans) pour les images
- Activer la compression GZIP via .htaccess (déjà configuré)
- Activer le cache navigateur (déjà configuré dans .htaccess)

# 📦 Guide de déploiement Afrikonnect sur OVH

## Structure des fichiers

```
afrikonnect/
├── index.html      ← Site vitrine (page d'accueil marketing)
├── app.html        ← Application dashboard (interface commerçant)
└── README.md       ← Ce guide
```

---

## 🚀 Déploiement sur OVH (hébergement mutualisé)

### Étape 1 — Accéder à votre espace OVH
1. Connectez-vous sur https://www.ovh.com/manager
2. Allez dans **Hébergements** → votre offre
3. Cliquez sur l'onglet **FTP - SSH**
4. Notez vos identifiants FTP

### Étape 2 — Uploader les fichiers via FTP
Utilisez un logiciel FTP gratuit comme **FileZilla** :
1. Hôte : `ftp.votre-domaine.fr`
2. Login : votre identifiant OVH
3. Mot de passe : votre mot de passe FTP
4. Port : `21`

Uploadez les fichiers dans le dossier **`www/`** (racine web) :
```
www/
├── index.html
├── app.html
```

### Étape 3 — Vérification
- Site vitrine : `https://votre-domaine.fr`
- Application : `https://votre-domaine.fr/app.html`

---

## 🌐 Configuration du domaine (si pas encore fait)

Dans l'espace OVH > **Domaines** :
1. Ajoutez un enregistrement **A** pointant vers l'IP de votre hébergement
2. Activez le **certificat SSL gratuit** (Let's Encrypt) dans l'onglet SSL/TLS
3. Activez la **redirection HTTPS** automatique

---

## 🔒 Checklist sécurité OVH

- [ ] SSL/TLS activé (HTTPS)
- [ ] Fichier `.htaccess` pour redirection HTTP → HTTPS
- [ ] Mot de passe FTP fort
- [ ] Sauvegardes automatiques OVH activées
- [ ] Mentions légales ajoutées (obligatoire en France)

---

## 📁 Fichier .htaccess recommandé

Créez un fichier `.htaccess` dans le dossier `www/` :

```apache
# Redirection HTTP vers HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Protection dossiers sensibles
Options -Indexes

# Cache navigateur
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

---

## 📧 Évolutions recommandées (phase 2)

Pour aller plus loin, vous aurez besoin d'un backend :

| Fonctionnalité | Technologie recommandée |
|---|---|
| Authentification utilisateurs | PHP + MySQL (inclus OVH) |
| Base de données produits | MySQL via phpMyAdmin |
| Paiements | Stripe API |
| Emails transactionnels | OVH Email Pro ou Mailjet |
| Notifications push | Firebase Cloud Messaging |

OVH propose des offres **VPS** ou **Cloud** si vous avez besoin de Node.js ou Python.

---

## 📞 Support OVH
- Documentation : https://docs.ovh.com/fr/
- Téléphone : 1007 (depuis la France)
- Espace client : https://www.ovh.com/manager

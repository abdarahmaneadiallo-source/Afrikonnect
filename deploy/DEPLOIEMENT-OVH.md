# 🚀 Déploiement Afrikonnect sur VPS OVH

## Prérequis
- Un **VPS OVH** (Starter suffit pour démarrer : ~4-7 €/mois, Ubuntu 22.04+)
- Le domaine **afrikonnect.fr** dans votre espace OVH
- Accès SSH au VPS (`ssh ubuntu@IP_VPS`)

---

## Étape 1 — DNS (espace OVH → Domaines → Zone DNS)

| Type | Sous-domaine | Cible |
|---|---|---|
| A | (vide) | IP du VPS |
| A | www | IP du VPS |
| A | api | IP du VPS |

Propagation : jusqu'à 24 h (souvent < 1 h).

---

## Étape 2 — Préparer le VPS

```bash
ssh ubuntu@IP_VPS
# Copier setup-vps.sh sur le VPS puis :
bash setup-vps.sh
```

Le script installe Node.js 20, PostgreSQL (avec base + utilisateur), Nginx, Certbot, PM2 et le pare-feu.
**⚠ Notez le DATABASE_URL affiché à la fin.**

---

## Étape 3 — Envoyer le code

Depuis votre Mac :
```bash
rsync -av --exclude node_modules --exclude .next --exclude dev.db \
  ~/Desktop/08_Projet_Afrikonnect/afrikonnect-saas \
  ~/Desktop/08_Projet_Afrikonnect/afrikonnect-frontend \
  ~/Desktop/08_Projet_Afrikonnect/deploy/ecosystem.config.js \
  ubuntu@IP_VPS:/home/ubuntu/afrikonnect/
```

---

## Étape 4 — Backend (sur le VPS)

```bash
cd /home/ubuntu/afrikonnect/afrikonnect-saas/backend

# 1. Passer Prisma en PostgreSQL (une seule ligne à changer)
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 2. Configurer l'environnement
cp /chemin/vers/env.production.example .env
nano .env   # coller le DATABASE_URL, générer JWT_SECRET, clés Stripe

# 3. Installer et initialiser
npm install
npx prisma db push
node prisma/seed.js        # optionnel : données de démo
```

> Le schéma est compatible PostgreSQL tel quel (les listes sont stockées en JSON string) — seul le `provider` change.

---

## Étape 5 — Frontend (sur le VPS)

```bash
cd /home/ubuntu/afrikonnect/afrikonnect-frontend
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=https://api.afrikonnect.fr/api
NEXT_PUBLIC_APP_URL=https://afrikonnect.fr
EOF
npm install
npm run build
```

---

## Étape 6 — Lancer avec PM2

```bash
cd /home/ubuntu/afrikonnect
pm2 start ecosystem.config.js
pm2 save && pm2 startup    # suivre l'instruction affichée
pm2 status                 # les 2 apps doivent être "online"
```

---

## Étape 7 — Nginx + HTTPS

```bash
sudo cp nginx-afrikonnect.conf /etc/nginx/sites-available/afrikonnect
sudo ln -s /etc/nginx/sites-available/afrikonnect /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Certificats SSL gratuits (Let's Encrypt)
sudo certbot --nginx -d afrikonnect.fr -d www.afrikonnect.fr -d api.afrikonnect.fr
```

---

## Étape 8 — Vérification

- https://afrikonnect.fr → page de connexion
- https://api.afrikonnect.fr/health → `{"status":"ok"}`
- Connexion démo : `demo@afrikonnect.fr` / `demo1234` (si seed exécuté)

---

## Maintenance

| Tâche | Commande |
|---|---|
| Voir les logs | `pm2 logs` |
| Redéployer le front | `cd afrikonnect-frontend && git pull && npm run build && pm2 restart afrikonnect-front` |
| Redéployer l'API | `cd afrikonnect-saas/backend && git pull && npm install && pm2 restart afrikonnect-api` |
| Sauvegarde base | `pg_dump -U afrikonnect afrikonnect_db > backup_$(date +%F).sql` |
| Renouvellement SSL | automatique (certbot timer) |

## Checklist sécurité
- [ ] JWT_SECRET unique généré (`openssl rand -hex 32`)
- [ ] Mot de passe PostgreSQL fort (généré par le script)
- [ ] Clés Stripe **live** (pas test) et webhook configuré sur dashboard.stripe.com
- [ ] Supprimer le compte démo en production : `demo@afrikonnect.fr`
- [ ] Sauvegardes automatiques : `crontab -e` → `0 3 * * * pg_dump -U afrikonnect afrikonnect_db > /home/ubuntu/backups/db_$(date +\%F).sql`

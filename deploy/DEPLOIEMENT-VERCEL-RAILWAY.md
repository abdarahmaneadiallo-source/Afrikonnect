# 🆓 Déploiement gratuit — Vercel (frontend) + Railway (API + PostgreSQL)

Idéal pour tester avant de s'engager sur OVH. Durée totale : ~20 minutes.

> Le dépôt Git local est déjà prêt (commit fait). Il ne reste qu'à le pousser sur GitHub.

---

## Étape 1 — Pousser le code sur GitHub (5 min)

1. Créez un compte sur https://github.com si besoin
2. Créez un nouveau dépôt **privé** nommé `afrikonnect` (sans README ni .gitignore)
3. Dans le Terminal :

```bash
cd ~/Desktop/08_Projet_Afrikonnect
git remote add origin https://github.com/VOTRE_PSEUDO/afrikonnect.git
git push -u origin main
```

(GitHub vous demandera de vous connecter — suivez les instructions.)

---

## Étape 2 — Railway : API + PostgreSQL (10 min)

1. https://railway.app → **Login with GitHub**
2. **New Project → Deploy from GitHub repo** → choisissez `afrikonnect`
3. Dans les réglages du service (Settings) :
   - **Root Directory** : `afrikonnect-saas/backend`
   - **Custom Start Command** : `npm run start:railway`
4. **+ New → Database → PostgreSQL** (dans le même projet)
5. Dans le service backend → **Variables** :
   - `DATABASE_URL` → cliquez "Add Reference" → sélectionnez `DATABASE_URL` du Postgres
   - `JWT_SECRET` → générez sur votre Mac : `openssl rand -hex 32`
   - `STRIPE_SECRET_KEY` → `sk_test_dummy` (pour l'instant)
   - `FRONTEND_URL` → `http://localhost:4310` (on mettra l'URL Vercel après)
   - `NODE_ENV` → `production`
6. Settings → **Networking → Generate Domain** → notez l'URL
   (ex : `afrikonnect-production.up.railway.app`)
7. Vérifiez : `https://VOTRE-URL-RAILWAY/health` doit répondre `{"status":"ok"}`

**Données de démo (optionnel)** : onglet du service → ⌘K → "Run command" → `npm run seed:railway`
(ou via Railway CLI : `railway run npm run seed:railway`)

---

## Étape 3 — Vercel : frontend (5 min)

1. https://vercel.com → **Continue with GitHub**
2. **Add New → Project** → importez `afrikonnect`
3. Configuration :
   - **Root Directory** : `afrikonnect-frontend`
   - **Framework Preset** : Next.js (détecté automatiquement)
4. **Environment Variables** :
   - `NEXT_PUBLIC_API_URL` → `https://VOTRE-URL-RAILWAY/api`
5. **Deploy** → notez l'URL (ex : `afrikonnect.vercel.app`)

---

## Étape 4 — Relier les deux

Retour sur Railway → service backend → Variables :
- `FRONTEND_URL` → `https://afrikonnect.vercel.app`
(le backend accepte déjà automatiquement tous les domaines `*.vercel.app`)

---

## Étape 5 — Tester 🎉

- `https://afrikonnect.vercel.app` → page de connexion
- Compte démo (si seed exécuté) : `demo@afrikonnect.fr` / `demo1234`

---

## Limites des plans gratuits

| Service | Gratuit | Limite |
|---|---|---|
| Vercel Hobby | Oui | Usage non commercial ; 100 Go bande passante/mois |
| Railway | 5 $ de crédit d'essai unique | Ensuite ~5 $/mois (plan Hobby) |

💡 Railway n'est donc gratuit que pour l'essai. Alternatives 100 % gratuites pour l'API :
**Render Free** (l'API s'endort après 15 min d'inactivité, réveil ~30 s) + **Neon** (PostgreSQL gratuit 0,5 Go).

## Mises à jour

Chaque `git push` redéploie automatiquement Vercel ET Railway. C'est tout.

## Passage à OVH plus tard

Le kit `deploy/DEPLOIEMENT-OVH.md` reste valable tel quel — même code, même schéma PostgreSQL.
Il suffira d'exporter la base Railway (`pg_dump`) et de l'importer sur le VPS.

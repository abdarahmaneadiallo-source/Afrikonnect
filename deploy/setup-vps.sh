#!/bin/bash
# ===== AFRIKONNECT — INSTALLATION VPS OVH (Ubuntu 22.04/24.04) =====
# Usage : bash setup-vps.sh
# À exécuter en SSH sur le VPS : ssh ubuntu@VOTRE_IP_VPS

set -e

echo "=== 1/6 Mise à jour du système ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== 2/6 Installation Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== 3/6 Installation PostgreSQL ==="
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

# Créer la base et l'utilisateur (mot de passe à changer !)
DB_PASSWORD=$(openssl rand -hex 16)
sudo -u postgres psql <<EOF
CREATE USER afrikonnect WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE afrikonnect_db OWNER afrikonnect;
EOF
echo ""
echo ">>> DATABASE_URL à copier dans votre .env :"
echo "postgresql://afrikonnect:${DB_PASSWORD}@localhost:5432/afrikonnect_db"
echo ""

echo "=== 4/6 Installation Nginx + Certbot (HTTPS) ==="
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== 5/6 Installation PM2 ==="
sudo npm install -g pm2

echo "=== 6/6 Pare-feu ==="
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "✅ VPS prêt. Étapes suivantes :"
echo "  1. Clonez ou uploadez le code dans /home/ubuntu/afrikonnect"
echo "  2. Configurez backend/.env avec le DATABASE_URL ci-dessus"
echo "  3. Copiez nginx-afrikonnect.conf dans /etc/nginx/sites-available/"
echo "  4. Lancez : pm2 start ecosystem.config.js"
echo "  5. HTTPS : sudo certbot --nginx -d afrikonnect.fr -d www.afrikonnect.fr"

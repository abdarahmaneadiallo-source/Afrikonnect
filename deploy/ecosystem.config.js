// ===== AFRIKONNECT — PM2 (process manager) =====
// Copier à la racine du projet sur le VPS, puis :
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup   (redémarrage auto au boot)

module.exports = {
  apps: [
    {
      name: 'afrikonnect-api',
      cwd: './afrikonnect-saas/backend',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'afrikonnect-front',
      cwd: './afrikonnect-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

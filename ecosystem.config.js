module.exports = {
  apps: [
    {
      name: 'profitdariai',
      script: '.next/standalone/server.js',
      cwd: '/var/www/profitdariai',
      env_file: '/var/www/profitdariai/.env.production',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}

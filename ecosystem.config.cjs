module.exports = {
  apps: [
    {
      exec_mode: 'fork',
      name: 'storno-docs',
      // Next.js standalone output produces .next/standalone/server.js. The
      // deploy.sh moves it under .next-live/ so the same zero-downtime swap
      // pattern landing uses works here too.
      script: '.next-live/standalone/server.js',
      cwd: '/storage/www/storno/docs',
      instances: 1,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      node_args: '--max-old-space-size=2048 --env-file-if-exists=.env',
      env: {
        NODE_ENV: 'production',
        // nginx proxies docs.storno.ro → 127.0.0.1:8903 (with :8913 backup
        // configured but unused under the PM2 model).
        HOSTNAME: '127.0.0.1',
        PORT: 8903,
      },
    },
    {
      exec_mode: 'fork',
      name: 'storno-docs-webhook',
      script: 'webhook-server.cjs',
      cwd: '/storage/www/storno/docs',
      instances: 1,
      max_memory_restart: '256M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'production',
        WEBHOOK_PORT: 9903,
      },
    },
  ],
};

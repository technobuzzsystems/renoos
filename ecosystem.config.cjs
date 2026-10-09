module.exports = {
  apps: [
    {
      name: 'renoos-hotel',
      cwd: '/var/www/renoos',
      script: './node_modules/tsx/dist/cli.mjs',
      args: 'server/index.mjs',
      interpreter: 'node',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '15080',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      watch: false,
    },
  ],
}

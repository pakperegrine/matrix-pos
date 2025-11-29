// PM2 configuration file for process management
// Alternative to systemd for managing the backend process

module.exports = {
  apps: [
    {
      name: 'matrix-pos-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/matrix-pos',
      instances: 2,  // Number of instances (use 'max' for all CPU cores)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/matrix-pos/logs/backend-error.log',
      out_file: '/var/www/matrix-pos/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};

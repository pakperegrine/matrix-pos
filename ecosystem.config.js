// PM2 configuration file for process management
// Alternative to systemd for managing the backend process

module.exports = {
  apps: [
    {
      name: 'matrix-pos-backend',
      script: './dist/main.js',
      cwd: 'C:/pos_repo/backend',
      instances: 1,  // Single instance to avoid port conflicts on Windows
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        JWT_SECRET: 'change_this_secret',
        DB_TYPE: 'sqlite',
        DB_DATABASE: './dev.sqlite',
        DEV_BUSINESS_ID: 'business-1'
      },
      error_file: 'C:/pos_repo/logs/backend-error.log',
      out_file: 'C:/pos_repo/logs/backend-out.log',
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

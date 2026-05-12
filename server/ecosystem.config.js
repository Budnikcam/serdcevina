module.exports = {
  apps: [
    {
      name: 'serdcevina-api',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      max_memory_restart: '500M',
    },
  ],
};

// PM2 configuration
// NOTE: Socket.io uses an in-memory store for online users.
// Running multiple instances (cluster mode) will break real-time features
// unless you add a Redis adapter (@socket.io/redis-adapter).
// For free hosting (single instance), instances: 1 is safe and correct.
// To scale later: npm install @socket.io/redis-adapter ioredis and configure Redis.

module.exports = {
  apps: [{
    name: 'excel-tutoring-api',
    script: './server.js',
    instances: 1,          // Keep at 1 until Redis adapter is configured
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: false,
    listen_timeout: 10000
  }]
};

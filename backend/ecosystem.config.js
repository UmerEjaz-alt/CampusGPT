// ============================================================
//  PM2 Ecosystem — Auto-start CampusGPT on system boot
//
//  Install PM2 globally:  npm install -g pm2
//  Start:                 pm2 start ecosystem.config.js
//  Save & auto-boot:      pm2 save && pm2 startup
//  Monitor:               pm2 monit
//  Logs:                  pm2 logs campusgpt-backend
//  Stop:                  pm2 stop campusgpt-backend
// ============================================================

module.exports = {
  apps: [{
    name:         'campusgpt-backend',
    script:       'server.js',
    instances:    1,
    autorestart:  true,          // Restart if it crashes
    watch:        false,         // Don't watch files in production
    max_memory_restart: '512M',  // Restart if RAM exceeds 512MB
    env: {
      NODE_ENV: 'production',
      PORT:     5000,
    },
    error_file:  './logs/err.log',
    out_file:    './logs/out.log',
    merge_logs:  true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

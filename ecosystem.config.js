// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CẤU HÌNH QUẢN LÝ TIẾN TRÌNH PM2 (PRODUCTION PROCESS MANAGER)
// ============================================================================

module.exports = {
  apps: [
    {
      name: 'quan-moc-pos-server',
      script: 'backend/mayChu.js',
      instances: 1, // Do dùng SQLite WAL mode và Socket.io gateway nên 1 instance là tối ưu nhất
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        CONG_BACKEND: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        CONG_BACKEND: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true
    }
  ]
};

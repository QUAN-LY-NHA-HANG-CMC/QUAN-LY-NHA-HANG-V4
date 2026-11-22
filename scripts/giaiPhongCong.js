// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG QUÁN MỘC POS
// TIỆN ÍCH: GIẢI PHÓNG CỔNG 3001 (ĐÓNG TIẾN TRÌNH NODE ĐANG CHẠY NGẦM)
// ============================================================================

const { execSync } = require('child_process');

const PORT = 3001;

function giaiPhongCong(port = PORT) {
  console.log(`\n🔍 Đang kiểm tra tiến trình đang chiếm cổng ${port}...`);
  try {
    if (process.platform === 'win32') {
      // Tìm PID qua netstat trên Windows
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const lines = output.trim().split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const state = parts[3];
          const pid = parts[parts.length - 1];
          if (state === 'LISTENING' || line.includes(`:${port}`)) {
            if (pid && pid !== '0' && pid !== String(process.pid)) {
              pids.add(pid);
            }
          }
        }
      });

      if (pids.size === 0) {
        console.log(`✅ Cổng ${port} hiện đang TRỐNG, không có tiến trình nào chiếm dụng.`);
        return;
      }

      pids.forEach(pid => {
        try {
          console.log(`🛑 Đang dừng tiến trình PID: ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`✅ Đã giải phóng tiến trình PID ${pid} thành công!`);
        } catch (err) {
          console.log(`⚠️ Không thể tắt PID ${pid}: ${err.message}`);
        }
      });
      console.log(`🎉 Cổng ${port} đã được giải phóng hoàn toàn! Bạn có thể khởi động lại máy chủ ngay.\n`);
    } else {
      // Unix / macOS / Linux
      try {
        execSync(`lsof -t -i:${port} | xargs kill -9`);
        console.log(`✅ Đã giải phóng cổng ${port} trên Unix/Linux!`);
      } catch (err) {
        console.log(`✅ Cổng ${port} đã trống.`);
      }
    }
  } catch (error) {
    console.log(`✅ Cổng ${port} hiện đang TRỐNG (không có tiến trình nào đang lắng nghe).`);
  }
}

giaiPhongCong(PORT);

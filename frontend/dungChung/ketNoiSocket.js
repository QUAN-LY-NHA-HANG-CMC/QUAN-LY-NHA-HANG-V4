/**
 * Module kết nối WebSockets Client (Socket.io)
 * Tích hợp tự động kết nối lại (Auto-reconnect) & đồng bộ trạng thái (US-136)
 * Phụ trách: Nhật (Architecture) & Phong (Frontend)
 */
let socket = null;
let trangThaiKetNoi = false;

export function layKetNoiSocket() {
    if (!socket && typeof window !== 'undefined' && window.io) {
        // Cấu hình tự động kết nối lại với độ trễ tăng dần (Exponential backoff)
        socket = window.io({
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        socket.on('connect', () => {
            trangThaiKetNoi = true;
            console.log('[Socket.io] Đã kết nối máy chủ thời gian thực thành công:', socket.id);
        });

        socket.on('disconnect', (lyDo) => {
            trangThaiKetNoi = false;
            console.warn('[Socket.io] Mất kết nối máy chủ:', lyDo);
        });

        socket.on('reconnect', (soLanThu) => {
            trangThaiKetNoi = true;
            console.log(`[Socket.io] Kết nối lại thành công sau ${soLanThu} lần thử!`);
        });

        socket.on('reconnect_error', (loi) => {
            console.error('[Socket.io] Lỗi kết nối lại:', loi.message);
        });
    }
    return socket;
}

export function kiemTraKetNoi() {
    return trangThaiKetNoi;
}

export function thamGiaBan(banId, maPhien) {
    const s = layKetNoiSocket();
    if (s && banId) {
        s.emit('tham_gia_ban', { banId, maPhien });
    }
}

export function thamGiaPhong(phong) {
    const s = layKetNoiSocket();
    if (s && phong) {
        s.emit('tham_gia_phong', { phong });
    }
}

export function langNgheSuKien(tenSuKien, hamXuLy) {
    const s = layKetNoiSocket();
    if (s) {
        s.on(tenSuKien, hamXuLy);
    }
}

export function huyLangNghe(tenSuKien, hamXuLy) {
    const s = layKetNoiSocket();
    if (s) {
        if (hamXuLy) {
            s.off(tenSuKien, hamXuLy);
        } else {
            s.off(tenSuKien);
        }
    }
}

/**
 * Module kết nối WebSockets Client (Socket.io)
 * Phụ trách: Phong (Frontend Developer)
 */
let socket = null;

export function layKetNoiSocket() {
    if (!socket && typeof window !== 'undefined' && window.io) {
        socket = window.io();

        socket.on('connect', () => {
            console.log('[Socket] Đã kết nối máy chủ thời gian thực:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Mất kết nối máy chủ');
        });
    }
    return socket;
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

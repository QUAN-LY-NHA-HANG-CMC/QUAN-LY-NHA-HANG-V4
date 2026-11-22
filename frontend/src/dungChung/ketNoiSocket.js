// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// QUẢN LÝ KẾT NỐI REALTIME SOCKET.IO CLIENT
// ============================================================================

import { io } from 'socket.io-client';
import { api } from './api';

let socket = null;
let tokenHienTai;

export function khoiTaoSocket() {
  const token = api.layToken();
  if (socket && token !== tokenHienTai) {
    tokenHienTai = token;
    socket.disconnect().connect();
  }
  if (!socket) {
    tokenHienTai = token;
    // Kết nối tới cùng host (Vite proxy chuyển tiếp websocket sang port 3001)
    socket = io(window.location.origin, {
      auth: callback => callback({ token: api.layToken() }),
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      const vaiTro = api.layNguoiDung()?.vaiTro;
      if (vaiTro) socket.emit('tham_gia_vai_tro', vaiTro);
    });

    socket.on('disconnect', (lyDo) => {
      console.log('🔌 [Socket.io] Mất kết nối:', lyDo);
    });
  }
  return socket;
}

export const taoKetNoiSocket = khoiTaoSocket;
export const ketNoiSocket = laySocket;

export function laySocket() {
  return khoiTaoSocket();
}

export function thamGiaBan(banId) {
  const s = laySocket();
  if (s && banId) {
    s.emit('tham_gia_ban', banId);
  }
}

export function roiBan(banId) {
  const s = laySocket();
  if (s && banId) {
    s.emit('roi_ban', banId);
  }
}

export function thamGiaVaiTro(vaiTro) {
  const s = laySocket();
  if (s && vaiTro) {
    s.emit('tham_gia_vai_tro', vaiTro);
  }
}

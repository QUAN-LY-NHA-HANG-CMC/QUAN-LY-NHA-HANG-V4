/**
 * Cấu hình Socket.io Server phục vụ đồng bộ dữ liệu thời gian thực (Sprint 2)
 * Các room:
 * - ban_{banId}: Dành cho khách tại bàn theo dõi trạng thái đơn món / yêu cầu hỗ trợ
 * - bep: Dành cho màn hình điều phối bếp (KDS)
 * - thu_ngan: Dành cho POS thu ngân nhận yêu cầu thanh toán / hỗ trợ
 */
const { Server } = require('socket.io');

let io = null;

function khoiTaoSocket(serverHttp) {
    if (!serverHttp) return io;
    io = new Server(serverHttp, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        // Khách hàng tham gia room theo bàn ăn
        socket.on('tham_gia_ban', ({ banId, maPhien }, callback) => {
            if (banId) {
                const tenRoom = `ban_${banId}`;
                socket.join(tenRoom);
                socket.banId = banId;
                socket.maPhien = maPhien;
            }
            if (typeof callback === 'function') {
                callback({ ok: true });
            }
        });

        // Nhân viên tham gia room chức năng (bếp, thu ngân, quản lý)
        socket.on('tham_gia_phong', ({ phong }, callback) => {
            const cacPhongChoPhep = ['bep', 'thu_ngan', 'quan_ly'];
            if (cacPhongChoPhep.includes(phong)) {
                socket.join(phong);
            }
            if (typeof callback === 'function') {
                callback({ ok: true });
            }
        });

        socket.on('disconnect', () => {
            // Socket ngắt kết nối
        });
    });

    return io;
}

function laySocketServer() {
    return io;
}

const laySocketIO = laySocketServer;

function phatSuKienBan(banId, tenSuKien, duLieu) {
    if (io && banId) {
        io.to(`ban_${banId}`).emit(tenSuKien, duLieu);
    }
}

function phatSuKienBep(tenSuKien, duLieu) {
    if (io) {
        io.to('bep').emit(tenSuKien, duLieu);
    }
}

function phatSuKienThuNgan(tenSuKien, duLieu) {
    if (io) {
        io.to('thu_ngan').emit(tenSuKien, duLieu);
    }
}

function phatToanHeThong(tenSuKien, duLieu) {
    if (io) {
        io.emit(tenSuKien, duLieu);
    }
}

function dongSocket() {
    if (io) {
        io.close();
        io = null;
    }
}

module.exports = {
    khoiTaoSocket,
    laySocketServer,
    laySocketIO,
    phatSuKienBan,
    phatSuKienBep,
    phatSuKienThuNgan,
    phatToanHeThong,
    dongSocket
};

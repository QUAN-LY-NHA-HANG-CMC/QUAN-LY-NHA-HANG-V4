/**
 * Cấu hình kết nối WebSockets (Socket.io)
 * Chuẩn bị kiến trúc cho Sprint 2 & Sprint 3 (Real-time sync)
 */
let ioInstance = null;

function khoiTaoSocket(server) {
    // Có thể gắn Socket.io tại đây khi nâng cấp Sprint 2
    return ioInstance;
}

function laySocketIO() {
    return ioInstance;
}

module.exports = {
    khoiTaoSocket,
    laySocketIO
};

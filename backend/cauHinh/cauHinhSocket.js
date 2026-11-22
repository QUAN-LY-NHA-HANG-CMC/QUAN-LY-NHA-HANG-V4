// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CẤU HÌNH VÀ ĐIỀU PHỐI SOCKET.IO GATEWAY THỜI GIAN THỰC (REAL-TIME)
// ============================================================================

const { Server } = require('socket.io');
const cauHinh = require('./cauHinhChung');
const { layTaiKhoanTuToken } = require('../middleware/xacThuc');
const banAnModel = require('../modules/banAn/banAn.model');
const { xacThucThietBi } = require('../modules/banAn/thietBiPhienBan');

let io = null;

function phongPhien(banId, phienId = banAnModel.layPhienBanHienTai(Number(banId))?.id) {
    return `phien_ban_${phienId}`;
}

/**
 * Khởi tạo Socket.io Server gắn kết với HTTP Server
 * @param {import('http').Server} mayChuHttp 
 * @returns {Server}
 */
function khoiTaoSocket(mayChuHttp) {
    io = new Server(mayChuHttp, {
        cors: {
            origin: cauHinh.nguonFrontendChoPhep,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    function coQuyen(socket, vaiTro) {
        try {
            const taiKhoan = layTaiKhoanTuToken(socket.handshake.auth.token);
            return taiKhoan?.trang_thai === 'hoat_dong' &&
                [vaiTro, 'quan_ly'].includes(taiKhoan.ma_vai_tro);
        } catch {
            return false;
        }
    }

    io.on('connection', (socket) => {
        try {
            const nv = layTaiKhoanTuToken(socket.handshake.auth.token);
            if (nv?.trang_thai === 'hoat_dong') {
                socket.join(nv.ma_vai_tro);
                if (nv.nhan_vien_id) socket.join('nhan_vien_' + nv.nhan_vien_id);
            }
        } catch { /* Kết nối khách chưa có tài khoản nhân viên. */ }
        // 1. Gia nhập phòng theo vai trò nội bộ (bep, thu_ngan, phuc_vu, admin)
        socket.on('tham_gia_vai_tro', (vaiTro) => {
            if (['bep', 'thu_ngan', 'phuc_vu', 'quan_ly'].includes(vaiTro) && coQuyen(socket, vaiTro)) {
                socket.join(vaiTro);
            }
        });

        // 2. Gia nhập phòng theo bàn ăn (Khách hàng quét QR bàn X)
        socket.on('tham_gia_ban', (banId, token, khoaThietBi) => {
            const ban = typeof token === 'string' && banAnModel.timTheoQrToken(token);
            const thietBi = ban?.id === Number(banId) && xacThucThietBi(ban.id, khoaThietBi);
            if (!thietBi) return;
            if (socket.data.phongPhien) socket.leave(socket.data.phongPhien);
            socket.data.phongPhien = phongPhien(ban.id, thietBi.phien_ban_id);
            socket.join(socket.data.phongPhien);
        });

        // 3. Rời phòng
        socket.on('roi_ban', () => {
            if (socket.data.phongPhien) socket.leave(socket.data.phongPhien);
            delete socket.data.phongPhien;
        });

        socket.on('disconnect', () => {
            // Ngắt kết nối socket tự nhiên
        });

        // 5. Phục vụ giục món gửi tới Bếp KDS (Real-time)
        socket.on('phuc_vu:giuc_mon', (duLieu, phanHoi) => {
            if (typeof phanHoi !== 'function') return;
            if (!coQuyen(socket, 'phuc_vu')) return phanHoi({ ok: false, msg: 'Bạn không có quyền giục món.' });
            const nv = layTaiKhoanTuToken(socket.handshake.auth.token);
            const caLamViec = require('../modules/caLamViec/caLamViec.service');
            if (nv.ma_vai_tro !== 'quan_ly' && !caLamViec.trangThaiCa(nv.nhan_vien_id).caDangLam)
                return phanHoi({ ok: false, msg: 'Hãy xác nhận vào ca trước.' });
            const { truyVanNhieu } = require('./ketNoiCoSoDuLieu');
            const banId = Number(duLieu?.banId);
            const id = Number(duLieu?.chiTietId || 0);
            if (!Number.isSafeInteger(banId) || !Number.isSafeInteger(id))
                return phanHoi({ ok: false, msg: 'Bàn hoặc món không hợp lệ.' });
            const mon = truyVanNhieu(`SELECT b.ma_ban,b.ten_ban,m.ten_mon FROM chi_tiet_don_mon c
                JOIN don_goi_mon d ON d.id=c.don_goi_mon_id JOIN phien_ban p ON p.id=d.phien_ban_id
                JOIN ban_an b ON b.id=p.ban_an_id JOIN mon_an m ON m.id=c.mon_an_id
                WHERE p.ban_an_id=? AND (?=0 OR c.id=?) AND p.trang_thai='dang_hoat_dong'
                AND d.trang_thai='da_duyet' AND c.trang_thai_mon IN ('cho_duyet','dang_nau')`, [banId,id,id]);
            if (!mon.length) return phanHoi({ ok: false, msg: 'Bàn không còn món cần bếp xử lý.' });
            const tin = { banId, maBan: mon[0].ma_ban, tenBan: mon[0].ten_ban, tenMon: mon.map(x => x.ten_mon).join(', '),
                tenPhucVu: nv.ho_ten, lyDo: String(duLieu?.lyDo ?? '').slice(0, 240),
                thoiGianCho: Math.min(1440, Math.max(0, Number(duLieu.thoiGianCho) || 0)), thoiGianGui: new Date().toISOString() };
            io.to('bep').emit('bep:co_de_nghi_giuc_mon', tin);
            phanHoi({ ok: true, data: tin });
        });

        // 6. Bếp phản hồi giục món gửi lại Phục vụ
        socket.on('bep:phan_hoi_giuc_mon', (duLieu) => {
            if (!coQuyen(socket, 'bep')) return;
            io.to('phuc_vu').emit('phuc_vu:nhan_phan_hoi_giuc_mon', duLieu);
        });
    });

    return io;
}

/**
 * Lấy đối tượng IO hiện tại để phát sự kiện từ các Service
 * @returns {Server}
 */
function layIo() {
    if (!io) {
        throw new Error('Socket.io chưa được khởi tạo. Hãy gọi khoiTaoSocket trước.');
    }
    return io;
}

/**
 * Các hàm phát sự kiện Realtime chuẩn hóa toàn dự án
 */
function phatChoPhucVuTheoBan(ten, duLieu) {
    if (!io || !duLieu.banId) return;
    const phong = require('../modules/banAn/dieuPhoiBan').layPhongNhan(duLieu.banId);
    if (phong.length) io.to(phong).emit(ten, duLieu);
}

const socketPhat = {
    viecBanThayDoi: () => {
        if (io) io.to(['phuc_vu', 'thu_ngan', 'quan_ly']).emit('ban:cap_nhat_cong_viec');
    },
    gioMonThayDoi: (banId) => {
        if (io) io.to(phongPhien(banId)).emit('gio_mon:thay_doi', { banId });
    },

    capNhatSoSuat: (duLieu) => {
        if (io) io.emit('thuc_don:cap_nhat_so_suat', duLieu);
    },

    // Thông báo đơn món mới gửi từ khách QR tới nhân viên phục vụ & bếp
    donHangMoi: (duLieu) => {
        if (!io) return;
        if (duLieu.trangThaiDon === 'cho_duyet') phatChoPhucVuTheoBan('don_hang_moi', duLieu);
        socketPhat.viecBanThayDoi();
        io.to('bep').emit('don_hang_moi', duLieu);
        if (duLieu.banId) {
            io.to(phongPhien(duLieu.banId)).emit('trang_thai_don_hang', duLieu);
        }
    },

    // Thông báo Bếp bắt đầu nấu hoặc nấu xong món ăn
    tienDoMonAn: (duLieu) => {
        if (!io) return;
        phatChoPhucVuTheoBan('tien_do_mon_an', duLieu);
        socketPhat.viecBanThayDoi();
        io.to('bep').emit('tien_do_mon_an', duLieu);
        io.to('thu_ngan').emit('tien_do_mon_an', duLieu);
        if (duLieu.banId) {
            io.to(phongPhien(duLieu.banId)).emit('tien_do_mon_an', duLieu);
        }
    },

    // Báo chuông khách bấm Gọi phục vụ hoặc Yêu cầu tính tiền
    khachGoiHoTro: (duLieu) => {
        if (!io) return;
        if (duLieu.loaiYeuCau === 'yeu_cau_thanh_toan') {
            io.to('thu_ngan').emit('khach_yeu_cau_thanh_toan', duLieu);
        } else {
            phatChoPhucVuTheoBan('khach_goi_ho_tro', duLieu);
            socketPhat.viecBanThayDoi();
        }
    },

    // Báo trạng thái thanh toán hóa đơn thành công
    thanhToanThanhCong: (duLieu) => {
        if (!io) return;
        phatChoPhucVuTheoBan('thanh_toan_thanh_cong', duLieu);
        socketPhat.viecBanThayDoi();
        io.to('thu_ngan').emit('thanh_toan_thanh_cong', duLieu);
        io.to('quan_ly').emit('thanh_toan_thanh_cong', duLieu);
        if (duLieu.banId) {
            const phong = phongPhien(duLieu.banId, duLieu.phienBanId);
            io.to(phong).emit('thanh_toan_thanh_cong', duLieu);
            io.in(phong).socketsLeave(phong);
        }
    },

    // Báo yêu cầu đổi ca / xin nghỉ mới tới Admin
    yeuCauDoiCaMoi: (duLieu) => {
        if (!io) return;
        io.to('quan_ly').emit('yeu_cau_doi_ca_moi', duLieu);
    },

    // Báo kết quả phê duyệt đổi ca tới nhân viên liên quan
    ketQuaDuyetCa: (duLieu) => {
        if (!io) return;
        const phong = [duLieu.nhanVienYeuCauId, duLieu.nhanVienNhanCaId].filter(Boolean).map(id => 'nhan_vien_' + id);
        if (phong.length) io.to(phong).emit('ket_qua_duyet_ca', duLieu);
    },

    trangThaiCaThayDoi: (nhanVienId) => {
        if (io && nhanVienId) io.to('nhan_vien_' + nhanVienId).emit('ca_lam_viec:thay_doi');
        socketPhat.viecBanThayDoi();
    },

    // Cập nhật trạng thái bàn ăn (Trống / Có khách / Chờ món / Yêu cầu thanh toán)
    trangThaiBan: (duLieu) => {
        if (!io) return;
        io.to('phuc_vu').emit('trang_thai_ban', duLieu);
        io.to('thu_ngan').emit('trang_thai_ban', duLieu);
        io.to('quan_ly').emit('trang_thai_ban', duLieu);
    },

    // Lệnh điều phối khẩn cấp từ Quản lý tới Bếp, Phục vụ, Thu ngân (Realtime)
    dieuPhoiQuanLy: (duLieu) => {
        if (!io) return;
        // Phát sự kiện toàn cục để đảm bảo 100% client nhận được tức thì
        io.to('quan_ly').emit('dieu_phoi:moi', duLieu);

        // Phát riêng tới room tương ứng nếu client tham gia room
        if (duLieu.boPhan === 'bep' || duLieu.boPhan === 'tat_ca') {
            io.to('bep').emit('dieu_phoi:bep', duLieu);
        }
        if (duLieu.boPhan === 'phuc_vu' || duLieu.boPhan === 'tat_ca') {
            io.to('phuc_vu').emit('dieu_phoi:phuc_vu', duLieu);
        }
        if (duLieu.boPhan === 'thu_ngan' || duLieu.boPhan === 'tat_ca') {
            io.to('thu_ngan').emit('dieu_phoi:thu_ngan', duLieu);
        }
    },

    // Xác nhận đã tiếp nhận lệnh điều phối
    xacNhanDieuPhoi: (duLieu) => {
        if (!io) return;
        io.to('quan_ly').emit('dieu_phoi:da_tiep_nhan', duLieu);
    },

    yeuCauHuyMonThayDoi: () => {
        if (io) io.to('quan_ly').emit('yeu_cau_huy_mon:thay_doi');
    },
    nhatKyThayDoi: () => {
        if (io) io.to('quan_ly').emit('nhat_ky:thay_doi');
    },

    xacNhanNghiViec: (nhanVienId) => {
        if (!io) return;
        const phong = 'nhan_vien_' + nhanVienId;
        io.to(phong).emit('nhan_su:da_nghi_viec');
        io.in(phong).disconnectSockets();
    }
};

module.exports = {
    khoiTaoSocket,
    layIo,
    socketPhat
};

/**
 * Service xử lý Yêu cầu hỗ trợ tại bàn (Gọi nhân viên, Yêu cầu thanh toán)
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');
const { phatSuKienThuNgan, phatSuKienBan } = require('../../cauHinh/cauHinhSocket.js');

async function taoYeuCau({ phienBanId, banAnId, loaiYeuCau, lyDo }) {
    if (!banAnId) {
        throw new Error('Mã bàn không được để trống');
    }

    const cacLoaiHopLe = ['goi_nhan_vien', 'yeu_cau_thanh_toan', 'yeu_cau_khac'];
    if (!cacLoaiHopLe.includes(loaiYeuCau)) {
        throw new Error('Loại yêu cầu hỗ trợ không hợp lệ');
    }

    // Nếu không truyền phienBanId, tự tìm phiên bàn đang hoạt động
    let idPhien = phienBanId;
    if (!idPhien) {
        const phien = ketNoiCoSoDuLieu.layMot(
            `SELECT id FROM phien_ban WHERE ban_an_id = ? AND trang_thai IN ('dang_su_dung', 'cho_thanh_toan') ORDER BY id DESC LIMIT 1`,
            [banAnId]
        );
        if (phien) {
            idPhien = phien.id;
        } else {
            // Tự tạo phiên tạm nếu chưa có
            const maPhien = `PB_${banAnId}_${Date.now()}`;
            const res = ketNoiCoSoDuLieu.thucThi(
                `INSERT INTO phien_ban (ban_an_id, ma_phien, thoi_gian_bat_dau, trang_thai) VALUES (?, ?, CURRENT_TIMESTAMP, 'dang_su_dung')`,
                [banAnId, maPhien]
            );
            idPhien = res.lastInsertRowid;
        }
    }

    // Lưu yêu cầu vào CSDL
    const sql = `
        INSERT INTO yeu_cau_ho_tro (phien_ban_id, ban_an_id, loai_yeu_cau, ly_do, trang_thai)
        VALUES (?, ?, ?, ?, 'cho_tiep_nhan')
    `;
    const ketQua = ketNoiCoSoDuLieu.thucThi(sql, [idPhien, banAnId, loaiYeuCau, lyDo || '']);
    const yeuCauMoi = ketNoiCoSoDuLieu.layMot(`SELECT * FROM yeu_cau_ho_tro WHERE id = ?`, [ketQua.lastInsertRowid]);

    // Nếu là yêu cầu thanh toán -> cập nhật trạng thái bàn và phiên sang "cho_thanh_toan"
    if (loaiYeuCau === 'yeu_cau_thanh_toan') {
        ketNoiCoSoDuLieu.thucThi(`UPDATE ban_an SET trang_thai = 'cho_thanh_toan' WHERE id = ?`, [banAnId]);
        ketNoiCoSoDuLieu.thucThi(`UPDATE phien_ban SET trang_thai = 'cho_thanh_toan' WHERE id = ?`, [idPhien]);
    }

    // Phát socket cho Thu ngân và Khách tại bàn
    phatSuKienThuNgan('yeu_cau_ho_tro_moi', {
        yeuCau: yeuCauMoi,
        banAnId,
        loaiYeuCau,
        lyDo
    });

    phatSuKienBan(banAnId, 'yeu_cau_da_gui', {
        id: yeuCauMoi.id,
        loaiYeuCau,
        trangThai: 'cho_tiep_nhan'
    });

    return yeuCauMoi;
}

async function tiepNhanYeuCau(id) {
    const yeuCau = ketNoiCoSoDuLieu.layMot(`SELECT * FROM yeu_cau_ho_tro WHERE id = ?`, [id]);
    if (!yeuCau) {
        throw new Error('Yêu cầu không tồn tại');
    }

    ketNoiCoSoDuLieu.thucThi(
        `UPDATE yeu_cau_ho_tro SET trang_thai = 'hoan_thanh', thoi_gian_xu_ly = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
    );

    const yeuCauCapNhat = ketNoiCoSoDuLieu.layMot(`SELECT * FROM yeu_cau_ho_tro WHERE id = ?`, [id]);

    phatSuKienThuNgan('yeu_cau_hoan_thanh', { id });
    phatSuKienBan(yeuCau.ban_an_id, 'yeu_cau_hoan_thanh', { id });

    return yeuCauCapNhat;
}

async function layDanhSachYeuCau() {
    return ketNoiCoSoDuLieu.layNhieu(`
        SELECT y.*, b.ten_ban, b.ma_ban
        FROM yeu_cau_ho_tro y
        JOIN ban_an b ON y.ban_an_id = b.id
        ORDER BY y.id DESC
    `);
}

module.exports = {
    taoYeuCau,
    tiepNhanYeuCau,
    layDanhSachYeuCau
};

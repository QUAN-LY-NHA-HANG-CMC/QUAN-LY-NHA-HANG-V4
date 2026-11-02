/**
 * Service xử lý giỏ hàng, xác thực giá server-side và lưu trữ giỏ hàng tạm
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

async function kiemTraVaTinhGia(danhSachMon = []) {
    if (!Array.isArray(danhSachMon) || danhSachMon.length === 0) {
        throw new Error('Giỏ hàng trống');
    }

    const danhSachHopLe = [];
    let tongTienTamTinh = 0;

    for (const item of danhSachMon) {
        const monAn = ketNoiCoSoDuLieu.layMot(
            `SELECT id, ma_mon, ten_mon, gia_ban, trang_thai FROM mon_an WHERE id = ? AND da_xoa = 0`,
            [item.monAnId]
        );

        if (!monAn) {
            continue; // Bỏ qua món không tồn tại
        }

        if (monAn.trang_thai === 'het_mon') {
            throw new Error(`Món "${monAn.ten_mon}" hiện tại đã hết hàng, vui lòng chọn món khác!`);
        }

        const soLuong = Number(item.soLuong) > 0 ? Number(item.soLuong) : 1;
        let donGia = Number(monAn.gia_ban);

        // Cộng giá các tùy chọn nếu có
        if (item.tuyChonChon && Array.isArray(item.tuyChonChon.toppingIds)) {
            for (const toppingId of item.tuyChonChon.toppingIds) {
                const opt = ketNoiCoSoDuLieu.layMot(`SELECT gia_them FROM tuy_chon_mon WHERE id = ?`, [toppingId]);
                if (opt) {
                    donGia += Number(opt.gia_them || 0);
                }
            }
        }

        const thanhTien = donGia * soLuong;
        tongTienTamTinh += thanhTien;

        danhSachHopLe.push({
            monAnId: monAn.id,
            tenMon: monAn.ten_mon,
            maMon: monAn.ma_mon,
            soLuong: soLuong,
            donGia: donGia,
            thanhTien: thanhTien,
            tuyChonChon: item.tuyChonChon || null,
            ghiChu: item.ghiChu || ''
        });
    }

    return {
        danhSachHopLe,
        tongTienTamTinh
    };
}

async function luuGioHangTam(phienBanId, duLieuGioHang = []) {
    const phienBan = ketNoiCoSoDuLieu.layMot(`SELECT id FROM phien_ban WHERE id = ?`, [phienBanId]);
    if (!phienBan) {
        throw new Error('Phiên bàn không tồn tại');
    }

    const chuoiJson = JSON.stringify(duLieuGioHang);
    const tonTai = ketNoiCoSoDuLieu.layMot(`SELECT id FROM gio_hang_tam WHERE phien_ban_id = ?`, [phienBanId]);

    if (tonTai) {
        ketNoiCoSoDuLieu.thucThi(
            `UPDATE gio_hang_tam SET du_lieu_gio_hang = ?, ngay_cap_nhat = CURRENT_TIMESTAMP WHERE phien_ban_id = ?`,
            [chuoiJson, phienBanId]
        );
    } else {
        ketNoiCoSoDuLieu.thucThi(
            `INSERT INTO gio_hang_tam (phien_ban_id, du_lieu_gio_hang) VALUES (?, ?)`,
            [phienBanId, chuoiJson]
        );
    }

    return { phienBanId, soLuongMon: duLieuGioHang.length };
}

async function layGioHangTam(phienBanId) {
    const banGhi = ketNoiCoSoDuLieu.layMot(`SELECT du_lieu_gio_hang FROM gio_hang_tam WHERE phien_ban_id = ?`, [phienBanId]);
    if (!banGhi || !banGhi.du_lieu_gio_hang) {
        return { gioHang: [] };
    }
    try {
        const gioHang = JSON.parse(banGhi.du_lieu_gio_hang);
        return { gioHang };
    } catch {
        return { gioHang: [] };
    }
}

module.exports = {
    kiemTraVaTinhGia,
    luuGioHangTam,
    layGioHangTam
};

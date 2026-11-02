/**
 * Tiện ích ghi nhật ký hoạt động hệ thống
 */

function ghiThongTin(thongDiep, duLieu = null) {
    const thoiGian = new Date().toISOString();
    if (duLieu) {
        console.log(`[INFO] [${thoiGian}] ${thongDiep}`, duLieu);
    } else {
        console.log(`[INFO] [${thoiGian}] ${thongDiep}`);
    }
}

function ghiLoi(thongDiep, loi = null) {
    const thoiGian = new Date().toISOString();
    if (loi) {
        console.error(`[ERROR] [${thoiGian}] ${thongDiep}:`, loi.message || loi);
    } else {
        console.error(`[ERROR] [${thoiGian}] ${thongDiep}`);
    }
}

module.exports = {
    ghiThongTin,
    ghiLoi
};

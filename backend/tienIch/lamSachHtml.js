/**
 * Tiện ích làm sạch chuỗi và ngăn chặn tấn công XSS
 * Phục vụ US-006 & Mục 10.3 (QUY_TAC_LAM_DU_AN.txt)
 */

/**
 * Thoát các ký tự đặc biệt nguy hiểm trong HTML
 * @param {string} chuoi - Chuỗi đầu vào
 * @returns {string} Chuỗi an toàn
 */
function lamSachHtml(chuoi) {
    if (typeof chuoi !== 'string') {
        return chuoi;
    }
    return chuoi
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Làm sạch đệ quy một đối tượng dữ liệu đầu vào
 * @param {any} duLieu - Đối tượng hoặc mảng hoặc chuỗi
 * @returns {any} Dữ liệu đã được làm sạch
 */
function lamSachDauVao(duLieu) {
    if (duLieu === null || duLieu === undefined) {
        return duLieu;
    }
    if (typeof duLieu === 'string') {
        return lamSachHtml(duLieu.trim());
    }
    if (Array.isArray(duLieu)) {
        return duLieu.map(phanTu => lamSachDauVao(phanTu));
    }
    if (typeof duLieu === 'object') {
        const ketQua = {};
        for (const [khoa, giaTri] of Object.entries(duLieu)) {
            ketQua[khoa] = lamSachDauVao(giaTri);
        }
        return ketQua;
    }
    return duLieu;
}

module.exports = {
    lamSachHtml,
    lamSachDauVao
};

const ketNoiCoSoDuLieu = require('../../cauHinh/ketNoiCoSoDuLieu.js');

function layDanhSachVaiTro() {
    const sqlVaiTro = 'SELECT * FROM vai_tro ORDER BY id ASC';
    const danhSachVaiTro = ketNoiCoSoDuLieu.layNhieu(sqlVaiTro);

    const sqlQuyen = `
        SELECT vtqh.vai_tro_id, qh.* 
        FROM vai_tro_quyen_han vtqh
        JOIN quyen_han qh ON vtqh.quyen_han_id = qh.id
    `;
    const toanBoQuyen = ketNoiCoSoDuLieu.layNhieu(sqlQuyen);

    return danhSachVaiTro.map(vt => {
        return {
            ...vt,
            quyenHan: toanBoQuyen.filter(q => q.vai_tro_id === vt.id)
        };
    });
}

function layToanBoQuyenHan() {
    return ketNoiCoSoDuLieu.layNhieu('SELECT * FROM quyen_han ORDER BY nhom_quyen, id');
}

module.exports = {
    layDanhSachVaiTro,
    layToanBoQuyenHan
};

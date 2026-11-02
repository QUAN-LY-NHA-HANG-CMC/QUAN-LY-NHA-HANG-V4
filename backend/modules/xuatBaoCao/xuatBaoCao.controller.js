/**
 * Controller Xuất báo cáo CSV
 * Phụ trách: Minh (Backend Developer)
 */
const xuatBaoCaoService = require('./xuatBaoCao.service.js');

function xuatDoanhThuCsv(req, res, next) {
    try {
        const csv = xuatBaoCaoService.xuatDoanhThuCsv();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="bao-cao-doanh-thu-${Date.now()}.csv"`);
        return res.status(200).send(csv);
    } catch (loi) {
        next(loi);
    }
}

function xuatHoaDonCsv(req, res, next) {
    try {
        const csv = xuatBaoCaoService.xuatHoaDonCsv();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="danh-sach-hoa-don-${Date.now()}.csv"`);
        return res.status(200).send(csv);
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    xuatDoanhThuCsv,
    xuatHoaDonCsv
};

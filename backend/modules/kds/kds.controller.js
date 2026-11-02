/**
 * Controller Điều phối Bếp (KDS)
 * Phụ trách: Nhật (PM / Backend Lead)
 */
const kdsService = require('./kds.service.js');

async function layDonCho(req, res, next) {
    try {
        const data = await kdsService.layDonCho();
        res.json({
            ok: true,
            data,
            msg: 'Lấy danh sách món chờ chế biến thành công'
        });
    } catch (loi) {
        next(loi);
    }
}

async function gomMon(req, res, next) {
    try {
        const data = await kdsService.gomMon();
        res.json({
            ok: true,
            data,
            msg: 'Gom nhóm món chờ thành công'
        });
    } catch (loi) {
        next(loi);
    }
}

async function chuyenTrangThai(req, res, next) {
    try {
        const chiTietId = parseInt(req.params.id, 10);
        const { trangThaiMoi, nguoiThucHien } = req.body;
        const data = await kdsService.chuyenTrangThai(chiTietId, trangThaiMoi, nguoiThucHien);
        res.json({
            ok: true,
            data,
            msg: `Đã chuyển trạng thái món sang ${trangThaiMoi}`
        });
    } catch (loi) {
        next(loi);
    }
}

async function toggleHetMon(req, res, next) {
    try {
        const monAnId = parseInt(req.params.id, 10);
        const data = await kdsService.toggleHetMon(monAnId);
        res.json({
            ok: true,
            data,
            msg: `Cập nhật trạng thái món ăn thành công: ${data.trang_thai}`
        });
    } catch (loi) {
        next(loi);
    }
}

async function tuChoiMon(req, res, next) {
    try {
        const chiTietId = parseInt(req.params.id, 10);
        const { lyDo } = req.body;
        const data = await kdsService.tuChoiMon(chiTietId, lyDo);
        res.json({
            ok: true,
            data,
            msg: 'Đã từ chối món và hoàn trừ tiền thành công'
        });
    } catch (loi) {
        next(loi);
    }
}

async function layLichSuBep(req, res, next) {
    try {
        const data = await kdsService.layLichSuBep();
        res.json({
            ok: true,
            data,
            msg: 'Lấy lịch sử món đã ra thành công'
        });
    } catch (loi) {
        next(loi);
    }
}

module.exports = {
    layDonCho,
    gomMon,
    chuyenTrangThai,
    toggleHetMon,
    tuChoiMon,
    layLichSuBep
};

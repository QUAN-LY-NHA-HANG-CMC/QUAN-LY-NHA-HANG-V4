// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// CONTROLLER TIẾP NHẬN YÊU CẦU BÁO CÁO DOANH THU & TÀI CHÍNH
// ============================================================================

const baoCaoService = require('./baoCao.service');
const { phanHoiThanhCong, phanHoiLoi } = require('../../tienIch/dinhDangPhanHoi');

const baoCaoController = {
    async layTongQuan(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.layTongQuan(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo tổng quan thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layTheoThoiGian(req, res) {
        try {
            const ky = req.query.ky || '7_ngay';
            const ketQua = await baoCaoService.layTheoThoiGian(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo theo thời gian thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layMonAn(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.layMonAn(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo món ăn bán chạy thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layKhuVucBan(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.layKhuVucBan(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo khu vực phòng bàn thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async laySoQuy(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.laySoQuy(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo sổ quỹ thu chi thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layKenhVaDanhGia(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.layKenhVaDanhGia(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy báo cáo kênh đặt và đánh giá thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async layTatCaBaoCao(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const ketQua = await baoCaoService.layTatCaBaoCao(ky);
            return phanHoiThanhCong(res, ketQua, 'Lấy toàn bộ hệ thống báo cáo thành công');
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    },

    async xuatBaoCaoCsv(req, res) {
        try {
            const ky = req.query.ky || 'hom_nay';
            const duLieu = await baoCaoService.layTatCaBaoCao(ky);
            
            // Xây dựng nội dung CSV đơn giản với BOM UTF-8 hỗ trợ Excel tiếng Việt
            let csv = '\uFEFF';
            csv += `BÁO CÁO KINH DOANH & TÀI CHÍNH QUÁN MỘC POS\n`;
            csv += `Kỳ báo cáo: ${ky}\n`;
            csv += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;

            csv += `1. CHỈ SỐ TỔNG QUAN\n`;
            csv += `Tổng doanh thu,${duLieu.tongQuan.tongDoanhThu}\n`;
            csv += `Tổng số hóa đơn,${duLieu.tongQuan.soHoaDon}\n`;
            csv += `Tổng lượng khách,${duLieu.tongQuan.tongKhach}\n`;
            csv += `Trung bình đơn,${duLieu.tongQuan.giaTriTrungBinhDon}\n`;
            csv += `Chi tiêu trung bình/khách,${duLieu.tongQuan.chiTieuTrungBinhKhach}\n\n`;

            csv += `2. TOP MÓN BÁN CHẠY NHẤT\n`;
            csv += `Hạng,Tên món,Danh mục,Số lượng bán,Doanh thu (VNĐ),Tỷ lệ đóng góp (%)\n`;
            duLieu.monAn.topMonDoanhThu.forEach(m => {
                csv += `${m.hang},"${m.ten_mon}","${m.ten_danh_muc || ''}",${m.tong_so_luong},${m.tong_doanh_thu},${m.tiLeDongGop}%\n`;
            });
            csv += `\n`;

            csv += `3. DOANH THU THEO KHU VỰC\n`;
            csv += `Khu vực,Số hóa đơn,Lượng khách,Doanh thu (VNĐ),Tỷ lệ đóng góp (%)\n`;
            duLieu.khuVucBan.theoKhuVuc.forEach(kv => {
                csv += `"${kv.ten_khu_vuc}",${kv.so_hoa_don},${kv.tong_khach},${kv.tong_doanh_thu},${kv.tiLeDongGop}%\n`;
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="BaoCao_QuanMoc_${ky}_${Date.now()}.csv"`);
            return res.status(200).send(csv);
        } catch (loi) {
            return phanHoiLoi(res, loi.message, 500);
        }
    }
};

module.exports = baoCaoController;

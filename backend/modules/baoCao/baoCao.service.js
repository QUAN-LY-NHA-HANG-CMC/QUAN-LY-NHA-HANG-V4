// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SERVICE TÍNH TOÁN & XỬ LÝ CHỈ SỐ BÁO CÁO DOANH THU & TÀI CHÍNH
// ============================================================================

const baoCaoModel = require('./baoCao.model');

const baoCaoService = {
    /**
     * 1. Báo cáo Tổng quan & Tài chính
     */
    async layTongQuan(ky = 'hom_nay') {
        const raw = baoCaoModel.layBaoCaoTongQuan(ky);
        const { tongHop, doanhThuKyTruoc, kenhThanhToan, coCauDanhMuc } = raw;

        // Tính giá trị trung bình đơn (AOV) & chi tiêu/khách
        const soHoaDon = tongHop.tong_so_hoa_don || 0;
        const tongDoanhThu = tongHop.tong_doanh_thu || 0;
        const tongKhach = tongHop.tong_khach_hang || 0;

        const giaTriTrungBinhDon = soHoaDon > 0 ? Math.round(tongDoanhThu / soHoaDon) : 0;
        const chiTieuTrungBinhKhach = tongKhach > 0 ? Math.round(tongDoanhThu / tongKhach) : 0;

        // Tăng trưởng so với kỳ trước
        let phanTramTangTruong = 0;
        if (doanhThuKyTruoc > 0) {
            phanTramTangTruong = Number((((tongDoanhThu - doanhThuKyTruoc) / doanhThuKyTruoc) * 100).toFixed(1));
        } else if (tongDoanhThu > 0) {
            phanTramTangTruong = 100;
        }

        // Tỷ trọng % kênh thanh toán
        const kenhCoTyLe = kenhThanhToan.map(k => ({
            ...k,
            tiLe: tongDoanhThu > 0 ? Number(((k.so_tien / tongDoanhThu) * 100).toFixed(1)) : 0
        }));

        // Tỷ trọng % doanh mục
        const danhMucCoTyLe = coCauDanhMuc.map(dm => ({
            ...dm,
            tiLe: tongDoanhThu > 0 ? Number(((dm.tong_doanh_thu / tongDoanhThu) * 100).toFixed(1)) : 0
        }));

        return {
            tongDoanhThu,
            soHoaDon,
            tongKhach,
            giaTriTrungBinhDon,
            chiTieuTrungBinhKhach,
            tongTienMon: tongHop.tong_tien_mon,
            tongChietKhau: tongHop.tong_chiet_khau,
            tongVat: tongHop.tong_vat,
            doanhThuKyTruoc,
            phanTramTangTruong,
            kenhThanhToan: kenhCoTyLe,
            coCauDanhMuc: danhMucCoTyLe
        };
    },

    /**
     * 2. Báo cáo Theo thời gian & Ca làm việc
     */
    async layTheoThoiGian(ky = '7_ngay') {
        const raw = baoCaoModel.layBaoCaoTheoThoiGian(ky);
        
        // Tính doanh thu trung bình mỗi ca
        const theoCa = raw.theoCa.map(ca => ({
            ...ca,
            trungBinhDon: ca.so_hoa_don > 0 ? Math.round(ca.tong_doanh_thu / ca.so_hoa_don) : 0
        }));

        return {
            theoNgay: raw.theoNgay,
            theoCa,
            theoKhungGio: raw.theoKhungGio
        };
    },

    /**
     * 3. Báo cáo Món ăn & Mặt hàng bán chạy
     */
    async layMonAn(ky = 'hom_nay') {
        const raw = baoCaoModel.layBaoCaoMonAn(ky);
        const tongDoanhThuMon = raw.topMonDoanhThu.reduce((tong, m) => tong + m.tong_doanh_thu, 0);

        const topMonDoanhThu = raw.topMonDoanhThu.map((m, index) => ({
            hang: index + 1,
            ...m,
            tiLeDongGop: tongDoanhThuMon > 0 ? Number(((m.tong_doanh_thu / tongDoanhThuMon) * 100).toFixed(1)) : 0
        }));

        return {
            topMonDoanhThu,
            topMonSoLuong: raw.topMonSoLuong,
            monHuyThatThoat: raw.monHuyThatThoat,
            kiemSoatSuat: raw.kiemSoatSuat
        };
    },

    /**
     * 4. Báo cáo Doanh thu Khu vực & Bàn ăn
     */
    async layKhuVucBan(ky = 'hom_nay') {
        const raw = baoCaoModel.layBaoCaoKhuVucBan(ky);
        const tongDoanhThuKhuVuc = raw.theoKhuVuc.reduce((tong, kv) => tong + kv.tong_doanh_thu, 0);

        const theoKhuVuc = raw.theoKhuVuc.map(kv => ({
            ...kv,
            tiLeDongGop: tongDoanhThuKhuVuc > 0 ? Number(((kv.tong_doanh_thu / tongDoanhThuKhuVuc) * 100).toFixed(1)) : 0,
            chiTieuKhach: kv.tong_khach > 0 ? Math.round(kv.tong_doanh_thu / kv.tong_khach) : 0
        }));

        const theoBan = raw.theoBan.map(b => ({
            ...b,
            chiTieuKhach: b.tong_khach > 0 ? Math.round(b.tong_doanh_thu / b.tong_khach) : 0
        }));

        return {
            theoKhuVuc,
            theoBan
        };
    },

    /**
     * 5. Báo cáo Sổ quỹ & Chốt ca
     */
    async laySoQuy(ky = 'hom_nay') {
        return baoCaoModel.layBaoCaoSoQuy(ky);
    },

    /**
     * 6. Báo cáo Kênh đặt & Đánh giá
     */
    async layKenhVaDanhGia(ky = 'hom_nay') {
        const raw = baoCaoModel.layBaoCaoKenhVaDanhGia(ky);
        const tongDon = raw.coCauKenh.reduce((tong, k) => tong + k.so_don, 0);

        const coCauKenh = raw.coCauKenh.map(k => ({
            ...k,
            tiLe: tongDon > 0 ? Number(((k.so_don / tongDon) * 100).toFixed(1)) : 0
        }));

        return {
            coCauKenh,
            thongKeSao: raw.thongKeSao,
            danhSachNhanXet: raw.danhSachNhanXet,
            hieuSuatNhanSu: raw.hieuSuatNhanSu
        };
    },

    /**
     * Lấy toàn bộ 6 nhóm báo cáo trong 1 lần gọi duy nhất (Tối ưu kết nối)
     */
    async layTatCaBaoCao(ky = 'hom_nay') {
        const [tongQuan, theoThoiGian, monAn, khuVucBan, soQuy, kenhDanhGia] = await Promise.all([
            this.layTongQuan(ky),
            this.layTheoThoiGian(ky === 'hom_nay' ? '7_ngay' : ky),
            this.layMonAn(ky),
            this.layKhuVucBan(ky),
            this.laySoQuy(ky),
            this.layKenhVaDanhGia(ky)
        ]);

        return {
            ky,
            tongQuan,
            theoThoiGian,
            monAn,
            khuVucBan,
            soQuy,
            kenhDanhGia,
            thoiGianCapNhat: new Date().toISOString()
        };
    }
};

module.exports = baoCaoService;

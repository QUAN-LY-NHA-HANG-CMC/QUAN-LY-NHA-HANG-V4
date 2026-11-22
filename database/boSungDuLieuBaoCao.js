// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// SCRIPT BỔ SUNG DỮ LIỆU MẪU ĐA DẠNG CHO HỆ THỐNG BÁO CÁO DOANH THU & TÀI CHÍNH
// ============================================================================

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const cauHinh = require('../backend/cauHinh/cauHinhChung');

function boSungDuLieuBaoCao() {
    const duongDanCsdl = cauHinh.duongDanCsdl || path.join(__dirname, 'coSoDuLieu.sqlite');
    const db = new DatabaseSync(duongDanCsdl);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = DELETE;');

    // Kiểm tra xem đã có hóa đơn đã thanh toán chưa
    const checkHd = db.prepare("SELECT COUNT(*) as c FROM hoa_don WHERE trang_thai = 'da_thanh_toan'").get();
    
    // Nếu đã có nhiều hơn 5 hóa đơn thanh toán, ta không cần nạp lại
    if (checkHd && checkHd.c >= 10) {
        console.log(`ℹ️ CSDL đã có ${checkHd.c} hóa đơn thanh toán, giữ nguyên dữ liệu hiện tại.`);
        return { daNap: false, soLuong: checkHd.c };
    }

    console.log('🔄 Đang bổ sung dữ liệu mẫu thực tế cho phân hệ Báo cáo doanh thu & tài chính...');

    // Lấy danh sách món ăn
    const danhSachMon = db.prepare("SELECT id, ten_mon, don_gia, danh_muc_id FROM mon_an WHERE kich_hoat = 1").all();
    if (!danhSachMon || danhSachMon.length === 0) {
        console.warn('⚠️ Chưa có món ăn trong CSDL, bỏ qua tạo dữ liệu hóa đơn.');
        return { daNap: false, soLuong: 0 };
    }

    // Lấy danh sách bàn
    const danhSachBan = db.prepare("SELECT id, khu_vuc_id, ten_ban FROM ban_an WHERE kich_hoat = 1").all();
    
    // Lấy nhân viên phục vụ / thu ngân
    const danhSachNv = db.prepare("SELECT id, ho_ten FROM nhan_vien").all();
    const thuNganId = danhSachNv.find(nv => nv.ho_ten.includes('Thu Ngân'))?.id || danhSachNv[0]?.id || 1;
    const phucVuId = danhSachNv.find(nv => nv.ho_ten.includes('Minh') || nv.ho_ten.includes('Lan'))?.id || danhSachNv[1]?.id || 1;

    // Danh sách 7 ngày gần đây
    const ngayHienTai = new Date();
    
    // Mảng mẫu khách đánh giá
    const nhanXetMau = [
        { soSao: 5, ten: 'Anh Hoàng (Bàn 08)', sdt: '0912***456', nhanXet: 'Món bò lúc lắc sốt tiêu rất đậm đà, gọi món QR trên điện thoại mượt mà nhanh chóng!' },
        { soSao: 5, ten: 'Chị Mai Lan', sdt: '0988***123', nhanXet: 'Trà đào cam sả thanh mát, lẩu gà nấm ngon tuyệt. Phục vụ nhiệt tình, 5 sao!' },
        { soSao: 4, ten: 'Minh Tuấn', sdt: '0903***789', nhanXet: 'Đồ ăn ra nhanh, không gian máy lạnh tầng 1 ấm cúng, nhạc nền êm dịu.' },
        { soSao: 5, ten: 'Gia đình chị Ngọc', sdt: '0977***654', nhanXet: 'Combo sum vầy rất tiện và tiết kiệm, cả nhà ai cũng ưng món cá chẽm.' },
        { soSao: 4, ten: 'Bác Thành', sdt: '0933***890', nhanXet: 'Thịt bò tươi mềm, thanh toán VietQR quét mã rất nhanh không cần chờ nhân viên.' },
        { soSao: 5, ten: 'Khách VIP 01', sdt: '0909***333', nhanXet: 'Phòng VIP riêng tư sang trọng, dịch vụ chuyên nghiệp, tiếp khách rất hài lòng.' }
    ];

    let tongHoaDonTao = 0;

    // Sinh dữ liệu cho 5 ngày qua (mỗi ngày từ 4-8 hóa đơn) và hôm nay (6 hóa đơn)
    for (let ngayLui = 4; ngayLui >= 0; ngayLui--) {
        const ngay = new Date(ngayHienTai);
        ngay.setDate(ngay.getDate() - ngayLui);
        const chuoiNgay = ngay.toISOString().split('T')[0];

        // Số hóa đơn trong ngày
        const soHdTrongNgay = ngayLui === 0 ? 6 : Math.floor(Math.random() * 4) + 4; // 4 đến 7 đơn

        for (let i = 1; i <= soHdTrongNgay; i++) {
            const ban = danhSachBan[Math.floor(Math.random() * danhSachBan.length)];
            const gio = ngayLui === 0 
                ? (11 + Math.floor(Math.random() * 8)) // Hôm nay từ 11h đến 19h
                : (10 + Math.floor(Math.random() * 12)); // Ngày trước từ 10h đến 22h
            const phut = Math.floor(Math.random() * 59);
            const giay = Math.floor(Math.random() * 59);
            const chuoiGio = `${String(gio).padStart(2, '0')}:${String(phut).padStart(2, '0')}:${String(giay).padStart(2, '0')}`;
            const thoiGianTao = `${chuoiNgay} ${chuoiGio}`;

            const soKhach = Math.floor(Math.random() * 5) + 2;
            const maPhien = `PB_${chuoiNgay.replace(/-/g, '')}_${ban.id}_${i}`;

            // Tạo phiên bàn
            const resPhien = db.prepare(`
                INSERT INTO phien_ban (ban_an_id, ma_phien, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai, so_luong_khach, ghi_chu, ngay_tao)
                VALUES (?, ?, ?, ?, 'da_thanh_toan', ?, ?, ?)
            `).run(ban.id, maPhien, thoiGianTao, thoiGianTao, soKhach, `${ban.ten_ban} · ${soKhach} khách`, thoiGianTao);

            const phienBanId = resPhien.lastInsertRowid;

            // Tạo đơn gọi món
            const nguonTao = Math.random() > 0.35 ? 'khach_qr' : 'phuc_vu_dat_ho';
            const maDon = `DGM_${chuoiNgay.replace(/-/g, '')}_${i}`;
            const resDon = db.prepare(`
                INSERT INTO don_goi_mon (phien_ban_id, ma_don, nguon_tao, nhan_vien_duyet_id, trang_thai, thoi_gian_gui, thoi_gian_duyet, ngay_tao)
                VALUES (?, ?, ?, ?, 'hoan_tat', ?, ?, ?)
            `).run(phienBanId, maDon, nguonTao, phucVuId, thoiGianTao, thoiGianTao, thoiGianTao);

            const donGoiMonId = resDon.lastInsertRowid;

            // Chọn 2 đến 4 món ngẫu nhiên
            const soMonChon = Math.floor(Math.random() * 3) + 2;
            let tongTienMon = 0;
            const monDaChon = [];

            for (let m = 0; m < soMonChon; m++) {
                const mon = danhSachMon[Math.floor(Math.random() * danhSachMon.length)];
                const soLuong = Math.floor(Math.random() * 2) + 1;
                const thanhTien = mon.don_gia * soLuong;
                tongTienMon += thanhTien;

                const resCtDon = db.prepare(`
                    INSERT INTO chi_tiet_don_mon (don_goi_mon_id, mon_an_id, so_luong, don_gia, trang_thai_mon, ngay_tao)
                    VALUES (?, ?, ?, ?, 'da_phuc_vu', ?)
                `).run(donGoiMonId, mon.id, soLuong, mon.don_gia, thoiGianTao);

                monDaChon.push({
                    monId: mon.id,
                    tenMon: mon.ten_mon,
                    donGia: mon.don_gia,
                    soLuong,
                    thanhTien,
                    ctDonId: resCtDon.lastInsertRowid
                });
            }

            // Tính chiết khấu và VAT
            const coChietKhau = Math.random() > 0.8;
            const phanTramChietKhau = coChietKhau ? 10 : 0;
            const tienChietKhau = Math.round(tongTienMon * phanTramChietKhau / 100);
            const phanTramVat = 8;
            const tienVat = Math.round((tongTienMon - tienChietKhau) * phanTramVat / 100);
            const tongTienThanhToan = tongTienMon - tienChietKhau + tienVat;

            const phuongThuc = Math.random() > 0.4 ? 'vietqr' : 'tien_mat';
            const maHoaDon = `MOC_${chuoiNgay.replace(/-/g, '')}_HD${String(tongHoaDonTao + 1).padStart(4, '0')}`;

            const resHd = db.prepare(`
                INSERT INTO hoa_don (
                    phien_ban_id, ma_hoa_don, thu_ngan_id, tong_tien_mon, 
                    phan_tram_chiet_khau, tien_chiet_khau, phan_tram_vat, tien_vat, 
                    tong_tien_thanh_toan, phuong_thuc_thanh_toan, tien_khach_dua, tien_thoi_lai,
                    trang_thai, thoi_gian_thanh_toan, ngay_tao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'da_thanh_toan', ?, ?)
            `).run(
                phienBanId, maHoaDon, thuNganId, tongTienMon,
                phanTramChietKhau, tienChietKhau, phanTramVat, tienVat,
                tongTienThanhToan, phuongThuc, tongTienThanhToan, 0,
                thoiGianTao, thoiGianTao
            );

            const hoaDonId = resHd.lastInsertRowid;

            // Thêm chi tiết hóa đơn
            for (const item of monDaChon) {
                db.prepare(`
                    INSERT INTO chi_tiet_hoa_don (hoa_don_id, chi_tiet_don_mon_id, mon_an_id, ten_mon, don_gia, so_luong, thanh_tien)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(hoaDonId, item.ctDonId, item.monId, item.tenMon, item.donGia, item.soLuong, item.thanhTien);
            }

            // Ghi nhận giao dịch thanh toán
            db.prepare(`
                INSERT INTO giao_dich_thanh_toan (hoa_don_id, so_tien, phuong_thuc, trang_thai, thoi_gian_tao)
                VALUES (?, ?, ?, 'thanh_cong', ?)
            `).run(hoaDonId, tongTienThanhToan, phuongThuc === 'vietqr' ? 'VIETQR' : 'TIEN_MAT', thoiGianTao);

            tongHoaDonTao++;
        }

        // Tạo 1-2 phiếu thu/chi nội bộ cho ngày
        db.prepare(`
            INSERT INTO phieu_thu_chi_noi_bo (loai, so_tien, ly_do, nguoi_tao_id, thoi_gian_tao)
            VALUES ('CHI', ?, ?, ?, ?)
        `).run(
            150000 + Math.floor(Math.random() * 200000),
            'Mua đá sạch tinh khiết và chanh sả bổ sung cho quầy bar',
            thuNganId,
            `${chuoiNgay} 14:00:00`
        );

        if (ngayLui % 2 === 0) {
            db.prepare(`
                INSERT INTO phieu_thu_chi_noi_bo (loai, so_tien, ly_do, nguoi_tao_id, thoi_gian_tao)
                VALUES ('CHI', ?, ?, ?, ?)
            `).run(
                85000,
                'Mua giấy in nhiệt bill POS khổ 80mm',
                thuNganId,
                `${chuoiNgay} 16:30:00`
            );
        }
    }

    // Thêm các đánh giá khách hàng
    for (const dg of nhanXetMau) {
        db.prepare(`
            INSERT INTO danh_gia (phien_ban_id, so_sao, nhan_xet, ten_khach_hang, so_dien_thoai, ngay_tao)
            VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(dg.soSao, dg.nhanXet, dg.ten, dg.sdt);
    }

    // Thêm 1 yêu cầu hủy món làm ví dụ thất thoát
    try {
        const ctDonSample = db.prepare("SELECT id FROM chi_tiet_don_mon LIMIT 1").get();
        if (ctDonSample) {
            db.prepare(`
                INSERT INTO yeu_cau_huy_mon (chi_tiet_don_mon_id, nhan_vien_yeu_cau_id, ly_do_huy, trang_thai_yeu_cau, thoi_gian_yeu_cau, thoi_gian_duyet)
                VALUES (?, ?, 'Khách đổi sang dùng lẩu nấm gà thay vì bò lúc lắc', 'da_chap_thuan', DATETIME('now', '-2 hours'), DATETIME('now', '-110 minutes'))
            `).run(ctDonSample.id, phucVuId);
        }
    } catch (e) {
        console.warn('Lỗi chèn mẫu hủy món:', e.message);
    }

    console.log(`✅ Đã bổ sung thành công ${tongHoaDonTao} hóa đơn mẫu thực tế, các phiếu thu chi và đánh giá khách hàng!`);
    return { daNap: true, soLuong: tongHoaDonTao };
}

if (require.main === module) {
    boSungDuLieuBaoCao();
}

module.exports = { boSungDuLieuBaoCao };

/**
 * Màn hình POS Thu ngân: Kiểm tra hóa đơn, Khuyến mãi & Thanh toán VietQR
 * Phụ trách: Quân (Frontend POS / Table Operations / Checkout)
 */
import { goiApi } from '../../dungChung/api.js';
import { thongBao } from '../../dungChung/thongBao.js';

export async function renderThanhToan(vungChua) {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const phienBanId = params.get('phienBanId') || params.get('phienId');

    if (!phienBanId) {
        vungChua.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>Không tìm thấy thông tin phiên bàn cần thanh toán</h3>
                <a href="#/so-do-ban" class="nut nut-chinh" style="margin-top: 16px; display: inline-block;">Quay lại Sơ đồ bàn</a>
            </div>
        `;
        return;
    }

    vungChua.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <a href="#/so-do-ban" class="nut nut-phu nut-nho">⬅ Quay lại Sơ đồ bàn</a>
                    <h1 class="tieu-de-lon" style="margin: 0; font-size: 22px;">Thu Ngân & Thanh Toán Hóa Đơn</h1>
                </div>
                <button class="nut nut-phu nut-nho" id="nut-in-tam-tinh">🖨 In phiếu tạm tính</button>
            </div>

            <div id="khung-thanh-toan" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
                <div style="text-align: center; padding: 40px; grid-column: 1/-1;">Đang tải thông tin hóa đơn...</div>
            </div>
        </div>
    `;

    let duLieuTamTinh = null;
    let maKhuyenMaiApDung = '';
    let phuongThucChon = 'tien_mat'; // 'tien_mat' hoặc 'chuyen_khoan_vietqr'
    let duLieuVietQr = null;

    async function taiHoaDon() {
        try {
            const url = `/hoaDon/tam-tinh/${phienBanId}` + (maKhuyenMaiApDung ? `?maKhuyenMai=${encodeURIComponent(maKhuyenMaiApDung)}` : '');
            const res = await goiApi(url, 'GET');
            duLieuTamTinh = res.data;
            renderGiaoDienThanhToan();
        } catch (loi) {
            vungChua.querySelector('#khung-thanh-toan').innerHTML = `
                <div style="color: #e74c3c; padding: 30px; grid-column: 1/-1; text-align: center;">
                    <h3>Lỗi: ${loi.message}</h3>
                    <a href="#/so-do-ban" class="nut nut-chinh" style="margin-top: 10px; display: inline-block;">Về Sơ đồ bàn</a>
                </div>
            `;
        }
    }

    function renderGiaoDienThanhToan() {
        const khung = document.getElementById('khung-thanh-toan');
        if (!khung || !duLieuTamTinh) return;

        khung.innerHTML = `
            <!-- Cột trái: Chi tiết món ăn trên hóa đơn -->
            <div class="the" style="padding: 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 14px;">
                    <div style="font-size: 18px; font-weight: bold; color: #1e293b;">
                        ${duLieuTamTinh.tenBan} • Khu vực: ${duLieuTamTinh.tenKhuVuc || 'Chung'}
                    </div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                        Mã phiên: <b>${duLieuTamTinh.maPhien}</b> • Giờ vào: ${duLieuTamTinh.thoiGianBatDau || ''} • Khách: ${duLieuTamTinh.soKhach} người
                    </div>
                </div>

                <div style="max-height: 380px; overflow-y: auto; margin-bottom: 16px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                                <th style="padding: 8px 0;">Món ăn</th>
                                <th style="padding: 8px 0; text-align: center;">SL</th>
                                <th style="padding: 8px 0; text-align: right;">Đơn giá</th>
                                <th style="padding: 8px 0; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${duLieuTamTinh.danhSachMon.map(m => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0;">
                                        <div style="font-weight: 600; color: #334155;">${m.ten_mon}</div>
                                        ${m.ghi_chu_mon ? `<div style="font-size: 11px; color: #94a3b8;">${m.ghi_chu_mon}</div>` : ''}
                                    </td>
                                    <td style="padding: 10px 0; text-align: center; font-weight: bold;">${m.so_luong}</td>
                                    <td style="padding: 10px 0; text-align: right; color: #64748b;">${(m.don_gia).toLocaleString('vi-VN')}</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">${(m.thanh_tien).toLocaleString('vi-VN')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Bảng tổng tiền chi tiết -->
                <div style="border-top: 2px dashed #cbd5e1; padding-top: 14px; font-size: 14px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; color: #475569;">
                        <span>Tổng tiền món:</span>
                        <span style="font-weight: 600;">${duLieuTamTinh.tongTienMon.toLocaleString('vi-VN')} đ</span>
                    </div>

                    ${duLieuTamTinh.tienGiamGia > 0 ? `
                        <div style="display: flex; justify-content: space-between; color: #16a34a;">
                            <span>Giảm giá (${duLieuTamTinh.khuyenMai?.maKhuyenMai || ''}):</span>
                            <span style="font-weight: 600;">-${duLieuTamTinh.tienGiamGia.toLocaleString('vi-VN')} đ</span>
                        </div>
                    ` : ''}

                    <div style="display: flex; justify-content: space-between; color: #475569;">
                        <span>Thuế VAT (${duLieuTamTinh.tyLeVat}%):</span>
                        <span>+${duLieuTamTinh.tienVat.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #e11d48; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <span>TỔNG THANH TOÁN:</span>
                        <span>${duLieuTamTinh.tongThanhToan.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Phương thức thanh toán & Thao tác -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Khối Khuyến mãi -->
                <div class="the" style="padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="font-weight: 600; font-size: 13px; color: #334155; display: block; margin-bottom: 8px;">
                        🏷 Mã Khuyến Mãi / Voucher:
                    </label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="input-ma-km" class="o-nhap" placeholder="VD: KM10, QUANMOC50K" value="${maKhuyenMaiApDung}" style="text-transform: uppercase; font-weight: bold;">
                        <button class="nut nut-phu" id="nut-ap-dung-km" style="white-space: nowrap;">Áp dụng</button>
                    </div>
                    ${duLieuTamTinh.khuyenMai ? `
                        <div style="font-size: 12px; color: #16a34a; margin-top: 6px;">
                            ✓ Đã áp dụng: <b>${duLieuTamTinh.khuyenMai.tenChuongTrinh}</b>
                        </div>
                    ` : ''}
                </div>

                <!-- Khối Phương thức thanh toán -->
                <div class="the" style="padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="font-weight: 600; font-size: 13px; color: #334155; display: block; margin-bottom: 12px;">
                        💳 Phương thức thanh toán:
                    </label>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                        <button class="nut ${phuongThucChon === 'tien_mat' ? 'nut-chinh' : 'nut-phu'} nut-chon-pt" data-pt="tien_mat">
                            💵 Tiền mặt
                        </button>
                        <button class="nut ${phuongThucChon === 'chuyen_khoan_vietqr' ? 'nut-chinh' : 'nut-phu'} nut-chon-pt" data-pt="chuyen_khoan_vietqr">
                            📱 Napas VietQR
                        </button>
                    </div>

                    <!-- Nội dung cho Tiền mặt -->
                    <div id="vung-tien-mat" style="display: ${phuongThucChon === 'tien_mat' ? 'block' : 'none'};">
                        <label style="font-size: 13px; color: #64748b; display: block; margin-bottom: 6px;">Tiền khách đưa (VNĐ):</label>
                        <input type="number" id="input-tien-khach-dua" class="o-nhap" value="${duLieuTamTinh.tongThanhToan}" style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">

                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                            ${[100000, 200000, 500000, 1000000].map(soTien => `
                                <button class="nut nut-phu nut-nho nut-menh-gia" data-tien="${soTien}" style="font-size: 11px;">
                                    ${(soTien / 1000)}k
                                </button>
                            `).join('')}
                            <button class="nut nut-phu nut-nho nut-menh-gia" data-tien="${duLieuTamTinh.tongThanhToan}" style="font-size: 11px; background: #f1f5f9;">
                                Vừa đủ
                            </button>
                        </div>

                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                                <span style="color: #64748b;">Tổng cần trả:</span>
                                <b>${duLieuTamTinh.tongThanhToan.toLocaleString('vi-VN')} đ</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
                                <span style="color: #16a34a;">Tiền thối lại:</span>
                                <span id="hien-thi-tien-thoi" style="color: #16a34a;">0 đ</span>
                            </div>
                        </div>
                    </div>

                    <!-- Nội dung cho VietQR -->
                    <div id="vung-vietqr" style="display: ${phuongThucChon === 'chuyen_khoan_vietqr' ? 'block' : 'none'}; text-align: center;">
                        <div id="khung-anh-vietqr" style="padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                            <div style="color: #888; font-size: 13px;">Đang tạo mã VietQR Napas...</div>
                        </div>
                        <div style="font-size: 12px; color: #64748b;">
                            Quét bằng app ngân hàng bất kỳ để thanh toán chính xác <b>${duLieuTamTinh.tongThanhToan.toLocaleString('vi-VN')} đ</b>
                        </div>
                    </div>
                </div>

                <!-- Nút Xác nhận thanh toán -->
                <button class="nut nut-chinh" id="nut-xac-nhan-thanh-toan" style="padding: 14px; font-size: 16px; font-weight: bold; background: #16a34a; border-color: #16a34a;">
                    ✓ HOÀN TẤT THANH TOÁN & ĐÓNG BÀN
                </button>
            </div>
        `;

        ganSuKienThanhToan();
    }

    function ganSuKienThanhToan() {
        // Nút áp dụng mã KM
        const btnApDungKm = document.getElementById('nut-ap-dung-km');
        const inputKm = document.getElementById('input-ma-km');
        if (btnApDungKm && inputKm) {
            btnApDungKm.addEventListener('click', () => {
                maKhuyenMaiApDung = inputKm.value.trim().toUpperCase();
                taiHoaDon();
            });
        }

        // Chọn phương thức thanh toán
        document.querySelectorAll('.nut-chon-pt').forEach(btn => {
            btn.addEventListener('click', async () => {
                phuongThucChon = btn.getAttribute('data-pt');
                renderGiaoDienThanhToan();

                if (phuongThucChon === 'chuyen_khoan_vietqr') {
                    taiVietQr();
                }
            });
        });

        // Tính tiền thối lại real-time
        const inputKhachDua = document.getElementById('input-tien-khach-dua');
        const elTienThoi = document.getElementById('hien-thi-tien-thoi');

        function capNhatTienThoi() {
            if (!inputKhachDua || !elTienThoi) return;
            const dua = Number(inputKhachDua.value) || 0;
            const phaiTra = duLieuTamTinh.tongThanhToan;
            const thoi = Math.max(0, dua - phaiTra);
            elTienThoi.textContent = `${thoi.toLocaleString('vi-VN')} đ`;
            if (dua < phaiTra) {
                elTienThoi.textContent = `Khách đưa thiếu ${(phaiTra - dua).toLocaleString('vi-VN')} đ`;
                elTienThoi.style.color = '#e11d48';
            } else {
                elTienThoi.style.color = '#16a34a';
            }
        }

        if (inputKhachDua) {
            inputKhachDua.addEventListener('input', capNhatTienThoi);
            capNhatTienThoi();
        }

        // Mệnh giá nhanh
        document.querySelectorAll('.nut-menh-gia').forEach(btn => {
            btn.addEventListener('click', () => {
                const soTien = Number(btn.getAttribute('data-tien'));
                if (inputKhachDua) {
                    inputKhachDua.value = soTien;
                    capNhatTienThoi();
                }
            });
        });

        // Nút in phiếu tạm tính
        const btnIn = document.getElementById('nut-in-tam-tinh');
        if (btnIn) {
            btnIn.addEventListener('click', () => {
                window.print();
            });
        }

        // Nút Hoàn tất thanh toán
        const btnThanhToan = document.getElementById('nut-xac-nhan-thanh-toan');
        if (btnThanhToan) {
            btnThanhToan.addEventListener('click', async () => {
                btnThanhToan.disabled = true;
                btnThanhToan.textContent = 'Đang xử lý...';

                try {
                    const tienKhachDua = phuongThucChon === 'tien_mat' ? Number(inputKhachDua?.value || duLieuTamTinh.tongThanhToan) : duLieuTamTinh.tongThanhToan;

                    const res = await goiApi('/thanh-toan/xac-nhan', 'POST', {
                        phienBanId: Number(phienBanId),
                        maKhuyenMai: maKhuyenMaiApDung || null,
                        phuongThuc: phuongThucChon,
                        soTienKhachDua: tienKhachDua,
                        nguoiThucHien: 'Thu ngân'
                    });

                    thongBao.thanhCong('🎉 Thanh toán thành công! Bàn đã được giải phóng.');
                    setTimeout(() => {
                        window.location.hash = '#/so-do-ban';
                    }, 1200);
                } catch (loi) {
                    thongBao.thatBai(loi.message);
                    btnThanhToan.disabled = false;
                    btnThanhToan.textContent = '✓ HOÀN TẤT THANH TOÁN & ĐÓNG BÀN';
                }
            });
        }
    }

    async function taiVietQr() {
        const khungQr = document.getElementById('khung-anh-vietqr');
        if (!khungQr) return;

        try {
            const res = await goiApi('/thanh-toan/vietqr', 'POST', {
                phienBanId: Number(phienBanId),
                soTien: duLieuTamTinh.tongThanhToan
            });
            duLieuVietQr = res.data;

            khungQr.innerHTML = `
                <img src="${duLieuVietQr.urlVietQr}" alt="VietQR" style="max-width: 220px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <div style="font-weight: bold; font-size: 14px; margin-top: 8px; color: #1e293b;">${duLieuVietQr.chuTaiKhoan}</div>
                <div style="font-size: 12px; color: #64748b;">${duLieuVietQr.maNganHang} • STK: <b>${duLieuVietQr.soTaiKhoan}</b></div>
                <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">Nội dung: <b>${duLieuVietQr.noiDung}</b></div>
            `;
        } catch (e) {
            khungQr.innerHTML = `<div style="color: #e74c3c;">Lỗi tạo mã QR: ${e.message}</div>`;
        }
    }

    taiHoaDon();
}

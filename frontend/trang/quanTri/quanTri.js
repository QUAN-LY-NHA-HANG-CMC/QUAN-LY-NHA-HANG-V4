import { goiApi } from '../../dungChung/api.js';
import { dinhDangNgayGio } from '../../dungChung/dinhDang.js';
import { hienThongBao } from '../../dungChung/thongBao.js';

export async function renderQuanTri(container) {
    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">Cấu Hình Nhà Hàng & Nhật Ký Hoạt Động</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">Thiết lập thông tin thương hiệu, thuế VAT, tài khoản VietQR và kiểm soát nhật ký hệ thống</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <!-- Cột cấu hình quán -->
            <div class="the">
                <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1e293b;">🏢 Thông Tin Quán & Thanh Toán</h2>
                <form id="form-cau-hinh">
                    <div class="nhom-bieu-mau">
                        <label>Tên nhà hàng</label>
                        <input type="text" id="cfg-ten-nha-hang" required>
                    </div>
                    <div class="nhom-bieu-mau">
                        <label>Địa chỉ</label>
                        <input type="text" id="cfg-dia-chi" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="nhom-bieu-mau">
                            <label>Số điện thoại / Hotline</label>
                            <input type="text" id="cfg-so-dien-thoai">
                        </div>
                        <div class="nhom-bieu-mau">
                            <label>Mật khẩu Wifi</label>
                            <input type="text" id="cfg-mat-khau-wifi">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="nhom-bieu-mau">
                            <label>Tỷ lệ thuế VAT (%)</label>
                            <input type="number" id="cfg-ty-le-thue-vat" min="0" max="20" required>
                        </div>
                        <div class="nhom-bieu-mau">
                            <label>Phí phục vụ (%)</label>
                            <input type="number" id="cfg-phi-phuc-vu" min="0" max="20" value="0">
                        </div>
                    </div>

                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--mau-vien);">
                        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--mau-chinh);">💳 Tài khoản nhận VietQR</h3>
                        <div class="nhom-bieu-mau">
                            <label>Ngân hàng</label>
                            <input type="text" id="cfg-ngan-hang-vietqr" placeholder="VD: MBBank, Vietcombank">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="nhom-bieu-mau">
                                <label>Số tài khoản</label>
                                <input type="text" id="cfg-so-tai-khoan-vietqr">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Tên chủ tài khoản</label>
                                <input type="text" id="cfg-chu-tai-khoan-vietqr">
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="nut nut-chinh" style="width: 100%; margin-top: 12px;">Lưu Thay Đổi Cấu Hình</button>
                </form>
            </div>

            <!-- Cột nhật ký hệ thống -->
            <div class="the">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="font-size: 18px; font-weight: 700; color: #1e293b;">📜 Nhật Ký Hoạt Động Hệ Thống</h2>
                    <button class="nut nut-phu nut-nho" id="nut-lam-moi-log">Làm mới</button>
                </div>
                <div style="max-height: 480px; overflow-y: auto;">
                    <table class="bang-du-lieu" style="font-size: 13px;">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Hành động</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody id="bang-nhat-ky-than">
                            <tr><td colspan="3" style="text-align: center; padding: 20px;">Đang tải...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const ganGiaTri = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    async function taiCauHinh() {
        try {
            const res = await goiApi('/api/cau-hinh-nha-hang');
            const data = res.data || {};
            ganGiaTri('cfg-ten-nha-hang', data.ten_nha_hang);
            ganGiaTri('cfg-dia-chi', data.dia_chi);
            ganGiaTri('cfg-so-dien-thoai', data.so_dien_thoai);
            ganGiaTri('cfg-mat-khau-wifi', data.mat_khau_wifi);
            ganGiaTri('cfg-ty-le-thue-vat', data.ty_le_thue_vat || '8');
            ganGiaTri('cfg-phi-phuc-vu', data.phi_phuc_vu || '0');
            ganGiaTri('cfg-ngan-hang-vietqr', data.ngan_hang_vietqr);
            ganGiaTri('cfg-so-tai-khoan-vietqr', data.so_tai_khoan_vietqr);
            ganGiaTri('cfg-chu-tai-khoan-vietqr', data.chu_tai_khoan_vietqr);
        } catch (loi) {
            hienThongBao('Lỗi tải cấu hình: ' + (loi.message || 'Lỗi mạng'), 'loi');
        }
    }

    async function taiNhatKy() {
        try {
            const thanBang = document.getElementById('bang-nhat-ky-than');
            if (!thanBang) return;

            const res = await goiApi('/api/cau-hinh-nha-hang/nhat-ky');
            const danhSach = res.data || [];

            if (danhSach.length === 0) {
                thanBang.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #94a3b8;">Chưa có nhật ký nào.</td></tr>`;
                return;
            }

            thanBang.innerHTML = danhSach.map(log => `
                <tr>
                    <td style="white-space: nowrap; color: #64748b;">${dinhDangNgayGio(log.thoi_gian)}</td>
                    <td><code>${log.hanh_dong}</code></td>
                    <td>${log.chi_tiet || '—'}</td>
                </tr>
            `).join('');
        } catch (loi) {
            console.error('Lỗi tải nhật ký:', loi);
        }
    }

    const form = document.getElementById('form-cau-hinh');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const layGiaTri = (id) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : '';
            };

            const payload = {
                ten_nha_hang: layGiaTri('cfg-ten-nha-hang'),
                dia_chi: layGiaTri('cfg-dia-chi'),
                so_dien_thoai: layGiaTri('cfg-so-dien-thoai'),
                mat_khau_wifi: layGiaTri('cfg-mat-khau-wifi'),
                ty_le_thue_vat: layGiaTri('cfg-ty-le-thue-vat'),
                phi_phuc_vu: layGiaTri('cfg-phi-phuc-vu'),
                ngan_hang_vietqr: layGiaTri('cfg-ngan-hang-vietqr'),
                so_tai_khoan_vietqr: layGiaTri('cfg-so-tai-khoan-vietqr'),
                chu_tai_khoan_vietqr: layGiaTri('cfg-chu-tai-khoan-vietqr')
            };

            try {
                await goiApi('/api/cau-hinh-nha-hang', {
                    method: 'PUT',
                    body: payload
                });
                hienThongBao('Đã cập nhật cấu hình nhà hàng thành công!', 'thanh_cong');
                taiNhatKy();
            } catch (loi) {
                hienThongBao('Lỗi lưu cấu hình: ' + (loi.message || 'Lỗi server'), 'loi');
            }
        });
    }

    const nutLamMoi = document.getElementById('nut-lam-moi-log');
    if (nutLamMoi) {
        nutLamMoi.addEventListener('click', taiNhatKy);
    }

    taiCauHinh();
    taiNhatKy();
}

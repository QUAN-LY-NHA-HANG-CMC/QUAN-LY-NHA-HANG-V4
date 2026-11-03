import { goiApi } from '../../dungChung/api.js';
import { dinhDangNgayGio } from '../../dungChung/dinhDang.js';

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

    async function taiCauHinh() {
        try {
            const res = await goiApi('/api/cau-hinh-nha-hang');
            const data = res.data || {};
            document.getElementById('cfg-ten-nha-hang').value = data.ten_nha_hang || '';
            document.getElementById('cfg-dia-chi').value = data.dia_chi || '';
            document.getElementById('cfg-so-dien-thoai').value = data.so_dien_thoai || '';
            document.getElementById('cfg-mat-khau-wifi').value = data.mat_khau_wifi || '';
            document.getElementById('cfg-ty-le-thue-vat').value = data.ty_le_thue_vat || '8';
            document.getElementById('cfg-phi-phuc-vu').value = data.phi_phuc_vu || '0';
            document.getElementById('cfg-ngan-hang-vietqr').value = data.ngan_hang_vietqr || '';
            document.getElementById('cfg-so-tai-khoan-vietqr').value = data.so_tai_khoan_vietqr || '';
            document.getElementById('cfg-chu-tai-khoan-vietqr').value = data.chu_tai_khoan_vietqr || '';
        } catch (loi) {
            alert('Lỗi tải cấu hình: ' + loi.message);
        }
    }

    async function taiNhatKy() {
        try {
            const res = await goiApi('/api/cau-hinh-nha-hang/nhat-ky');
            const danhSach = res.data || [];
            const thanBang = document.getElementById('bang-nhat-ky-than');

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

    document.getElementById('form-cau-hinh').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            ten_nha_hang: document.getElementById('cfg-ten-nha-hang').value.trim(),
            dia_chi: document.getElementById('cfg-dia-chi').value.trim(),
            so_dien_thoai: document.getElementById('cfg-so-dien-thoai').value.trim(),
            mat_khau_wifi: document.getElementById('cfg-mat-khau-wifi').value.trim(),
            ty_le_thue_vat: document.getElementById('cfg-ty-le-thue-vat').value,
            phi_phuc_vu: document.getElementById('cfg-phi-phuc-vu').value,
            ngan_hang_vietqr: document.getElementById('cfg-ngan-hang-vietqr').value.trim(),
            so_tai_khoan_vietqr: document.getElementById('cfg-so-tai-khoan-vietqr').value.trim(),
            chu_tai_khoan_vietqr: document.getElementById('cfg-chu-tai-khoan-vietqr').value.trim()
        };

        try {
            await goiApi('/api/cau-hinh-nha-hang', {
                method: 'PUT',
                body: payload
            });
            alert('Đã cập nhật cấu hình nhà hàng thành công!');
            taiNhatKy();
        } catch (loi) {
            alert('Lỗi lưu cấu hình: ' + loi.message);
        }
    });

    document.getElementById('nut-lam-moi-log').addEventListener('click', taiNhatKy);

    taiCauHinh();
    taiNhatKy();
}

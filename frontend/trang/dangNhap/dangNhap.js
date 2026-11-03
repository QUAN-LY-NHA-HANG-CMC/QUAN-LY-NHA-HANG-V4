import { goiApi } from '../../dungChung/api.js';
import { KHOA_LUU_TRU } from '../../dungChung/hangSo.js';

export function renderDangNhap(container) {
    container.innerHTML = `
        <div class="khung-dang-nhap">
            <div class="the-dang-nhap">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 8px;">🍲</div>
                    <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">Hệ Thống Quản Lý Quán Mộc</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Đăng nhập để vào hệ thống điều hành</p>
                </div>

                <div id="thong-bao-loi" style="display: none; background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;"></div>

                <form id="form-dang-nhap">
                    <div class="nhom-bieu-mau">
                        <label for="tenDangNhap">Tên đăng nhập</label>
                        <input type="text" id="tenDangNhap" name="tenDangNhap" placeholder="Nhập tên tài khoản" required autofocus value="admin">
                    </div>
                    <div class="nhom-bieu-mau">
                        <label for="matKhau">Mật khẩu</label>
                        <input type="password" id="matKhau" name="matKhau" placeholder="Nhập mật khẩu" required value="123456">
                    </div>
                    <button type="submit" class="nut nut-chinh" style="width: 100%; padding: 12px; margin-top: 8px; font-size: 16px;">
                        Đăng Nhập
                    </button>
                </form>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
                    <strong>Tài khoản mẫu thử nghiệm (Mật khẩu: 123456):</strong><br>
                    • <b>admin</b>: Quản lý toàn quyền<br>
                    • <b>thungan</b>: Thu ngân & Sơ đồ bàn<br>
                    • <b>daubep</b>: Bếp KDS<br>
                    • <b>phucvu</b>: Phục vụ bàn
                </div>
            </div>
        </div>
    `;

    // Ẩn thanh header và sidebar khi ở trang đăng nhập
    document.getElementById('thanh-ben').style.display = 'none';
    document.getElementById('dau-trang').style.display = 'none';

    const form = document.getElementById('form-dang-nhap');
    const baoLoi = document.getElementById('thong-bao-loi');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        baoLoi.style.display = 'none';

        const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
        const matKhau = document.getElementById('matKhau').value;

        try {
            const ketQua = await goiApi('/api/tai-khoan/dang-nhap', {
                method: 'POST',
                body: { tenDangNhap, matKhau }
            });

            localStorage.setItem(KHOA_LUU_TRU.TOKEN, ketQua.data.token);
            localStorage.setItem(KHOA_LUU_TRU.NGUOI_DUNG, JSON.stringify(ketQua.data.nguoiDung));

            const vaiTro = ketQua.data.nguoiDung.vaiTro;
            const trangDich = vaiTro === 'bep' ? '#/bep' : '#/so-do-ban';

            if (window.location.hash === trangDich) {
                window.dispatchEvent(new Event('hashchange'));
            } else {
                window.location.hash = trangDich;
            }
        } catch (loi) {
            baoLoi.textContent = loi.message || 'Đăng nhập không thành công';
            baoLoi.style.display = 'block';
        }
    });
}

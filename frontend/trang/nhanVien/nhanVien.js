import { goiApi } from '../../dungChung/api.js';

export async function renderNhanVien(container) {
    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">Quản Lý Hồ Sơ Nhân Sự & Phân Quyền</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">Quản lý tài khoản nhân viên, cấp vai trò và bảo mật tài khoản</p>
            </div>
            <button class="nut nut-chinh" id="nut-them-nhan-vien">+ Thêm Nhân Viên Mới</button>
        </div>

        <div class="the">
            <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
                <input type="text" id="tim-kiem-nv" placeholder="🔍 Tìm theo họ tên, tên đăng nhập hoặc SĐT..." style="flex: 1; min-width: 260px; padding: 10px 14px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                <select id="loc-vai-tro-nv" style="padding: 10px 14px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                    <option value="">Tất cả vai trò</option>
                </select>
            </div>

            <div style="overflow-x: auto;">
                <table class="bang-du-lieu">
                    <thead>
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Tài khoản</th>
                            <th>Vai trò</th>
                            <th>Số điện thoại / Email</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="bang-nhan-vien-than">
                        <tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    let danhSachVaiTro = [];
    let danhSachNhanVien = [];

    async function taiDuLieu() {
        const tuKhoa = document.getElementById('tim-kiem-nv').value.trim();
        const vaiTroId = document.getElementById('loc-vai-tro-nv').value;

        let query = [];
        if (tuKhoa) query.push(`tuKhoa=${encodeURIComponent(tuKhoa)}`);
        if (vaiTroId) query.push(`vaiTroId=${vaiTroId}`);

        try {
            const [resVt, resNv] = await Promise.all([
                goiApi('/api/vai-tro'),
                goiApi('/api/nhan-vien?' + query.join('&'))
            ]);

            danhSachVaiTro = resVt.data || [];
            danhSachNhanVien = resNv.data.danhSach || [];

            capNhatSelectVaiTro();
            hienThiBang();
        } catch (loi) {
            alert('Lỗi tải dữ liệu: ' + loi.message);
        }
    }

    function capNhatSelectVaiTro() {
        const sel = document.getElementById('loc-vai-tro-nv');
        const giaTriHienTai = sel.value;
        sel.innerHTML = '<option value="">Tất cả vai trò</option>' +
            danhSachVaiTro.map(vt => `<option value="${vt.id}" ${String(vt.id) === giaTriHienTai ? 'selected' : ''}>${vt.ten_vai_tro}</option>`).join('');
    }

    function hienThiBang() {
        const thanBang = document.getElementById('bang-nhan-vien-than');
        if (danhSachNhanVien.length === 0) {
            thanBang.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">Không tìm thấy nhân viên nào.</td></tr>`;
            return;
        }

        thanBang.innerHTML = danhSachNhanVien.map(nv => {
            const laHoatDong = nv.trang_thai === 'hoat_dong';
            return `
                <tr>
                    <td><b>${nv.ho_ten}</b></td>
                    <td><code>${nv.ten_dang_nhap}</code></td>
                    <td><span class="the-ten-vai-tro">${nv.ten_vai_tro}</span></td>
                    <td>${nv.so_dien_thoai || '—'} <br><small style="color: #64748b;">${nv.email || ''}</small></td>
                    <td>
                        <span class="huy-hieu ${laHoatDong ? 'huy-hieu-xanh' : 'huy-hieu-do'}">
                            ${laHoatDong ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="nut nut-phu nut-nho nut-doi-tt" data-id="${nv.id}" data-tt="${laHoatDong ? 'bi_khoa' : 'hoat_dong'}">
                                ${laHoatDong ? 'Khóa' : 'Mở khóa'}
                            </button>
                            <button class="nut nut-phu nut-nho nut-reset-mk" data-id="${nv.id}">
                                Đặt lại MK
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        thanBang.querySelectorAll('.nut-doi-tt').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const trangThai = btn.getAttribute('data-tt');
                try {
                    await goiApi(`/api/nhan-vien/${id}/trang-thai`, {
                        method: 'PATCH',
                        body: { trangThai }
                    });
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi: ' + loi.message);
                }
            });
        });

        thanBang.querySelectorAll('.nut-reset-mk').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Đặt lại mật khẩu của nhân viên này về mặc định "123456"?')) return;
                const id = btn.getAttribute('data-id');
                try {
                    await goiApi(`/api/nhan-vien/${id}/dat-lai-mat-khau`, {
                        method: 'POST',
                        body: { matKhauMoi: '123456' }
                    });
                    alert('Đã đặt lại mật khẩu thành công về "123456"!');
                } catch (loi) {
                    alert('Lỗi: ' + loi.message);
                }
            });
        });
    }

    // Modal thêm nhân viên
    document.getElementById('nut-them-nhan-vien').addEventListener('click', () => {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Thêm Nhân Viên Mới</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-them-nv">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Họ và tên nhân viên</label>
                                <input type="text" id="themHoTen" required placeholder="VD: Nguyễn Văn A">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="nhom-bieu-mau">
                                    <label>Tên đăng nhập</label>
                                    <input type="text" id="themTenDn" required placeholder="VD: nguyenvana">
                                </div>
                                <div class="nhom-bieu-mau">
                                    <label>Mật khẩu khởi tạo</label>
                                    <input type="password" id="themMatKhau" required value="123456">
                                </div>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Vai trò chức vụ</label>
                                <select id="themVaiTroId" required>
                                    ${danhSachVaiTro.map(vt => `<option value="${vt.id}">${vt.ten_vai_tro} - ${vt.mo_ta}</option>`).join('')}
                                </select>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="nhom-bieu-mau">
                                    <label>Số điện thoại</label>
                                    <input type="text" id="themSdt" placeholder="090...">
                                </div>
                                <div class="nhom-bieu-mau">
                                    <label>Email</label>
                                    <input type="email" id="themEmail" placeholder="nhanvien@...">
                                </div>
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Tạo Tài Khoản</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(btn => {
            btn.addEventListener('click', () => { vungModal.innerHTML = ''; });
        });

        document.getElementById('form-them-nv').addEventListener('submit', async (e) => {
            e.preventDefault();
            const hoTen = document.getElementById('themHoTen').value.trim();
            const tenDangNhap = document.getElementById('themTenDn').value.trim();
            const matKhau = document.getElementById('themMatKhau').value;
            const vaiTroId = document.getElementById('themVaiTroId').value;
            const soDienThoai = document.getElementById('themSdt').value.trim();
            const email = document.getElementById('themEmail').value.trim();

            try {
                await goiApi('/api/nhan-vien', {
                    method: 'POST',
                    body: { hoTen, tenDangNhap, matKhau, vaiTroId, soDienThoai, email }
                });
                vungModal.innerHTML = '';
                taiDuLieu();
            } catch (loi) {
                alert('Lỗi: ' + loi.message);
            }
        });
    });

    document.getElementById('tim-kiem-nv').addEventListener('input', () => taiDuLieu());
    document.getElementById('loc-vai-tro-nv').addEventListener('change', () => taiDuLieu());

    taiDuLieu();
}

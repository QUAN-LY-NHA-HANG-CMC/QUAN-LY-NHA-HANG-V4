import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';

export async function renderQuanLyThucDon(container) {
    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">Quản Lý Thực Đơn & Danh Mục Món Ăn</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">Quản lý các món ăn, thiết lập giá, tùy chọn và bật/tắt nhanh trạng thái hết hàng</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="nut nut-phu" id="nut-quan-ly-dm">📂 Quản Lý Danh Mục</button>
                <button class="nut nut-chinh" id="nut-them-mon">+ Thêm Món Ăn</button>
            </div>
        </div>

        <div class="the" style="padding: 16px 20px;">
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 240px;">
                    <input type="text" id="o-tim-kiem-mon" placeholder="🔍 Tìm kiếm món theo tên hoặc mã món..." style="width: 100%; padding: 10px 14px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                </div>
                <div>
                    <select id="chon-danh-muc-loc" style="padding: 10px 14px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                        <option value="">Tất cả danh mục</option>
                    </select>
                </div>
                <div>
                    <select id="chon-trang-thai-loc" style="padding: 10px 14px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                        <option value="">Tất cả trạng thái</option>
                        <option value="dang_ban">Đang bán</option>
                        <option value="tam_het">Tạm hết</option>
                    </select>
                </div>
            </div>
        </div>

        <div id="danh-sach-mon-khung" class="luoi-mon-an">
            <div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Đang tải danh sách thực đơn...</div>
        </div>
    `;

    let danhSachDanhMuc = [];
    let danhSachMon = [];

    async function taiDuLieu() {
        const tuKhoa = document.getElementById('o-tim-kiem-mon').value.trim();
        const danhMucId = document.getElementById('chon-danh-muc-loc').value;
        const trangThai = document.getElementById('chon-trang-thai-loc').value;

        let query = [];
        if (tuKhoa) query.push(`tuKhoa=${encodeURIComponent(tuKhoa)}`);
        if (danhMucId) query.push(`danhMucId=${danhMucId}`);
        if (trangThai) query.push(`trangThai=${trangThai}`);

        try {
            const [resDm, resMon] = await Promise.all([
                goiApi('/api/danh-muc-mon'),
                goiApi('/api/thuc-don?' + query.join('&'))
            ]);

            danhSachDanhMuc = resDm.data || [];
            danhSachMon = resMon.data.danhSach || [];

            capNhatSelectDanhMuc();
            hienThiDanhSachMon();
        } catch (loi) {
            alert('Lỗi tải thực đơn: ' + loi.message);
        }
    }

    function capNhatSelectDanhMuc() {
        const sel = document.getElementById('chon-danh-muc-loc');
        const giaTriHienTai = sel.value;
        sel.innerHTML = '<option value="">Tất cả danh mục</option>' +
            danhSachDanhMuc.map(dm => `<option value="${dm.id}" ${String(dm.id) === giaTriHienTai ? 'selected' : ''}>${dm.ten_danh_muc}</option>`).join('');
    }

    function hienThiDanhSachMon() {
        const khung = document.getElementById('danh-sach-mon-khung');
        if (danhSachMon.length === 0) {
            khung.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Không tìm thấy món ăn phù hợp.</div>`;
            return;
        }

        khung.innerHTML = danhSachMon.map(mon => {
            const laDangBan = mon.trang_thai === 'dang_ban';
            const anhHienThi = mon.hinh_anh || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f1f5f9" width="300" height="200"/><text fill="%2394a3b8" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">Hình Ảnh Món Ăn</text></svg>';

            return `
                <div class="the-mon-an">
                    <img src="${anhHienThi}" alt="${mon.ten_mon}" class="anh-mon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect fill=%22%23f1f5f9%22 width=%22300%22 height=%22200%22/><text fill=%22%2394a3b8%22 font-family=%22sans-serif%22 font-size=%2220%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22>Quán Mộc</text></svg>'">
                    <div class="chi-tiet-mon">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${mon.ten_danh_muc} • ${mon.ma_mon}</span>
                                ${mon.la_mon_noi_bat ? '<span class="huy-hieu huy-hieu-cam">⭐ Bán chạy</span>' : ''}
                            </div>
                            <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 4px 0;">${mon.ten_mon}</h3>
                            <p style="font-size: 13px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${mon.mo_ta || 'Chưa có mô tả cho món ăn này.'}
                            </p>
                            <div class="gia-mon-an">${dinhDangTien(mon.gia_ban)} <span style="font-size: 13px; font-weight: 400; color: #64748b;">/ ${mon.don_vi_tinh}</span></div>
                        </div>

                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--mau-vien); display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label class="nut-gat">
                                    <input type="checkbox" class="toggle-trang-thai" data-id="${mon.id}" ${laDangBan ? 'checked' : ''}>
                                    <span class="con-truot"></span>
                                </label>
                                <span style="font-size: 12px; font-weight: 600; color: ${laDangBan ? 'var(--mau-xanh-la)' : 'var(--mau-do)'};">
                                    ${laDangBan ? 'Đang bán' : 'Tạm hết'}
                                </span>
                            </div>

                            <button class="nut nut-xoa nut-nho nut-xoa-mon" data-id="${mon.id}">Xóa</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bắt sự kiện Toggle trạng thái
        khung.querySelectorAll('.toggle-trang-thai').forEach(chk => {
            chk.addEventListener('change', async (e) => {
                const monId = chk.getAttribute('data-id');
                const trangThaiMoi = chk.checked ? 'dang_ban' : 'tam_het';
                try {
                    await goiApi(`/api/thuc-don/${monId}/trang-thai`, {
                        method: 'PATCH',
                        body: { trangThai: trangThaiMoi }
                    });
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi cập nhật trạng thái: ' + loi.message);
                    chk.checked = !chk.checked;
                }
            });
        });

        // Bắt sự kiện xóa mềm món
        khung.querySelectorAll('.nut-xoa-mon').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?')) return;
                const monId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/api/thuc-don/${monId}`, { method: 'DELETE' });
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi: ' + loi.message);
                }
            });
        });
    }

    // Modal thêm món ăn mới
    document.getElementById('nut-them-mon').addEventListener('click', () => {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Thêm Món Ăn Mới</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-them-mon">
                        <div class="hop-thoai-than">
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
                                <div class="nhom-bieu-mau">
                                    <label>Mã món (VD: DS03)</label>
                                    <input type="text" id="themMaMon" required placeholder="Mã món">
                                </div>
                                <div class="nhom-bieu-mau">
                                    <label>Tên món ăn</label>
                                    <input type="text" id="themTenMon" required placeholder="VD: Gà Nướng Mật Ong">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="nhom-bieu-mau">
                                    <label>Danh mục</label>
                                    <select id="themDanhMucId" required>
                                        ${danhSachDanhMuc.map(dm => `<option value="${dm.id}">${dm.ten_danh_muc}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="nhom-bieu-mau">
                                    <label>Đơn vị tính</label>
                                    <input type="text" id="themDvt" value="Phần" required>
                                </div>
                            </div>

                            <div class="nhom-bieu-mau">
                                <label>Giá bán (VND)</label>
                                <input type="number" id="themGiaBan" min="0" step="1000" required placeholder="VD: 150000">
                            </div>

                            <div class="nhom-bieu-mau">
                                <label>Mô tả món ăn</label>
                                <textarea id="themMoTaMon" rows="2" placeholder="Thành phần, hương vị đặc sắc..."></textarea>
                            </div>

                            <div class="nhom-bieu-mau" style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="themNoiBat" style="width: auto;">
                                <label for="themNoiBat" style="margin: 0; cursor: pointer;">Đánh dấu là món đặc sắc / bán chạy</label>
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Lưu Món Ăn</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(btn => {
            btn.addEventListener('click', () => { vungModal.innerHTML = ''; });
        });

        document.getElementById('form-them-mon').addEventListener('submit', async (e) => {
            e.preventDefault();
            const maMon = document.getElementById('themMaMon').value.trim();
            const tenMon = document.getElementById('themTenMon').value.trim();
            const danhMucId = document.getElementById('themDanhMucId').value;
            const donViTinh = document.getElementById('themDvt').value.trim();
            const giaBan = document.getElementById('themGiaBan').value;
            const moTa = document.getElementById('themMoTaMon').value.trim();
            const laMonNoiBat = document.getElementById('themNoiBat').checked ? 1 : 0;

            try {
                await goiApi('/api/thuc-don', {
                    method: 'POST',
                    body: { maMon, tenMon, danhMucId, donViTinh, giaBan, moTa, laMonNoiBat }
                });
                vungModal.innerHTML = '';
                taiDuLieu();
            } catch (loi) {
                alert('Lỗi: ' + loi.message);
            }
        });
    });

    // Modal quản lý danh mục
    document.getElementById('nut-quan-ly-dm').addEventListener('click', () => {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 600px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Quản Lý Danh Mục Món</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <div class="hop-thoai-than">
                        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                            <input type="text" id="themTenDmNhanh" placeholder="Tên danh mục mới..." style="flex: 1; padding: 8px 12px; border: 1px solid var(--mau-vien); border-radius: 6px;">
                            <button class="nut nut-chinh" id="nut-luu-dm-nhanh">+ Thêm</button>
                        </div>
                        <table class="bang-du-lieu">
                            <thead>
                                <tr>
                                    <th>Tên danh mục</th>
                                    <th>Số món</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${danhSachDanhMuc.map(dm => `
                                    <tr>
                                        <td><b>${dm.ten_danh_muc}</b></td>
                                        <td>${dm.so_luong_mon || 0} món</td>
                                        <td>
                                            <button class="nut nut-xoa nut-nho xoa-dm-btn" data-id="${dm.id}">Xóa</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(btn => {
            btn.addEventListener('click', () => { vungModal.innerHTML = ''; });
        });

        document.getElementById('nut-luu-dm-nhanh').addEventListener('click', async () => {
            const tenDanhMuc = document.getElementById('themTenDmNhanh').value.trim();
            if (!tenDanhMuc) return alert('Vui lòng nhập tên danh mục');
            try {
                await goiApi('/api/danh-muc-mon', {
                    method: 'POST',
                    body: { tenDanhMuc }
                });
                vungModal.innerHTML = '';
                taiDuLieu();
            } catch (loi) {
                alert('Lỗi: ' + loi.message);
            }
        });

        vungModal.querySelectorAll('.xoa-dm-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
                const dmId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/api/danh-muc-mon/${dmId}`, { method: 'DELETE' });
                    vungModal.innerHTML = '';
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi: ' + loi.message);
                }
            });
        });
    });

    document.getElementById('o-tim-kiem-mon').addEventListener('input', () => taiDuLieu());
    document.getElementById('chon-danh-muc-loc').addEventListener('change', () => taiDuLieu());
    document.getElementById('chon-trang-thai-loc').addEventListener('change', () => taiDuLieu());

    taiDuLieu();
}

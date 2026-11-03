import { goiApi } from '../../dungChung/api.js';
import { TRANG_THAI_BAN } from '../../dungChung/hangSo.js';

export async function renderQuanLyBanQr(container) {
    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">Quản Lý Sơ Đồ Bàn & Mã QR Định Danh</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">Xem danh sách bàn ăn, tạo bàn mới và xuất mã QR để khách quét gọi món</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="nut nut-phu" id="nut-them-khu-vuc">+ Thêm Khu Vực</button>
                <button class="nut nut-chinh" id="nut-them-ban">+ Thêm Bàn Ăn</button>
            </div>
        </div>

        <div class="the" style="padding: 14px 20px;">
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="font-weight: 600; font-size: 14px;">Lọc theo khu vực:</span>
                <div id="danh-sach-tab-khu-vuc" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="nut nut-chinh nut-nho tab-kv" data-id="">Tất cả</button>
                </div>
            </div>
        </div>

        <div id="danh-sach-ban-khung" class="luoi-ban-an">
            <div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Đang tải danh sách bàn...</div>
        </div>
    `;

    let khuVucHienTai = '';
    let danhSachKhuVuc = [];
    let danhSachBan = [];

    async function taiDuLieu() {
        try {
            const [resKv, resBan] = await Promise.all([
                goiApi('/api/khu-vuc'),
                goiApi('/api/ban-an' + (khuVucHienTai ? `?khuVucId=${khuVucHienTai}` : ''))
            ]);

            danhSachKhuVuc = resKv.data || [];
            danhSachBan = resBan.data || [];

            hienThiTabKhuVuc();
            hienThiDanhSachBan();
        } catch (loi) {
            alert('Lỗi tải dữ liệu: ' + loi.message);
        }
    }

    function hienThiTabKhuVuc() {
        const vungTab = document.getElementById('danh-sach-tab-khu-vuc');
        vungTab.innerHTML = `<button class="nut ${!khuVucHienTai ? 'nut-chinh' : 'nut-phu'} nut-nho tab-kv" data-id="">Tất cả (${danhSachBan.length})</button>`;
        
        danhSachKhuVuc.forEach(kv => {
            const dangChon = String(kv.id) === String(khuVucHienTai);
            vungTab.innerHTML += `
                <button class="nut ${dangChon ? 'nut-chinh' : 'nut-phu'} nut-nho tab-kv" data-id="${kv.id}">
                    ${kv.ten_khu_vuc} (${kv.so_luong_ban || 0})
                </button>
            `;
        });

        vungTab.querySelectorAll('.tab-kv').forEach(btn => {
            btn.addEventListener('click', () => {
                khuVucHienTai = btn.getAttribute('data-id');
                taiDuLieu();
            });
        });
    }

    function hienThiDanhSachBan() {
        const khung = document.getElementById('danh-sach-ban-khung');
        if (danhSachBan.length === 0) {
            khung.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Chưa có bàn ăn nào trong khu vực này.</div>`;
            return;
        }

        khung.innerHTML = danhSachBan.map(ban => {
            const tt = TRANG_THAI_BAN[ban.trang_thai?.toUpperCase()] || TRANG_THAI_BAN.TRONG;
            return `
                <div class="the-ban-an ${ban.trang_thai}">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <span class="ten-ban">${ban.ten_ban}</span>
                            <span class="huy-hieu ${ban.trang_thai === 'trong' ? 'huy-hieu-xanh' : (ban.trang_thai === 'dang_dung' ? 'huy-hieu-cam' : 'huy-hieu-xam')}">
                                ${tt.nhan}
                            </span>
                        </div>
                        <div style="font-size: 13px; color: var(--mau-chu-phu); margin-bottom: 4px;">
                            Mã bàn: <b>${ban.ma_ban}</b> • Sức chứa: <b>${ban.suc_chua} người</b>
                        </div>
                        <div style="font-size: 13px; color: var(--mau-chu-phu);">
                            Khu vực: <b>${ban.ten_khu_vuc}</b>
                        </div>
                    </div>

                    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--mau-vien); display: flex; gap: 8px;">
                        <button class="nut nut-chinh nut-nho nut-xem-qr" data-id="${ban.id}" style="flex: 1;">
                            📱 Mã QR
                        </button>
                        <button class="nut nut-phu nut-nho nut-lam-moi-qr" data-id="${ban.id}" title="Làm mới token mã QR">
                            🔄
                        </button>
                        <button class="nut nut-xoa nut-nho nut-xoa-ban" data-id="${ban.id}" title="Xóa bàn">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bắt sự kiện xem mã QR
        khung.querySelectorAll('.nut-xem-qr').forEach(btn => {
            btn.addEventListener('click', async () => {
                const banId = btn.getAttribute('data-id');
                try {
                    const res = await goiApi(`/api/ban-an/${banId}/ma-qr`);
                    hienThiModalQr(res.data);
                } catch (loi) {
                    alert('Lỗi lấy mã QR: ' + loi.message);
                }
            });
        });

        // Bắt sự kiện làm mới QR
        khung.querySelectorAll('.nut-lam-moi-qr').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc chắn muốn làm mới mã QR của bàn này? Mã QR cũ sẽ bị vô hiệu.')) return;
                const banId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/api/ban-an/${banId}/lam-moi-qr`, { method: 'POST' });
                    alert('Đã làm mới mã QR thành công!');
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi: ' + loi.message);
                }
            });
        });

        // Bắt sự kiện xóa bàn
        khung.querySelectorAll('.nut-xoa-ban').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
                const banId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/api/ban-an/${banId}`, { method: 'DELETE' });
                    taiDuLieu();
                } catch (loi) {
                    alert('Lỗi xóa bàn: ' + loi.message);
                }
            });
        });
    }

    function hienThiModalQr(duLieuQr) {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung khung-in-qr">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Mã QR Bàn: ${duLieuQr.tenBan} (${duLieuQr.maBan})</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <div class="hop-thoai-than" style="text-align: center;">
                        <img src="${duLieuQr.anhBase64}" alt="QR Code" style="width: 240px; height: 240px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
                        <p style="font-weight: 600; font-size: 16px; color: var(--mau-chinh);">${duLieuQr.tenBan}</p>
                        <p style="font-size: 13px; color: var(--mau-chu-phu); margin-top: 4px;">Khách hàng quét mã này để gọi món tại bàn</p>
                        <div style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 12px; word-break: break-all; margin-top: 12px; color: #475569;">
                            ${duLieuQr.url}
                        </div>
                    </div>
                    <div class="hop-thoai-chan">
                        <a href="${duLieuQr.anhBase64}" download="QR_${duLieuQr.maBan}.png" class="nut nut-phu">Tải ảnh QR</a>
                        <button class="nut nut-chinh" onclick="window.print()">In mã QR</button>
                    </div>
                </div>
            </div>
        `;

        vungModal.querySelector('.dong-modal').addEventListener('click', () => {
            vungModal.innerHTML = '';
        });
    }

    // Modal thêm bàn mới
    document.getElementById('nut-them-ban').addEventListener('click', () => {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Thêm Bàn Ăn Mới</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-them-ban">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Mã bàn (VD: B07, VIP02)</label>
                                <input type="text" id="themMaBan" required placeholder="Nhập mã bàn">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Tên hiển thị bàn</label>
                                <input type="text" id="themTenBan" required placeholder="VD: Bàn 07">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Khu vực / Tầng</label>
                                <select id="themKhuVucId" required>
                                    ${danhSachKhuVuc.map(kv => `<option value="${kv.id}">${kv.ten_khu_vuc}</option>`).join('')}
                                </select>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Sức chứa (số khách)</label>
                                <input type="number" id="themSucChua" min="1" value="4" required>
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Tạo Bàn & Sinh QR</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(btn => {
            btn.addEventListener('click', () => { vungModal.innerHTML = ''; });
        });

        document.getElementById('form-them-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            const maBan = document.getElementById('themMaBan').value.trim();
            const tenBan = document.getElementById('themTenBan').value.trim();
            const khuVucId = document.getElementById('themKhuVucId').value;
            const sucChua = document.getElementById('themSucChua').value;

            try {
                await goiApi('/api/ban-an', {
                    method: 'POST',
                    body: { maBan, tenBan, khuVucId, sucChua }
                });
                vungModal.innerHTML = '';
                taiDuLieu();
            } catch (loi) {
                alert('Lỗi: ' + loi.message);
            }
        });
    });

    // Modal thêm khu vực mới
    document.getElementById('nut-them-khu-vuc').addEventListener('click', () => {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Thêm Khu Vực Phục Vụ</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-them-khu-vuc">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Tên khu vực</label>
                                <input type="text" id="themTenKv" required placeholder="VD: Tầng 3 - Sân thượng">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Tầng số</label>
                                <input type="number" id="themTang" value="1" required>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Mô tả ngắn</label>
                                <input type="text" id="themMoTaKv" placeholder="VD: Không gian mở thoáng đãng">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Lưu Khu Vực</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(btn => {
            btn.addEventListener('click', () => { vungModal.innerHTML = ''; });
        });

        document.getElementById('form-them-khu-vuc').addEventListener('submit', async (e) => {
            e.preventDefault();
            const tenKhuVuc = document.getElementById('themTenKv').value.trim();
            const tang = document.getElementById('themTang').value;
            const moTa = document.getElementById('themMoTaKv').value.trim();

            try {
                await goiApi('/api/khu-vuc', {
                    method: 'POST',
                    body: { tenKhuVuc, tang, moTa }
                });
                vungModal.innerHTML = '';
                taiDuLieu();
            } catch (loi) {
                alert('Lỗi: ' + loi.message);
            }
        });
    });

    taiDuLieu();
}

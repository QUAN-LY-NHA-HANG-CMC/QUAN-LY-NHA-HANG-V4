/**
 * Màn hình Giỏ hàng và Xác nhận đặt món (Mobile-First)
 * Phụ trách: Quân (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';

let thongTinBan = null;
let thongTinPhien = null;

export async function renderGioHang(container) {
    try {
        thongTinBan = JSON.parse(localStorage.getItem('emenu_ban_an') || 'null');
        thongTinPhien = JSON.parse(localStorage.getItem('emenu_phien_ban') || 'null');
    } catch {
        thongTinBan = null;
        thongTinPhien = null;
    }

    container.innerHTML = `
        <div class="gio-hang-container" style="max-width: 600px; margin: 0 auto; padding-bottom: 120px;">
            <!-- Header Giỏ hàng -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <a href="#/menu" class="nut nut-phu nut-nho" style="text-decoration: none;">← Thêm món</a>
                <h2 style="margin: 0; font-size: 18px;">Giỏ hàng - ${thongTinBan ? thongTinBan.ten_ban : 'Bàn phục vụ'}</h2>
                <button id="nut-xoa-tat-ca-gio" class="nut nut-nguy-hiem nut-nho">Xóa hết</button>
            </div>

            <!-- Danh sách món trong giỏ -->
            <div id="danh-sach-mon-gio" style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Render động -->
            </div>

            <!-- Ghi chú cho toàn bộ đơn -->
            <div style="background: white; border-radius: 12px; padding: 14px; margin-top: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">
                    📝 Ghi chú cho bếp (Tùy chọn):
                </label>
                <textarea id="gio-hang-ghi-chu-chung" rows="2" placeholder="Ví dụ: Làm nhanh giúp, ít đường, không cay..." 
                          style="width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 8px; font-size: 14px; resize: none;"></textarea>
            </div>

            <!-- Tổng kết tiền & Nút xác nhận đặt món cố định dưới cùng -->
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; padding: 14px 20px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); z-index: 100;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
                        <span>Tổng tạm tính:</span>
                        <strong id="gio-hang-tong-thanh-tien" style="color: var(--mau-chinh); font-size: 18px;">0 đ</strong>
                    </div>
                    <button id="nut-xac-nhan-dat-mon" class="nut nut-chinh" style="width: 100%; padding: 12px; font-size: 16px; font-weight: 700; border-radius: 8px;">
                        🚀 Xác nhận gửi gọi món
                    </button>
                </div>
            </div>
        </div>
    `;

    renderDanhSachMonGio();
    ganSuKien();
}

function layGioHang() {
    try {
        return JSON.parse(localStorage.getItem('emenu_gio_hang') || '[]');
    } catch {
        return [];
    }
}

function luuGioHang(gioHang) {
    localStorage.setItem('emenu_gio_hang', JSON.stringify(gioHang));
    renderDanhSachMonGio();

    // Đồng bộ lên server giỏ hàng tạm nếu có phiên
    if (thongTinPhien && thongTinPhien.id) {
        goiApi(`/gio-hang/tam-thoi/${thongTinPhien.id}`, 'PUT', { gioHang }).catch(() => {});
    }
}

function renderDanhSachMonGio() {
    const container = document.getElementById('danh-sach-mon-gio');
    if (!container) return;

    const gioHang = layGioHang();

    if (gioHang.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                <div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Giỏ hàng của bạn đang trống</div>
                <p style="color: #777; font-size: 14px; margin-bottom: 20px;">Hãy duyệt thực đơn và chọn những món ăn hấp dẫn nhé!</p>
                <a href="#/menu" class="nut nut-chinh" style="text-decoration: none; padding: 10px 24px;">Xem thực đơn ngay</a>
            </div>
        `;
        document.getElementById('gio-hang-tong-thanh-tien').textContent = '0 đ';
        const nutDat = document.getElementById('nut-xac-nhan-dat-mon');
        if (nutDat) nutDat.disabled = true;
        return;
    }

    const nutDat = document.getElementById('nut-xac-nhan-dat-mon');
    if (nutDat) nutDat.disabled = false;

    let html = '';
    let tongTien = 0;

    gioHang.forEach((item, index) => {
        const thanhTien = item.soLuong * item.donGia;
        tongTien += thanhTien;

        html += `
            <div style="background: white; border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">${item.tenMon}</div>
                    <div style="color: var(--mau-chinh); font-weight: 700; font-size: 14px; margin-bottom: 6px;">
                        ${dinhDangTien(item.donGia)}
                    </div>
                    <div style="font-size: 12px; color: #888;">Thành tiền: <strong>${dinhDangTien(thanhTien)}</strong></div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="nut nut-phu nut-nho nut-giam-sl" data-index="${index}" style="width: 32px; height: 32px; padding: 0; font-size: 18px; font-weight: 700;">-</button>
                    <span style="font-weight: 700; min-width: 24px; text-align: center;">${item.soLuong}</span>
                    <button class="nut nut-phu nut-nho nut-tang-sl" data-index="${index}" style="width: 32px; height: 32px; padding: 0; font-size: 18px; font-weight: 700;">+</button>
                    <button class="nut nut-nguy-hiem nut-nho nut-xoa-item" data-index="${index}" style="width: 32px; height: 32px; padding: 0; margin-left: 6px;" title="Xóa món">🗑️</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('gio-hang-tong-thanh-tien').textContent = dinhDangTien(tongTien);

    // Gắn sự kiện tăng/giảm/xóa
    container.querySelectorAll('.nut-tang-sl').forEach(b => {
        b.addEventListener('click', () => {
            const idx = Number(b.dataset.index);
            const g = layGioHang();
            g[idx].soLuong += 1;
            luuGioHang(g);
        });
    });

    container.querySelectorAll('.nut-giam-sl').forEach(b => {
        b.addEventListener('click', () => {
            const idx = Number(b.dataset.index);
            const g = layGioHang();
            if (g[idx].soLuong > 1) {
                g[idx].soLuong -= 1;
                luuGioHang(g);
            } else {
                g.splice(idx, 1);
                luuGioHang(g);
            }
        });
    });

    container.querySelectorAll('.nut-xoa-item').forEach(b => {
        b.addEventListener('click', () => {
            const idx = Number(b.dataset.index);
            const g = layGioHang();
            g.splice(idx, 1);
            luuGioHang(g);
        });
    });
}

function ganSuKien() {
    const nutXoaTatCa = document.getElementById('nut-xoa-tat-ca-gio');
    if (nutXoaTatCa) {
        nutXoaTatCa.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn xóa toàn bộ món trong giỏ hàng?')) {
                luuGioHang([]);
            }
        });
    }

    const nutDatMon = document.getElementById('nut-xac-nhan-dat-mon');
    if (nutDatMon) {
        nutDatMon.addEventListener('click', async () => {
            const gioHang = layGioHang();
            if (gioHang.length === 0) return;

            if (!thongTinPhien || !thongTinBan) {
                alert('Không tìm thấy thông tin phiên bàn, vui lòng quét lại mã QR tại bàn!');
                window.location.hash = '#/menu';
                return;
            }

            nutDatMon.disabled = true;
            nutDatMon.textContent = '⏳ Đang gửi đơn đặt món...';

            try {
                const ghiChuChung = document.getElementById('gio-hang-ghi-chu-chung').value;

                const res = await goiApi('/don-goi-mon', 'POST', {
                    phienBanId: thongTinPhien.id,
                    banAnId: thongTinBan.id,
                    ghiChu: ghiChuChung,
                    danhSachMon: gioHang
                });

                if (res.ok) {
                    // Xóa giỏ hàng local và giỏ hàng tạm server
                    localStorage.removeItem('emenu_gio_hang');
                    goiApi(`/gio-hang/tam-thoi/${thongTinPhien.id}`, 'PUT', { gioHang: [] }).catch(() => {});

                    alert('🎉 Đặt món thành công! Đơn hàng đã được chuyển tới nhà bếp.');
                    window.location.hash = '#/theo-doi-don';
                } else {
                    alert(res.msg || 'Đặt món không thành công, vui lòng thử lại!');
                    nutDatMon.disabled = false;
                    nutDatMon.textContent = '🚀 Xác nhận gửi gọi món';
                }
            } catch (loi) {
                console.error('Lỗi đặt món:', loi);
                alert('Đã xảy ra lỗi khi gửi đơn hàng, vui lòng liên hệ nhân viên!');
                nutDatMon.disabled = false;
                nutDatMon.textContent = '🚀 Xác nhận gửi gọi món';
            }
        });
    }
}

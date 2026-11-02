/**
 * Màn hình Theo dõi Đơn món Thời gian thực & Gọi nhân viên tại bàn
 * Phụ trách: Phong (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';
import { thamGiaBan, langNgheSuKien, huyLangNghe } from '../../dungChung/ketNoiSocket.js';

let thongTinBan = null;
let thongTinPhien = null;
let duLieuChiTietPhien = null;

export async function renderTheoDoiDonMon(container) {
    try {
        thongTinBan = JSON.parse(localStorage.getItem('emenu_ban_an') || 'null');
        thongTinPhien = JSON.parse(localStorage.getItem('emenu_phien_ban') || 'null');
    } catch {
        thongTinBan = null;
        thongTinPhien = null;
    }

    if (!thongTinPhien || !thongTinBan) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>Chưa có thông tin phiên bàn</h3>
                <p style="color: #666; margin-bottom: 20px;">Vui lòng quét mã QR tại bàn để xem thông tin gọi món.</p>
                <a href="#/menu" class="nut nut-chinh" style="text-decoration: none;">Vào thực đơn</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="theo-doi-don-container" style="max-width: 600px; margin: 0 auto; padding-bottom: 120px;">
            <!-- Header Thông tin bàn và tổng hóa đơn -->
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <span style="font-size: 13px; color: #888;">Quán Mộc - Mã phiên: ${thongTinPhien.ma_phien || ''}</span>
                        <h2 style="margin: 2px 0 0 0; font-size: 18px;">${thongTinBan.ten_ban}</h2>
                    </div>
                    <span id="badge-trang-thai-ban" class="the-trang-thai the-hoat-dong" style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        Đang phục vụ
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px; border-top: 1px dashed #eee;">
                    <span style="font-size: 14px; color: #555;">Tổng tiền tạm tính:</span>
                    <strong id="tong-tien-hien-tai" style="font-size: 20px; color: var(--mau-chinh);">
                        0 đ
                    </strong>
                </div>
            </div>

            <!-- Danh sách các lượt gọi món -->
            <div id="danh-sach-cac-luot-goi" style="display: flex; flex-direction: column; gap: 14px;">
                <div style="text-align: center; padding: 30px; color: #888;">Đang tải danh sách món...</div>
            </div>

            <!-- Thanh công cụ hỗ trợ & gọi thêm món cố định dưới cùng -->
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; padding: 12px 20px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); z-index: 100;">
                <div style="max-width: 600px; margin: 0 auto; display: flex; gap: 10px;">
                    <button id="nut-goi-nhan-vien" class="nut nut-phu" style="flex: 1; padding: 10px; font-size: 14px; font-weight: 600;">
                        🛎️ Gọi phục vụ
                    </button>
                    <button id="nut-yeu-cau-thanh-toan" class="nut nut-phu" style="flex: 1; padding: 10px; font-size: 14px; font-weight: 600; color: #d97706; border-color: #d97706;">
                        💳 Thanh toán
                    </button>
                    <a href="#/menu" class="nut nut-chinh" style="flex: 1.2; padding: 10px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center;">
                        ➕ Gọi thêm món
                    </a>
                </div>
            </div>
        </div>
    `;

    // 1. Tham gia Socket Room
    thamGiaBan(thongTinBan.id, thongTinPhien.ma_phien);

    // 2. Tải dữ liệu ban đầu
    await taiChiTietPhien();

    // 3. Đăng ký lắng nghe sự kiện Socket Real-time
    dangKySocket();

    // 4. Gắn sự kiện các nút
    ganSuKienHoTro();
}

async function taiChiTietPhien() {
    try {
        const res = await goiApi(`/phien-ban/${thongTinPhien.ma_phien}`, 'GET');
        if (res.ok) {
            duLieuChiTietPhien = res.data;
            hienThiDanhSachDon();
        }
    } catch (e) {
        console.error('Lỗi tải chi tiết phiên:', e);
    }
}

function hienThiDanhSachDon() {
    if (!duLieuChiTietPhien) return;

    // Cập nhật tổng tiền
    const elTongTien = document.getElementById('tong-tien-hien-tai');
    if (elTongTien) {
        elTongTien.textContent = dinhDangTien(duLieuChiTietPhien.tong_tien_tam_tinh || 0);
    }

    const container = document.getElementById('danh-sach-cac-luot-goi');
    if (!container) return;

    const danhSachDon = duLieuChiTietPhien.danhSachDon || [];
    if (danhSachDon.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 12px;">
                <div style="font-size: 40px; margin-bottom: 10px;">🍽️</div>
                <div style="font-size: 15px; font-weight: 600;">Bàn chưa có đơn món nào</div>
                <p style="color: #777; font-size: 13px; margin: 6px 0 16px 0;">Hãy bấm "Gọi thêm món" để chọn món ngon nhé!</p>
                <a href="#/menu" class="nut nut-chinh nut-nho" style="text-decoration: none;">Xem thực đơn</a>
            </div>
        `;
        return;
    }

    let html = '';
    danhSachDon.forEach(don => {
        html += `
            <div style="background: white; border-radius: 12px; padding: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-weight: 700; font-size: 14px;">
                        📌 Lượt gọi #${don.lan_goi || 1} 
                        <span style="font-size: 12px; font-weight: normal; color: #888; margin-left: 6px;">(${don.thoi_gian_dat || ''})</span>
                    </div>
                    <span style="font-size: 13px; font-weight: 600; color: var(--mau-chinh);">${dinhDangTien(don.tong_tien_don)}</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${(don.chiTiet || []).map(item => taoDongMonAn(item)).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Gắn sự kiện nút Hủy món
    container.querySelectorAll('.nut-huy-mon-item').forEach(btn => {
        btn.addEventListener('click', async () => {
            const chiTietId = Number(btn.dataset.id);
            const tenMon = btn.dataset.tenMon;
            if (confirm(`Bạn có chắc muốn hủy món "${tenMon}"?`)) {
                await xuLyHuyMon(chiTietId);
            }
        });
    });
}

function taoDongMonAn(item) {
    let nhanTrangThai = '';
    let choPhepBaoHuy = false;

    switch (item.trang_thai) {
        case 'cho_xac_nhan':
            nhanTrangThai = `<span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">🟡 Chờ xác nhận</span>`;
            choPhepBaoHuy = true;
            break;
        case 'dang_che_bien':
            nhanTrangThai = `<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">🔵 Đang nấu</span>`;
            break;
        case 'hoan_thanh':
        case 'da_phuc_vu':
            nhanTrangThai = `<span style="background: #d1fae5; color: #047857; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">🟢 Đã phục vụ</span>`;
            break;
        case 'da_huy':
            nhanTrangThai = `<span style="background: #f3f4f6; color: #9ca3af; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; text-decoration: line-through;">⚪ Đã hủy</span>`;
            break;
        default:
            nhanTrangThai = `<span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${item.trang_thai}</span>`;
    }

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #f5f5f5;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 600; ${item.trang_thai === 'da_huy' ? 'text-decoration: line-through; color: #999;' : ''}">
                    ${item.ten_mon} <span style="color: var(--mau-chinh); font-weight: 700;">x${item.so_luong}</span>
                </div>
                ${item.ghi_chu_mon ? `<div style="font-size: 12px; color: #888;">Ghi chú: ${item.ghi_chu_mon}</div>` : ''}
                <div style="font-size: 12px; color: #666; margin-top: 2px;">${dinhDangTien(item.thanh_tien)}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
                ${nhanTrangThai}
                ${choPhepBaoHuy ? `
                    <button class="nut nut-nguy-hiem nut-nho nut-huy-mon-item" data-id="${item.id}" data-ten-mon="${item.ten_mon}" 
                            style="padding: 2px 8px; font-size: 11px;">
                        Hủy
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function xuLyHuyMon(chiTietId) {
    try {
        const res = await goiApi(`/don-goi-mon/huy-mon/${chiTietId}`, 'PUT', { lyDo: 'Khách hàng yêu cầu hủy' });
        if (res.ok) {
            alert('Đã hủy món thành công!');
            await taiChiTietPhien();
        } else {
            alert(res.msg || 'Không thể hủy món ăn này!');
        }
    } catch (e) {
        console.error('Lỗi khi hủy món:', e);
        alert('Lỗi hệ thống khi hủy món!');
    }
}

function dangKySocket() {
    langNgheSuKien('don_mon_moi', () => {
        taiChiTietPhien();
    });

    langNgheSuKien('cap_nhat_don_mon', () => {
        taiChiTietPhien();
    });

    langNgheSuKien('huy_mon', () => {
        taiChiTietPhien();
    });
}

function ganSuKienHoTro() {
    const nutGoiNhanVien = document.getElementById('nut-goi-nhan-vien');
    if (nutGoiNhanVien) {
        nutGoiNhanVien.addEventListener('click', async () => {
            const lyDo = prompt('Bạn cần hỗ trợ gì? (Khăn lạnh, thêm đá, đổi bát đũa...)', 'Cần hỗ trợ tại bàn');
            if (lyDo !== null) {
                try {
                    const res = await goiApi('/yeu-cau-ho-tro', 'POST', {
                        banAnId: thongTinBan.id,
                        phienBanId: thongTinPhien.id,
                        loaiYeuCau: 'goi_nhan_vien',
                        lyDo: lyDo
                    });
                    if (res.ok) {
                        alert('🛎️ Đã gửi yêu cầu tới nhân viên! Phục vụ sẽ có mặt ngay.');
                    }
                } catch {
                    alert('Lỗi khi gửi yêu cầu hỗ trợ!');
                }
            }
        });
    }

    const nutThanhToan = document.getElementById('nut-yeu-cau-thanh-toan');
    if (nutThanhToan) {
        nutThanhToan.addEventListener('click', async () => {
            if (confirm('Bạn muốn yêu cầu thanh toán hóa đơn cho bàn này?')) {
                try {
                    const res = await goiApi('/yeu-cau-ho-tro', 'POST', {
                        banAnId: thongTinBan.id,
                        phienBanId: thongTinPhien.id,
                        loaiYeuCau: 'yeu_cau_thanh_toan',
                        lyDo: 'Khách yêu cầu tính tiền'
                    });
                    if (res.ok) {
                        alert('💳 Yêu cầu thanh toán đã được gửi tới quầy Thu ngân!');
                        const badge = document.getElementById('badge-trang-thai-ban');
                        if (badge) {
                            badge.textContent = 'Chờ thanh toán';
                            badge.style.background = '#fef3c7';
                            badge.style.color = '#b45309';
                        }
                    }
                } catch {
                    alert('Lỗi khi gửi yêu cầu thanh toán!');
                }
            }
        });
    }
}

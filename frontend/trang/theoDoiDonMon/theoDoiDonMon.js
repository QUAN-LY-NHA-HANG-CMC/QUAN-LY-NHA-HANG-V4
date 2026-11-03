/**
 * Màn hình Theo dõi Đơn món Thời gian thực & Gọi nhân viên tại bàn
 * Phụ trách: Phong (Frontend Developer) & Quân (Đánh giá E-Menu)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';
import { thamGiaBan, langNgheSuKien, huyLangNghe } from '../../dungChung/ketNoiSocket.js';
import { hienThongBao } from '../../dungChung/thongBao.js';

let thongTinBan = null;
let thongTinPhien = null;
let duLieuChiTietPhien = null;
let soSaoChon = 5;

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

            <!-- Khối nút Đánh giá món ăn -->
            <div style="background: #fffdf9; border: 1px solid #fce8d5; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; font-size: 14px; color: #2c3e50;">Cảm nhận bữa ăn thế nào?</div>
                    <div style="font-size: 12px; color: #7f8c8d;">Đánh giá giúp Quán Mộc nâng cao chất lượng</div>
                </div>
                <button id="nut-mo-danh-gia" class="nut nut-phu nut-nho" style="color: #e67e22; border-color: #e67e22; font-weight: 600; padding: 6px 12px;">
                    ⭐ Đánh giá
                </button>
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

        <!-- Modal Đánh Giá Bữa Ăn -->
        <div id="modal-danh-gia-khach" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; border-radius: 16px; width: 100%; max-width: 420px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; text-align: center; font-size: 18px; color: #2c3e50;">Đánh Giá Trải Nghiệm Bữa Ăn</h3>
                
                <div style="display: flex; justify-content: center; gap: 10px; font-size: 32px; margin: 16px 0; cursor: pointer;" id="danh-sach-sao-chon">
                    <span class="ngoi-sao" data-val="1">⭐</span>
                    <span class="ngoi-sao" data-val="2">⭐</span>
                    <span class="ngoi-sao" data-val="3">⭐</span>
                    <span class="ngoi-sao" data-val="4">⭐</span>
                    <span class="ngoi-sao" data-val="5">⭐</span>
                </div>
                <div id="chu-thich-so-sao" style="text-align: center; font-size: 13px; font-weight: 600; color: #e67e22; margin-bottom: 16px;">
                    Rất tuyệt vời (5 sao)
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Họ tên của bạn (tùy chọn):</label>
                    <input type="text" id="nhap-ten-khach-dg" placeholder="Để trống nếu muốn ẩn danh" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px;">
                </div>

                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Nhận xét, góp ý cho nhà hàng:</label>
                    <textarea id="nhap-nhan-xet-dg" rows="3" placeholder="Món ăn, thái độ nhân viên, không gian quán..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px;"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="nut-huy-dg-khach" class="nut nut-phu">Để sau</button>
                    <button id="nut-gui-dg-khach" class="nut nut-chinh">Gửi Đánh Giá</button>
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
    ganSuKienDanhGia();
}

async function taiChiTietPhien() {
    try {
        const res = await goiApi(`/phien-ban/${thongTinPhien.ma_phien}`, 'GET');
        if (res && res.ok) {
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

    // Gắn sự kiện hủy món
    container.querySelectorAll('.nut-huy-mon').forEach(btn => {
        btn.addEventListener('click', () => {
            const chiTietId = btn.dataset.id;
            if (confirm('Bạn chắc chắn muốn hủy món này?')) {
                xuLyHuyMon(chiTietId);
            }
        });
    });
}

function taoDongMonAn(item) {
    let mauTrangThai = '#6b7280';
    let tenTrangThai = 'Chờ xác nhận';

    switch (item.trang_thai) {
        case 'cho_xac_nhan':
            mauTrangThai = '#eab308';
            tenTrangThai = '⏳ Chờ bếp nhận';
            break;
        case 'dang_che_bien':
            mauTrangThai = '#3b82f6';
            tenTrangThai = '👨‍🍳 Đang nấu';
            break;
        case 'hoan_thanh':
            mauTrangThai = '#10b981';
            tenTrangThai = '🍲 Đã xong, chờ bưng';
            break;
        case 'da_phuc_vu':
            mauTrangThai = '#059669';
            tenTrangThai = '✅ Đã lên bàn';
            break;
        case 'da_huy':
            mauTrangThai = '#ef4444';
            tenTrangThai = '❌ Đã hủy';
            break;
    }

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #f5f5f5;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.ten_mon} <span style="color: var(--mau-chinh); font-weight: 700;">x${item.so_luong}</span>
                </div>
                ${item.ghi_chu ? `<div style="font-size: 12px; color: #888;">Ghi chú: ${item.ghi_chu}</div>` : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 500; color: ${mauTrangThai}; background: ${mauTrangThai}15;">
                    ${tenTrangThai}
                </span>

                ${item.trang_thai === 'cho_xac_nhan' ? `
                    <button class="nut-huy-mon" data-id="${item.id}" style="background: none; border: 1px solid #ffccd5; color: #e63946; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">
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
        if (res && res.ok) {
            hienThongBao('Đã hủy món thành công!', 'thanh_cong');
            await taiChiTietPhien();
        } else {
            hienThongBao((res && res.msg) || 'Không thể hủy món ăn này!', 'canh_bao');
        }
    } catch (e) {
        console.error('Lỗi khi hủy món:', e);
        hienThongBao('Lỗi hệ thống khi hủy món!', 'loi');
    }
}

function dangKySocket() {
    langNgheSuKien('don_mon_moi', () => taiChiTietPhien());
    langNgheSuKien('cap_nhat_don_mon', () => taiChiTietPhien());
    langNgheSuKien('huy_mon', () => taiChiTietPhien());
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
                    if (res && res.ok) {
                        hienThongBao('🛎️ Đã gửi yêu cầu tới nhân viên! Phục vụ sẽ có mặt ngay.', 'thanh_cong');
                    }
                } catch {
                    hienThongBao('Lỗi khi gửi yêu cầu hỗ trợ!', 'loi');
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
                    if (res && res.ok) {
                        hienThongBao('💳 Yêu cầu thanh toán đã được gửi tới quầy Thu ngân!', 'thanh_cong');
                        const badge = document.getElementById('badge-trang-thai-ban');
                        if (badge) {
                            badge.textContent = 'Chờ thanh toán';
                            badge.style.background = '#fef3c7';
                            badge.style.color = '#b45309';
                        }
                        hienThiVietQrTaiBan();
                    }
                } catch {
                    hienThongBao('Lỗi khi gửi yêu cầu thanh toán!', 'loi');
                }
            }
        });
    }
}

function ganSuKienDanhGia() {
    const modal = document.getElementById('modal-danh-gia-khach');
    const nutMo = document.getElementById('nut-mo-danh-gia');
    const nutHuy = document.getElementById('nut-huy-dg-khach');
    const nutGui = document.getElementById('nut-gui-dg-khach');

    if (nutMo) nutMo.addEventListener('click', () => modal.style.display = 'flex');
    if (nutHuy) nutHuy.addEventListener('click', () => modal.style.display = 'none');

    // Chấm sao
    const cacSao = document.querySelectorAll('.ngoi-sao');
    const elChuThich = document.getElementById('chu-thich-so-sao');
    const cacChuThich = {
        1: 'Rất tệ (1 sao)',
        2: 'Chưa hài lòng (2 sao)',
        3: 'Bình thường (3 sao)',
        4: 'Hài lòng (4 sao)',
        5: 'Rất tuyệt vời (5 sao)'
    };

    cacSao.forEach(sao => {
        sao.addEventListener('click', () => {
            soSaoChon = Number(sao.dataset.val);
            cacSao.forEach((s, idx) => {
                s.style.opacity = idx < soSaoChon ? '1' : '0.25';
            });
            if (elChuThich) elChuThich.textContent = cacChuThich[soSaoChon];
        });
    });

    if (nutGui) {
        nutGui.addEventListener('click', async () => {
            const ten = document.getElementById('nhap-ten-khach-dg').value.trim();
            const nhanXet = document.getElementById('nhap-nhan-xet-dg').value.trim();

            try {
                const res = await goiApi('/danh-gia', 'POST', {
                    phienBanId: thongTinPhien.id,
                    soSao: soSaoChon,
                    tenKhachHang: ten || 'Khách bàn ' + thongTinBan.ten_ban,
                    nhanXet,
                    anDanh: !ten
                });

                if (res && res.ok) {
                    hienThongBao('Quán Mộc xin chân thành cảm ơn đánh giá quý báu của quý khách!', 'thanh_cong');
                    modal.style.display = 'none';
                    if (nutMo) {
                        nutMo.textContent = '✅ Đã đánh giá';
                        nutMo.disabled = true;
                    }
                }
            } catch (e) {
                hienThongBao(e.message || 'Lỗi gửi đánh giá', 'loi');
            }
        });
    }
}

function hienThiVietQrTaiBan() {
    let khung = document.getElementById('khung-vietqr-khach-tai-ban');
    const container = document.querySelector('.theo-doi-don-container');
    if (!container) return;

    const tongTien = duLieuChiTietPhien ? (duLieuChiTietPhien.tong_tien_tam_tinh || 0) : 0;
    const maBan = thongTinBan ? (thongTinBan.ma_ban || 'BAN') : 'BAN';
    const qrUrl = `https://api.vietqr.io/image/970422-0901234567-compact.png?amount=${tongTien}&addInfo=THANHTOAN%20${encodeURIComponent(maBan)}`;

    if (!khung) {
        khung = document.createElement('div');
        khung.id = 'khung-vietqr-khach-tai-ban';
        const vungDon = document.getElementById('danh-sach-don-hang-khach');
        if (vungDon && vungDon.parentNode) {
            vungDon.parentNode.insertBefore(khung, vungDon);
        } else {
            container.appendChild(khung);
        }
    }

    khung.innerHTML = `
        <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);">
            <div style="font-size: 14px; font-weight: 700; color: #b45309; margin-bottom: 6px;">
                💳 BÀN ĐANG CHỜ THANH TOÁN
            </div>
            <p style="font-size: 13px; color: #475569; margin-bottom: 14px;">
                Quý khách có thể quét mã Napas VietQR bên dưới để thanh toán chuyển khoản ngay tại bàn:
            </p>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; display: inline-block; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                <img src="${qrUrl}" alt="Napas VietQR" style="max-width: 220px; width: 100%; border-radius: 6px; display: block; margin: 0 auto;">
            </div>
            <div style="font-size: 14px; color: #1e293b; margin-top: 6px;">
                Số tiền: <b style="color: #e11d48; font-size: 18px;">${dinhDangTien(tongTien)}</b>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Nội dung CK: <b>THANHTOAN ${maBan}</b></div>
            <div style="font-size: 12px; color: #16a34a; margin-top: 6px; font-weight: 600;">✓ Quầy Thu ngân sẽ tự động kiểm tra và hoàn tất hóa đơn</div>
        </div>
    `;
}

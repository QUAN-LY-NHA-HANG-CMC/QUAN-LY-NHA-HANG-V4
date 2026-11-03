/**
 * Màn hình E-Menu gọi món quét mã QR tại bàn (Mobile-First)
 * Phụ trách: Quân (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';
import { thamGiaBan } from '../../dungChung/ketNoiSocket.js';

let danhSachDanhMuc = [];
let danhSachMonAn = [];
let danhMucDangChon = 'tat_ca';
let tuKhoaTimKiem = '';
let thongTinBanHienTai = null;
let thongTinPhienHienTai = null;

export async function renderThucDonQr(container) {
    container.innerHTML = `
        <div class="emenu-container" style="max-width: 600px; margin: 0 auto; padding-bottom: 90px;">
            <!-- Header Bàn -->
            <div class="emenu-header" style="background: var(--mau-chinh); color: white; padding: 16px; border-radius: 0 0 16px 16px; margin: -20px -20px 16px -20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; opacity: 0.9;">Nhà hàng Quán Mộc</div>
                        <h2 id="emenu-ten-ban" style="margin: 4px 0 0 0; font-size: 20px;">Đang xác thực bàn...</h2>
                    </div>
                    <div style="text-align: right;">
                        <a href="#/theo-doi-don" class="nut nut-phu nut-nho" style="background: rgba(255,255,255,0.2); color: white; border: none; text-decoration: none;">
                            📋 Đơn đã gọi
                        </a>
                    </div>
                </div>
                <!-- Ô tìm kiếm -->
                <div style="margin-top: 14px;">
                    <input type="text" id="emenu-tim-kiem" placeholder="🔍 Tìm kiếm món ăn, đồ uống..." 
                           style="width: 100%; padding: 10px 14px; border-radius: 8px; border: none; font-size: 14px; outline: none;">
                </div>
            </div>

            <!-- Danh mục dạng cuộn ngang -->
            <div id="emenu-danh-muc" style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; scrollbar-width: none; position: sticky; top: 0; background: var(--mau-nen); z-index: 50;">
                <button class="nut nut-phu nut-nho kich-hoat" data-danh-muc="tat_ca">Tất cả</button>
            </div>

            <!-- Danh sách món ăn -->
            <div id="emenu-danh-sach-mon" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="text-align: center; padding: 40px; color: #888;">Đang tải thực đơn...</div>
            </div>

            <!-- Thanh giỏ hàng nổi phía dưới -->
            <div id="emenu-gio-hang-noi" style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; padding: 12px 20px; display: none; justify-content: space-between; align-items: center; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); z-index: 100;">
                <div>
                    <div style="font-size: 12px; color: #666;"><span id="gio-hang-so-luong">0</span> món trong giỏ</div>
                    <div id="gio-hang-tong-tien" style="font-size: 17px; font-weight: 700; color: var(--mau-chinh);">0 đ</div>
                </div>
                <a href="#/gio-hang" class="nut nut-chinh" style="padding: 10px 20px; text-decoration: none; font-weight: 600;">
                    Xem giỏ hàng 🛒
                </a>
            </div>
        </div>
    `;

    // 1. Lấy thông tin Bàn từ query params hoặc session lưu trữ
    await khoiTaoThongTinBan();

    // 2. Tải danh mục và món ăn
    await taiDanhMuc();
    await taiThucDon();

    // 3. Gắn sự kiện tìm kiếm & lọc danh mục
    ganSuKienTimKiemVaLoc();

    // 4. Cập nhật thanh giỏ hàng nổi
    capNhatThanhGioHangNoi();
}

async function khoiTaoThongTinBan() {
    // Phân tích tham số từ URL Hash
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : (window.location.search ? window.location.search.slice(1) : '');
    const params = new URLSearchParams(queryString);
    
    let banId = params.get('banId') || params.get('ban') || '1';
    // Chuyển B01 thành 1 nếu truyền chuỗi mã bàn
    if (typeof banId === 'string' && banId.startsWith('B')) {
        const so = parseInt(banId.slice(1), 10);
        if (!isNaN(so)) banId = so;
    }

    try {
        const res = await goiApi('/phien-ban/xac-thuc-qr', 'POST', {
            banId: Number(banId) || 1,
            maDinhDanhQr: params.get('token') || ''
        });

        if (res && res.ok) {
            thongTinBanHienTai = res.data.banAn;
            thongTinPhienHienTai = res.data.phienBan;

            localStorage.setItem('emenu_ban_an', JSON.stringify(thongTinBanHienTai));
            localStorage.setItem('emenu_phien_ban', JSON.stringify(thongTinPhienHienTai));

            const elTenBan = document.getElementById('emenu-ten-ban');
            if (elTenBan) {
                elTenBan.textContent = `${thongTinBanHienTai.ten_ban || 'Bàn ' + banId}`;
            }

            // Tham gia room WebSockets của bàn
            thamGiaBan(thongTinBanHienTai.id, thongTinPhienHienTai.ma_phien);
        }
    } catch (e) {
        console.error('Lỗi xác thực bàn:', e);
        const elTenBan = document.getElementById('emenu-ten-ban');
        if (elTenBan) elTenBan.textContent = 'Bàn phục vụ';
    }
}

async function taiDanhMuc() {
    try {
        const res = await goiApi('/danh-muc-mon', 'GET');
        if (res && res.ok) {
            danhSachDanhMuc = Array.isArray(res.data) ? res.data : (res.data && res.data.danhSach ? res.data.danhSach : []);
            const container = document.getElementById('emenu-danh-muc');
            if (!container) return;

            let html = `<button class="nut nut-phu nut-nho ${danhMucDangChon === 'tat_ca' ? 'kich-hoat' : ''}" data-danh-muc="tat_ca" style="white-space: nowrap;">Tất cả</button>`;
            for (const dm of danhSachDanhMuc) {
                html += `
                    <button class="nut nut-phu nut-nho ${danhMucDangChon === dm.id.toString() ? 'kich-hoat' : ''}" 
                            data-danh-muc="${dm.id}" style="white-space: nowrap;">
                        ${dm.ten_danh_muc}
                    </button>
                `;
            }
            container.innerHTML = html;
        }
    } catch (e) {
        console.error('Lỗi tải danh mục:', e);
    }
}

async function taiThucDon() {
    try {
        const res = await goiApi('/thuc-don', 'GET');
        if (res && res.ok) {
            danhSachMonAn = (res.data && res.data.danhSach) ? res.data.danhSach : (Array.isArray(res.data) ? res.data : []);
            renderDanhSachMon();
        } else {
            const container = document.getElementById('emenu-danh-sach-mon');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888;">
                        <p style="font-size: 24px; margin-bottom: 8px;">🍽️</p>
                        <p style="font-weight: 600;">Chưa có món ăn nào trong thực đơn</p>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error('Lỗi tải thực đơn:', e);
        const container = document.getElementById('emenu-danh-sach-mon');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <p style="font-size: 28px; margin-bottom: 8px;">📶</p>
                    <p style="font-weight: 600; color: #e74c3c; margin-bottom: 4px;">Không thể kết nối đến máy chủ</p>
                    <p style="font-size: 13px; color: #777; margin-bottom: 14px;">Vui lòng kiểm tra lại dịch vụ backend hoặc nhấn thử lại.</p>
                    <button class="nut nut-phu nut-nho" onclick="window.location.reload()" style="cursor: pointer; padding: 6px 16px;">🔄 Thử lại</button>
                </div>
            `;
        }
    }
}

function renderDanhSachMon() {
    const container = document.getElementById('emenu-danh-sach-mon');
    if (!container) return;

    let danhSachLoc = danhSachMonAn;

    if (danhMucDangChon !== 'tat_ca') {
        danhSachLoc = danhSachLoc.filter(m => m.danh_muc_id === Number(danhMucDangChon));
    }

    if (tuKhoaTimKiem.trim() !== '') {
        const kw = tuKhoaTimKiem.toLowerCase().trim();
        danhSachLoc = danhSachLoc.filter(m => m.ten_mon.toLowerCase().includes(kw));
    }

    if (danhSachLoc.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; color: #888;">Không tìm thấy món ăn phù hợp</div>`;
        return;
    }

    let html = '';
    for (const m of danhSachLoc) {
        const hetMon = m.trang_thai === 'het_mon';
        html += `
            <div class="the-mon-emenu" style="display: flex; gap: 12px; background: white; border-radius: 12px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); align-items: center;">
                <div style="width: 76px; height: 76px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">
                    <img src="${m.hinh_anh || '/tepTaiLen/monAn/mac_dinh.svg'}" alt="${m.ten_mon}" onerror="this.onerror=null; this.src='/tepTaiLen/monAn/mac_dinh.svg';" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${m.ten_mon}
                    </div>
                    <div style="font-size: 13px; color: #777; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${m.mo_ta || 'Món ngon đặc sản Quán Mộc'}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: var(--mau-chinh); font-size: 15px;">
                            ${dinhDangTien(m.gia_ban)}
                        </span>
                        ${hetMon ? `
                            <span style="font-size: 12px; color: #999; background: #eee; padding: 4px 8px; border-radius: 4px;">Hết món</span>
                        ` : `
                            <button class="nut nut-chinh nut-nho nut-them-mon" data-id="${m.id}" style="padding: 6px 14px; border-radius: 20px;">
                                + Thêm
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Gắn sự kiện thêm món
    container.querySelectorAll('.nut-them-mon').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const mon = danhSachMonAn.find(item => item.id === id);
            if (mon) themVaoGioHang(mon);
        });
    });
}

function themVaoGioHang(mon) {
    let gioHang = [];
    try {
        gioHang = JSON.parse(localStorage.getItem('emenu_gio_hang') || '[]');
    } catch {
        gioHang = [];
    }

    const tonTai = gioHang.find(item => item.monAnId === mon.id);
    if (tonTai) {
        tonTai.soLuong += 1;
    } else {
        gioHang.push({
            monAnId: mon.id,
            tenMon: mon.ten_mon,
            donGia: Number(mon.gia_ban),
            soLuong: 1,
            ghiChuMon: ''
        });
    }

    localStorage.setItem('emenu_gio_hang', JSON.stringify(gioHang));
    capNhatThanhGioHangNoi();
}

function capNhatThanhGioHangNoi() {
    let gioHang = [];
    try {
        gioHang = JSON.parse(localStorage.getItem('emenu_gio_hang') || '[]');
    } catch {
        gioHang = [];
    }

    const thanhNoi = document.getElementById('emenu-gio-hang-noi');
    if (!thanhNoi) return;

    if (gioHang.length === 0) {
        thanhNoi.style.display = 'none';
        return;
    }

    const tongSoLuong = gioHang.reduce((sum, item) => sum + item.soLuong, 0);
    const tongTien = gioHang.reduce((sum, item) => sum + item.soLuong * item.donGia, 0);

    thanhNoi.style.display = 'flex';
    document.getElementById('gio-hang-so-luong').textContent = tongSoLuong;
    document.getElementById('gio-hang-tong-tien').textContent = dinhDangTien(tongTien);
}

function ganSuKienTimKiemVaLoc() {
    const elTimKiem = document.getElementById('emenu-tim-kiem');
    if (elTimKiem) {
        elTimKiem.addEventListener('input', (e) => {
            tuKhoaTimKiem = e.target.value;
            renderDanhSachMon();
        });
    }

    const elDanhMuc = document.getElementById('emenu-danh-muc');
    if (elDanhMuc) {
        elDanhMuc.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                danhMucDangChon = e.target.dataset.danhMuc;
                elDanhMuc.querySelectorAll('button').forEach(b => b.classList.remove('kich-hoat'));
                e.target.classList.add('kich-hoat');
                renderDanhSachMon();
            }
        });
    }
}

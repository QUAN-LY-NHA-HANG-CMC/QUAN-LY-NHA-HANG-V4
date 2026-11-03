
async function taiMauPhanHoi() {
    try {
        const res = await goiApi('/danh-gia/mau-phan-hoi', 'GET');
        const vungMau = document.getElementById('vung-mau-phan-hoi');
        if (!vungMau || !res || !res.data) return;

        vungMau.innerHTML = res.data.map(m => `
            <button type="button" class="nut nut-phu nut-nho nut-chon-mau-ph" data-nd="${encodeURIComponent(m.noiDung)}" style="font-size: 11px; padding: 4px 8px;">
                💡 ${m.tieuDe}
            </button>
        `).join('');

        vungMau.querySelectorAll('.nut-chon-mau-ph').forEach(btn => {
            btn.addEventListener('click', () => {
                const nd = decodeURIComponent(btn.dataset.nd);
                const txt = document.getElementById('nhap-loi-phan-hoi');
                if (txt) txt.value = nd;
            });
        });
    } catch (e) {
        console.warn('Lỗi tải mẫu phản hồi:', e);
    }
}
/**
 * Màn hình Quản trị Đánh giá & Phản hồi Khách hàng
 * Phụ trách: Quân (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { hienThongBao } from '../../dungChung/thongBao.js';

let danhSachDanhGia = [];
let thongTinDiemTb = { diemTrungBinh: 5.0, tongLuotDanhGia: 0, phanBo: [] };
let boLocHienTai = 'tat_ca';

export async function renderDanhGia(container) {
    container.innerHTML = `
        <div class="trang-danh-gia" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">Quản Trị Đánh Giá & Ý Kiến Khách Hàng</h1>
                    <p style="margin: 4px 0 0 0; color: #7f8c8d; font-size: 14px;">Lắng nghe phản hồi thực tế từ khách quét mã QR để nâng cao chất lượng phục vụ</p>
                </div>
            </div>

            <!-- Khối tổng quan điểm số -->
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 28px; display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; font-weight: 800; color: #f39c12; line-height: 1;" id="diem-so-lon">5.0</div>
                    <div style="font-size: 20px; color: #f39c12; margin: 6px 0;" id="sao-lon">⭐⭐⭐⭐⭐</div>
                    <div style="font-size: 13px; color: #7f8c8d;" id="tong-luot-dg">Dựa trên 0 lượt đánh giá</div>
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="nut nut-phu nut-nho nut-loc-dg kich-hoat" data-loc="tat_ca">Tất cả đánh giá</button>
                    <button class="nut nut-phu nut-nho nut-loc-dg" data-loc="tieu_cuc" style="color: #e74c3c; border-color: #fadbd8;">⚠️ Cần xử lý gấp (1-2 ⭐)</button>
                    <button class="nut nut-phu nut-nho nut-loc-dg" data-loc="5_sao">5 ⭐ Xuất sắc</button>
                </div>
            </div>

            <!-- Danh sách các thẻ đánh giá -->
            <div id="danh-sach-the-danh-gia" style="display: flex; flex-direction: column; gap: 16px;">
                <div style="text-align: center; padding: 40px; color: #888;">Đang tải danh sách đánh giá...</div>
            </div>
        </div>

        <!-- Modal Quản Lý Trả Lời Đánh Giá -->
        <div id="modal-phan-hoi-dg" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #2c3e50;">Gửi Phản Hồi Cho Khách Hàng</h3>
                <div id="noi-dung-khach-viet" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 14px; font-size: 13px; color: #555;"></div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Lời cảm ơn hoặc giải trình của Quán:</label>
                    <div id="vung-mau-phan-hoi" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;"></div>
                    <textarea id="nhap-loi-phan-hoi" rows="4" placeholder="Nhập phản hồi từ Quán Mộc..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="nut-huy-phan-hoi" class="nut nut-phu">Hủy</button>
                    <button id="nut-xac-nhan-phan-hoi" class="nut nut-chinh">Gửi Phản Hồi</button>
                </div>
            </div>
        </div>
    `;

    await taiDiemVaDanhSach();
    ganSuKien();
}

async function taiDiemVaDanhSach() {
    try {
        // 1. Điểm trung bình
        const resDiem = await goiApi('/danh-gia/diem-trung-binh', 'GET');
        if (resDiem && resDiem.ok) {
            thongTinDiemTb = resDiem.data || {};
            renderDiem();
        }

        // 2. Danh sách đánh giá
        let url = '/danh-gia';
        if (boLocHienTai === 'tieu_cuc') {
            url += '?chiTieuCuc=true';
        } else if (boLocHienTai === '5_sao') {
            url += '?soSao=5';
        }

        const resDg = await goiApi(url, 'GET');
        if (resDg && resDg.ok) {
            danhSachDanhGia = resDg.data || [];
            renderDanhSach();
        }
    } catch (e) {
        console.error('Lỗi tải đánh giá:', e);
    }
}

function renderDiem() {
    const elDiem = document.getElementById('diem-so-lon');
    const elSao = document.getElementById('sao-lon');
    const elTong = document.getElementById('tong-luot-dg');

    const dtb = thongTinDiemTb.diemTrungBinh || 5.0;
    const tong = thongTinDiemTb.tongLuotDanhGia || 0;

    if (elDiem) elDiem.textContent = dtb.toFixed(1);
    if (elTong) elTong.textContent = `Dựa trên ${tong} lượt đánh giá thực tế`;

    if (elSao) {
        const soSaoTron = Math.round(dtb);
        elSao.textContent = '⭐'.repeat(Math.max(1, Math.min(5, soSaoTron)));
    }
}

function renderDanhSach() {
    const container = document.getElementById('danh-sach-the-danh-gia');
    if (!container) return;

    if (danhSachDanhGia.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; color: #888;">
                <p style="font-size: 32px; margin-bottom: 8px;">✨</p>
                <p>Không có đánh giá nào phù hợp với bộ lọc hiện tại</p>
            </div>
        `;
        return;
    }

    container.innerHTML = danhSachDanhGia.map(dg => {
        const saoStr = '⭐'.repeat(dg.so_sao) + '☆'.repeat(5 - dg.so_sao);
        const laTieuCuc = dg.so_sao <= 2;

        return `
            <div class="the-danh-gia" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 5px solid ${laTieuCuc ? '#e74c3c' : '#2ecc71'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="font-size: 15px; color: #2c3e50;">${dg.ten_khach_hang}</strong>
                        ${dg.ten_mon ? `<span style="font-size: 13px; color: #7f8c8d; margin-left: 8px;">(Món: ${dg.ten_mon})</span>` : ''}
                        <div style="color: #f39c12; font-size: 16px; margin-top: 4px;">${saoStr}</div>
                    </div>
                    <span style="font-size: 12px; color: #95a5a6;">${dg.thoi_gian_tao}</span>
                </div>

                <div style="font-size: 14px; color: #34495e; line-height: 1.5; margin-bottom: 12px;">
                    "${dg.nhan_xet || 'Khách không để lại lời nhắn thêm'}"
                </div>

                ${dg.phan_hoi_quan_ly ? `
                    <div style="background: #fdf6f0; border-left: 3px solid var(--mau-chinh); padding: 10px 14px; border-radius: 6px; font-size: 13px; color: #555; margin-bottom: 10px;">
                        <strong style="color: var(--mau-chinh);">Quán Mộc phản hồi:</strong> ${dg.phan_hoi_quan_ly}
                        <div style="font-size: 11px; color: #999; margin-top: 4px;">${dg.thoi_gian_phan_hoi || ''}</div>
                    </div>
                ` : `
                    <button class="nut nut-phu nut-nho nut-mo-phan-hoi" data-id="${dg.id}" data-khach="${dg.ten_khach_hang}" data-nx="${dg.nhan_xet || ''}" style="font-size: 12px; padding: 4px 10px;">
                        ✍️ Phản hồi khách hàng
                    </button>
                `}
            </div>
        `;
    }).join('');

    // Gắn sự kiện mở modal phản hồi
    container.querySelectorAll('.nut-mo-phan-hoi').forEach(btn => {
        btn.addEventListener('click', () => {
            dangChonDgId = btn.dataset.id;
            const modal = document.getElementById('modal-phan-hoi-dg');
            const elKhach = document.getElementById('noi-dung-khach-viet');
            if (elKhach) {
                elKhach.innerHTML = `<strong>${btn.dataset.khach}:</strong> "${btn.dataset.nx}"`;
            }
            if (modal) {
                modal.style.display = 'flex';
                taiMauPhanHoi();
            }
        });
    });
}

let dangChonDgId = null;

function ganSuKien() {
    // 1. Bộ lọc
    const cacNutLoc = document.querySelectorAll('.nut-loc-dg');
    cacNutLoc.forEach(btn => {
        btn.addEventListener('click', () => {
            cacNutLoc.forEach(b => b.classList.remove('kich-hoat'));
            btn.classList.add('kich-hoat');
            boLocHienTai = btn.dataset.loc;
            taiDiemVaDanhSach();
        });
    });

    // 2. Modal Phản hồi
    const modal = document.getElementById('modal-phan-hoi-dg');
    const nutHuy = document.getElementById('nut-huy-phan-hoi');
    const nutGui = document.getElementById('nut-xac-nhan-phan-hoi');

    if (nutHuy) nutHuy.addEventListener('click', () => modal.style.display = 'none');
    if (nutGui) {
        nutGui.addEventListener('click', async () => {
            const phanHoi = document.getElementById('nhap-loi-phan-hoi').value.trim();
            if (!phanHoi) {
                hienThongBao('Vui lòng nhập nội dung phản hồi', 'canh_bao');
                return;
            }

            try {
                const res = await goiApi(`/danh-gia/${dangChonDgId}/phan-hoi`, 'PATCH', { phanHoi });
                if (res && res.ok) {
                    hienThongBao('Đã gửi phản hồi thành công!', 'thanh_cong');
                    modal.style.display = 'none';
                    document.getElementById('nhap-loi-phan-hoi').value = '';
                    taiDiemVaDanhSach();
                }
            } catch (e) {
                hienThongBao(e.message || 'Lỗi gửi phản hồi', 'loi');
            }
        });
    }
}

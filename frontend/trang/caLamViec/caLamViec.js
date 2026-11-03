/**
 * Màn hình Quản lý Ca làm việc, Phiên thu ngân & Đối soát quỹ
 * Phụ trách: Phong (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';
import { hienThongBao } from '../../dungChung/thongBao.js';

let phienHienTai = null;
let danhSachCa = [];
let danhSachPhieu = [];
let lichSuPhien = [];

export async function renderCaLamViec(container) {
    container.innerHTML = `
        <div class="trang-ca-lam-viec" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">Quản lý Ca làm việc & Quỹ Thu ngân</h1>
                    <p style="margin: 4px 0 0 0; color: #7f8c8d; font-size: 14px;">Đối soát tiền mặt, lập phiếu thu chi và bàn giao ca minh bạch</p>
                </div>
                <div id="vung-hanh-dong-ca" style="display: flex; gap: 10px;">
                    <!-- Nút Mở ca hoặc Kết ca sẽ render tại đây -->
                </div>
            </div>

            <!-- Khối trạng thái ca hiện tại -->
            <div id="khoi-ca-hien-tai" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 28px;">
                <div style="text-align: center; color: #888; padding: 20px;">Đang tải thông tin ca làm việc...</div>
            </div>

            <!-- Bảng Phiếu thu/chi trong ca -->
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 28px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">Phiếu Thu / Chi Tiền Mặt Phát Sinh Trong Ca</h3>
                    <button id="nut-tao-phieu" class="nut nut-phu nut-nho" style="display: none;">+ Lập phiếu thu/chi</button>
                </div>
                <div id="bang-phieu-thu-chi" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #f8f9fa; border-bottom: 2px solid #eee; text-align: left;">
                                <th style="padding: 12px;">Mã Phiếu</th>
                                <th style="padding: 12px;">Loại Phiếu</th>
                                <th style="padding: 12px;">Số Tiền</th>
                                <th style="padding: 12px;">Lý Do</th>
                                <th style="padding: 12px;">Người Thực Hiện</th>
                                <th style="padding: 12px;">Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-phieu-thu-chi">
                            <tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Chưa có phiếu phát sinh</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Lịch sử các ca đã đóng -->
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #2c3e50;">Lịch Sử Biên Bản Bàn Giao Ca (Đối Soát Quỹ)</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #f8f9fa; border-bottom: 2px solid #eee; text-align: left;">
                                <th style="padding: 12px;">Mã Phiên</th>
                                <th style="padding: 12px;">Thu Ngân</th>
                                <th style="padding: 12px;">Ca</th>
                                <th style="padding: 12px;">Tiền Đầu Ca</th>
                                <th style="padding: 12px;">Hệ Thống Tính</th>
                                <th style="padding: 12px;">Tiền Thực Tế</th>
                                <th style="padding: 12px;">Chênh Lệch</th>
                                <th style="padding: 12px;">Thời Gian Đóng</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-lich-su-ca">
                            <tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Đang tải lịch sử...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Mở Ca -->
        <div id="modal-mo-ca" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 100%; max-width: 450px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0;">Mở Ca Làm Việc Thu Ngân</h3>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Chọn ca:</label>
                    <select id="chon-ca-lam-viec" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;"></select>
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Tiền mặt đầu ca (VNĐ):</label>
                    <input type="number" id="nhap-tien-dau-ca" value="1000000" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                </div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Ghi chú mở ca:</label>
                    <input type="text" id="nhap-ghi-chu-mo-ca" placeholder="Ghi chú thêm nếu có..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="nut-huy-mo-ca" class="nut nut-phu">Hủy</button>
                    <button id="nut-xac-nhan-mo-ca" class="nut nut-chinh">Xác Nhận Mở Ca</button>
                </div>
            </div>
        </div>

        <!-- Modal Lập Phiếu Thu / Chi -->
        <div id="modal-thu-chi" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 100%; max-width: 450px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0;">Lập Phiếu Thu / Chi Tiền Mặt</h3>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Loại phiếu:</label>
                    <select id="chon-loai-phieu" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                        <option value="chi">Phiếu Chi (Tiền ra khỏi quỹ)</option>
                        <option value="thu">Phiếu Thu (Tiền vào thêm)</option>
                    </select>
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Số tiền (VNĐ):</label>
                    <input type="number" id="nhap-tien-thu-chi" placeholder="Nhập số tiền..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                </div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Lý do phát sinh:</label>
                    <input type="text" id="nhap-ly-do-thu-chi" placeholder="VD: Mua thêm đá, nước chấm..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="nut-huy-thu-chi" class="nut nut-phu">Hủy</button>
                    <button id="nut-xac-nhan-thu-chi" class="nut nut-chinh">Lưu Phiếu</button>
                </div>
            </div>
        </div>

        <!-- Modal Kết Ca -->
        <div id="modal-ket-ca" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #c0392b;">Kết Ca Làm Việc & Bàn Giao Quỹ</h3>
                <div style="background: #fdf6f0; border-left: 4px solid #e67e22; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
                    Vui lòng kiểm đếm chính xác toàn bộ tiền mặt trong ngăn kéo trước khi xác nhận đóng ca.
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Tiền mặt thực tế kiểm đếm (VNĐ):</label>
                    <input type="number" id="nhap-tien-thuc-te" placeholder="Nhập tổng tiền đếm được..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 16px; font-weight: 700;">
                </div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Ghi chú kết ca (Lý do nếu lệch tiền):</label>
                    <textarea id="nhap-ghi-chu-ket-ca" rows="3" placeholder="Nhập ghi chú bàn giao ca..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="nut-huy-ket-ca" class="nut nut-phu">Hủy</button>
                    <button id="nut-xac-nhan-ket-ca" class="nut nut-chinh" style="background: #c0392b; border-color: #c0392b;">Xác Nhận Đóng Ca</button>
                </div>
            </div>
        </div>
    `;

    await taiDuLieuCa();
    ganSuKienModal();
}

async function taiDuLieuCa() {
    try {
        // 1. Tải danh sách ca chuẩn
        const resCa = await goiApi('/ca-lam-viec', 'GET');
        if (resCa && resCa.ok) {
            danhSachCa = resCa.data || [];
            const selectCa = document.getElementById('chon-ca-lam-viec');
            if (selectCa) {
                selectCa.innerHTML = danhSachCa.map(c => `<option value="${c.id}">${c.ten_ca}</option>`).join('');
            }
        }

        // 2. Tải phiên ca hiện tại của nhân viên
        const resPhien = await goiApi('/ca-lam-viec/phien-hien-tai', 'GET');
        phienHienTai = (resPhien && resPhien.ok) ? resPhien.data : null;
        renderKhoiCaHienTai();

        // 3. Tải danh sách phiếu thu chi nếu có ca mở
        if (phienHienTai) {
            const resPhieu = await goiApi(`/ca-lam-viec/phieu-thu-chi/${phienHienTai.id}`, 'GET');
            if (resPhieu && resPhieu.ok) {
                danhSachPhieu = resPhieu.data || [];
                renderDanhSachPhieu();
            }
        }

        // 4. Tải lịch sử ca đã đóng
        const resLichSu = await goiApi('/ca-lam-viec/lich-su', 'GET');
        if (resLichSu && resLichSu.ok) {
            lichSuPhien = resLichSu.data || [];
            renderLichSuCa();
        }
    } catch (e) {
        console.error('Lỗi tải dữ liệu ca làm việc:', e);
    }
}

function renderKhoiCaHienTai() {
    const khoi = document.getElementById('khoi-ca-hien-tai');
    const vungHanhDong = document.getElementById('vung-hanh-dong-ca');
    const nutTaoPhieu = document.getElementById('nut-tao-phieu');

    if (!khoi || !vungHanhDong) return;

    if (!phienHienTai) {
        khoi.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 40px; margin-bottom: 12px;">🚪</div>
                <h3 style="margin: 0 0 8px 0; color: #2c3e50;">Hiện tại chưa có ca làm việc nào đang mở</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">Vui lòng mở ca làm việc mới và nhập số tiền mặt bàn giao đầu ca để bắt đầu phục vụ.</p>
                <button id="nut-mo-ca-chinh" class="nut nut-chinh" style="padding: 10px 24px; font-weight: 600;">+ Mở Ca Làm Việc Ngay</button>
            </div>
        `;
        vungHanhDong.innerHTML = '';
        if (nutTaoPhieu) nutTaoPhieu.style.display = 'none';

        const nutMo = document.getElementById('nut-mo-ca-chinh');
        if (nutMo) nutMo.addEventListener('click', () => {
            const modal = document.getElementById('modal-mo-ca');
            if (modal) modal.style.display = 'flex';
        });
        return;
    }

    if (nutTaoPhieu) nutTaoPhieu.style.display = 'inline-block';

    khoi.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div>
                <span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">ĐANG MỞ</span>
                <span style="font-size: 18px; font-weight: 700; color: #2c3e50; margin-left: 10px;">${phienHienTai.ten_ca || 'Ca làm việc'}</span>
                <span style="color: #7f8c8d; font-size: 13px; margin-left: 8px;">(Bắt đầu: ${phienHienTai.thoi_gian_mo})</span>
            </div>
            <div>
                <span style="color: #555; font-size: 14px;">Thu ngân: <strong>${phienHienTai.ten_thu_ngan || 'Tôi'}</strong></span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #3498db;">
                <div style="font-size: 12px; color: #7f8c8d;">Tiền Mặt Đầu Ca</div>
                <div style="font-size: 20px; font-weight: 700; color: #2c3e50; margin-top: 4px;">${dinhDangTien(phienHienTai.tien_dau_ca)}</div>
            </div>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #2ecc71;">
                <div style="font-size: 12px; color: #7f8c8d;">Tổng Thu Phát Sinh</div>
                <div style="font-size: 20px; font-weight: 700; color: #27ae60; margin-top: 4px;">+${dinhDangTien(phienHienTai.tong_thu_phat_sinh)}</div>
            </div>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <div style="font-size: 12px; color: #7f8c8d;">Tổng Chi Phát Sinh</div>
                <div style="font-size: 20px; font-weight: 700; color: #c0392b; margin-top: 4px;">-${dinhDangTien(phienHienTai.tong_chi_phat_sinh)}</div>
            </div>
        </div>
    `;

    vungHanhDong.innerHTML = `
        <button id="nut-ket-ca-header" class="nut nut-chinh" style="background: #c0392b; border-color: #c0392b; font-weight: 600;">
            🔒 Kết Ca & Bàn Giao
        </button>
    `;

    const nutKetCa = document.getElementById('nut-ket-ca-header');
    if (nutKetCa) {
        nutKetCa.addEventListener('click', () => {
            const modal = document.getElementById('modal-ket-ca');
            if (modal) modal.style.display = 'flex';
        });
    }
}

function renderDanhSachPhieu() {
    const tbody = document.getElementById('tbody-phieu-thu-chi');
    if (!tbody) return;

    if (danhSachPhieu.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Chưa có phiếu phát sinh trong ca này</td></tr>`;
        return;
    }

    tbody.innerHTML = danhSachPhieu.map(p => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px; font-weight: 600;">${p.ma_phieu}</td>
            <td style="padding: 12px;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${p.loai_phieu === 'thu' ? '#e8f8f5; color: #27ae60' : '#fdedec; color: #e74c3c'};">
                    ${p.loai_phieu === 'thu' ? 'PHIẾU THU' : 'PHIẾU CHI'}
                </span>
            </td>
            <td style="padding: 12px; font-weight: 700; color: ${p.loai_phieu === 'thu' ? '#27ae60' : '#e74c3c'};">
                ${p.loai_phieu === 'thu' ? '+' : '-'}${dinhDangTien(p.so_tien)}
            </td>
            <td style="padding: 12px;">${p.ly_do}</td>
            <td style="padding: 12px;">${p.nguoi_thuc_hien || 'Nhân viên'}</td>
            <td style="padding: 12px; color: #7f8c8d; font-size: 12px;">${p.thoi_gian_tao}</td>
        </tr>
    `).join('');
}

function renderLichSuCa() {
    const tbody = document.getElementById('tbody-lich-su-ca');
    if (!tbody) return;

    if (lichSuPhien.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Chưa có lịch sử ca làm việc</td></tr>`;
        return;
    }

    tbody.innerHTML = lichSuPhien.map(p => {
        const daDong = p.trang_thai === 'da_dong';
        const lech = p.chenh_lech || 0;
        let mauLech = '#27ae60';
        let chuLech = 'Khớp chuẩn';
        if (lech > 0) {
            mauLech = '#2980b9';
            chuLech = `+${dinhDangTien(lech)} (Thừa)`;
        } else if (lech < 0) {
            mauLech = '#c0392b';
            chuLech = `${dinhDangTien(lech)} (Thiếu)`;
        }

        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: 600;">${p.ma_phien_ca}</td>
                <td style="padding: 12px;">${p.ten_thu_ngan || 'N/A'}</td>
                <td style="padding: 12px;">${p.ten_ca || 'N/A'}</td>
                <td style="padding: 12px;">${dinhDangTien(p.tien_dau_ca)}</td>
                <td style="padding: 12px;">${daDong ? dinhDangTien(p.tien_mat_he_thong) : 'Đang tính'}</td>
                <td style="padding: 12px; font-weight: 600;">${daDong ? dinhDangTien(p.tien_mat_thuc_te) : '--'}</td>
                <td style="padding: 12px; font-weight: 700; color: ${mauLech};">${daDong ? chuLech : 'Chưa chốt'}</td>
                <td style="padding: 12px; color: #7f8c8d; font-size: 12px;">${p.thoi_gian_dong || 'Chưa đóng'}</td>
            </tr>
        `;
    }).join('');
}

function ganSuKienModal() {
    // 1. Mở Ca
    const modalMoCa = document.getElementById('modal-mo-ca');
    const nutHuyMoCa = document.getElementById('nut-huy-mo-ca');
    const nutXacNhanMoCa = document.getElementById('nut-xac-nhan-mo-ca');

    if (nutHuyMoCa) nutHuyMoCa.addEventListener('click', () => modalMoCa.style.display = 'none');
    if (nutXacNhanMoCa) {
        nutXacNhanMoCa.addEventListener('click', async () => {
            const caLamViecId = document.getElementById('chon-ca-lam-viec').value;
            const tienDauCa = Number(document.getElementById('nhap-tien-dau-ca').value) || 0;
            const ghiChu = document.getElementById('nhap-ghi-chu-mo-ca').value;

            try {
                const res = await goiApi('/ca-lam-viec/mo-ca', 'POST', { caLamViecId, tienDauCa, ghiChu });
                if (res && res.ok) {
                    hienThongBao('Mở ca làm việc thành công!', 'thanh_cong');
                    modalMoCa.style.display = 'none';
                    taiDuLieuCa();
                }
            } catch (err) {
                hienThongBao(err.message || 'Mở ca thất bại', 'loi');
            }
        });
    }

    // 2. Thu / Chi
    const modalThuChi = document.getElementById('modal-thu-chi');
    const nutTaoPhieu = document.getElementById('nut-tao-phieu');
    const nutHuyThuChi = document.getElementById('nut-huy-thu-chi');
    const nutXacNhanThuChi = document.getElementById('nut-xac-nhan-thu-chi');

    if (nutTaoPhieu) nutTaoPhieu.addEventListener('click', () => modalThuChi.style.display = 'flex');
    if (nutHuyThuChi) nutHuyThuChi.addEventListener('click', () => modalThuChi.style.display = 'none');
    if (nutXacNhanThuChi) {
        nutXacNhanThuChi.addEventListener('click', async () => {
            const loaiPhieu = document.getElementById('chon-loai-phieu').value;
            const soTien = Number(document.getElementById('nhap-tien-thu-chi').value) || 0;
            const lyDo = document.getElementById('nhap-ly-do-thu-chi').value;

            if (soTien <= 0) {
                hienThongBao('Vui lòng nhập số tiền hợp lệ lớn hơn 0', 'canh_bao');
                return;
            }

            try {
                const res = await goiApi('/ca-lam-viec/phieu-thu-chi', 'POST', {
                    phienCaId: phienHienTai.id,
                    loaiPhieu,
                    soTien,
                    lyDo
                });
                if (res && res.ok) {
                    hienThongBao('Tạo phiếu thu/chi thành công!', 'thanh_cong');
                    modalThuChi.style.display = 'none';
                    taiDuLieuCa();
                }
            } catch (err) {
                hienThongBao(err.message || 'Lập phiếu thất bại', 'loi');
            }
        });
    }

    // 3. Kết Ca
    const modalKetCa = document.getElementById('modal-ket-ca');
    const nutHuyKetCa = document.getElementById('nut-huy-ket-ca');
    const nutXacNhanKetCa = document.getElementById('nut-xac-nhan-ket-ca');

    if (nutHuyKetCa) nutHuyKetCa.addEventListener('click', () => modalKetCa.style.display = 'none');
    if (nutXacNhanKetCa) {
        nutXacNhanKetCa.addEventListener('click', async () => {
            const tienMatThucTe = Number(document.getElementById('nhap-tien-thuc-te').value);
            const ghiChu = document.getElementById('nhap-ghi-chu-ket-ca').value;

            if (isNaN(tienMatThucTe) || tienMatThucTe < 0) {
                hienThongBao('Vui lòng nhập số tiền kiểm đếm thực tế hợp lệ', 'canh_bao');
                return;
            }

            try {
                const res = await goiApi('/ca-lam-viec/ket-ca', 'POST', {
                    phienCaId: phienHienTai.id,
                    tienMatThucTe,
                    ghiChu
                });
                if (res && res.ok) {
                    hienThongBao('Đã đóng ca làm việc và đối soát quỹ thành công!', 'thanh_cong');
                    modalKetCa.style.display = 'none';
                    taiDuLieuCa();
                }
            } catch (err) {
                hienThongBao(err.message || 'Kết ca thất bại', 'loi');
            }
        });
    }
}

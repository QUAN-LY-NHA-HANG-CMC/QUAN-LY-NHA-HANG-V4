/**
 * Giao diện Quản Lý Sơ Đồ Bàn, Mã QR & Vận Hành POS (Chuyển/Ghép/Mở Bàn)
 * Phụ trách: Quân (Frontend POS / Table Operations / Checkout)
 */
import { goiApi } from '../../dungChung/api.js';
import { TRANG_THAI_BAN } from '../../dungChung/hangSo.js';
import { thongBao } from '../../dungChung/thongBao.js';

export async function renderQuanLyBanQr(container) {
    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">Sơ Đồ Bàn Thời Gian Thực & POS Phục Vụ</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">Theo dõi trạng thái bàn, mở bàn, chuyển bàn, ghép bàn và gọi tính tiền</p>
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
            <div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Đang tải sơ đồ bàn...</div>
        </div>
    `;

    let khuVucHienTai = '';
    let danhSachKhuVuc = [];
    let danhSachBan = [];

    // Socket.io tự động cập nhật sơ đồ bàn
    if (window.io) {
        try {
            const socket = window.io();
            socket.on('cap_nhat_ban', () => taiDuLieu());
            socket.on('chuyen_ban', () => {
                thongBao.thanhCong('Sơ đồ bàn vừa được cập nhật (Chuyển bàn)');
                taiDuLieu();
            });
            socket.on('ghep_ban', () => {
                thongBao.thanhCong('Sơ đồ bàn vừa được cập nhật (Ghép bàn)');
                taiDuLieu();
            });
            socket.on('thanh_toan_hoan_tat', () => {
                thongBao.thanhCong('Bàn đã thanh toán và giải phóng');
                taiDuLieu();
            });
            socket.on('don_mon_moi', () => taiDuLieu());
            socket.on('mon_san_sang', () => taiDuLieu());
        } catch (e) {
            console.warn('Socket sơ đồ bàn không khả dụng:', e);
        }
    }

    async function taiDuLieu() {
        try {
            const [resKv, resBan] = await Promise.all([
                goiApi('/khu-vuc', 'GET'),
                goiApi('/ban-an/so-do-chi-tiet', 'GET')
            ]);

            danhSachKhuVuc = resKv.data || [];
            danhSachBan = resBan.data || [];

            hienThiTabKhuVuc();
            hienThiDanhSachBan();
        } catch (loi) {
            thongBao.thatBai('Lỗi tải sơ đồ bàn: ' + loi.message);
        }
    }

    function hienThiTabKhuVuc() {
        const vungTab = document.getElementById('danh-sach-tab-khu-vuc');
        if (!vungTab) return;

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
                hienThiDanhSachBan();
            });
        });
    }

    function hienThiDanhSachBan() {
        const khung = document.getElementById('danh-sach-ban-khung');
        if (!khung) return;

        const danhSachLoc = khuVucHienTai 
            ? danhSachBan.filter(b => String(b.khu_vuc_id) === String(khuVucHienTai))
            : danhSachBan;

        if (danhSachLoc.length === 0) {
            khung.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Chưa có bàn ăn nào trong khu vực này.</div>`;
            return;
        }

        khung.innerHTML = danhSachLoc.map(ban => {
            const tt = TRANG_THAI_BAN[ban.trang_thai?.toUpperCase()] || TRANG_THAI_BAN.TRONG;
            const coKhach = ['dang_dung', 'cho_thanh_toan'].includes(ban.trang_thai);

            return `
                <div class="the-ban-an ${ban.trang_thai}" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <span class="ten-ban" style="font-size: 18px; font-weight: 700;">${ban.ten_ban}</span>
                                <span style="font-size: 12px; color: var(--mau-chu-phu); margin-left: 6px;">(${ban.ma_ban})</span>
                            </div>
                            <span class="huy-hieu ${ban.trang_thai === 'trong' ? 'huy-hieu-xanh' : (ban.trang_thai === 'dang_dung' ? 'huy-hieu-cam' : 'huy-hieu-xam')}">
                                ${tt.nhan}
                            </span>
                        </div>

                        <div style="font-size: 13px; color: var(--mau-chu-phu); margin-bottom: 6px;">
                            Khu vực: <b>${ban.ten_khu_vuc}</b> • Sức chứa: <b>${ban.suc_chua} chỗ</b>
                        </div>

                        ${coKhach ? `
                            <div style="background: #fff8eb; border: 1px solid #fde3a7; border-radius: 6px; padding: 10px; margin-top: 10px; font-size: 13px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="color: #64748b;">Thời gian ngồi:</span>
                                    <strong style="color: #e67e22;">⏱ ${ban.so_phut_ngoi || 0} phút</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="color: #64748b;">Tạm tính:</span>
                                    <strong style="color: #e11d48; font-size: 15px;">${(ban.tong_tien_tam_tinh || 0).toLocaleString('vi-VN')} đ</strong>
                                </div>
                                <div style="font-size: 11px; color: #475569; display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
                                    <span title="Món chờ nấu">⏳ Chờ: <b>${ban.mon_cho || 0}</b></span>
                                    <span title="Món đang nấu">🔥 Nấu: <b>${ban.mon_dang_nau || 0}</b></span>
                                    <span title="Món xong sẵn sàng phục vụ" style="color: #16a34a;">✅ Xong: <b>${ban.mon_san_sang || 0}</b></span>
                                    <span title="Món đã dọn lên bàn">🍽 Phục vụ: <b>${ban.mon_da_phuc_vu || 0}</b></span>
                                </div>
                            </div>
                        ` : `
                            <div style="padding: 18px 0; text-align: center; color: #94a3b8; font-size: 13px;">
                                Bàn đang sẵn sàng đón khách
                            </div>
                        `}
                    </div>

                    <!-- Khu vực nút bấm vận hành -->
                    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--mau-vien); display: flex; flex-direction: column; gap: 6px;">
                        ${coKhach ? `
                            <div style="display: flex; gap: 6px;">
                                <a href="#/thanh-toan?phienBanId=${ban.phien_ban_id}" class="nut nut-chinh nut-nho" style="flex: 1; text-align: center; text-decoration: none; background: #16a34a; border-color: #16a34a;">
                                    💰 Thanh toán
                                </a>
                                <button class="nut nut-phu nut-nho nut-chuyen-ban" data-phien="${ban.phien_ban_id}" data-ten="${ban.ten_ban}" title="Chuyển sang bàn khác">
                                    🔀 Đổi bàn
                                </button>
                                <button class="nut nut-phu nut-nho nut-ghep-ban" data-phien="${ban.phien_ban_id}" data-ten="${ban.ten_ban}" title="Ghép với bàn khác">
                                    🔗 Ghép bàn
                                </button>
                            </div>
                        ` : `
                            <button class="nut nut-chinh nut-nho nut-mo-ban" data-id="${ban.id}" data-ten="${ban.ten_ban}" style="width: 100%;">
                                👤 Mở bàn trực tiếp
                            </button>
                        `}

                        <div style="display: flex; gap: 6px;">
                            <button class="nut nut-phu nut-nho nut-xem-qr" data-id="${ban.id}" style="flex: 1;">
                                📱 Mã QR
                            </button>
                            <button class="nut nut-phu nut-nho nut-lam-moi-qr" data-id="${ban.id}" title="Làm mới token QR">
                                🔄
                            </button>
                            <button class="nut nut-xoa nut-nho nut-xoa-ban" data-id="${ban.id}" title="Xóa bàn">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        ganSuKienSoDoBan();
    }

    function ganSuKienSoDoBan() {
        const khung = document.getElementById('danh-sach-ban-khung');

        // Xem mã QR
        khung.querySelectorAll('.nut-xem-qr').forEach(btn => {
            btn.addEventListener('click', async () => {
                const banId = btn.getAttribute('data-id');
                try {
                    const res = await goiApi(`/ban-an/${banId}/ma-qr`, 'GET');
                    hienThiModalQr(res.data);
                } catch (loi) {
                    thongBao.thatBai('Lỗi lấy mã QR: ' + loi.message);
                }
            });
        });

        // Làm mới QR
        khung.querySelectorAll('.nut-lam-moi-qr').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc muốn làm mới mã QR của bàn này? Mã cũ sẽ mất hiệu lực.')) return;
                const banId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/ban-an/${banId}/lam-moi-qr`, 'POST');
                    thongBao.thanhCong('Đã làm mới mã QR');
                    taiDuLieu();
                } catch (loi) {
                    thongBao.thatBai(loi.message);
                }
            });
        });

        // Xóa bàn
        khung.querySelectorAll('.nut-xoa-ban').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
                const banId = btn.getAttribute('data-id');
                try {
                    await goiApi(`/ban-an/${banId}`, 'DELETE');
                    thongBao.thanhCong('Đã xóa bàn thành công');
                    taiDuLieu();
                } catch (loi) {
                    thongBao.thatBai(loi.message);
                }
            });
        });

        // Mở bàn trực tiếp
        khung.querySelectorAll('.nut-mo-ban').forEach(btn => {
            btn.addEventListener('click', () => {
                const banId = btn.getAttribute('data-id');
                const tenBan = btn.getAttribute('data-ten');
                hienThiModalMoBan(banId, tenBan);
            });
        });

        // Chuyển bàn
        khung.querySelectorAll('.nut-chuyen-ban').forEach(btn => {
            btn.addEventListener('click', () => {
                const phienBanId = btn.getAttribute('data-phien');
                const tenBan = btn.getAttribute('data-ten');
                hienThiModalChuyenBan(phienBanId, tenBan);
            });
        });

        // Ghép bàn
        khung.querySelectorAll('.nut-ghep-ban').forEach(btn => {
            btn.addEventListener('click', () => {
                const phienBanId = btn.getAttribute('data-phien');
                const tenBan = btn.getAttribute('data-ten');
                hienThiModalGhepBan(phienBanId, tenBan);
            });
        });
    }

    function hienThiModalMoBan(banId, tenBan) {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 400px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Mở Bàn: ${tenBan}</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-mo-ban">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Số lượng khách ngồi:</label>
                                <input type="number" id="mo-ban-so-khach" class="o-nhap" value="2" min="1" max="50" required>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Ghi chú phục vụ (nếu có):</label>
                                <input type="text" id="mo-ban-ghi-chu" class="o-nhap" placeholder="VD: Khách gọi trước, hẹn sinh nhật...">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Xác nhận mở bàn</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-mo-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const soKhach = Number(document.getElementById('mo-ban-so-khach').value);
                const ghiChu = document.getElementById('mo-ban-ghi-chu').value;
                await goiApi('/phien-ban/mo-ban-truc-tiep', 'POST', { banId: Number(banId), soKhach, ghiChu });
                vungModal.innerHTML = '';
                thongBao.thanhCong(`Đã mở ${tenBan} thành công!`);
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
            }
        });
    }

    function hienThiModalChuyenBan(phienBanId, tenBan) {
        const danhSachBanTrong = danhSachBan.filter(b => b.trang_thai === 'trong');
        const vungModal = document.getElementById('vung-modal');

        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 420px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Đổi Bàn Cho: ${tenBan}</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-chuyen-ban">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Chọn bàn trống muốn chuyển tới:</label>
                                <select id="chuyen-ban-dich" class="o-nhap" required>
                                    ${danhSachBanTrong.length === 0 ? '<option value="">-- Không có bàn trống nào --</option>' : ''}
                                    ${danhSachBanTrong.map(b => `<option value="${b.id}">${b.ten_ban} (${b.ma_ban} - ${b.ten_khu_vuc})</option>`).join('')}
                                </select>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Lý do đổi bàn:</label>
                                <input type="text" id="chuyen-ban-ly-do" class="o-nhap" value="Khách yêu cầu đổi bàn">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh" ${danhSachBanTrong.length === 0 ? 'disabled' : ''}>Xác nhận chuyển</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-chuyen-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            const banDichId = Number(document.getElementById('chuyen-ban-dich').value);
            const lyDo = document.getElementById('chuyen-ban-ly-do').value;
            try {
                await goiApi('/phien-ban/chuyen-ban', 'POST', {
                    phienBanId: Number(phienBanId),
                    banDichId,
                    lyDo,
                    nguoiThucHien: 'Phục vụ'
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Đã chuyển bàn thành công!');
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
            }
        });
    }

    function hienThiModalGhepBan(phienBanId, tenBan) {
        const danhSachBanCoKhach = danhSachBan.filter(b => ['dang_dung', 'cho_thanh_toan'].includes(b.trang_thai) && String(b.phien_ban_id) !== String(phienBanId));
        const vungModal = document.getElementById('vung-modal');

        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 440px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Ghép Bàn: ${tenBan}</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-ghep-ban">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Chọn bàn muốn ghép vào (Bàn đích):</label>
                                <select id="ghep-ban-dich" class="o-nhap" required>
                                    ${danhSachBanCoKhach.length === 0 ? '<option value="">-- Không có bàn nào khác đang có khách --</option>' : ''}
                                    ${danhSachBanCoKhach.map(b => `<option value="${b.phien_ban_id}">${b.ten_ban} (Phiên #${b.phien_ban_id} - Tạm tính: ${(b.tong_tien_tam_tinh || 0).toLocaleString('vi-VN')}đ)</option>`).join('')}
                                </select>
                            </div>
                            <p style="font-size: 12px; color: #e11d48; margin-top: 4px;">
                                Lưu ý: Toàn bộ món ăn và hóa đơn của ${tenBan} sẽ được gộp sang bàn đích. Bàn hiện tại sẽ trở về trạng thái Trống.
                            </p>
                            <div class="nhom-bieu-mau">
                                <label>Lý do ghép bàn:</label>
                                <input type="text" id="ghep-ban-ly-do" class="o-nhap" value="Khách ngồi chung bàn">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh" ${danhSachBanCoKhach.length === 0 ? 'disabled' : ''}>Xác nhận ghép bàn</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-ghep-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            const phienBanDichId = Number(document.getElementById('ghep-ban-dich').value);
            const lyDo = document.getElementById('ghep-ban-ly-do').value;
            try {
                await goiApi('/phien-ban/ghep-ban', 'POST', {
                    phienBanNguonId: Number(phienBanId),
                    phienBanDichId,
                    lyDo,
                    nguoiThucHien: 'Phục vụ'
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Đã ghép bàn thành công!');
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
            }
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
                                <input type="text" id="them-ma-ban" class="o-nhap" required placeholder="Nhập mã bàn duy nhất">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Tên bàn hiển thị</label>
                                <input type="text" id="them-ten-ban" class="o-nhap" required placeholder="VD: Bàn 07, Phòng VIP 2">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Khu vực</label>
                                <select id="them-khu-vuc-id" class="o-nhap" required>
                                    ${danhSachKhuVuc.map(kv => `<option value="${kv.id}">${kv.ten_khu_vuc}</option>`).join('')}
                                </select>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Sức chứa (số khách)</label>
                                <input type="number" id="them-suc-chua" class="o-nhap" value="4" min="1" max="50">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Tạo bàn & Sinh mã QR</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-them-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await goiApi('/ban-an', 'POST', {
                    maBan: document.getElementById('them-ma-ban').value,
                    tenBan: document.getElementById('them-ten-ban').value,
                    khuVucId: Number(document.getElementById('them-khu-vuc-id').value),
                    sucChua: Number(document.getElementById('them-suc-chua').value)
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Tạo bàn mới thành công!');
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
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
                        <h3 style="font-size: 18px; font-weight: 700;">Thêm Khu Vực Mới</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-them-khu-vuc">
                        <div class="hop-thoai-than">
                            <div class="nhom-bieu-mau">
                                <label>Tên khu vực (VD: Tầng 1, Ngoài trời, Sân thượng)</label>
                                <input type="text" id="them-ten-khu-vuc" class="o-nhap" required placeholder="Nhập tên khu vực">
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Mã khu vực (VD: T1, NT, VIP)</label>
                                <input type="text" id="them-ma-khu-vuc" class="o-nhap" required placeholder="Nhập mã khu vực duy nhất">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Lưu khu vực</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-them-khu-vuc').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await goiApi('/khu-vuc', 'POST', {
                    tenKhuVuc: document.getElementById('them-ten-khu-vuc').value,
                    maKhuVuc: document.getElementById('them-ma-khu-vuc').value
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Tạo khu vực mới thành công!');
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
            }
        });
    });

    taiDuLieu();
}

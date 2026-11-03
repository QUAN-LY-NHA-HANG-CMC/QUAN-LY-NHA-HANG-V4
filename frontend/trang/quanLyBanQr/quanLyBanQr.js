/**
 * Giao diện Quản Lý Sơ Đồ Bàn, Mã QR & Vận Hành POS (Chuyên Biệt Theo Vai Trò)
 * Phục vụ: Mở bàn, chuyển/ghép bàn, xem món và bưng món đã nấu lên bàn.
 * Thu ngân: Sơ đồ bàn POS, hóa đơn tạm tính, thu tiền và VietQR.
 * Quản lý: Toàn quyền cấu hình bàn, khu vực và điều hành.
 */
import { goiApi } from '../../dungChung/api.js';
import { TRANG_THAI_BAN, KHOA_LUU_TRU } from '../../dungChung/hangSo.js';
import { thongBao } from '../../dungChung/thongBao.js';

function layVaiTroHienTai() {
    try {
        const duLieu = localStorage.getItem(KHOA_LUU_TRU.NGUOI_DUNG);
        if (!duLieu) return '';
        const user = JSON.parse(duLieu);
        return user.vaiTro || '';
    } catch {
        return '';
    }
}

export async function renderQuanLyBanQr(container) {
    const vaiTro = layVaiTroHienTai();

    // Tùy biến tiêu đề chuyên biệt theo vai trò nhân sự
    let tieuDeTrang = 'Sơ Đồ Bàn Thời Gian Thực & POS Phục Vụ';
    let moTaTrang = 'Theo dõi trạng thái bàn, mở bàn, chuyển bàn, ghép bàn và gọi tính tiền';
    if (vaiTro === 'phuc_vu') {
        tieuDeTrang = '🪑 Sơ Đồ Bàn & Phục Vụ Bàn Ăn';
        moTaTrang = 'Theo dõi bàn có khách, mở bàn đón tiếp, chuyển/ghép bàn và bưng món ăn phục vụ';
    } else if (vaiTro === 'thu_ngan') {
        tieuDeTrang = '💼 Sơ Đồ Bàn & POS Thu Ngân';
        moTaTrang = 'Kiểm tra hóa đơn tạm tính, áp mã giảm giá, thu tiền mặt / VietQR và đối soát ca';
    }

    container.innerHTML = `
        <div class="thanh-tieu-de-trang">
            <div>
                <h1 class="tieu-de-lon">${tieuDeTrang}</h1>
                <p style="color: var(--mau-chu-phu); font-size: 14px;">${moTaTrang}</p>
            </div>
            ${vaiTro === 'quan_ly' ? `
                <div style="display: flex; gap: 10px;">
                    <button class="nut nut-phu" id="nut-them-khu-vuc">+ Thêm Khu Vực</button>
                    <button class="nut nut-chinh" id="nut-them-ban">+ Thêm Bàn Ăn</button>
                </div>
            ` : ''}
        </div>

        <div class="the" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span style="font-weight: 600; font-size: 13px; color: var(--mau-chu-phu);">Khu vực:</span>
                    <div id="danh-sach-tab-khu-vuc" style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button class="nut nut-chinh nut-nho tab-kv" data-id="">Tất cả</button>
                    </div>
                </div>

                <div style="width: 260px; max-width: 100%;">
                    <input type="text" id="tim-kiem-ban" placeholder="🔍 Tìm tên hoặc mã bàn..." 
                           style="width: 100%; padding: 8px 12px; border: 1px solid var(--mau-vien); border-radius: 8px; font-size: 13px;">
                </div>
            </div>

            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; border-top: 1px dashed var(--mau-vien); padding-top: 12px;">
                <span style="font-weight: 600; font-size: 13px; color: var(--mau-chu-phu);">Trạng thái:</span>
                <div id="danh-sach-tab-trang-thai" class="tab-trang-thai" style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="nut nut-chinh nut-nho tab-tt" data-tt="">Tất cả</button>
                    <button class="nut nut-phu nut-nho tab-tt" data-tt="trong">🟢 Bàn trống</button>
                    <button class="nut nut-phu nut-nho tab-tt" data-tt="dang_dung">🟡 Đang phục vụ</button>
                    <button class="nut nut-phu nut-nho tab-tt" data-tt="cho_thanh_toan">🔴 Chờ thanh toán</button>
                </div>
            </div>
        </div>

        <div id="danh-sach-ban-khung" class="luoi-ban-an">
            <div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Đang tải sơ đồ bàn...</div>
        </div>
    `;

    let khuVucHienTai = '';
    let trangThaiHienTai = '';
    let tuKhoaTimKiem = '';
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
            socket.on('mon_da_phuc_vu', () => taiDuLieu());
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
                hienThiTabKhuVuc();
                hienThiDanhSachBan();
            });
        });
    }

    function hienThiDanhSachBan() {
        const khung = document.getElementById('danh-sach-ban-khung');
        if (!khung) return;

        let danhSachLoc = khuVucHienTai 
            ? danhSachBan.filter(b => String(b.khu_vuc_id) === String(khuVucHienTai))
            : danhSachBan;

        if (trangThaiHienTai) {
            danhSachLoc = danhSachLoc.filter(b => b.trang_thai === trangThaiHienTai);
        }

        if (tuKhoaTimKiem) {
            const tk = tuKhoaTimKiem.toLowerCase();
            danhSachLoc = danhSachLoc.filter(b => 
                (b.ten_ban && b.ten_ban.toLowerCase().includes(tk)) || 
                (b.ma_ban && b.ma_ban.toLowerCase().includes(tk))
            );
        }

        if (danhSachLoc.length === 0) {
            khung.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 40px; color: #94a3b8;">Chưa có bàn ăn nào phù hợp với bộ lọc.</div>`;
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
                                    <span title="Món xong sẵn sàng phục vụ" style="color: #16a34a; font-weight: 700;">✅ Xong: <b>${ban.mon_san_sang || 0}</b></span>
                                    <span title="Món đã dọn lên bàn">🍽 Phục vụ: <b>${ban.mon_da_phuc_vu || 0}</b></span>
                                </div>
                            </div>
                        ` : `
                            <div style="padding: 18px 0; text-align: center; color: #94a3b8; font-size: 13px;">
                                Bàn đang sẵn sàng đón khách
                            </div>
                        `}
                    </div>

                    <!-- Khu vực nút bấm vận hành chuyên biệt theo vai trò -->
                    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--mau-vien); display: flex; flex-direction: column; gap: 6px;">
                        ${coKhach ? `
                            <div style="display: flex; gap: 6px;">
                                ${vaiTro === 'phuc_vu' ? `
                                    <button class="nut nut-chinh nut-nho nut-xem-phuc-vu" data-id="${ban.id}" data-phien="${ban.phien_ban_id}" data-ten="${ban.ten_ban}" style="flex: 1; text-align: center; background: #2563eb; border-color: #2563eb;" title="Xem các món và bưng món ra bàn">
                                        🍽️ Bưng món ${ban.mon_san_sang > 0 ? `<span style="background: #ef4444; color: white; padding: 1px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">${ban.mon_san_sang} xong</span>` : ''}
                                    </button>
                                ` : `
                                    <a href="#/thanh-toan?phienBanId=${ban.phien_ban_id}" class="nut nut-chinh nut-nho" style="flex: 1; text-align: center; text-decoration: none; background: #16a34a; border-color: #16a34a;">
                                        💰 Thanh toán
                                    </a>
                                `}
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

                            ${vaiTro === 'phuc_vu' && coKhach ? `
                                <button class="nut nut-phu nut-nho nut-bao-tinh-tien" data-id="${ban.id}" data-ten="${ban.ten_ban}" style="flex: 1; background: #fef3c7; color: #92400e; border-color: #fde68a;" title="Báo thu ngân tính tiền cho bàn này">
                                    🔔 Báo tính tiền
                                </button>
                            ` : ''}

                            ${(vaiTro === 'thu_ngan' || vaiTro === 'quan_ly') && coKhach ? `
                                <button class="nut nut-phu nut-nho nut-xem-phuc-vu" data-id="${ban.id}" data-phien="${ban.phien_ban_id}" data-ten="${ban.ten_ban}" style="flex: 1;" title="Xem các món của bàn">
                                    📋 Xem món
                                </button>
                            ` : ''}

                            ${vaiTro === 'quan_ly' ? `
                                <button class="nut nut-phu nut-nho nut-lam-moi-qr" data-id="${ban.id}" title="Làm mới token QR">
                                    🔄
                                </button>
                                <button class="nut nut-xoa nut-nho nut-xoa-ban" data-id="${ban.id}" title="Xóa bàn">
                                    🗑️
                                </button>
                            ` : ''}
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

        // Xem món & bưng món cho bàn (Phục vụ & Thu ngân & Quản lý)
        khung.querySelectorAll('.nut-xem-phuc-vu').forEach(btn => {
            btn.addEventListener('click', () => {
                const banId = btn.getAttribute('data-id');
                const phienBanId = btn.getAttribute('data-phien');
                const tenBan = btn.getAttribute('data-ten');
                hienThiModalPhucVuMon(banId, phienBanId, tenBan);
            });
        });

        // Phục vụ bấm báo thu ngân tính tiền
        khung.querySelectorAll('.nut-bao-tinh-tien').forEach(btn => {
            btn.addEventListener('click', async () => {
                const banId = btn.getAttribute('data-id');
                const tenBan = btn.getAttribute('data-ten');
                try {
                    await goiApi(`/ban-an/${banId}/trang-thai`, 'PATCH', { trang_thai: 'cho_thanh_toan' });
                    thongBao.thanhCong(`Đã chuyển bàn [${tenBan}] sang trạng thái Chờ thanh toán!`);
                    taiDuLieu();
                } catch (loi) {
                    thongBao.thatBai('Lỗi thông báo: ' + loi.message);
                }
            });
        });

        // Làm mới QR (Chỉ Quản lý)
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

        // Xóa bàn (Chỉ Quản lý)
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

    // Modal Phục vụ món & Bưng món
    async function hienThiModalPhucVuMon(banId, phienBanId, tenBan) {
        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 650px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700; color: #1e293b;">🍽️ Danh Sách Món & Phục Vụ - ${tenBan}</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <div class="hop-thoai-than" id="than-modal-phuc-vu" style="max-height: 480px; overflow-y: auto;">
                        <div style="text-align: center; padding: 30px; color: #64748b;">Đang tải danh sách món ăn...</div>
                    </div>
                    <div class="hop-thoai-chan" style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 8px;">
                            <button class="nut nut-phu nut-nho nut-mo-emenu-dat-ho" data-id="${banId}" title="Mở thực đơn gọi món hộ khách">
                                ➕ Đặt món hộ
                            </button>
                            ${vaiTro === 'phuc_vu' ? `
                                <button class="nut nut-phu nut-nho nut-modal-bao-tinh-tien" data-id="${banId}" data-ten="${tenBan}" style="background: #fef3c7; color: #92400e; border-color: #fde68a;">
                                    🔔 Báo Thu ngân tính tiền
                                </button>
                            ` : ''}
                        </div>
                        <button class="nut nut-phu nut-nho dong-modal">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        try {
            const res = await goiApi(`/don-goi-mon/ban/${banId}`, 'GET');
            const danhSachDon = res.data || [];
            const thanModal = document.getElementById('than-modal-phuc-vu');
            if (!thanModal) return;

            let tatCaChiTiet = [];
            danhSachDon.forEach(d => {
                if (d.chiTiet && Array.isArray(d.chiTiet)) {
                    d.chiTiet.forEach(ct => tatCaChiTiet.push({ ...ct, maDon: d.ma_don, lanGoi: d.lan_goi }));
                }
            });

            if (tatCaChiTiet.length === 0) {
                thanModal.innerHTML = `<div style="text-align: center; padding: 40px; color: #94a3b8;">Bàn này chưa có món nào được gọi.</div>`;
                return;
            }

            const monSanSang = tatCaChiTiet.filter(m => m.trang_thai === 'hoan_thanh');
            const monDangNau = tatCaChiTiet.filter(m => m.trang_thai === 'dang_che_bien');
            const monCho = tatCaChiTiet.filter(m => m.trang_thai === 'cho_xac_nhan');
            const monDaPhucVu = tatCaChiTiet.filter(m => m.trang_thai === 'da_phuc_vu');

            let html = `
                <div style="display: flex; gap: 8px; margin-bottom: 14px; font-size: 12px; flex-wrap: wrap;">
                    <span style="background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-weight: 600;">⏳ Chờ nấu: ${monCho.length}</span>
                    <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 600;">🔥 Đang nấu: ${monDangNau.length}</span>
                    <span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 6px; font-weight: 700;">✅ Bếp nấu xong: ${monSanSang.length}</span>
                    <span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px;">🍽️ Đã phục vụ: ${monDaPhucVu.length}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
            `;

            tatCaChiTiet.forEach(item => {
                const laSanSang = item.trang_thai === 'hoan_thanh';
                const laDaPhucVu = item.trang_thai === 'da_phuc_vu';
                const laDangNau = item.trang_thai === 'dang_che_bien';

                let mauNen = '#ffffff';
                let mauVien = '#e2e8f0';
                let nhanTrangThai = '⏳ Chờ chế biến';
                let mauChuNhan = '#64748b';

                if (laSanSang) {
                    mauNen = '#f0fdf4';
                    mauVien = '#86efac';
                    nhanTrangThai = '✅ Bếp đã nấu xong (Cần bưng món!)';
                    mauChuNhan = '#16a34a';
                } else if (laDaPhucVu) {
                    mauNen = '#f8fafc';
                    mauVien = '#e2e8f0';
                    nhanTrangThai = '🍽️ Đã dọn lên bàn';
                    mauChuNhan = '#0284c7';
                } else if (laDangNau) {
                    mauNen = '#fffbeb';
                    mauVien = '#fde68a';
                    nhanTrangThai = '🔥 Đang nấu tại bếp';
                    mauChuNhan = '#d97706';
                }

                html += `
                    <div style="background: ${mauNen}; border: 1px solid ${mauVien}; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div>
                            <div style="font-weight: 700; font-size: 14px; color: #1e293b;">
                                ${item.ten_mon} <span style="color: #e11d48; margin-left: 4px;">x${item.so_luong}</span>
                            </div>
                            <div style="font-size: 12px; color: ${mauChuNhan}; font-weight: 600; margin-top: 2px;">
                                ${nhanTrangThai} ${item.ghi_chu ? `• Ghi chú: <i>"${item.ghi_chu}"</i>` : ''}
                            </div>
                        </div>
                        <div>
                            ${laSanSang ? `
                                <button class="nut nut-chinh nut-nho nut-xac-nhan-bung-mon" data-id="${item.id}" data-ten="${item.ten_mon}" style="background: #16a34a; border-color: #16a34a; white-space: nowrap;">
                                    👉 Đã bưng ra bàn
                                </button>
                            ` : (laDaPhucVu ? `<span style="font-size: 13px; color: #16a34a; font-weight: 600;">✓ Hoàn tất</span>` : `<span style="font-size: 12px; color: #94a3b8;">Chờ bếp</span>`)}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            thanModal.innerHTML = html;

            // Bắt sự kiện xác nhận bưng món
            thanModal.querySelectorAll('.nut-xac-nhan-bung-mon').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const chiTietId = btn.getAttribute('data-id');
                    const tenMon = btn.getAttribute('data-ten');
                    try {
                        await goiApi(`/don-goi-mon/da-phuc-vu/${chiTietId}`, 'PUT');
                        thongBao.thanhCong(`Đã xác nhận bưng món [${tenMon}] lên bàn!`);
                        hienThiModalPhucVuMon(banId, phienBanId, tenBan);
                        taiDuLieu();
                    } catch (loi) {
                        thongBao.thatBai('Lỗi cập nhật: ' + loi.message);
                    }
                });
            });

            // Nút đặt thêm món hộ khách
            const nutDatHo = vungModal.querySelector('.nut-mo-emenu-dat-ho');
            if (nutDatHo) {
                nutDatHo.addEventListener('click', async () => {
                    try {
                        const resQr = await goiApi(`/ban-an/${banId}/ma-qr`, 'GET');
                        if (resQr.data && resQr.data.token) {
                            vungModal.innerHTML = '';
                            window.location.hash = '#/menu?token=' + resQr.data.token;
                        } else {
                            thongBao.thatBai('Không tìm thấy token của bàn này');
                        }
                    } catch (e) {
                        thongBao.thatBai('Không thể mở menu đặt món: ' + e.message);
                    }
                });
            }

            // Nút báo thu ngân tính tiền
            const nutBaoThuNgan = vungModal.querySelector('.nut-modal-bao-tinh-tien');
            if (nutBaoThuNgan) {
                nutBaoThuNgan.addEventListener('click', async () => {
                    try {
                        await goiApi(`/ban-an/${banId}/trang-thai`, 'PATCH', { trang_thai: 'cho_thanh_toan' });
                        thongBao.thanhCong(`Đã báo Thu ngân: Bàn [${tenBan}] sẵn sàng thanh toán!`);
                        vungModal.innerHTML = '';
                        taiDuLieu();
                    } catch (e) {
                        thongBao.thatBai('Lỗi thông báo: ' + e.message);
                    }
                });
            }
        } catch (loi) {
            document.getElementById('than-modal-phuc-vu').innerHTML = `<div style="color: #dc2626; padding: 20px; text-align: center;">Lỗi tải chi tiết: ${loi.message}</div>`;
        }
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
                                <input type="number" id="mo-ban-so-khach" class="o-nhap" min="1" max="50" value="2" required>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Ghi chú đón khách:</label>
                                <input type="text" id="mo-ban-ghi-chu" class="o-nhap" placeholder="VD: Khách đặt trước, có trẻ nhỏ...">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh">Xác nhận Mở bàn</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        vungModal.querySelectorAll('.dong-modal').forEach(b => b.addEventListener('click', () => vungModal.innerHTML = ''));

        vungModal.querySelector('#form-mo-ban').addEventListener('submit', async (e) => {
            e.preventDefault();
            const soLuongKhach = Number(document.getElementById('mo-ban-so-khach').value);
            const ghiChu = document.getElementById('mo-ban-ghi-chu').value;
            try {
                await goiApi('/phien-ban/mo-ban', 'POST', {
                    banId: Number(banId),
                    soLuongKhach,
                    ghiChu
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong(`Mở bàn [${tenBan}] thành công!`);
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
                            <button type="submit" class="nut nut-chinh" ${danhSachBanTrong.length === 0 ? 'disabled' : ''}>Chuyển bàn</button>
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
                    lyDo
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Chuyển bàn thành công!');
                taiDuLieu();
            } catch (loi) {
                thongBao.thatBai(loi.message);
            }
        });
    }

    function hienThiModalGhepBan(phienBanIdGoc, tenBanGoc) {
        const danhSachBanDangPhucVu = danhSachBan.filter(b => b.phien_ban_id && String(b.phien_ban_id) !== String(phienBanIdGoc));

        const vungModal = document.getElementById('vung-modal');
        vungModal.innerHTML = `
            <div class="hop-thoai-nen">
                <div class="hop-thoai-khung" style="max-width: 440px;">
                    <div class="hop-thoai-dau">
                        <h3 style="font-size: 18px; font-weight: 700;">Ghép Bàn: ${tenBanGoc}</h3>
                        <button class="nut nut-phu nut-nho dong-modal">✕</button>
                    </div>
                    <form id="form-ghep-ban">
                        <div class="hop-thoai-than">
                            <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
                                Toàn bộ món ăn và hóa đơn của bàn đích sẽ được gộp chung vào bàn này.
                            </p>
                            <div class="nhom-bieu-mau">
                                <label>Chọn bàn đang có khách để ghép vào:</label>
                                <select id="ghep-ban-dich" class="o-nhap" required>
                                    ${danhSachBanDangPhucVu.length === 0 ? '<option value="">-- Không có bàn khác đang phục vụ --</option>' : ''}
                                    ${danhSachBanDangPhucVu.map(b => `<option value="${b.phien_ban_id}">${b.ten_ban} (${b.ma_ban}) - Đang ngồi: ${b.so_phut_ngoi || 0} phút</option>`).join('')}
                                </select>
                            </div>
                            <div class="nhom-bieu-mau">
                                <label>Lý do ghép bàn:</label>
                                <input type="text" id="ghep-ban-ly-do" class="o-nhap" value="Khách ngồi chung bàn">
                            </div>
                        </div>
                        <div class="hop-thoai-chan">
                            <button type="button" class="nut nut-phu dong-modal">Hủy</button>
                            <button type="submit" class="nut nut-chinh" ${danhSachBanDangPhucVu.length === 0 ? 'disabled' : ''}>Xác nhận Ghép</button>
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
                    phienBanGocId: Number(phienBanIdGoc),
                    phienBanDichId,
                    lyDo
                });
                vungModal.innerHTML = '';
                thongBao.thanhCong('Ghép bàn thành công!');
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

    // Modal thêm bàn mới (Chỉ Quản lý)
    const elNutThemBan = document.getElementById('nut-them-ban');
    if (elNutThemBan) {
        elNutThemBan.addEventListener('click', () => {
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
    }

    // Modal thêm khu vực mới (Chỉ Quản lý)
    const elNutThemKv = document.getElementById('nut-them-khu-vuc');
    if (elNutThemKv) {
        elNutThemKv.addEventListener('click', () => {
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
    }

    // Bộ lọc trạng thái bàn & Tìm kiếm thời gian thực
    const oTimKiem = document.getElementById('tim-kiem-ban');
    if (oTimKiem) {
        oTimKiem.addEventListener('input', (e) => {
            tuKhoaTimKiem = e.target.value.trim();
            hienThiDanhSachBan();
        });
    }

    const cacNutTrangThai = document.querySelectorAll('.tab-trang-thai .tab-tt');
    cacNutTrangThai.forEach(btn => {
        btn.addEventListener('click', () => {
            cacNutTrangThai.forEach(b => {
                b.classList.remove('nut-chinh');
                b.classList.add('nut-phu');
            });
            btn.classList.remove('nut-phu');
            btn.classList.add('nut-chinh');
            trangThaiHienTai = btn.getAttribute('data-tt');
            hienThiDanhSachBan();
        });
    });

    taiDuLieu();
}

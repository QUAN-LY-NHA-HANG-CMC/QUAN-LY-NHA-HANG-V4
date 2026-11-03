
let amThanhBat = true;
function phatAmBaoKds() {
    if (!amThanhBat) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.warn('Web Audio error:', e);
    }
}
/**
 * Giao diện Màn hình Điều phối Bếp (Kitchen Display System - KDS)
 * Phụ trách: Phong (Frontend Admin & Real-time)
 */
import { goiApi } from '../../dungChung/api.js';
import { thongBao } from '../../dungChung/thongBao.js';

let intervalCapNhat = null;

export async function renderDieuPhoiBep(vungChua) {
    if (intervalCapNhat) clearInterval(intervalCapNhat);

    vungChua.innerHTML = `
        <div class="kds-khung" style="padding: 16px; background: #1e1e2d; min-height: calc(100vh - 70px); color: #fff;">
            <!-- Thanh công cụ KDS -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <h2 style="margin: 0; font-size: 22px; color: #ff9f43; display: flex; align-items: center; gap: 8px;">
                        <span>🍳</span> ĐIỀU PHỐI BẾP (KDS)
                    </h2>
                    <span style="background: #2a2b36; border: 1px solid #ff9f43; color: #ff9f43; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        🧑‍🍳 Trực ban Đầu bếp
                    </span>
                    <span id="kds-dem-tong" style="background: #e74c3c; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                        0 món chờ
                    </span>
                </div>

                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="background: #2a2b36; border-radius: 8px; padding: 4px; display: flex; gap: 4px;">
                        <button class="nut nut-phu nut-nho kds-tab-btn kich-hoat" id="tab-hang-doi" style="color: white; border: none; background: #ff9f43;">
                            ⏱ Hàng đợi gọi món (FIFO)
                        </button>
                        <button class="nut nut-phu nut-nho kds-tab-btn" id="tab-gom-mon" style="color: #aaa; border: none; background: transparent;">
                            🍲 Gom nhóm món
                        </button>
                        <button class="nut nut-phu nut-nho kds-tab-btn" id="tab-lich-su" style="color: #aaa; border: none; background: transparent;">
                            ✅ Món đã nấu xong
                        </button>
                    </div>

                    <button class="nut nut-chinh nut-nho" id="nut-lam-moi-kds" style="background: #2ed573; border: none;">
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            <!-- Vùng hiển thị nội dung chính KDS -->
            <div id="kds-noi-dung-chinh">
                <div style="text-align: center; padding: 40px; color: #888;">Đang tải danh sách điều phối bếp...</div>
            </div>
        </div>
    `;

    let cheDoHienTai = 'hang_doi'; // 'hang_doi', 'gom_mon', 'lich_su'

    const btnHangDoi = document.getElementById('tab-hang-doi');
    const btnGomMon = document.getElementById('tab-gom-mon');
    const btnLichSu = document.getElementById('tab-lich-su');
    const btnLamMoi = document.getElementById('nut-lam-moi-kds');

    function setActiveTab(btnActive) {
        [btnHangDoi, btnGomMon, btnLichSu].forEach(b => {
            b.style.background = 'transparent';
            b.style.color = '#aaa';
            b.classList.remove('kich-hoat');
        });
        btnActive.style.background = '#ff9f43';
        btnActive.style.color = '#fff';
        btnActive.classList.add('kich-hoat');
    }

    const btnChuong = document.getElementById('nut-chuong-kds');
    if (btnChuong) {
        btnChuong.addEventListener('click', () => {
            amThanhBat = !amThanhBat;
            btnChuong.textContent = amThanhBat ? '🔔 Chuông Bật' : '🔕 Chuông Tắt';
            btnChuong.style.background = amThanhBat ? '#4b6584' : '#e74c3c';
            if (amThanhBat) phatAmBaoKds();
        });
    }

    const btnFullscreen = document.getElementById('nut-toan-man-hinh');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                vungChua.requestFullscreen().catch(err => console.warn(err));
                btnFullscreen.textContent = '⏹ Thu nhỏ';
            } else {
                document.exitFullscreen();
                btnFullscreen.textContent = '⛶ Toàn màn hình';
            }
        });
    }

    if (window.io) {
        try {
            const socket = window.io();
            socket.on('don_mon_moi', () => {
                phatAmBaoKds();
            });
        } catch (e) {}
    }

    btnHangDoi.addEventListener('click', () => {
        cheDoHienTai = 'hang_doi';
        setActiveTab(btnHangDoi);
        taiDuLieu();
    });

    btnGomMon.addEventListener('click', () => {
        cheDoHienTai = 'gom_mon';
        setActiveTab(btnGomMon);
        taiDuLieuGomMon();
    });

    btnLichSu.addEventListener('click', () => {
        cheDoHienTai = 'lich_su';
        setActiveTab(btnLichSu);
        taiDuLieuLichSu();
    });

    btnLamMoi.addEventListener('click', () => {
        if (cheDoHienTai === 'hang_doi') taiDuLieu();
        else if (cheDoHienTai === 'gom_mon') taiDuLieuGomMon();
        else taiDuLieuLichSu();
    });

    // Lắng nghe Socket IO real-time
    if (window.io) {
        try {
            const socket = window.io();
            socket.on('don_mon_moi', () => {
                thongBao.thanhCong('🔔 Có đơn gọi món mới từ khách!');
                if (cheDoHienTai === 'hang_doi') taiDuLieu();
                else if (cheDoHienTai === 'gom_mon') taiDuLieuGomMon();
            });
            socket.on('huy_mon', () => {
                if (cheDoHienTai === 'hang_doi') taiDuLieu();
            });
        } catch (e) {
            console.warn('Socket KDS không khả dụng:', e);
        }
    }

    // Tải hàng đợi FIFO
    async function taiDuLieu() {
        const vungNd = document.getElementById('kds-noi-dung-chinh');
        if (!vungNd) return;

        try {
            const res = await goiApi('/kds/don-cho', 'GET');
            const danhSach = res.data?.danhSachCho || [];
            const badgeDem = document.getElementById('kds-dem-tong');
            if (badgeDem) badgeDem.textContent = `${danhSach.length} món chờ`;

            if (danhSach.length === 0) {
                vungNd.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: #888;">
                        <span style="font-size: 48px; display: block; margin-bottom: 12px;">🎉</span>
                        <h3>Bếp đang trống việc!</h3>
                        <p>Hiện không có món nào đang chờ chế biến.</p>
                    </div>
                `;
                return;
            }

            // Render danh sách món dạng thẻ KDS Kanban
            vungNd.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    ${danhSach.map(item => {
                        const quaGio = item.canh_bao_qua_gio;
                        const dangNau = item.trang_thai === 'dang_che_bien';
                        const mauVien = quaGio ? '#e74c3c' : (dangNau ? '#3498db' : '#f39c12');
                        const mauNen = quaGio ? '#2c1e21' : '#232530';

                        return `
                            <div class="the-mon-kds" style="
                                background: ${mauNen}; 
                                border: 2px solid ${mauVien}; 
                                border-radius: 10px; 
                                padding: 14px; 
                                display: flex; 
                                flex-direction: column; 
                                justify-content: space-between;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                                ${quaGio ? 'animation: blinkBorder 1.5s infinite alternate;' : ''}
                            ">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                        <div>
                                            <span style="background: #e67e22; color: #fff; font-weight: bold; font-size: 13px; padding: 2px 8px; border-radius: 4px;">
                                                ${item.ten_ban || ('Bàn ' + item.ban_an_id)}
                                            </span>
                                            <span style="color: #aaa; font-size: 12px; margin-left: 6px;">Lần #${item.lan_goi || 1}</span>
                                        </div>
                                        <span style="
                                            font-size: 12px; 
                                            font-weight: 700; 
                                            color: ${quaGio ? '#ff4757' : '#2ed573'};
                                            background: rgba(0,0,0,0.4); 
                                            padding: 2px 6px; 
                                            border-radius: 4px;
                                        ">
                                            ⏱ ${item.so_phut_cho || 0} phút ${quaGio ? '⚠️' : ''}
                                        </span>
                                    </div>

                                    <div style="font-size: 17px; font-weight: bold; color: #f1f2f6; margin-bottom: 6px;">
                                        ${item.ten_mon}
                                        <span style="color: #ff9f43; font-size: 18px; margin-left: 6px;">x${item.so_luong}</span>
                                    </div>

                                    ${item.ghi_chu_mon ? `
                                        <div style="font-size: 12px; color: #ffbe76; background: rgba(255, 159, 67, 0.15); padding: 4px 8px; border-radius: 4px; margin-bottom: 10px;">
                                            📝 ${item.ghi_chu_mon}
                                        </div>
                                    ` : ''}

                                    <div style="font-size: 12px; color: #aaa; margin-bottom: 12px;">
                                        Trạng thái: 
                                        <span style="color: ${dangNau ? '#3498db' : '#f39c12'}; font-weight: bold;">
                                            ${dangNau ? 'Đang nấu...' : 'Chờ bắt đầu'}
                                        </span>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                                    ${!dangNau ? `
                                        <button class="nut nut-phu nut-nho nut-bat-dau-nau" data-id="${item.id}" style="flex: 1; background: #3498db; color: white; border: none; padding: 8px 4px;">
                                            🔥 Bắt đầu nấu
                                        </button>
                                    ` : `
                                        <button class="nut nut-chinh nut-nho nut-hoan-thanh-mon" data-id="${item.id}" style="flex: 1; background: #2ed573; color: white; border: none; padding: 8px 4px;">
                                            ✅ Xong món
                                        </button>
                                    `}
                                    <button class="nut nut-nguy-hiem nut-nho nut-tu-choi-mon" data-id="${item.id}" data-ten="${item.ten_mon}" style="background: #eb4d4b; border: none; padding: 8px 8px;" title="Báo hết nguyên liệu / Từ chối">
                                        ❌
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            ganSuKienKds();
        } catch (loi) {
            vungNd.innerHTML = `<div style="color: #e74c3c; padding: 20px;">Lỗi tải dữ liệu bếp: ${loi.message}</div>`;
        }
    }

    // Tải gom nhóm món (Batch Cooking)
    async function taiDuLieuGomMon() {
        const vungNd = document.getElementById('kds-noi-dung-chinh');
        if (!vungNd) return;

        try {
            const res = await goiApi('/kds/gom-mon', 'GET');
            const danhSach = res.data || [];

            if (danhSach.length === 0) {
                vungNd.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: #888;">
                        <h3>Không có món nào đang chờ chế biến.</h3>
                    </div>
                `;
                return;
            }

            vungNd.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                    ${danhSach.map(item => `
                        <div style="background: #232530; border: 1px solid #3e4153; border-radius: 10px; padding: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <h3 style="margin: 0; font-size: 18px; color: #fff;">${item.ten_mon}</h3>
                                <span style="background: #ff4757; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 16px;">
                                    Tổng: ${item.tong_so_luong} phần
                                </span>
                            </div>
                            <div style="color: #a4b0be; font-size: 13px; margin-bottom: 14px;">
                                Phục vụ cho: <strong style="color: #eccc68;">${item.so_ban_dat} bàn</strong> đang chờ
                            </div>
                            <button class="nut nut-phu nut-nho nut-toggle-het-mon" data-id="${item.mon_an_id}" style="width: 100%; background: #2f3542; color: #ffa502; border: 1px solid #57606f;">
                                ⚠️ Báo tạm hết món này
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            document.querySelectorAll('.nut-toggle-het-mon').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    try {
                        const r = await goiApi(`/kds/toggle-het-mon/${id}`, 'PUT');
                        thongBao.thanhCong(`Đã chuyển trạng thái món sang: ${r.data.trang_thai}`);
                        taiDuLieuGomMon();
                    } catch (e) {
                        thongBao.thatBai(e.message);
                    }
                });
            });
        } catch (loi) {
            vungNd.innerHTML = `<div style="color: #e74c3c; padding: 20px;">Lỗi tải dữ liệu gom món: ${loi.message}</div>`;
        }
    }

    // Tải lịch sử món đã nấu
    async function taiDuLieuLichSu() {
        const vungNd = document.getElementById('kds-noi-dung-chinh');
        if (!vungNd) return;

        try {
            const res = await goiApi('/kds/lich-su', 'GET');
            const danhSach = res.data || [];

            vungNd.innerHTML = `
                <div style="background: #232530; border-radius: 10px; padding: 16px;">
                    <h3 style="margin-top: 0; color: #2ed573;">Lịch sử món ra gần nhất (50 món)</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; color: #dcdde1; font-size: 14px;">
                            <thead>
                                <tr style="border-bottom: 2px solid #3e4153; text-align: left;">
                                    <th style="padding: 10px;">Bàn</th>
                                    <th style="padding: 10px;">Tên món</th>
                                    <th style="padding: 10px;">Số lượng</th>
                                    <th style="padding: 10px;">Thời gian xong</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${danhSach.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 20px;">Chưa có món nào</td></tr>` : ''}
                                ${danhSach.map(item => `
                                    <tr style="border-bottom: 1px solid #2f3542;">
                                        <td style="padding: 10px;"><strong style="color: #ff9f43;">${item.ten_ban}</strong></td>
                                        <td style="padding: 10px;">${item.ten_mon}</td>
                                        <td style="padding: 10px; font-weight: bold; color: #2ed573;">x${item.so_luong}</td>
                                        <td style="padding: 10px; font-size: 12px; color: #888;">${item.thoi_gian_hoan_thanh || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (loi) {
            vungNd.innerHTML = `<div style="color: #e74c3c; padding: 20px;">Lỗi tải lịch sử bếp: ${loi.message}</div>`;
        }
    }

    function ganSuKienKds() {
        document.querySelectorAll('.nut-bat-dau-nau').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                try {
                    await goiApi(`/kds/chuyen-trang-thai/${id}`, 'PUT', { trangThaiMoi: 'dang_che_bien' });
                    thongBao.thanhCong('Đã chuyển sang đang nấu');
                    taiDuLieu();
                } catch (e) {
                    thongBao.thatBai(e.message);
                }
            });
        });

        document.querySelectorAll('.nut-hoan-thanh-mon').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                try {
                    await goiApi(`/kds/chuyen-trang-thai/${id}`, 'PUT', { trangThaiMoi: 'hoan_thanh' });
                    thongBao.thanhCong('Món ăn đã sẵn sàng phục vụ!');
                    taiDuLieu();
                } catch (e) {
                    thongBao.thatBai(e.message);
                }
            });
        });

        document.querySelectorAll('.nut-tu-choi-mon').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const tenMon = btn.getAttribute('data-ten');
                const lyDo = prompt(`Nhập lý do từ chối / hết món "${tenMon}":`, 'Hết nguyên liệu');
                if (!lyDo) return;

                try {
                    await goiApi(`/kds/tu-choi/${id}`, 'POST', { lyDo });
                    thongBao.thanhCong('Đã từ chối món và trừ tiền cho bàn');
                    taiDuLieu();
                } catch (e) {
                    thongBao.thatBai(e.message);
                }
            });
        });
    }

    // Tự động làm mới mỗi 15 giây
    taiDuLieu();
    intervalCapNhat = setInterval(() => {
        if (cheDoHienTai === 'hang_doi') taiDuLieu();
    }, 15000);
}

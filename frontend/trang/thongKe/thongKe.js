/**
 * Màn hình Dashboard Thống kê & Báo cáo Doanh thu
 * Phụ trách: Phong (Frontend Developer)
 */
import { goiApi } from '../../dungChung/api.js';
import { dinhDangTien } from '../../dungChung/dinhDang.js';
import { hienThongBao } from '../../dungChung/thongBao.js';
import { KHOA_LUU_TRU } from '../../dungChung/hangSo.js';

let duLieuTongQuan = {};
let duLieuDoanhThu = [];
let duLieuPhuongThuc = {};
let duLieuTopMon = { topBanChay: [], topBanCham: [] };
let duLieuKhungGio = [];
let chuKyHienTai = 'ngay';

export async function renderThongKe(container) {
    container.innerHTML = `
        <div class="trang-thong-ke" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <!-- Tiêu đề & Nút xuất báo cáo -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">Báo Cáo Doanh Thu & Thống Kê</h1>
                    <p style="margin: 4px 0 0 0; color: #7f8c8d; font-size: 14px;">Số liệu kinh doanh nhà hàng Quán Mộc cập nhật thời gian thực</p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="nut-xuat-doanh-thu" class="nut nut-phu nut-nho" style="font-weight: 600;">
                        📥 Xuất CSV Doanh Thu
                    </button>
                    <button id="nut-xuat-hoa-don" class="nut nut-chinh nut-nho" style="font-weight: 600;">
                        📥 Xuất CSV Hóa Đơn
                    </button>
                </div>
            </div>

            <!-- 4 Thẻ KPI Chỉ số chính -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 28px;">
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-left: 5px solid #2ecc71;">
                    <div style="font-size: 13px; color: #7f8c8d; text-transform: uppercase; font-weight: 600;">Doanh Thu Hôm Nay</div>
                    <div id="kpi-doanh-thu" style="font-size: 24px; font-weight: 700; color: #27ae60; margin: 8px 0 4px 0;">0 đ</div>
                    <div id="kpi-tang-truong" style="font-size: 12px; color: #888;">So với hôm qua: 0%</div>
                </div>

                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-left: 5px solid #3498db;">
                    <div style="font-size: 13px; color: #7f8c8d; text-transform: uppercase; font-weight: 600;">Hóa Đơn Thanh Toán</div>
                    <div id="kpi-hoa-don" style="font-size: 24px; font-weight: 700; color: #2980b9; margin: 8px 0 4px 0;">0 đơn</div>
                    <div style="font-size: 12px; color: #888;">Giao dịch thành công</div>
                </div>

                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-left: 5px solid #e67e22;">
                    <div style="font-size: 13px; color: #7f8c8d; text-transform: uppercase; font-weight: 600;">Khách Hàng Phục Vụ</div>
                    <div id="kpi-khach" style="font-size: 24px; font-weight: 700; color: #d35400; margin: 8px 0 4px 0;">0 khách</div>
                    <div style="font-size: 12px; color: #888;">Lượt khách ngồi tại bàn</div>
                </div>

                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-left: 5px solid #9b59b6;">
                    <div style="font-size: 13px; color: #7f8c8d; text-transform: uppercase; font-weight: 600;">Trung Bình / Đơn</div>
                    <div id="kpi-trung-binh" style="font-size: 24px; font-weight: 700; color: #8e44ad; margin: 8px 0 4px 0;">0 đ</div>
                    <div style="font-size: 12px; color: #888;">Giá trị trung bình 1 bàn</div>
                </div>
            </div>

            <!-- Hàng 1: Biểu đồ doanh thu & Tỷ trọng phương thức thanh toán -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 28px;">
                <!-- Biểu đồ doanh thu -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0; font-size: 17px; color: #2c3e50;">Biểu Đồ Doanh Thu</h3>
                        <div style="display: flex; gap: 6px;">
                            <button class="nut nut-phu nut-nho nut-chu-ky kich-hoat" data-ky="ngay">Ngày</button>
                            <button class="nut nut-phu nut-nho nut-chu-ky" data-ky="tuan">Tuần</button>
                            <button class="nut nut-phu nut-nho nut-chu-ky" data-ky="thang">Tháng</button>
                        </div>
                    </div>
                    <div id="vung-ve-bieu-do-doanh-thu" style="width: 100%; height: 260px; position: relative;">
                        <canvas id="canvas-doanh-thu" style="width: 100%; height: 100%;"></canvas>
                    </div>
                </div>

                <!-- Tỷ trọng phương thức thanh toán -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 16px 0; font-size: 17px; color: #2c3e50;">Phương Thức Thanh Toán</h3>
                    <div id="vung-ve-phuong-thuc" style="width: 100%; height: 180px; position: relative; margin-bottom: 16px;">
                        <canvas id="canvas-phuong-thuc" style="width: 100%; height: 100%;"></canvas>
                    </div>
                    <div id="chi-tiet-phuong-thuc" style="font-size: 13px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span>💵 Tiền mặt:</span>
                            <strong id="pt-tien-mat">0 đ (0%)</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>📱 Chuyển khoản VietQR:</span>
                            <strong id="pt-chuyen-khoan">0 đ (0%)</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hàng 2: Top món bán chạy & Khung giờ cao điểm -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- Top món bán chạy -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 16px 0; font-size: 17px; color: #2c3e50;">Top 5 Món Ăn Bán Chạy Nhất</h3>
                    <div id="danh-sach-top-mon" style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="text-align: center; color: #888; padding: 20px;">Đang tải top món...</div>
                    </div>
                </div>

                <!-- Khung giờ cao điểm -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 16px 0; font-size: 17px; color: #2c3e50;">Khung Giờ Cao Điểm Trong Ngày (0h - 23h)</h3>
                    <div id="vung-ve-khung-gio" style="width: 100%; height: 220px; position: relative;">
                        <canvas id="canvas-khung-gio" style="width: 100%; height: 100%;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    await taiTatCaDuLieu();
    ganSuKien();
}

async function taiTatCaDuLieu() {
    try {
        // 1. KPI Tổng quan
        const resTq = await goiApi('/thong-ke/tong-quan', 'GET');
        if (resTq && resTq.ok) {
            duLieuTongQuan = resTq.data || {};
            renderKpi();
        }

        // 2. Doanh thu theo chu kỳ
        const resDt = await goiApi(`/thong-ke/doanh-thu?ky=${chuKyHienTai}`, 'GET');
        if (resDt && resDt.ok) {
            duLieuDoanhThu = resDt.data || [];
            veBieuDoDoanhThu();
        }

        // 3. Tỷ trọng phương thức thanh toán
        const resPt = await goiApi('/thong-ke/phuong-thuc', 'GET');
        if (resPt && resPt.ok) {
            duLieuPhuongThuc = resPt.data || {};
            veBieuDoPhuongThuc();
        }

        // 4. Top món
        const resTop = await goiApi('/thong-ke/top-mon?gioiHan=5', 'GET');
        if (resTop && resTop.ok) {
            duLieuTopMon = resTop.data || { topBanChay: [] };
            renderTopMon();
        }

        // 5. Khung giờ
        const resKg = await goiApi('/thong-ke/khung-gio', 'GET');
        if (resKg && resKg.ok) {
            duLieuKhungGio = resKg.data || [];
            veBieuDoKhungGio();
        }
    } catch (e) {
        console.error('Lỗi tải dữ liệu thống kê:', e);
    }
}

function renderKpi() {
    const elDt = document.getElementById('kpi-doanh-thu');
    const elHd = document.getElementById('kpi-hoa-don');
    const elKh = document.getElementById('kpi-khach');
    const elTb = document.getElementById('kpi-trung-binh');
    const elTt = document.getElementById('kpi-tang-truong');

    if (elDt) elDt.textContent = dinhDangTien(duLieuTongQuan.tongDoanhThuNgay || 0);
    if (elHd) elHd.textContent = `${duLieuTongQuan.soHoaDonNgay || 0} đơn`;
    if (elKh) elKh.textContent = `${duLieuTongQuan.soKhachPhucVu || 0} khách`;
    if (elTb) elTb.textContent = dinhDangTien(duLieuTongQuan.giaTriTrungBinhDon || 0);

    if (elTt) {
        const rate = duLieuTongQuan.tyLeTangTruong || 0;
        const color = rate >= 0 ? '#27ae60' : '#c0392b';
        const sign = rate >= 0 ? '+' : '';
        elTt.innerHTML = `So với hôm qua: <strong style="color: ${color}">${sign}${rate}%</strong>`;
    }
}

function renderTopMon() {
    const container = document.getElementById('danh-sach-top-mon');
    if (!container) return;

    const list = duLieuTopMon.topBanChay || [];
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #888; padding: 20px;">Chưa có dữ liệu bán món</div>`;
        return;
    }

    container.innerHTML = list.map((m, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 24px; height: 24px; border-radius: 50%; background: ${idx < 3 ? 'var(--mau-chinh)' : '#95a5a6'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
                    ${idx + 1}
                </span>
                <div>
                    <div style="font-weight: 600; font-size: 14px; color: #2c3e50;">${m.ten_mon}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${m.ten_danh_muc} • ${dinhDangTien(m.gia_ban)}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--mau-chinh); font-size: 14px;">${m.da_ban} phần</div>
                <div style="font-size: 12px; color: #7f8c8d;">${dinhDangTien(m.doanh_thu)}</div>
            </div>
        </div>
    `).join('');
}

function veBieuDoDoanhThu() {
    const canvas = document.getElementById('canvas-doanh-thu');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (duLieuDoanhThu.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có dữ liệu doanh thu trong khoảng thời gian này', canvas.width / 2, canvas.height / 2);
        return;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = canvas.width - padding.left - padding.right;
    const chartH = canvas.height - padding.top - padding.bottom;

    const maxVal = Math.max(...duLieuDoanhThu.map(d => d.doanh_thu), 100000);
    const colW = chartW / duLieuDoanhThu.length;

    // Vẽ cột Bar Chart
    duLieuDoanhThu.forEach((d, idx) => {
        const barH = (d.doanh_thu / maxVal) * chartH;
        const x = padding.left + idx * colW + colW * 0.15;
        const y = padding.top + (chartH - barH);
        const w = colW * 0.7;

        // Cột màu gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, '#8B4513');
        grad.addColorStop(1, '#D2691E');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, w, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Nhãn ngày / mốc
        ctx.fillStyle = '#555';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const label = d.moc_thoi_gian.length > 5 ? d.moc_thoi_gian.slice(5) : d.moc_thoi_gian;
        ctx.fillText(label, x + w / 2, canvas.height - 15);
    });

    // Trục hoành
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(canvas.width - padding.right, padding.top + chartH);
    ctx.stroke();
}

function veBieuDoPhuongThuc() {
    const canvas = document.getElementById('canvas-phuong-thuc');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tm = duLieuPhuongThuc.tienMat || 0;
    const ck = duLieuPhuongThuc.chuyenKhoan || 0;
    const tong = tm + ck;

    document.getElementById('pt-tien-mat').textContent = `${dinhDangTien(tm)} (${duLieuPhuongThuc.phanTramTienMat || 0}%)`;
    document.getElementById('pt-chuyen-khoan').textContent = `${dinhDangTien(ck)} (${duLieuPhuongThuc.phanTramChuyenKhoan || 0}%)`;

    if (tong === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có thanh toán', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Vẽ Doughnut Chart
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const innerR = r * 0.55;

    const gocTm = (tm / tong) * 2 * Math.PI;

    // Phần tiền mặt (#2ecc71)
    ctx.beginPath();
    ctx.fillStyle = '#2ecc71';
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + gocTm);
    ctx.arc(cx, cy, innerR, -Math.PI / 2 + gocTm, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    // Phần chuyển khoản (#3498db)
    ctx.beginPath();
    ctx.fillStyle = '#3498db';
    ctx.arc(cx, cy, r, -Math.PI / 2 + gocTm, 1.5 * Math.PI);
    ctx.arc(cx, cy, innerR, 1.5 * Math.PI, -Math.PI / 2 + gocTm, true);
    ctx.closePath();
    ctx.fill();
}

function veBieuDoKhungGio() {
    const canvas = document.getElementById('canvas-khung-gio');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (duLieuKhungGio.length === 0) return;

    const padding = { top: 15, right: 15, bottom: 30, left: 35 };
    const chartW = canvas.width - padding.left - padding.right;
    const chartH = canvas.height - padding.top - padding.bottom;

    const maxDon = Math.max(...duLieuKhungGio.map(k => k.soDon), 5);
    const colW = chartW / 24;

    duLieuKhungGio.forEach((k, h) => {
        const barH = (k.soDon / maxDon) * chartH;
        const x = padding.left + h * colW + 1;
        const y = padding.top + (chartH - barH);
        const w = Math.max(colW - 2, 2);

        // Nổi bật giờ cao điểm trưa (11-13h) và tối (18-21h)
        const laCaoDiem = (h >= 11 && h <= 13) || (h >= 18 && h <= 21);
        ctx.fillStyle = laCaoDiem ? '#e74c3c' : '#3498db';

        ctx.fillRect(x, y, w, barH);

        // Chỉ ghi số giờ chẵn để tránh đè chữ
        if (h % 3 === 0) {
            ctx.fillStyle = '#777';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${h}h`, x + w / 2, canvas.height - 10);
        }
    });
}

function ganSuKien() {
    // 1. Chuyển chu kỳ
    const cacNutChuKy = document.querySelectorAll('.nut-chu-ky');
    cacNutChuKy.forEach(btn => {
        btn.addEventListener('click', async () => {
            cacNutChuKy.forEach(b => b.classList.remove('kich-hoat'));
            btn.classList.add('kich-hoat');
            chuKyHienTai = btn.dataset.ky;
            const resDt = await goiApi(`/thong-ke/doanh-thu?ky=${chuKyHienTai}`, 'GET');
            if (resDt && resDt.ok) {
                duLieuDoanhThu = resDt.data || [];
                veBieuDoDoanhThu();
            }
        });
    });

    // 2. Xuất CSV Doanh thu
    const nutCsvDoanhThu = document.getElementById('nut-xuat-doanh-thu');
    if (nutCsvDoanhThu) {
        nutCsvDoanhThu.addEventListener('click', () => {
            taiTepCsv('/api/xuat-bao-cao/doanh-thu-csv', `bao-cao-doanh-thu-${Date.now()}.csv`);
        });
    }

    // 3. Xuất CSV Hóa đơn
    const nutCsvHoaDon = document.getElementById('nut-xuat-hoa-don');
    if (nutCsvHoaDon) {
        nutCsvHoaDon.addEventListener('click', () => {
            taiTepCsv('/api/xuat-bao-cao/hoa-don-csv', `danh-sach-hoa-don-${Date.now()}.csv`);
        });
    }
}

async function taiTepCsv(url, tenTep) {
    try {
        const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không thể tải file báo cáo');

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = tenTep;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        hienThongBao('Tải báo cáo CSV thành công!', 'thanh_cong');
    } catch (e) {
        hienThongBao(e.message || 'Lỗi khi tải file', 'loi');
    }
}

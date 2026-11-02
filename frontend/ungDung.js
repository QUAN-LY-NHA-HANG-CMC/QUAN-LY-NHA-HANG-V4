import { KHOA_LUU_TRU } from './dungChung/hangSo.js';
import { renderDangNhap } from './trang/dangNhap/dangNhap.js';
import { renderQuanLyBanQr } from './trang/quanLyBanQr/quanLyBanQr.js';
import { renderQuanLyThucDon } from './trang/quanLyThucDon/quanLyThucDon.js';
import { renderNhanVien } from './trang/nhanVien/nhanVien.js';
import { renderQuanTri } from './trang/quanTri/quanTri.js';

const tuyenDuong = {
    '/dang-nhap': renderDangNhap,
    '/so-do-ban': renderQuanLyBanQr,
    '/thuc-don': renderQuanLyThucDon,
    '/nhan-vien': renderNhanVien,
    '/quan-tri': renderQuanTri
};

function layNguoiDungHienTai() {
    try {
        const duLieu = localStorage.getItem(KHOA_LUU_TRU.NGUOI_DUNG);
        return duLieu ? JSON.parse(duLieu) : null;
    } catch {
        return null;
    }
}

function capNhatGiaoDienNguoiDung() {
    const nguoiDung = layNguoiDungHienTai();
    const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);

    const thanhBen = document.getElementById('thanh-ben');
    const dauTrang = document.getElementById('dau-trang');

    if (!token || !nguoiDung) {
        thanhBen.style.display = 'none';
        dauTrang.style.display = 'none';
        return;
    }

    thanhBen.style.display = 'flex';
    dauTrang.style.display = 'flex';

    document.getElementById('nhan-vai-tro').textContent = nguoiDung.tenVaiTro || 'Nhân viên';
    document.getElementById('ten-nguoi-dung').textContent = nguoiDung.hoTen || nguoiDung.tenDangNhap;

    // Phân quyền hiển thị menu
    const vaiTro = nguoiDung.vaiTro;
    const linkNhanVien = document.getElementById('link-nhan-vien');
    const linkQuanTri = document.getElementById('link-quan-tri');

    if (linkNhanVien) {
        linkNhanVien.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
    if (linkQuanTri) {
        linkQuanTri.parentElement.style.display = vaiTro === 'quan_ly' ? 'block' : 'none';
    }
}

function dieuHuong() {
    const hash = window.location.hash.slice(1) || '/so-do-ban';
    const duongDan = hash.split('?')[0];

    const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
    if (!token && duongDan !== '/dang-nhap') {
        window.location.hash = '#/dang-nhap';
        return;
    }

    if (token && duongDan === '/dang-nhap') {
        window.location.hash = '#/so-do-ban';
        return;
    }

    capNhatGiaoDienNguoiDung();

    // Đánh dấu active trên sidebar
    document.querySelectorAll('.menu-dieu-huong a').forEach(a => {
        if (a.getAttribute('href') === `#${duongDan}`) {
            a.classList.add('kich-hoat');
        } else {
            a.classList.remove('kich-hoat');
        }
    });

    const vungChinh = document.getElementById('noi-dung-chinh');
    const hamRender = tuyenDuong[duongDan] || renderQuanLyBanQr;
    hamRender(vungChinh);
}

// Xử lý sự kiện đăng xuất
document.getElementById('nut-dang-xuat').addEventListener('click', () => {
    localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
    localStorage.removeItem(KHOA_LUU_TRU.NGUOI_DUNG);
    window.location.hash = '#/dang-nhap';
});

window.addEventListener('hashchange', dieuHuong);
window.addEventListener('DOMContentLoaded', dieuHuong);

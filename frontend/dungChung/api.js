import { KHOA_LUU_TRU } from './hangSo.js';

export async function goiApi(duongDan, tuyChon = {}) {
    const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
    const headers = { ...tuyChon.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(tuyChon.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (tuyChon.body && typeof tuyChon.body === 'object') {
            tuyChon.body = JSON.stringify(tuyChon.body);
        }
    }

    const cauHinh = {
        ...tuyChon,
        headers
    };

    try {
        const phanHoi = await fetch(duongDan, cauHinh);
        const duLieu = await phanHoi.json();

        if (!phanHoi.ok) {
            if (phanHoi.status === 401) {
                localStorage.removeItem(KHOA_LUU_TRU.TOKEN);
                localStorage.removeItem(KHOA_LUU_TRU.NGUOI_DUNG);
                window.location.hash = '#/dang-nhap';
            }
            throw new Error(duLieu.msg || 'Yêu cầu không thành công');
        }

        return duLieu;
    } catch (loi) {
        console.error(`Lỗi gọi API [${duongDan}]:`, loi);
        throw loi;
    }
}

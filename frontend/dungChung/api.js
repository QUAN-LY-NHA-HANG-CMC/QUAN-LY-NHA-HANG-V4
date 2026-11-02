import { KHOA_LUU_TRU } from './hangSo.js';

export async function goiApi(duongDan, thamSo2 = {}, thamSo3 = null) {
    // 1. Tự động thêm tiền tố /api nếu chưa có
    let url = duongDan;
    if (!url.startsWith('/api') && !url.startsWith('http')) {
        url = '/api' + (url.startsWith('/') ? '' : '/') + url;
    }

    let tuyChon = {};
    if (typeof thamSo2 === 'string') {
        // Hỗ trợ cú pháp goiApi(url, 'POST', data)
        tuyChon = {
            method: thamSo2.toUpperCase(),
            body: thamSo3
        };
    } else {
        // Hỗ trợ cú pháp goiApi(url, { method: 'POST', body: data })
        tuyChon = { ...thamSo2 };
    }

    const token = localStorage.getItem(KHOA_LUU_TRU.TOKEN);
    const headers = { ...tuyChon.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (tuyChon.body && !(tuyChon.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (typeof tuyChon.body === 'object') {
            tuyChon.body = JSON.stringify(tuyChon.body);
        }
    }

    const cauHinh = {
        ...tuyChon,
        headers
    };

    try {
        const phanHoi = await fetch(url, cauHinh);
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
        console.error(`Lỗi gọi API [${url}]:`, loi);
        throw loi;
    }
}

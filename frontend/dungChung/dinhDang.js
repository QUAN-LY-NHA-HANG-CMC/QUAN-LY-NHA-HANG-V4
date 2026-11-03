/**
 * Tiện ích định dạng hiển thị
 */

export function dinhDangTien(soTien) {
    if (soTien === undefined || soTien === null || isNaN(soTien)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien);
}

export function dinhDangNgayGio(chuoiNgay) {
    if (!chuoiNgay) return '';
    const ngay = new Date(chuoiNgay);
    return ngay.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

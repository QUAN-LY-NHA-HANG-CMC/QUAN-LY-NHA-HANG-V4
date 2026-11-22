// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// TIỆN ÍCH ĐỒNG BỘ ĐƯỜNG DẪN URL TRÌNH DUYỆT (HTML5 HISTORY API)
// ============================================================================

/**
 * Đọc giá trị tham số từ URL hiện tại
 * @param {string} tenThamSo - Tên tham số query (ví dụ: 'phanHe', 'tab', 'subTab')
 * @param {string} giaTriMacDinh - Giá trị dự phòng nếu không tìm thấy
 * @returns {string} Giá trị tìm được hoặc giá trị mặc định
 */
export function layThamSoUrl(tenThamSo, giaTriMacDinh = '') {
  try {
    const params = new URLSearchParams(window.location.search);
    const giaTri = params.get(tenThamSo);
    return giaTri !== null ? giaTri : giaTriMacDinh;
  } catch (e) {
    return giaTriMacDinh;
  }
}

/**
 * Cập nhật đường dẫn URL trên thanh địa chỉ trình duyệt mà không reload trang
 * @param {Object} cacThamSo - Danh sách tham số cần thêm/sửa/xóa (truyền null/undefined để xóa)
 * @param {boolean} ghiDe - true nếu dùng replaceState (thay thế URL hiện tại), false nếu dùng pushState (tạo lịch sử Back/Forward)
 */
export function capNhatUrl(cacThamSo = {}, ghiDe = false) {
  try {
    const url = new URL(window.location.href);
    Object.entries(cacThamSo).forEach(([khoa, giaTri]) => {
      if (giaTri === null || giaTri === undefined || giaTri === '') {
        url.searchParams.delete(khoa);
      } else {
        url.searchParams.set(khoa, giaTri);
      }
    });

    const urlMoi = `${url.pathname}${url.search}${url.hash}`;
    if (ghiDe) {
      window.history.replaceState({ ...window.history.state, ...cacThamSo }, '', urlMoi);
    } else {
      window.history.pushState({ ...window.history.state, ...cacThamSo }, '', urlMoi);
    }
  } catch (e) {
    console.warn('Lỗi cập nhật URL trình duyệt:', e);
  }
}

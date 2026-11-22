// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// MODULE GỌI API BACKEND CHUẨN HÓA VÀ QUẢN LÝ TOKEN
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  layToken() {
    return localStorage.getItem('token_quan_moc') || '';
  },

  luuToken(token) {
    if (token) {
      localStorage.setItem('token_quan_moc', token);
    } else {
      localStorage.removeItem('token_quan_moc');
    }
  },

  layNguoiDung() {
    try {
      const data = localStorage.getItem('nguoi_dung_quan_moc');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  luuNguoiDung(nguoiDung) {
    if (nguoiDung) {
      localStorage.setItem('nguoi_dung_quan_moc', JSON.stringify(nguoiDung));
    } else {
      localStorage.removeItem('nguoi_dung_quan_moc');
    }
  },

  dangXuat() {
    localStorage.removeItem('token_quan_moc');
    localStorage.removeItem('nguoi_dung_quan_moc');
  },

  async yeuCau(duongDan, tuyChon = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...tuyChon.headers
    };

    const token = this.layToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...tuyChon,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(`${BASE_URL}${duongDan}`, config);
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        if (res.status === 401 && !duongDan.includes('/dang-nhap')) {
          this.dangXuat();
        }
        throw new Error(data.msg || `Lỗi máy chủ (${res.status})`);
      }

      return data.data;
    } catch (err) {
      console.error(`[API Error] ${duongDan}:`, err.message);
      throw err;
    }
  },

  get(duongDan, headers = {}) {
    return this.yeuCau(duongDan, { method: 'GET', headers });
  },

  post(duongDan, body = {}, headers = {}) {
    return this.yeuCau(duongDan, { method: 'POST', body, headers });
  },

  put(duongDan, body = {}, headers = {}) {
    return this.yeuCau(duongDan, { method: 'PUT', body, headers });
  },

  delete(duongDan, headers = {}) {
    return this.yeuCau(duongDan, { method: 'DELETE', headers });
  }
};

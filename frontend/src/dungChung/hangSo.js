// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// HẰNG SỐ CHUNG TOÀN ỨNG DỤNG FRONTEND
// ============================================================================

export const VAI_TRO = {
  QUAN_LY: 'quan_ly',
  THU_NGAN: 'thu_ngan',
  BEP: 'bep',
  PHUC_VU: 'phuc_vu',
  KHACH_HANG: 'khach_hang'
};

export const NHAN_VAI_TRO = {
  [VAI_TRO.QUAN_LY]: 'Quản Lý Nhà Hàng',
  [VAI_TRO.THU_NGAN]: 'Thu Ngân',
  [VAI_TRO.BEP]: 'Đầu Bếp KDS',
  [VAI_TRO.PHUC_VU]: 'Nhân Viên Phục Vụ'
};

export const TRANG_THAI_BAN = {
  TRONG: 'trong',
  CO_KHACH: 'co_khach',
  CHO_MON: 'cho_mon',
  YEU_CAU_THANH_TOAN: 'yeu_cau_thanh_toan',
  CAN_DON_DEP: 'can_don_dep'
};

export const NHAN_TRANG_THAI_BAN = {
  [TRANG_THAI_BAN.TRONG]: { nhan: 'Bàn trống', mau: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  [TRANG_THAI_BAN.CO_KHACH]: { nhan: 'Đang dùng bữa', mau: 'bg-blue-50 text-blue-700 border-blue-200' },
  [TRANG_THAI_BAN.CHO_MON]: { nhan: 'Đang chờ món', mau: 'bg-amber-50 text-amber-700 border-amber-200' },
  [TRANG_THAI_BAN.YEU_CAU_THANH_TOAN]: { nhan: 'Gọi thanh toán', mau: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' },
  [TRANG_THAI_BAN.CAN_DON_DEP]: { nhan: 'Chờ dọn bàn', mau: 'bg-stone-100 text-stone-600 border-stone-300' }
};

export const TRANG_THAI_MON = {
  CHO_DUYET: 'cho_duyet',
  DANG_NAU: 'dang_nau',
  HOAN_THANH: 'hoan_thanh',
  DA_PHUC_VU: 'da_phuc_vu',
  DA_HUY: 'da_huy'
};

export const NHAN_TRANG_THAI_MON = {
  [TRANG_THAI_MON.CHO_DUYET]: { nhan: 'Chờ duyệt', mau: 'bg-amber-100 text-amber-800' },
  [TRANG_THAI_MON.DANG_NAU]: { nhan: 'Đang nấu', mau: 'bg-orange-100 text-orange-800' },
  [TRANG_THAI_MON.HOAN_THANH]: { nhan: 'Nấu xong · Chờ bưng', mau: 'bg-emerald-100 text-emerald-800' },
  [TRANG_THAI_MON.DA_PHUC_VU]: { nhan: 'Đã lên bàn', mau: 'bg-stone-100 text-stone-600' },
  [TRANG_THAI_MON.DA_HUY]: { nhan: 'Đã hủy', mau: 'bg-rose-100 text-rose-700' }
};

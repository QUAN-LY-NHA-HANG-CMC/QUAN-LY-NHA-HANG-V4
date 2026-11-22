// ============================================================================
// DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
// DỮ LIỆU MẪU ĐỒNG BỘ 100% THEO THIẾT KẾ FIGMA (FILE KEY: D3c38R5RHlUvi74GtryQ17)
// ============================================================================

export const DU_LIEU_NHA_HANG = {
  ten: 'Quán Mộc - Ẩm Thực Việt Đương Đại',
  chiNhanh: 'Chi nhánh Thảo Điền',
  diaChi: '68 Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
  hotline: '1900 6868',
  gioMoCua: '10:00 - 22:30',
  trangThaiMoCua: 'Đang mở cửa · 22:00',
  wifi: { ten: 'QuanMoc_Guest', matKhau: 'mocdining2026' },
  nganHang: {
    tenNganHang: 'Vietcombank',
    soTaiKhoan: '0071000888999',
    chuTaiKhoan: 'CONG TY TNHH AM THUC MOC'
  }
};

export const DANH_MUC_THUC_DON = [
  { id: 'all', ma: 'tat_ca', ten: 'Tất cả', bieuTuong: '🍽️' },
  { id: '1', ma: 'khai_vi', ten: 'Khai vị', bieuTuong: '🥗' },
  { id: '2', ma: 'mon_chinh', ten: 'Món chính', bieuTuong: '🥩' },
  { id: '3', ma: 'do_uong', ten: 'Đồ uống', bieuTuong: '🍹' },
  { id: '4', ma: 'trang_mieng', ten: 'Tráng miệng', bieuTuong: '🍨' }
];

export const DANH_SACH_MON_AN = [
  {
    id: 1,
    ma_mon: 'BLL-01',
    ten_mon: 'Bò lúc lắc',
    gia: 189000,
    danh_muc_id: '2',
    danh_muc_ten: 'Món chính',
    nhan: 'Bán chạy · Bếp nóng',
    mo_ta: 'Thăn bò áp chảo mềm mọng, ớt chuông giòn ngọt, hành tây tím, dùng cùng sốt tiêu đen đặc chế và khoai tây múi cau.',
    di_ung: 'Có đậu nành và tiêu đen. Vui lòng báo nhân viên nếu bạn dị ứng bột nêm hoặc bơ tỏi.',
    tram_bep: 'bep_nong',
    thoi_gian_nau: 15,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    ma_mon: 'GNS-01',
    ten_mon: 'Gỏi ngó sen tôm',
    gia: 89000,
    danh_muc_id: '1',
    danh_muc_ten: 'Khai vị',
    nhan: 'Gợi ý từ bếp · Khai vị',
    mo_ta: 'Ngó sen Đồng Tháp tươi giòn, tôm sú luộc mọng nước, thịt ba chỉ xắt mỏng, rau răm, lạc rang giòn quyện nước mắm chua ngọt thanh.',
    di_ung: 'Có đậu phộng (lạc), tôm giáp xác. Có thể làm phần không lạc theo yêu cầu.',
    tram_bep: 'bep_lanh',
    thoi_gian_nau: 8,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    ma_mon: 'CCHS-01',
    ten_mon: 'Cơm chiên hải sản',
    gia: 129000,
    danh_muc_id: '2',
    danh_muc_ten: 'Món chính',
    nhan: 'Món chính · 15 phút',
    mo_ta: 'Hạt cơm thơm dẻo đảo vàng ươm, mực ống giòn sần sật, tôm tươi, trứng muối bùi béo và cọng hành hoa xanh mướt.',
    di_ung: 'Có hải sản tôm mực, trứng gia cầm.',
    tram_bep: 'bep_nong',
    thoi_gian_nau: 15,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    ma_mon: 'TDCS-01',
    ten_mon: 'Trà đào cam sả',
    gia: 45000,
    danh_muc_id: '3',
    danh_muc_ten: 'Đồ uống',
    nhan: 'Đồ uống · Tươi mát',
    mo_ta: 'Trà lài ủ lạnh thơm thanh, miếng đào ngâm giòn ngọt, cam vàng mọng nước và hương thơm nhẹ dịu từ nhánh sả tươi thanh lọc.',
    di_ung: 'Không có chất gây dị ứng thông thường.',
    tram_bep: 'bar_pha_che',
    thoi_gian_nau: 5,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    ma_mon: 'LTC-01',
    ten_mon: 'Lẩu tôm chua cay',
    gia: 299000,
    danh_muc_id: '2',
    danh_muc_ten: 'Món chính',
    nhan: 'Bán chạy · Nhóm',
    mo_ta: 'Nước lẩu ninh xương ống thơm ngát hương lá chúc và riềng tươi, tôm càng xanh tươi rói ăn kèm bún tươi và rau miệt vườn.',
    di_ung: 'Có hải sản tôm, ớt cay.',
    tram_bep: 'bep_nong',
    thoi_gian_nau: 20,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    ma_mon: 'CG-01',
    ten_mon: 'Chả giò Mộc truyền thống',
    gia: 79000,
    danh_muc_id: '1',
    danh_muc_ten: 'Khai vị',
    nhan: 'Món ăn kèm',
    mo_ta: 'Vỏ ram giòn rụm bọc nhân thịt nạc vai, mộc nhĩ, miến dong và tôm đất, chấm sốt tương ớt chua ngọt thủ công.',
    di_ung: 'Có trứng, thịt lợn, tôm.',
    tram_bep: 'bep_nong',
    thoi_gian_nau: 10,
    con_hang: true,
    hinh_anh: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'
  }
];

export const COMBO_GOI_Y = {
  ma: 'COMBO-SUM-VAY',
  ten: 'Combo sum vầy · 4 người',
  tagline: 'CÙNG NHAU THƯỞNG THỨC',
  giaGoc: 679000,
  giaKhuyenMai: 599000,
  tietKiem: 80000,
  moTa: 'Gồm 1 Bò lúc lắc, 1 Gỏi ngó sen tôm, 1 Cơm chiên hải sản, 4 Trà đào cam sả.',
  hinh_anh: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
};

export const DANH_SACH_BAN = [
  { ma_ban: 'B01', ten_ban: 'Bàn 01', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'B02', ten_ban: 'Bàn 02', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'co_khach', thoi_gian_vao: '19:15', so_khach: 3, tam_tinh: 412000 },
  { ma_ban: 'B03', ten_ban: 'Bàn 03', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'cho_mon', thoi_gian_vao: '19:10', so_khach: 2, tam_tinh: 278000 },
  { ma_ban: 'B04', ten_ban: 'Bàn 04', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'yeu_cau_thanh_toan', thoi_gian_vao: '18:40', so_khach: 4, tam_tinh: 685000 },
  { ma_ban: 'B05', ten_ban: 'Bàn 05', khu_vuc: 'Tầng 1', so_cho: 2, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'B06', ten_ban: 'Bàn 06', khu_vuc: 'Tầng 1', so_cho: 6, trang_thai: 'can_don_dep', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'B07', ten_ban: 'Bàn 07', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'co_khach', thoi_gian_vao: '19:20', so_khach: 4, tam_tinh: 540000 },
  { ma_ban: 'B08', ten_ban: 'Bàn 08', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'co_khach', thoi_gian_vao: '19:08', so_khach: 4, tam_tinh: 776000, hoa_don_ma: 'HD-0819' },
  { ma_ban: 'B09', ten_ban: 'Bàn 09', khu_vuc: 'Tầng 1', so_cho: 8, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'B10', ten_ban: 'Bàn 10', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'cho_mon', thoi_gian_vao: '19:30', so_khach: 3, tam_tinh: 380000 },
  { ma_ban: 'B11', ten_ban: 'Bàn 11', khu_vuc: 'Tầng 1', so_cho: 4, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'B12', ten_ban: 'Bàn 12', khu_vuc: 'Tầng 1', so_cho: 6, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  // Tầng 2 & Sân vườn
  { ma_ban: 'T2-01', ten_ban: 'Bàn 201', khu_vuc: 'Tầng 2', so_cho: 4, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 },
  { ma_ban: 'T2-02', ten_ban: 'Bàn 202', khu_vuc: 'Tầng 2', so_cho: 6, trang_thai: 'co_khach', thoi_gian_vao: '19:00', so_khach: 5, tam_tinh: 920000 },
  { ma_ban: 'SV-01', ten_ban: 'Sân Vườn 01', khu_vuc: 'Sân vườn', so_cho: 4, trang_thai: 'co_khach', thoi_gian_vao: '18:50', so_khach: 4, tam_tinh: 610000 },
  { ma_ban: 'SV-02', ten_ban: 'Sân Vườn 02', khu_vuc: 'Sân vườn', so_cho: 8, trang_thai: 'trong', thoi_gian_vao: null, so_khach: 0, tam_tinh: 0 }
];

export const DON_MAU_BAN_08 = {
  ma_don: 'ORD-081',
  ma_ban: 'B08',
  ten_ban: 'Bàn 08',
  thoi_gian: '19:25',
  phuc_vu_phu_trach: 'Nguyễn Thị Lan',
  so_khach: 4,
  trang_thai: 'cho_duyet',
  chi_tiet: [
    { id: 101, mon_id: 1, ten_mon: 'Bò lúc lắc', so_luong: 2, don_gia: 189000, thanh_tien: 378000, ghi_chu: 'Ít cay, thịt chín vừa', trang_thai: 'dang_nau' },
    { id: 102, mon_id: 2, ten_mon: 'Gỏi ngó sen tôm', so_luong: 1, don_gia: 89000, thanh_tien: 89000, ghi_chu: 'Không hành', trang_thai: 'hoan_thanh' },
    { id: 103, mon_id: 3, ten_mon: 'Cơm chiên hải sản', so_luong: 1, don_gia: 129000, thanh_tien: 129000, ghi_chu: 'Không có ghi chú', trang_thai: 'cho_duyet' },
    { id: 104, mon_id: 4, ten_mon: 'Trà đào cam sả', so_luong: 4, don_gia: 45000, thanh_tien: 180000, ghi_chu: 'Ít ngọt, ít đá', trang_thai: 'da_phuc_vu' }
  ],
  tong_tien_mon: 776000,
  thue_vat: 62080, // 8% VAT
  tong_cong: 838080
};

export const DANH_SACH_NHAN_SU = [
  {
    id: 1,
    ma_nv: 'NV-001',
    ho_ten: 'Nguyễn Minh Anh',
    ten_dang_nhap: 'admin',
    vai_tro: 'quan_ly',
    vai_tro_ten: 'Quản Lý Nhà Hàng',
    so_dien_thoai: '0901 234 567',
    email: 'minhanh.nguyen@quanmoc.vn',
    khu_vuc_phu_trach: 'Toàn nhà hàng',
    trang_thai: 'dang_lam_viec',
    ngay_vao_lam: '15/01/2024'
  },
  {
    id: 2,
    ma_nv: 'NV-002',
    ho_ten: 'Trần Ngọc Mai',
    ten_dang_nhap: 'thungan',
    vai_tro: 'thu_ngan',
    vai_tro_ten: 'Thu Ngân',
    so_dien_thoai: '0902 345 678',
    email: 'ngocmai.tran@quanmoc.vn',
    khu_vuc_phu_trach: 'Quầy thu ngân 01',
    trang_thai: 'dang_lam_viec',
    ngay_vao_lam: '20/03/2024'
  },
  {
    id: 3,
    ma_nv: 'NV-003',
    ho_ten: 'Lê Quốc Huy',
    ten_dang_nhap: 'bep',
    vai_tro: 'bep',
    vai_tro_ten: 'Bếp Trưởng / KDS',
    so_dien_thoai: '0903 456 789',
    email: 'quochuy.le@quanmoc.vn',
    khu_vuc_phu_trach: 'Bếp nóng · Trạm 01',
    trang_thai: 'dang_lam_viec',
    ngay_vao_lam: '10/02/2024'
  },
  {
    id: 4,
    ma_nv: 'NV-004',
    ho_ten: 'Nguyễn Thị Lan',
    ten_dang_nhap: 'phucvu',
    vai_tro: 'phuc_vu',
    vai_tro_ten: 'Nhân Viên Phục Vụ',
    so_dien_thoai: '0904 567 890',
    email: 'lan.nguyen@quanmoc.vn',
    khu_vuc_phu_trach: 'Tầng 1 · Bàn 01–12',
    trang_thai: 'dang_lam_viec',
    ngay_vao_lam: '05/05/2024'
  }
];

export const PHIEU_BEP_KDS = [
  {
    id: 'TICKET-01',
    ma_don: 'ORD-081',
    ma_ban: 'B08',
    loai: 'Bình thường',
    thoi_gian_tao: '19:25',
    thoi_gian_cho_phut: 17,
    muc_do: 'tre', // binh_thuong, chu_y, tre
    mon_an: [
      { id: 1, ten_mon: 'Bò lúc lắc', so_luong: 2, ghi_chu: 'Ít cay, chín vừa', trang_thai: 'dang_nau', phut_con_lai: 4 },
      { id: 2, ten_mon: 'Gỏi ngó sen tôm', so_luong: 1, ghi_chu: 'Không hành', trang_thai: 'hoan_thanh' }
    ]
  },
  {
    id: 'TICKET-02',
    ma_don: 'ORD-082',
    ma_ban: 'B03',
    loai: 'Ưu tiên',
    thoi_gian_tao: '19:30',
    thoi_gian_cho_phut: 12,
    muc_do: 'chu_y',
    mon_an: [
      { id: 3, ten_mon: 'Lẩu tôm chua cay', so_luong: 1, ghi_chu: 'Cay vừa, bún thêm', trang_thai: 'dang_nau', phut_con_lai: 8 }
    ]
  },
  {
    id: 'TICKET-03',
    ma_don: 'ORD-084',
    ma_ban: 'B10',
    loai: 'Bình thường',
    thoi_gian_tao: '19:38',
    thoi_gian_cho_phut: 4,
    muc_do: 'binh_thuong',
    mon_an: [
      { id: 4, ten_mon: 'Chả giò Mộc truyền thống', so_luong: 2, ghi_chu: 'Giòn, chiên kỹ', trang_thai: 'cho_nau', phut_con_lai: 10 }
    ]
  }
];

export const GOM_MON_KDS = [
  {
    ten_mon: 'Bò lúc lắc',
    tram: 'Bếp nóng',
    tong_so_luong: 5,
    chi_tiet: [
      { ban: 'B08', so_luong: 2, ghi_chu: 'Ít cay, chín vừa', thoi_gian_cho: '17p', trang_thai: 'dang_nau' },
      { ban: 'B02', so_luong: 2, ghi_chu: 'Bình thường', thoi_gian_cho: '9p', trang_thai: 'dang_nau' },
      { ban: 'SV-01', so_luong: 1, ghi_chu: 'Không tiêu', thoi_gian_cho: '3p', trang_thai: 'cho_nau' }
    ]
  },
  {
    ten_mon: 'Gỏi ngó sen tôm',
    tram: 'Bếp lạnh',
    tong_so_luong: 3,
    chi_tiet: [
      { ban: 'B08', so_luong: 1, ghi_chu: 'Không hành', thoi_gian_cho: '17p', trang_thai: 'hoan_thanh' },
      { ban: 'T2-02', so_luong: 2, ghi_chu: 'Nhiều lạc', thoi_gian_cho: '6p', trang_thai: 'dang_nau' }
    ]
  },
  {
    ten_mon: 'Cơm chiên hải sản',
    tram: 'Bếp nóng',
    tong_so_luong: 2,
    chi_tiet: [
      { ban: 'B08', so_luong: 1, ghi_chu: 'Không hành', thoi_gian_cho: '17p', trang_thai: 'cho_duyet' },
      { ban: 'B07', so_luong: 1, ghi_chu: 'Ít dầu mỡ', thoi_gian_cho: '5p', trang_thai: 'cho_nau' }
    ]
  }
];

export const CHI_DAO_BEP_KHAN_CAP = {
  ma: 'EMG-091',
  tieuDe: 'CHỈ ĐẠO GẤP BẮT BUỘC TỪ QUẢN LÝ',
  nguoiGui: 'Nguyễn Minh Anh (Quản lý)',
  thoiGian: '19:41',
  noiDung: 'Bàn 08 có khách VIP sắp đi đón tàu bay. Yêu cầu Bếp trưởng ưu tiên ra ngay 02 đĩa Bò lúc lắc trong vòng 5 phút!',
  trangThai: 'cho_xac_nhan',
  mucDo: 'rat_gap'
};

export const BAO_CAO_DOANH_THU_MAU = {
  doanhThuHomNay: 18450000,
  soHoaDon: 42,
  khachHang: 138,
  giaTriTrungBinh: 439000,
  tangTruongSoVoiHomQua: '+14.2%',
  kenhThanhToan: [
    { ten: 'VietQR / Ngân hàng', tiLe: 68, soTien: 12546000 },
    { ten: 'Tiền mặt', tiLe: 24, soTien: 4428000 },
    { ten: 'Thẻ POS / Khác', tiLe: 8, soTien: 1476000 }
  ],
  monBanChayNhat: [
    { ten: 'Bò lúc lắc', soLuong: 34, doanhThu: 6426000 },
    { ten: 'Gỏi ngó sen tôm', soLuong: 28, doanhThu: 2492000 },
    { ten: 'Trà đào cam sả', soLuong: 52, doanhThu: 2340000 },
    { ten: 'Cơm chiên hải sản', soLuong: 18, doanhThu: 2322000 }
  ]
};

export const NHAT_KY_KIEM_TOAN_MAU = [
  {
    id: 1,
    thoiGian: '19:35 · 19/11/2026',
    nguoiThucHien: 'Trần Ngọc Mai (Thu ngân)',
    hanhDong: 'TẠO_HÓA_ĐƠN',
    doiTuong: 'Bàn 08 · #HD-0819',
    chiTiet: 'In tạm tính hóa đơn trị giá 838.080đ cho 4 khách',
    mucDo: 'thong_thuong'
  },
  {
    id: 2,
    thoiGian: '19:28 · 19/11/2026',
    nguoiThucHien: 'Nguyễn Thị Lan (Phục vụ)',
    hanhDong: 'DUYỆT_ĐƠN_QR',
    doiTuong: 'Đơn #ORD-081',
    chiTiet: 'Xác nhận 4 món từ QR khách bàn 08 chuyển vào KDS',
    mucDo: 'thong_thuong'
  },
  {
    id: 3,
    thoiGian: '19:12 · 19/11/2026',
    nguoiThucHien: 'Nguyễn Minh Anh (Quản lý)',
    hanhDong: 'DUYỆT_HỦY_MÓN',
    doiTuong: 'Bàn 04 · Món Cơm chiên',
    chiTiet: 'Khách đổi ý muốn dùng bún thay thế. Đã xác nhận hủy trước khi chế biến.',
    mucDo: 'chu_y'
  },
  {
    id: 4,
    thoiGian: '18:50 · 19/11/2026',
    nguoiThucHien: 'Lê Quốc Huy (Bếp trưởng)',
    hanhDong: 'BÁO_HẾT_MÓN',
    doiTuong: 'Cá hồi áp chảo sốt chanh leo',
    chiTiet: 'Khóa món trên toàn hệ thống do kho hết phi lê cá tươi.',
    mucDo: 'canh_bao'
  }
];

export const DANH_GIA_KHACH_HANG_MAU = [
  {
    id: 1,
    ban: 'Bàn 08',
    ngay: '19/11/2026 · 19:40',
    soSao: 5,
    tieuDe: 'Rất hài lòng',
    noiDung: 'Bò lúc lắc rất mềm và thấm vị sốt tiêu. Gọi món qua QR rất tiện lợi và không phải chờ lâu.',
    nhan: ['Món ngon', 'Phục vụ nhanh', 'Không gian ấm cúng'],
    nguoiPhucVu: 'Nguyễn Thị Lan'
  },
  {
    id: 2,
    ban: 'Bàn 02',
    ngay: '19/11/2026 · 18:45',
    soSao: 4,
    tieuDe: 'Hài lòng',
    noiDung: 'Trà đào rất thơm mát. Lúc đông khách hơi ồn một chút nhưng nhân viên rất lễ phép.',
    nhan: ['Đồ uống ngon', 'Nhân viên nhiệt tình'],
    nguoiPhucVu: 'Nguyễn Thị Lan'
  }
];

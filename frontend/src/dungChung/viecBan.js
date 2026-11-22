import { api } from './api';

export const NHAN_VIEC_BAN = {
  ho_tro: 'Khách gọi hỗ trợ', duyet_qr: 'Đơn QR chờ duyệt',
  bung_mon: 'Món chờ bưng', don_ban: 'Bàn cần dọn'
};

export function tiepNhanViecBan(viec) {
  return api.put(`/api/ban-an/viec-ban/${viec.loai}/${viec.doi_tuong_id}/tiep-nhan`, { banId: viec.ban_id });
}

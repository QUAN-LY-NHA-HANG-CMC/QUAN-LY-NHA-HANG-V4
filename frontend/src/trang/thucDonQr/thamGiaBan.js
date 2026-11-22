import { useEffect, useState } from 'react';
import { api } from '../../dungChung/api';

function khoaTrinhDuyet() {
  const ten = 'quan_moc_khoa_thiet_bi';
  const cu = localStorage.getItem(ten);
  if (/^[a-f0-9]{64}$/.test(cu || '')) return cu;
  const khoa = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(ten, khoa);
  return khoa;
}

export function useThamGiaBan(banId, tokenBan, bat) {
  const [khoa] = useState(khoaTrinhDuyet);
  const [duLieu, setDuLieu] = useState(null);
  const [loi, setLoi] = useState('');
  const headers = { 'X-Table-Token': tokenBan, 'X-Device-Key': khoa };
  const url = `/api/ban-an/${banId}/tham-gia`;
  const phien = duLieu?.banId === banId ? duLieu : null;

  useEffect(() => {
    if (!bat || !banId || !tokenBan) return;
    let dung = false;
    let dangTai = false;
    let phienTuDong = null;
    const tai = async () => {
      if (dangTai) return;
      dangTai = true;
      try {
        let data = await api.get(url, headers);
        if (dung) return;
        if (data.trangThai === 'chua_gui' && phienTuDong === null) {
          const daGui = await api.post(url, { phienId: data.phienId }, headers);
          phienTuDong = daGui.phienId;
          data = daGui;
        } else if (data.phienId && phienTuDong === null) {
          phienTuDong = data.phienId;
        }
        if (!dung) setDuLieu({ ...data, banId, chenhGio: data.gioMayChu - Date.now() });
      } catch (err) {
        if (!dung) setLoi(err.message);
      } finally {
        dangTai = false;
      }
    };
    tai();
    const timer = setInterval(tai, 1500);
    return () => { dung = true; clearInterval(timer); };
  }, [bat, banId, tokenBan, khoa]);

  const thaoTac = async tai => {
    try {
      setLoi('');
      const data = await tai();
      setDuLieu({ ...data, banId, chenhGio: data.gioMayChu - Date.now() });
      return true;
    } catch (err) {
      setLoi(err.message);
      return false;
    }
  };
  return {
    phien, khoa, loi, headers,
    guiLai: () => thaoTac(() => api.post(url, { phienId: phien?.phienId }, headers)),
    quyetDinh: (id, chapNhan) => thaoTac(() => api.put(`${url}/${id}`, { chapNhan }, headers)),
    nhapMa: ma => thaoTac(() => api.post(`${url}/${phien.id}/ma`, { ma }, headers))
  };
}

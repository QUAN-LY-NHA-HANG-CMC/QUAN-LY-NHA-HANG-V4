const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');

async function kiemThuThamGiaBan({ baseUrl, db, headersQuanLy, headersThuNgan, headersBep }) {
    const request = async (url, headers, method = 'GET', body, code = 200) => {
        const res = await fetch(baseUrl + '/api' + url, { method, headers, body: body && JSON.stringify(body) });
        const json = await res.json();
        assert.equal(res.status, code, method + ' ' + url + ': ' + json.msg);
        return json.data;
    };
    const layBan = ma => db.prepare('SELECT * FROM ban_an WHERE ma_ban=?').get(ma);
    const ban = layBan('B11');
    const banKhac = layBan('B12');
    const duongBan = '/ban-an/' + ban.id;
    const url = duongBan + '/tham-gia';
    const urlGio = duongBan + '/gio-mon';
    const thietBi = (banChon = ban) => ({
        'Content-Type': 'application/json', 'X-Table-Token': banChon.ma_qr_token, 'X-Device-Key': randomBytes(32).toString('hex')
    });
    const A = thietBi(), B = thietBi(), C = thietBi(), X = thietBi();
    const trangThai = headers => request(url, headers);
    const gui = (headers, body = {}) => request(url, headers, 'POST', body);
    const duyet = (id, chapNhan = true, headers = A, code = 200) => request(url + '/' + id, headers, 'PUT', { chapNhan }, code);
    const nhapMa = (headers, id, ma, code = 200) => request(url + '/' + id + '/ma', headers, 'POST', { ma }, code);
    const docGio = headers => request(urlGio, headers);
    const suaGio = (headers, gio, body, code = 200) => request(urlGio, headers, 'PUT', {
        phienId: gio.phienId, phienSua: gio.phienSua, ...body
    }, code);
    const open = () => request(duongBan + '/mo-ban', headersThuNgan, 'POST', { soKhach: 2 }, 201);
    const grant = id => request(duongBan + '/thiet-bi-cho/' + id + '/chu', headersThuNgan, 'PUT');
    const log = (ids, note) => console.log('  [PASS] ' + ids + ' ' + note);
    const oMoc = async (moc, fn) => {
        const cu = Date.now;
        Date.now = () => moc;
        try { return await fn(); } finally { Date.now = cu; }
    };

    assert.equal((await trangThai(A)).trangThai, 'chua_mo');
    await request(url, X, 'POST', {}, 409);
    await open();
    const x = await gui(X);
    assert.equal(x.trangThai, 'cho_duyet');
    const a = await gui(A);
    await request(duongBan + '/thiet-bi-cho/' + x.id + '/chu', X, 'PUT', {}, 401);
    await grant(a.id);
    assert.equal((await trangThai(X)).trangThai, 'cho_duyet');
    assert.equal((await trangThai(A)).laChu, true);
    log('TC-01', 'QR ảnh lưu không tự cấp quyền và nhân viên chọn đúng thiết bị tại bàn');
    await duyet(x.id, false);

    const bCu = await gui(B);
    assert.equal(bCu.trangThai, 'cho_duyet');
    assert.equal((await trangThai(A)).yeuCau[0].id, bCu.id);
    assert.equal((await gui(B)).id, bCu.id);
    assert.equal((await trangThai(B)).id, bCu.id);
    const banGoc = { ...db.prepare('SELECT trang_thai FROM ban_an WHERE id=?').get(ban.id) };
    const dem = () => db.prepare('SELECT COUNT(*) AS dem FROM don_goi_mon WHERE phien_ban_id=?').get(a.phienId).dem;
    await request(urlGio, B, 'GET', null, 403);
    await request(urlGio, B, 'PUT', { phienId: a.phienId, phienSua: 0, monId: 1, soLuong: 1 }, 403);
    await request('/don-goi-mon', B, 'POST', { maQrToken: ban.ma_qr_token }, 403);
    await request('/don-goi-mon/ban/' + ban.id, B, 'GET', null, 403);
    await request(duongBan + '/ho-tro', B, 'POST', { loaiYeuCau: 'goi_phuc_vu' }, 403);
    await request('/hoa-don/tam-tinh/' + ban.id, B, 'GET', null, 403);
    assert.equal(dem(), 0);
    assert.deepEqual({ ...db.prepare('SELECT trang_thai FROM ban_an WHERE id=?').get(ban.id) }, banGoc);
    assert.equal(db.prepare('SELECT COUNT(*) AS dem FROM yeu_cau_ho_tro WHERE phien_ban_id=?').get(a.phienId).dem, 0);
    assert.equal(db.prepare('SELECT 1 FROM gio_mon_ban WHERE ban_an_id=?').get(ban.id), undefined);
    await duyet(bCu.id, false);
    assert.equal((await trangThai(B)).trangThai, 'tu_choi');
    await request(urlGio, B, 'GET', null, 403);
    log('TC-02–04, TC-10', 'yêu cầu xuất hiện, đọc lặp không tạo trùng, từ chối chặn toàn bộ quyền phiên');

    const [b, c] = await Promise.all([gui(B), gui(C)]);
    const lucDuyet = Date.now();
    const [b1, b2, c1] = await oMoc(lucDuyet, () => Promise.all([duyet(b.id), duyet(b.id), duyet(c.id)]));
    const moiB = b1.yeuCau.find(muc => muc.id === b.id);
    const moiC = c1.yeuCau.find(muc => muc.id === c.id);
    assert.equal(moiB.hetHan - lucDuyet, 40_000);
    assert.deepEqual((await trangThai(A)).yeuCau.find(muc => muc.id === b.id), moiB);
    assert.deepEqual(moiB, b2.yeuCau.find(muc => muc.id === b.id));
    assert.notEqual(moiB.maMoi, moiC.maMoi);
    const bNhap = await trangThai(B);
    assert.equal(bNhap.trangThai, 'cho_ma');
    assert.equal(bNhap.hetHan, moiB.hetHan);
    assert.ok(!JSON.stringify(bNhap).includes('"maMoi"'));
    assert.ok(!JSON.stringify(await trangThai(C)).includes('"maMoi"'));
    await nhapMa(C, b.id, moiB.maMoi, 403);
    const chapNhan = await oMoc(moiB.hetHan - 1, () => nhapMa(B, b.id, moiB.maMoi));
    assert.equal(chapNhan.trangThai, 'da_vao');
    await nhapMa(B, b.id, moiB.maMoi, 409);
    await oMoc(moiC.hetHan, async () => {
        await nhapMa(C, c.id, moiC.maMoi, 409);
        assert.equal((await trangThai(C)).trangThai, 'het_han');
    });
    assert.equal((await trangThai(C)).trangThai, 'cho_ma');
    log('TC-05, TC-06, TC-08, TC-09', 'mã riêng, chỉ chủ thấy mã, 39.999s đạt và 40s bị chặn');
    const got = await duyet(c.id);
    assert.equal(got.yeuCau.find(muc => muc.id === c.id).hetHan, moiC.hetHan);
    const sai = moiC.maMoi === '000000' ? '000001' : '000000';
    for (let lan = 1; lan <= 5; lan++) await nhapMa(C, c.id, sai, lan === 5 ? 429 : 400);
    await nhapMa({ ...C }, c.id, moiC.maMoi, 429);
    await request(url, C, 'POST', {}, 429);
    log('TC-07', 'khóa sau năm lần sai, khóa giữ nguyên khi tải lại hoặc gửi lại yêu cầu');

    const them = (headers, gio, n, note) => suaGio(headers, gio, { monId: 1, soLuong: n, ghiChu: note });
    const gioA = await them(A, await docGio(A), 2, 'Phần A');
    const gioB = await them(B, await docGio(B), 1, 'Phần B');
    const phanA = gioA.mon.find(muc => muc.cuaToi);
    const phanB = gioB.mon.find(muc => muc.cuaToi);
    assert.equal(gioB.mon.length, 2);
    assert.equal(gioB.mon.find(muc => !muc.cuaToi).ghi_chu, 'Phần A');
    assert.notEqual(phanA.dongId, phanB.dongId);
    await suaGio(B, gioB, { dongId: phanA.dongId, soLuong: 0 }, 403);
    await suaGio(B, gioB, { dongId: phanA.dongId, thayDoi: 1 }, 403);
    const sua = await suaGio(B, gioB, { dongId: phanB.dongId, soLuong: 2, ghiChu: 'B sửa' });
    assert.equal(sua.mon.find(muc => muc.cuaToi).ghi_chu, 'B sửa');
    const xoa = await suaGio(B, sua, { dongId: phanB.dongId, soLuong: 0 });
    assert.equal(xoa.mon.length, 1);
    assert.equal(xoa.mon[0].so_luong, 2);
    const gioA2 = await docGio(A), gioB2 = await docGio(B);
    db.prepare('UPDATE mon_an SET so_suat_con_lai=3 WHERE id=1').run();
    const [suaA, suaB] = await Promise.allSettled([them(A, gioA2, 3, 'Phần A'), them(B, gioB2, 1, 'Phần B')]);
    assert.equal([suaA, suaB].filter(kq => kq.status === 'fulfilled').length, 1);
    const tongGio = (await docGio(A)).mon.reduce((tong, mon) => tong + mon.so_luong, 0);
    assert.equal(tongGio, 3);
    await suaGio(B, await docGio(B), { monId: 1, soLuong: 2, congThem: true }, 409);
    db.prepare('UPDATE mon_an SET so_suat_con_lai=20 WHERE id=1').run();

    const coPhanB = await them(B, await docGio(B), 1, 'Phần B');
    const khoa = randomUUID();
    const body = { maQrToken: ban.ma_qr_token, khoaGui: khoa, phienSuaGio: coPhanB.phienSua };
    await request('/don-goi-mon', B, 'POST', {
        ...body, danhSachMon: [{ monAnId: 1, soLuong: 100, ghiChu: 'Phần giả của A' }]
    }, 400);
    assert.equal(dem(), 0);
    const dat = await request('/don-goi-mon', B, 'POST', body, 201);
    const datLai = await request('/don-goi-mon', B, 'POST', body, 201);
    assert.equal(dat.donGoiMonId, datLai.donGoiMonId);
    assert.equal(dem(), 1);
    assert.equal(dat.trangThai, 'cho_duyet');
    const monDaGui = db.prepare('SELECT so_luong, ghi_chu FROM chi_tiet_don_mon WHERE don_goi_mon_id=?').get(dat.donGoiMonId);
    assert.deepEqual({ ...monDaGui }, { so_luong: 1, ghi_chu: 'Phần B' });
    assert.equal(db.prepare('SELECT so_suat_con_lai AS sl FROM mon_an WHERE id=1').get().sl, 19);
    assert.equal((await docGio(B)).mon.length, 1);
    assert.equal((await docGio(B)).mon[0].cuaToi, false);
    log('TC-11–15', 'phân quyền theo dòng, giới hạn số suất đồng thời, gửi đúng phần và chống trùng');
    await request('/don-goi-mon/' + dat.donGoiMonId + '/duyet', headersThuNgan, 'PUT', {});
    const theoDoi = await request('/don-goi-mon/ban/' + ban.id, A);
    assert.ok(theoDoi.danhSachMon.some(mon => mon.don_goi_mon_id === dat.donGoiMonId));
    db.prepare('UPDATE ban_an SET tu_dong_duyet_mon=1 WHERE id=?').run(ban.id);
    const tuDuyet = await request('/don-goi-mon', A, 'POST', {
        maQrToken: ban.ma_qr_token, khoaGui: randomUUID(), phienSuaGio: (await docGio(A)).phienSua
    }, 201);
    assert.equal(tuDuyet.trangThai, 'da_duyet');
    await request(duongBan + '/ho-tro', B, 'POST', { loaiYeuCau: 'goi_phuc_vu', noiDung: 'Kiểm thử' });
    await request(duongBan + '/ho-tro', B, 'POST', { loaiYeuCau: 'yeu_cau_thanh_toan', noiDung: 'Xin tính tiền' });
    assert.ok((await request('/hoa-don/tam-tinh/' + ban.id, B)).tongTienThanhToan > 0);
    await duyet(c.id, true, B, 403);
    await request('/hoa-don/tao-hoa-don', B, 'POST', { banId: ban.id }, 401);
    await request(duongBan + '/trang-thai', B, 'PUT', { trangThai: 'trong' }, 401);
    assert.equal((await trangThai({ ...B })).trangThai, 'da_vao');
    await request(urlGio, thietBi(), 'GET', null, 403);
    await request('/ban-an/' + banKhac.id + '/gio-mon', { ...B, 'X-Table-Token': banKhac.ma_qr_token }, 'GET', null, 403);
    log('TC-16–17', 'hỗ trợ, đọc bill, giới hạn quyền nhân viên, thiết bị và bàn độc lập');

    const docMon = async (headers, id) => (await request('/don-goi-mon/ban/' + ban.id, headers))
        .danhSachMon.find(mon => mon.chi_tiet_id === id);
    const urlHuy = id => '/don-goi-mon/ban/' + ban.id + '/chi-tiet/' + id + '/yeu-cau-huy';
    const guiHuy = (headers, id, code = 200, lyDo = 'Khách đổi ý') => request(urlHuy(id), headers, 'POST', { lyDo }, code);
    const xuLyHuy = (id, chapNhan, headers = headersThuNgan, code = 200, banId = ban.id) =>
        request('/don-goi-mon/ban/' + banId + '/yeu-cau-huy-khach/' + id, headers, 'PUT', { chapNhan }, code);
    const idMonB = db.prepare('SELECT id FROM chi_tiet_don_mon WHERE don_goi_mon_id=?').get(dat.donGoiMonId).id;
    const idMonA = db.prepare('SELECT id FROM chi_tiet_don_mon WHERE don_goi_mon_id=?').get(tuDuyet.donGoiMonId).id;
    assert.equal((await docMon(A, idMonB)).coQuyenYeuCauHuy, false);
    assert.equal((await docMon(B, idMonA)).coQuyenYeuCauHuy, false);
    assert.equal((await docMon(B, idMonB)).coQuyenYeuCauHuy, true);
    assert.equal((await docMon(A, idMonB)).thiet_bi_tao_id, undefined);
    await guiHuy(A, idMonB, 403);
    await guiHuy(B, idMonA, 403);
    await guiHuy(C, idMonB, 403);
    await guiHuy(B, idMonB, 400, '   ');
    const biTuChoi = await guiHuy(B, idMonB);
    assert.equal((await guiHuy(B, idMonB)).id, biTuChoi.id);
    assert.equal((await docMon(B, idMonB)).trang_thai_huy_khach, 'cho_phuc_vu');
    assert.equal((await docMon(B, idMonB)).coQuyenYeuCauHuy, false);
    assert.equal((await docMon(A, idMonB)).trang_thai_huy_khach, undefined);
    assert.equal((await docMon(headersThuNgan, idMonB)).id_yeu_cau_huy_khach, biTuChoi.id);
    const banCoHuy = (await request('/ban-an', headersThuNgan)).banAn.find(muc => muc.id === ban.id);
    assert.equal(banCoHuy.so_huy_mon_khach, 1);
    await xuLyHuy(biTuChoi.id, true, B, 401);
    await xuLyHuy(biTuChoi.id, true, headersThuNgan, 409, banKhac.id);
    await request('/hoa-don/tao-hoa-don', headersThuNgan, 'POST', { banId: ban.id }, 409);
    await xuLyHuy(biTuChoi.id, false);
    assert.equal((await docMon(B, idMonB)).trang_thai_huy_khach, 'tu_choi');
    assert.equal((await docMon(B, idMonB)).trang_thai_mon, 'cho_duyet');
    log('HỦY-01', 'thiết bị chỉ yêu cầu hủy món do mình đặt, chống gửi lặp, POS chặn khi phục vụ chưa xử lý');

    const guiTruocKhiNau = await guiHuy(B, idMonB);
    for (const trangThaiMoi of ['dang_nau', 'hoan_thanh']) {
        await request('/dieu-phoi-bep/chi-tiet/' + idMonB + '/trang-thai', headersBep, 'PUT', { trangThaiMoi });
    }
    const guiQuanLy = await xuLyHuy(guiTruocKhiNau.id, true);
    assert.equal(guiQuanLy.huyNgay, false);
    assert.ok(guiQuanLy.yeuCauId);
    assert.equal((await docMon(B, idMonB)).trang_thai_huy_khach, 'cho_admin_duyet');
    const quyetDinh = (id, chapNhan, headers = headersQuanLy, code = 200, lyDoTuChoi) =>
        request('/don-goi-mon/yeu-cau-huy-mon/' + id + '/phe-duyet', headers, 'PUT', { chapNhan, lyDoTuChoi }, code);
    await quyetDinh(guiQuanLy.yeuCauId, true, headersThuNgan, 403);
    await quyetDinh(guiQuanLy.yeuCauId, false, headersQuanLy, 400);
    await quyetDinh(guiQuanLy.yeuCauId, false, headersQuanLy, 400, '   ');
    assert.equal((await docMon(B, idMonB)).trang_thai_mon, 'yeu_cau_huy');
    const lyDo = 'Món đã chế biến theo yêu cầu';
    await quyetDinh(guiQuanLy.yeuCauId, false, headersQuanLy, 200, ' ' + lyDo + ' ');
    assert.equal((await docMon(B, idMonB)).trang_thai_mon, 'hoan_thanh');
    assert.equal((await docMon(B, idMonB)).trang_thai_huy_khach, 'tu_choi');
    assert.equal((await docMon(headersThuNgan, idMonB)).ly_do_quan_ly_tu_choi_huy, lyDo);
    assert.equal((await docMon(B, idMonB)).ly_do_quan_ly_tu_choi_huy, undefined);
    assert.equal(db.prepare('SELECT phan_hoi_admin FROM yeu_cau_huy_mon WHERE id=?').get(guiQuanLy.yeuCauId).phan_hoi_admin, lyDo);
    const phieuMoi = await guiHuy(B, idMonB);
    const chuyenLai = await xuLyHuy(phieuMoi.id, true);
    const tongTruoc = (await request('/hoa-don/tam-tinh/' + ban.id, A)).tongTienMon;
    await quyetDinh(chuyenLai.yeuCauId, true);
    assert.equal((await docMon(B, idMonB)).trang_thai_mon, 'da_huy');
    assert.equal((await docMon(B, idMonB)).coQuyenYeuCauHuy, false);
    assert.equal((await request('/hoa-don/tam-tinh/' + ban.id, A)).tongTienMon,
        tongTruoc - db.prepare('SELECT don_gia FROM chi_tiet_don_mon WHERE id=?').get(idMonB).don_gia);
    log('HỦY-02', 'bếp nấu xong trước khi phục vụ xử lý thì chuyển quản lý, từ chối trả về Chờ bưng, duyệt thì loại khỏi bill');

    db.prepare('UPDATE ban_an SET tu_dong_duyet_mon=0 WHERE id=?').run(ban.id);
    const giuTruoc = db.prepare('SELECT so_suat_con_lai AS sl FROM mon_an WHERE id=1').get().sl;
    let gioHuy = await them(B, await docGio(B), 1, 'Hủy từng món');
    gioHuy = await suaGio(B, gioHuy, { monId: 2, soLuong: 1 });
    const haiMon = await request('/don-goi-mon', B, 'POST', {
        maQrToken: ban.ma_qr_token, khoaGui: randomUUID(), phienSuaGio: gioHuy.phienSua
    }, 201);
    const cacMon = db.prepare('SELECT id FROM chi_tiet_don_mon WHERE don_goi_mon_id=? ORDER BY id').all(haiMon.donGoiMonId);
    const [monMot, monHai] = cacMon;
    const phieuDau = await guiHuy(B, monMot.id);
    assert.equal((await xuLyHuy(phieuDau.id, true)).huyNgay, true);
    await xuLyHuy(phieuDau.id, true, headersThuNgan, 409);
    assert.equal((await docMon(B, monHai.id)).trang_thai_mon, 'cho_duyet');
    assert.equal((await docMon(B, monHai.id)).trang_thai_don, 'cho_duyet');
    assert.equal(db.prepare('SELECT so_suat_con_lai AS sl FROM mon_an WHERE id=1').get().sl, giuTruoc);
    const phieuHai = await guiHuy(B, monHai.id);
    assert.equal((await xuLyHuy(phieuHai.id, true)).huyNgay, true);
    assert.equal((await docMon(B, monHai.id)).trang_thai_don, 'da_huy');
    assert.equal((await docMon(A, idMonA)).trang_thai_mon, 'cho_duyet');
    log('HỦY-03', 'hủy riêng từng dòng trước khi nấu, hoàn suất một lần, tự kết thúc đơn đã hủy hết món');

    const D = thietBi();
    const d = await gui(D);
    const moiD = (await duyet(d.id)).yeuCau.find(muc => muc.id === d.id);
    const bill = await request('/hoa-don/tao-hoa-don', headersThuNgan, 'POST', { banId: ban.id }, 201);
    const urlBill = '/hoa-don/ban/' + ban.id + '/hoa-don';
    const billB = await request(urlBill, B);
    await request('/hoa-don/' + bill.id + '/thanh-toan', B, 'POST', {}, 401);
    const chiTiet = (await request('/hoa-don/tam-tinh/' + ban.id, headersThuNgan)).chiTietXuLyMon;
    for (const mon of chiTiet.filter(muc => muc.trang_thai_don === 'da_duyet' &&
        ['cho_duyet', 'dang_nau', 'hoan_thanh'].includes(muc.trang_thai_mon))) {
        await request('/hoa-don/ban/' + ban.id + '/mon/' + mon.id + '/xu-ly', headersThuNgan, 'POST',
            { luaChon: mon.id === idMonA ? 'goi_mang_ve' : 'khong_lay', trangThai: mon.trang_thai_mon });
    }
    const thuDu = { soTien: bill.tong_tien_thanh_toan, phuongThuc: 'vietqr', maYeuCau: randomUUID() };
    assert.equal((await request('/hoa-don/' + bill.id + '/qr-mot-phan', headersThuNgan, 'POST', thuDu)).soTien, thuDu.soTien);
    await request('/hoa-don/' + bill.id + '/thu-mot-phan', headersThuNgan, 'POST', thuDu);
    assert.equal((await request('/hoa-don/tam-tinh/' + ban.id, headersThuNgan)).conPhaiThu, 0);
    assert.equal(db.prepare('SELECT trang_thai FROM phien_ban WHERE id=?').get(a.phienId).trang_thai, 'dang_hoat_dong');
    await docGio(B);
    const chot = await request('/hoa-don/' + bill.id + '/thanh-toan', headersThuNgan, 'POST',
        { phuongThucThanhToan: 'tien_mat', tienKhachDua: 0, soTienDuKien: 0 });
    assert.equal(chot.cacDotThu.length, 1);
    assert.equal(chot.cacDotThu[0].so_tien, thuDu.soTien);
    log('POS', 'thu đủ vẫn giữ bàn mở, chốt 0đ không tạo giao dịch trùng');
    const hangDoiSauThanhToan = await request('/dieu-phoi-bep/hang-doi', headersBep);
    assert.ok(hangDoiSauThanhToan.some(mon => mon.chi_tiet_id === idMonA));
    for (const trangThaiMoi of ['dang_nau', 'hoan_thanh']) {
        await request('/dieu-phoi-bep/chi-tiet/' + idMonA + '/trang-thai', headersBep, 'PUT', { trangThaiMoi });
    }
    await request('/hoa-don/chi-dao-mon/' + idMonA, headersBep, 'PUT', { buoc: 'bep' });
    log('POS', 'bếp tiếp tục chế biến và gói món mang về sau khi thanh toán đóng bàn');
    await nhapMa(D, d.id, moiD.maMoi, 403);
    await request(urlGio, A, 'GET', null, 403);
    await request(urlGio, B, 'PUT', { phienId: a.phienId, phienSua: 0, monId: 1, soLuong: 1 }, 403);
    await request('/don-goi-mon', B, 'POST', body, 403);
    await request(duongBan + '/ho-tro', B, 'POST', { loaiYeuCau: 'goi_phuc_vu' }, 403);
    await guiHuy(A, idMonA, 403);
    assert.equal((await request(urlBill, { ...B, 'X-Bill-Token': billB.billToken })).trang_thai, 'da_thanh_toan');
    await request(urlBill, { ...D, 'X-Bill-Token': billB.billToken }, 'GET', null, 403);
    await request(duongBan + '/trang-thai', headersThuNgan, 'PUT', { trangThai: 'trong' });
    await open();
    await request(url, A, 'POST', { phienId: a.phienId }, 409);
    assert.equal((await trangThai(A)).trangThai, 'chua_gui');
    await nhapMa(D, d.id, moiD.maMoi, 403);
    const aMoi = await gui(A);
    assert.notEqual(aMoi.phienId, a.phienId);
    assert.notEqual(aMoi.id, a.id);
    await grant(aMoi.id);
    assert.equal((await docGio(A)).mon.length, 0);
    const datHo = await request('/don-goi-mon', headersQuanLy, 'POST', { banId: ban.id, nguonTao: 'phuc_vu_dat_ho',
        danhSachMon: [{ monAnId: 1, soLuong: 1 }] }, 201);
    assert.equal(datHo.trangThai, 'da_duyet');
    const chiTietDatHo = db.prepare('SELECT id FROM chi_tiet_don_mon WHERE don_goi_mon_id=?').get(datHo.donGoiMonId).id;
    for (const trangThaiMoi of ['dang_nau', 'hoan_thanh', 'da_phuc_vu']) {
        await request('/dieu-phoi-bep/chi-tiet/' + chiTietDatHo + '/trang-thai',
            trangThaiMoi === 'da_phuc_vu' ? headersQuanLy : headersBep, 'PUT', { trangThaiMoi });
    }
    const yeuCau = await request('/don-goi-mon/huy-mon', headersThuNgan, 'POST',
        { chiTietDonMonId: chiTietDatHo, lyDoHuy: 'Khách xin hủy món cuối' });
    await request('/don-goi-mon/yeu-cau-huy-mon/' + yeuCau.yeuCauId + '/phe-duyet', headersQuanLy, 'PUT', { chapNhan: true });
    const billRong = await request('/hoa-don/tam-tinh/' + ban.id, headersThuNgan);
    assert.equal(billRong.coTheChotBillRong, true);
    const hdRong = await request('/hoa-don/tao-hoa-don', headersThuNgan, 'POST', { banId: ban.id }, 201);
    assert.equal(hdRong.tong_tien_thanh_toan, 0);
    const chotRong = await request('/hoa-don/' + hdRong.id + '/thanh-toan', headersThuNgan, 'POST',
        { tienKhachDua: 0, soTienDuKien: 0 });
    assert.deepEqual(chotRong.cacDotThu, []);
    assert.equal(db.prepare('SELECT trang_thai FROM ban_an WHERE id=?').get(ban.id).trang_thai, 'can_don_dep');
    log('POS', 'duyệt hủy món cuối đã bưng vẫn chốt bill 0đ và chuyển bàn sang cần dọn');
    log('TC-18–20', 'đóng phiên thu hồi quyền, bill đúng thiết bị và luồng nhân viên đặt hộ vẫn hoạt động');
}

module.exports = kiemThuThamGiaBan;


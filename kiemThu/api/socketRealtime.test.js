const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { io: Client } = require('socket.io-client');
const { khoiTaoSocket, phatSuKienBan, phatSuKienBep, phatSuKienThuNgan, dongSocket } = require('../../backend/cauHinh/cauHinhSocket.js');

let server;
let diaChiMayChu;

test.before(async () => {
    const app = express();
    server = http.createServer(app);
    khoiTaoSocket(server);

    await new Promise((resolve) => {
        server.listen(0, () => {
            const port = server.address().port;
            diaChiMayChu = `http://localhost:${port}`;
            resolve();
        });
    });
});

test.after(async () => {
    dongSocket();
    if (server) {
        if (server.closeAllConnections) {
            server.closeAllConnections();
        }
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Khách hàng tham gia room bàn và nhận thông báo trạng thái đơn thời gian thực', async () => {
    const clientKhach = Client(diaChiMayChu);

    await new Promise((resolve) => clientKhach.on('connect', resolve));

    // Tham gia phòng của bàn số 1 và chờ xác nhận
    await new Promise((resolve) => {
        clientKhach.emit('tham_gia_ban', { banId: 1, maPhien: 'PB_TEST' }, resolve);
    });

    const nhanThongBao = new Promise((resolve) => {
        clientKhach.on('cap_nhat_don_mon', (duLieu) => {
            resolve(duLieu);
        });
    });

    // Server phát sự kiện cho bàn số 1
    phatSuKienBan(1, 'cap_nhat_don_mon', {
        maDon: 'ORD_100',
        trangThai: 'dang_che_bien',
        thongDiep: 'Món ăn đang được bếp chế biến'
    });

    const ketQua = await nhanThongBao;
    assert.strictEqual(ketQua.maDon, 'ORD_100');
    assert.strictEqual(ketQua.trangThai, 'dang_che_bien');

    clientKhach.disconnect();
});

test('Nhà bếp và Thu ngân nhận được thông báo thời gian thực đúng phân quyền room', async () => {
    const clientBep = Client(diaChiMayChu);
    const clientThuNgan = Client(diaChiMayChu);

    await Promise.all([
        new Promise((resolve) => clientBep.on('connect', resolve)),
        new Promise((resolve) => clientThuNgan.on('connect', resolve))
    ]);

    // Chờ xác nhận đã join room
    await Promise.all([
        new Promise((resolve) => clientBep.emit('tham_gia_phong', { phong: 'bep' }, resolve)),
        new Promise((resolve) => clientThuNgan.emit('tham_gia_phong', { phong: 'thu_ngan' }, resolve))
    ]);

    let bepNhanNhamYeuCauThuNgan = false;
    clientBep.on('yeu_cau_thanh_toan', () => {
        bepNhanNhamYeuCauThuNgan = true;
    });

    const doiDonBep = new Promise((resolve) => {
        clientBep.on('don_mon_moi', (duLieu) => {
            if (duLieu.maDon === 'ORD_BEP_01') {
                resolve(true);
            }
        });
    });

    const doiThuNgan = new Promise((resolve) => {
        clientThuNgan.on('yeu_cau_thanh_toan', (duLieu) => {
            if (duLieu.banId === 5) {
                resolve(true);
            }
        });
    });

    // Phát sự kiện
    phatSuKienBep('don_mon_moi', { maDon: 'ORD_BEP_01', banId: 2, soLuongMon: 3 });
    phatSuKienThuNgan('yeu_cau_thanh_toan', { banId: 5, maPhien: 'PB_05', soTien: 250000 });

    const [nhanDonBep, nhanYeuCauThuNgan] = await Promise.all([doiDonBep, doiThuNgan]);

    assert.ok(nhanDonBep, 'Bếp phải nhận được đơn món mới');
    assert.ok(nhanYeuCauThuNgan, 'Thu ngân phải nhận được yêu cầu thanh toán');
    assert.strictEqual(bepNhanNhamYeuCauThuNgan, false, 'Bếp không được nhận nhầm sự kiện của thu ngân');

    clientBep.disconnect();
    clientThuNgan.disconnect();
});

/**
 * Tiện ích hiển thị thông báo (Toast Notification) thời gian thực
 */

function layHoacTaoKhungToast() {
    let khung = document.getElementById('khung-thong-bao-toast');
    if (!khung) {
        khung = document.createElement('div');
        khung.id = 'khung-thong-bao-toast';
        khung.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            max-width: 400px;
            width: calc(100% - 48px);
        `;
        document.body.appendChild(khung);
    }
    return khung;
}

function hienThiToast(noiDung, loai = 'thong_tin', thoiGian = 3500) {
    const khung = layHoacTaoKhungToast();
    const theToast = document.createElement('div');
    
    let mauNen = '#1e293b';
    let mauVien = '#334155';
    let icon = 'ℹ️';

    if (loai === 'thanh_cong') {
        mauNen = '#065f46';
        mauVien = '#059669';
        icon = '✅';
    } else if (loai === 'that_bai' || loai === 'loi') {
        mauNen = '#991b1b';
        mauVien = '#dc2626';
        icon = '❌';
    } else if (loai === 'canh_bao') {
        mauNen = '#92400e';
        mauVien = '#d97706';
        icon = '⚠️';
    }

    theToast.style.cssText = `
        pointer-events: auto;
        padding: 12px 16px;
        background-color: ${mauNen};
        color: #ffffff;
        border: 1px solid ${mauVien};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.25s ease-out;
        opacity: 0;
        transform: translateY(-12px);
    `;

    theToast.innerHTML = `
        <span style="font-size: 16px; flex-shrink: 0;">${icon}</span>
        <span style="flex: 1; word-break: break-word; line-height: 1.4;">${noiDung}</span>
    `;

    khung.appendChild(theToast);

    requestAnimationFrame(() => {
        theToast.style.opacity = '1';
        theToast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        theToast.style.opacity = '0';
        theToast.style.transform = 'translateY(-12px)';
        setTimeout(() => {
            if (theToast.parentNode) {
                theToast.parentNode.removeChild(theToast);
            }
        }, 250);
    }, thoiGian);
}

export const thongBao = {
    thanhCong(noiDung, thoiGian = 3500) {
        hienThiToast(noiDung, 'thanh_cong', thoiGian);
    },
    thatBai(noiDung, thoiGian = 4000) {
        hienThiToast(noiDung, 'that_bai', thoiGian);
    },
    canhBao(noiDung, thoiGian = 3500) {
        hienThiToast(noiDung, 'canh_bao', thoiGian);
    },
    thongTin(noiDung, thoiGian = 3000) {
        hienThiToast(noiDung, 'thong_tin', thoiGian);
    }
};

export function hienThongBao(noiDung, loai = 'thong_tin', thoiGian = 3500) {
    hienThiToast(noiDung, loai, thoiGian);
}

const QRCode = require('qrcode');

async function taoAnhQrBase64(noiDung, tuyChon = {}) {
    const cauHinh = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 300,
        color: {
            dark: '#1e293b',
            light: '#ffffff'
        },
        ...tuyChon
    };
    return await QRCode.toDataURL(noiDung, cauHinh);
}

async function taoMaQrSvg(noiDung, tuyChon = {}) {
    return await QRCode.toString(noiDung, { type: 'svg', ...tuyChon });
}

module.exports = {
    taoAnhQrBase64,
    taoMaQrSvg
};

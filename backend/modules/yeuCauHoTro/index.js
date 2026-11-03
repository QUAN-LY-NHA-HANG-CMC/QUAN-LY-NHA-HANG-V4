const yeuCauHoTroRoutes = require('./yeuCauHoTro.routes');
const yeuCauHoTroService = require('./yeuCauHoTro.service');
const yeuCauHoTroController = require('./yeuCauHoTro.controller');

module.exports = {
    yeuCauHoTroRoutes,
    yeuCauHoTroService,
    yeuCauHoTroController,
    router: yeuCauHoTroRoutes
};

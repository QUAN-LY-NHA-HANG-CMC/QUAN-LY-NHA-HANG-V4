/**
 * Điểm xuất công khai module vaiTro (Rule 4.7)
 */
const vaiTroRoutes = require('./vaiTro.routes');
const vaiTroService = require('./vaiTro.service');
const vaiTroModel = require('./vaiTro.model');

module.exports = {
    vaiTroRoutes,
    vaiTroService,
    vaiTroModel
};

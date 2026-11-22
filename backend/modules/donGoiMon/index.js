const router = require('./donGoiMon.routes');
const donGoiMonService = require('./donGoiMon.service');
const donGoiMonModel = require('./donGoiMon.model');
const donGoiMonController = require('./donGoiMon.controller');

module.exports = {
    router,
    donGoiMonRoutes: router,
    donGoiMonService,
    donGoiMonModel,
    donGoiMonController
};

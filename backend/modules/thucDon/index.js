const router = require('./thucDon.routes');
const thucDonService = require('./thucDon.service');
const thucDonModel = require('./thucDon.model');
const thucDonController = require('./thucDon.controller');

module.exports = {
    router,
    thucDonRoutes: router,
    thucDonService,
    thucDonModel,
    thucDonController
};

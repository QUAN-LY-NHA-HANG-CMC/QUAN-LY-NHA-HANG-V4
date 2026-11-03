const thucDonRoutes = require('./thucDon.routes');
const thucDonService = require('./thucDon.service');
const thucDonModel = require('./thucDon.model');

module.exports = {
    thucDonRoutes,
    thucDonService,
    thucDonModel,
    router: thucDonRoutes
};

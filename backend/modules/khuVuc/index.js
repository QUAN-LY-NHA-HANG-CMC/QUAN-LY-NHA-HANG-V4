const khuVucRoutes = require('./khuVuc.routes');
const khuVucService = require('./khuVuc.service');
const khuVucModel = require('./khuVuc.model');

module.exports = {
    khuVucRoutes,
    khuVucService,
    khuVucModel,
    router: khuVucRoutes
};

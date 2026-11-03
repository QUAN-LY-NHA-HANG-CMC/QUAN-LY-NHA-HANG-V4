/**
 * Định tuyến API cho Yêu cầu hỗ trợ tại bàn
 * Phụ trách: Minh (Backend Nghiệp vụ)
 */
const express = require('express');
const router = express.Router();
const yeuCauHoTroController = require('./yeuCauHoTro.controller.js');

router.post('/', yeuCauHoTroController.taoYeuCau);
router.put('/:id/tiep-nhan', yeuCauHoTroController.tiepNhanYeuCau);
router.get('/danh-sach', yeuCauHoTroController.layDanhSach);

module.exports = router;

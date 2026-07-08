const express = require('express');
const router = express.Router();
const schoolAdminProductsController = require('../controllers/schoolAdminProductsController');

// GET / - 获取本校商品列表 (相对于 /api/school-admin/products)
router.get('/', schoolAdminProductsController.getSchoolProducts);

// PUT /:productId/status - 更新商品状态 (相对于 /api/school-admin/products)
router.put('/:productId/status', schoolAdminProductsController.updateProductStatus);

// TODO: 添加获取商品详情、编辑商品、删除商品等路由

module.exports = router; 
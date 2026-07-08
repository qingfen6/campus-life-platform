/**
 * 集市路由
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { uploadProductImages, handleMulterError } = require('../../middleware/uploadMiddleware');
const {
  getProducts,
  getProductDetail,
  getCategories,
  addProduct,
  bargainProduct,
  getMyProducts
} = require('../../controllers/market/marketController');

// 公开路由
router.get('/products', getProducts);
router.get('/products/:id', getProductDetail);
router.get('/categories', getCategories);
router.get('/search', getProducts); // 复用产品列表接口处理搜索

// 需要登录的路由
// 使用新的上传中间件 - 允许上传多个文件字段
router.post('/products', protect, uploadProductImages.any(), handleMulterError, addProduct);
router.post('/bargain', protect, bargainProduct);
router.get('/my/products', protect, getMyProducts);

module.exports = router; 
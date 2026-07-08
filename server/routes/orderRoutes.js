// server/routes/orderRoutes.js
// 该文件定义了所有与订单处理相关的API路由

const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    confirmMockOrderPayment,
    markOrderAsShipped,
    // processOrderPayment, // 尚未完全实现，按需启用
    // completeOrder,     // 尚未完全实现，按需启用
} = require('../controllers/OrderController');

// 从实际路径导入认证中间件
const { protect } = require('../middleware/authMiddleware');

// --- 订单路由定义 ---

/**
 * @route   POST /api/orders
 * @desc    创建新订单
 * @access  Private
 */
router.post('/', protect, createOrder);

/**
 * @route   GET /api/orders/my
 * @desc    获取当前登录用户的订单列表 (作为买家或卖家)
 * @access  Private
 */
router.get('/my', protect, getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    根据ID获取特定订单详情
 * @access  Private (控制器内会校验用户是否为订单的买家或卖家)
 */
router.get('/:id', protect, getOrderById);

/**
 * @route   POST /api/orders/:orderId/confirm-mock-payment
 * @desc    用户确认模拟支付完成，触发后端实际模拟支付处理
 * @access  Private
 */
router.post('/:orderId/confirm-mock-payment', protect, confirmMockOrderPayment);

/**
 * @route   PUT /api/orders/:orderId/ship
 * @desc    卖家标记订单为已发货
 * @access  Private
 */
router.put('/:orderId/ship', protect, markOrderAsShipped);

// 其他未来可能需要的路由 (根据 OrderController 中的函数)
// router.post('/:id/pay', protect, processOrderPayment); // 用于处理特定订单的支付 (如果需要独立于创建流程)
// router.put('/:id/complete', protect, completeOrder); // 用于标记订单为完成

module.exports = router; 
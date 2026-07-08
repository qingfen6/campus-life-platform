/**
 * 通知路由配置
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../../controllers/notification/notificationController');

// 需要登录的路由
router.get('/', protect, getNotifications);
router.post('/read', protect, markAsRead);
router.post('/read-all', protect, markAllAsRead);

module.exports = router; 
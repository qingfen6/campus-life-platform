// 认证路由
const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/login - 管理员登录
router.post('/login', login);

// GET /api/auth/me - 获取当前登录用户信息
router.get('/me', protect, getMe);

module.exports = router; 
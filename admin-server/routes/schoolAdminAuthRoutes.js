const express = require('express');
const router = express.Router();
const schoolAdminAuthController = require('../controllers/schoolAdminAuthController');

// POST /api/school-admin/auth/login - 学校管理员登录
router.post('/login', schoolAdminAuthController.login);

// 未来可以添加其他路由，例如：
// router.post('/forgot-password', schoolAdminAuthController.forgotPassword);
// router.post('/reset-password', schoolAdminAuthController.resetPassword);

module.exports = router; 
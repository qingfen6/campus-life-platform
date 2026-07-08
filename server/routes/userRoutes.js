// 用户路由 - 定义用户相关的API端点
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/users/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/users/profile
 * @desc    获取当前登录用户信息
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

module.exports = router; 
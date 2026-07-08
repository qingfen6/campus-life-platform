/**
 * 认证中间件
 * 
 * 负责保护需要登录的路由，验证用户的JWT令牌
 * 目前仅实现了一个简单的中间件，用于演示
 */
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * 保护路由，要求用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
exports.protect = async (req, res, next) => {
  try {
    // 由于尚未实现完整的用户认证系统
    // 这里简单地模拟一个已登录用户
    req.user = {
      id: 1,
      username: '演示用户',
      role: 'user'
    };
    
    // 继续执行后续中间件
    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({
      success: false,
      message: '未授权，请登录',
      error: error.message
    });
  }
}; 
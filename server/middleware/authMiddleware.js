/**
 * 认证中间件
 * 
 * 实现JWT令牌验证和用户身份认证
 */
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const asyncHandler = require('express-async-handler');
const url = require('url');

/**
 * 保护路由中间件
 * 验证请求头中的token，提取用户ID并查询用户信息
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 从请求头获取令牌
      token = req.headers.authorization.split(' ')[1];

      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 从数据库获取用户信息
      const [users] = await pool.query(
        'SELECT user_id, username, email FROM users WHERE user_id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        res.status(401);
        throw new Error('未授权，用户不存在');
      }

      // 将用户信息添加到请求对象
      req.user = {
        id: users[0].user_id,
        name: users[0].username,
        email: users[0].email
      };

      next();
    } catch (error) {
      console.error('令牌验证失败:', error);
      res.status(401);
      throw new Error('未授权，令牌无效');
    }
  } else {
    res.status(401);
    throw new Error('未提供授权令牌');
  }
});

/**
 * WebSocket认证中间件
 * 验证URL中的token参数，提取用户ID并查询用户信息
 */
const authMiddleware = async (request, response, next) => {
  try {
    // 解析URL参数
    const { query } = url.parse(request.url, true);
    const token = query.token;
    
    console.log('WebSocket认证中间件 - 收到token:', token ? '有token' : '无token');
    
    if (!token) {
      console.log('WebSocket认证失败: 未提供token');
      return next();
    }
    
    // 验证令牌
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 从数据库获取用户信息
      const [users] = await pool.query(
        'SELECT user_id, username, email FROM users WHERE user_id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        console.log(`WebSocket认证失败: 用户ID ${decoded.id} 不存在`);
        return next();
      }
      
      // 将用户信息添加到请求对象
      request.user = {
        id: users[0].user_id,
        name: users[0].username,
        email: users[0].email
      };
      
      console.log(`WebSocket认证成功: 用户 ${users[0].username}(ID: ${users[0].user_id})`);
      next();
    } catch (error) {
      console.error('WebSocket令牌验证失败:', error);
      return next();
    }
  } catch (error) {
    console.error('WebSocket认证中间件错误:', error);
    return next();
  }
};

/**
 * 管理员权限中间件
 * 检查用户是否具有管理员权限
 */
const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('未授权，请先登录');
  }

  try {
    // 查询用户角色
    const [roles] = await pool.query(
      `SELECT r.role_name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [req.user.id]
    );

    // 检查是否有管理员角色
    const isAdmin = roles.some(role => role.role_name === 'admin');

    if (isAdmin) {
      next();
    } else {
      res.status(403);
      throw new Error('禁止访问，需要管理员权限');
    }
  } catch (error) {
    // 如果是我们主动设置的错误，直接抛出
    if (res.statusCode !== 200) {
      throw error;
    }
    // 否则设置状态码并抛出一个通用错误
    res.status(500);
    throw new Error('服务器错误，权限验证失败: ' + error.message);
  }
});

module.exports = { protect, admin, authMiddleware }; 
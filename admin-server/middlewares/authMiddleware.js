// 认证中间件
const { verifyToken } = require('../config/jwt');

// 校验JWT令牌
const protect = (req, res, next) => {
  try {
    // 从请求头中获取token
    const authHeader = req.headers.authorization;
    console.log('认证中间件 - 请求路径:', req.path);
    console.log('认证中间件 - Authorization头:', authHeader ? '存在' : '不存在');
    
    let token;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
      console.log('认证中间件 - 提取到令牌:', token.substring(0, 10) + '...');
    } else {
      console.log('认证中间件 - 未找到有效的Authorization头格式');
    }

    // 检查token是否存在
    if (!token) {
      console.log('认证中间件 - 未提供令牌，返回401未授权');
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌，请先登录'
      });
    }

    // 验证token
    try {
      const decoded = verifyToken(token);
      console.log('认证中间件 - 令牌验证成功:', decoded);

      // 将用户信息添加到请求对象中
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
      console.log('认证中间件 - 用户信息已添加到请求:', req.user);

      next();
    } catch (verifyError) {
      console.error('认证中间件 - 令牌验证失败:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期，请重新登录',
        error: verifyError.message
      });
    }
  } catch (error) {
    console.error('认证中间件 - 处理过程发生错误:', error);
    return res.status(401).json({
      success: false,
      message: '认证失败，请重新登录',
      error: error.message
    });
  }
};

// 校验用户角色
const authorize = (roles = ['admin']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 检查用户角色是否有权限
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '无权访问此资源'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
}; 
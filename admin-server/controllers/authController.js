// 认证控制器
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

// 固定的管理员账号
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // 实际应用中应当使用哈希密码

// 管理员登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('认证控制器 - 登录请求:', { username, password: '******' });

    // 检查用户名和密码是否匹配
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('认证控制器 - 认证失败: 用户名或密码错误');
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    console.log('认证控制器 - 认证成功, 准备生成令牌');
    
    // 生成JWT令牌
    const token = generateToken(1, username);
    console.log('认证控制器 - 令牌已生成, 长度:', token.length);

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: 1,
          username: ADMIN_USERNAME,
          role: 'admin'
        }
      }
    });
    console.log('认证控制器 - 登录响应已发送');
  } catch (error) {
    console.error('认证控制器 - 登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，登录失败',
      error: error.message
    });
  }
};

// 获取当前登录用户信息
exports.getMe = async (req, res) => {
  try {
    // 用户信息已经通过认证中间件添加到请求对象中
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取用户信息失败',
      error: error.message
    });
  }
}; 
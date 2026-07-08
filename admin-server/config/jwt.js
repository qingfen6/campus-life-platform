// JWT配置
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'admin_secret_key_for_campus_life_system';
// JWT过期时间
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

console.log('JWT配置 - 密钥长度:', JWT_SECRET.length);
console.log('JWT配置 - 过期时间:', JWT_EXPIRES_IN);

// 生成JWT令牌
const generateToken = (userId, username, role = 'admin') => {
  console.log('JWT配置 - 生成令牌:', { userId, username, role });
  const token = jwt.sign(
    { id: userId, username, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  console.log('JWT配置 - 令牌生成成功，长度:', token.length);
  return token;
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    console.log('JWT配置 - 开始验证令牌');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT配置 - 令牌验证成功:', decoded);
    return decoded;
  } catch (error) {
    console.error('JWT配置 - 令牌验证失败:', error.message);
    throw new Error('无效的令牌');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
}; 
const jwt = require('jsonwebtoken');

/**
 * 生成JWT令牌
 * @param {Object} payload - 要包含在令牌中的数据
 * @returns {String} JWT令牌
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '7d' } // 令牌7天后过期
  );
};

/**
 * 验证JWT令牌
 * @param {String} token - 要验证的JWT令牌
 * @returns {Object} 解码后的payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
};

module.exports = {
  generateToken,
  verifyToken
}; 
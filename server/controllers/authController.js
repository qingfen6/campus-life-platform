const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 用户注册
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 验证用户输入
  if (!username || !email || !password) {
    return res.status(400).json({ message: '请提供所有必需的字段' });
  }

  // 检查邮箱是否已存在
  const emailCheckResult = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (emailCheckResult.rows.length > 0) {
    return res.status(400).json({ message: '该邮箱已被注册' });
  }

  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 创建用户
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hashedPassword]
  );

  const newUser = result.rows[0];

  // 生成JWT
  const token = generateToken({ id: newUser.id });

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    token
  });
});

/**
 * 用户登录
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 验证用户输入
  if (!email || !password) {
    return res.status(400).json({ message: '请提供电子邮箱和密码' });
  }

  // 查询用户
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.status(401).json({ message: '邮箱或密码不正确' });
  }

  const user = result.rows[0];

  // 验证密码
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(401).json({ message: '邮箱或密码不正确' });
  }

  // 生成JWT
  const token = generateToken({ id: user.id });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    token
  });
});

/**
 * 获取当前用户信息
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user 将由认证中间件设置
  const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ message: '用户未找到' });
  }
  
  res.json(result.rows[0]);
});

module.exports = {
  register,
  login,
  getCurrentUser
}; 
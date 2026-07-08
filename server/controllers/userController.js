/**
 * 用户控制器
 * 
 * 处理用户相关操作的业务逻辑，包括注册、登录、获取用户信息等
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * 生成JWT令牌
 * @param {number} id - 用户ID
 * @returns {string} JWT令牌
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * @desc   注册新用户
 * @route  POST /api/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone, gender, avatar } = req.body;

  // 验证必填字段
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('请提供用户名、邮箱和密码');
  }

  // 检查用户是否已存在
  const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (existingUsers.length > 0) {
    res.status(400);
    throw new Error('该邮箱已被注册');
  }

  // 加密密码
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 创建用户
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, phone, gender, avatar_url, user_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [username, email, hashedPassword, phone || null, gender || null, avatar || null, 'active']
  );

  if (result.affectedRows === 1) {
    // 获取新创建的用户信息
    const [newUser] = await pool.query('SELECT user_id, username, email, phone, gender, avatar_url FROM users WHERE user_id = ?', [result.insertId]);
    
    res.status(201).json({
      id: newUser[0].user_id,
      username: newUser[0].username,
      email: newUser[0].email,
      phone: newUser[0].phone,
      gender: newUser[0].gender,
      avatar: newUser[0].avatar_url,
      token: generateToken(newUser[0].user_id)
    });
  } else {
    res.status(400);
    throw new Error('无效的用户数据');
  }
});

/**
 * @desc   用户登录
 * @route  POST /api/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('登录请求：', email);
  console.log('登录请求体 (req.body):', req.body); // <--- 添加这行日志
  console.log('登录请求 email:', email, 'password:', password); // <--- 添加这行日志

  // 验证必填字段
  if (!email || !password) {
    res.status(400);
    throw new Error('请提供邮箱和密码');
  }

  // 查找用户
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (users.length === 0) {
    console.log('登录失败：用户不存在');
    res.status(401);
    throw new Error('邮箱或密码不正确');
  }

  const user = users[0];
  console.log('找到用户：', user.username, '(ID:', user.user_id, ')');

  try {
    // 验证密码
    console.log('正在验证密码...');
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('密码验证结果：', isPasswordMatch ? '匹配' : '不匹配');

    if (!isPasswordMatch) {
      res.status(401);
      throw new Error('邮箱或密码不正确');
    }

    // 更新最后登录时间
    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
    console.log('登录成功，已更新最后登录时间');

    // 生成令牌并返回用户信息
    const token = generateToken(user.user_id);
    console.log('已生成令牌');

    res.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      avatar: user.avatar_url,
      token: token
    });
  } catch (error) {
    console.error('登录过程出错:', error);
    if (res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc   获取当前用户信息
 * @route  GET /api/users/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. 获取用户基本信息
  const [users] = await pool.query(
    'SELECT user_id, username, email, phone, gender, avatar_url, bio, created_at FROM users WHERE user_id = ?',
    [userId]
  );

  if (users.length === 0) {
    res.status(404);
    throw new Error('用户不存在');
  }

  const userProfile = users[0];

  // 2. 并发查询统计数据
  try {
    const [
      postCountResult,
      publishedMissionCountResult, // Renamed for clarity, corresponds to "悬赏"
      productCountResult,
      orderCountResult,
      takenMissionCountResult    // New query for "任务"
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [userId]),
      pool.query('SELECT COUNT(*) as count FROM missions WHERE user_id = ?', [userId]), // Counts missions published by user ("悬赏")
      pool.query('SELECT COUNT(*) as count FROM products WHERE user_id = ?', [userId]),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE buyer_id = ?', [userId]), // Assuming buyer_id is correct for general orders
      pool.query("SELECT COUNT(*) as count FROM mission_takes WHERE taker_id = ? AND status IN ('accepted', 'completed')", [userId]) // Counts missions taken by user ("任务")
    ]);

    // // --- BEGIN DEBUG LOGS ---
    // console.log('[DEBUG] postCountResult:', JSON.stringify(postCountResult));
    // console.log('[DEBUG] publishedMissionCountResult:', JSON.stringify(publishedMissionCountResult));
    // console.log('[DEBUG] productCountResult:', JSON.stringify(productCountResult));
    // console.log('[DEBUG] orderCountResult:', JSON.stringify(orderCountResult));
    // console.log('[DEBUG] takenMissionCountResult:', JSON.stringify(takenMissionCountResult));
    // // --- END DEBUG LOGS ---

    // Helper to safely get count
    const getCount = (result) => (result && result[0] && result[0][0] && typeof result[0][0].count === 'number') ? result[0][0].count : 0;

    userProfile.postCount = getCount(postCountResult);
    userProfile.missionCount = getCount(publishedMissionCountResult); // This is for "悬赏" (published missions)
    userProfile.productCount = getCount(productCountResult);
    userProfile.orderCount = getCount(orderCountResult);
    userProfile.taskCount = getCount(takenMissionCountResult);      // This is for "任务" (taken missions)

  } catch (error) {
    console.error("获取用户统计数据失败:", error);
    // Default counts to 0 if there's an error in fetching statistics
    userProfile.postCount = userProfile.postCount || 0;
    userProfile.missionCount = userProfile.missionCount || 0; // "悬赏"
    userProfile.productCount = userProfile.productCount || 0;
    userProfile.orderCount = userProfile.orderCount || 0;
    userProfile.taskCount = 0; // Default for "任务"
  }

  res.json({
    id: userProfile.user_id,
    username: userProfile.username,
    email: userProfile.email,
    phone: userProfile.phone,
    gender: userProfile.gender,
    avatar: userProfile.avatar_url, // Keep frontend expected 'avatar' field name
    bio: userProfile.bio,
    created_at: userProfile.created_at,
    postCount: userProfile.postCount,
    missionCount: userProfile.missionCount, // For "悬赏" (published)
    productCount: userProfile.productCount,
    orderCount: userProfile.orderCount,
    taskCount: userProfile.taskCount       // For "任务" (taken)
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
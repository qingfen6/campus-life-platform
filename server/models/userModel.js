// 用户模型 - 数据库交互示例
const { pool } = require('../config/db');

// 获取所有用户
async function getAllUsers() {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

// 根据ID获取用户
async function getUserById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0]; // 返回第一个匹配的用户
  } catch (error) {
    console.error(`获取用户(ID: ${id})失败:`, error);
    throw error;
  }
}

// 创建新用户
async function createUser(userData) {
  try {
    const { username, email, password, avatar_url, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, avatar_url, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, password, avatar_url, role]
    );
    return result.insertId;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

// 更新用户信息
async function updateUser(id, userData) {
  try {
    const { username, email, avatar_url, role } = userData;
    const [result] = await pool.query(
      'UPDATE users SET username = ?, email = ?, avatar_url = ?, role = ?, updated_at = NOW() WHERE id = ?',
      [username, email, avatar_url, role, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`更新用户(ID: ${id})失败:`, error);
    throw error;
  }
}

// 删除用户
async function deleteUser(id) {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`删除用户(ID: ${id})失败:`, error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 
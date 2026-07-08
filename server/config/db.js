/**
 * 数据库连接配置
 * 
 * 负责创建和管理MySQL数据库连接池
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// 打印环境变量，用于调试
console.log('数据库配置环境变量:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('  DB_NAME:', process.env.DB_NAME);

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campuslife',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
const testConnection = async () => {
  console.log('数据库连接配置:');
  console.log('  主机:', dbConfig.host);
  console.log('  用户:', dbConfig.user);
  console.log('  数据库:', dbConfig.database);
  
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection }; 
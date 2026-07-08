/**
 * 数据库验证脚本
 * 
 * 用于检查数据库连接和表结构是否正确
 */
const { pool, testConnection } = require('../config/db');

/**
 * 获取数据库中所有表名
 * @returns {Promise<string[]>} 表名数组
 */
async function getAllTables() {
  try {
    const [rows] = await pool.query(
      'SHOW TABLES'
    );
    return rows.map(row => Object.values(row)[0]);
  } catch (error) {
    console.error('获取表名失败:', error.message);
    return [];
  }
}

/**
 * 获取表的结构信息
 * @param {string} tableName - 表名
 * @returns {Promise<Object[]>} 表结构信息
 */
async function getTableStructure(tableName) {
  try {
    const [rows] = await pool.query(
      `DESCRIBE ${tableName}`
    );
    return rows;
  } catch (error) {
    console.error(`获取表 ${tableName} 结构失败:`, error.message);
    return [];
  }
}

/**
 * 检查用户表是否存在必要的字段
 * @returns {Promise<boolean>} 表结构是否正确
 */
async function verifyUserTable() {
  try {
    const structure = await getTableStructure('users');
    
    // 检查必要的字段
    const requiredFields = ['user_id', 'username', 'email', 'password'];
    const missingFields = requiredFields.filter(field => 
      !structure.some(row => row.Field === field)
    );
    
    if (missingFields.length > 0) {
      console.error('用户表缺少必要字段:', missingFields.join(', '));
      return false;
    }
    
    console.log('用户表结构验证通过');
    return true;
  } catch (error) {
    console.error('验证用户表失败:', error.message);
    return false;
  }
}

/**
 * 验证数据库设置
 */
async function verifyDatabase() {
  try {
    // 测试数据库连接
    const connected = await testConnection();
    if (!connected) {
      console.error('数据库连接失败');
      return;
    }
    
    // 获取所有表
    const tables = await getAllTables();
    console.log('数据库中的表:', tables.join(', ') || '无表');
    
    // 如果没有表，建议运行初始化脚本
    if (tables.length === 0) {
      console.log('提示: 数据库中没有表，请运行初始化脚本: node server/scripts/init-db.js');
      return;
    }
    
    // 验证用户表
    if (tables.includes('users')) {
      await verifyUserTable();
    } else {
      console.error('用户表不存在，请运行初始化脚本');
    }
    
    // 显示其他重要表是否存在
    const requiredTables = ['roles', 'user_roles', 'schools', 'faculties'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.error('缺少以下重要表:', missingTables.join(', '));
      console.log('提示: 请运行初始化脚本: node server/scripts/init-db.js');
    } else {
      console.log('所有必要的表都已存在');
    }
  } catch (error) {
    console.error('验证数据库时出错:', error);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

// 执行验证
verifyDatabase(); 
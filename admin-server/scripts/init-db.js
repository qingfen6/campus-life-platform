const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 获取配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'campuslife',
  multipleStatements: true // 允许多条SQL语句执行
};

// 读取SQL文件
const readSqlFile = (filename) => {
  const filePath = path.join(__dirname, filename);
  return fs.readFileSync(filePath, 'utf8');
};

// 主函数
const initDatabase = async () => {
  let connection;
  try {
    // 创建不指定数据库的连接
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    console.log('数据库连接成功');

    // 先检查数据库是否存在
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    
    if (rows.length === 0) {
      // 如果不存在，创建数据库
      console.log(`创建数据库 ${dbConfig.database}...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`数据库 ${dbConfig.database} 创建成功`);
    } else {
      console.log(`数据库 ${dbConfig.database} 已存在`);
    }

    // 切换到指定数据库
    await connection.query(`USE ${dbConfig.database}`);
    console.log(`已切换到数据库 ${dbConfig.database}`);

    // 读取建表SQL脚本
    const createTablesSql = readSqlFile('create-tables.sql');
    
    // 执行建表操作
    console.log('开始创建基础表...');
    await connection.query(createTablesSql);
    console.log('基础表创建成功！');
    
    // 读取并执行管理员表SQL脚本
    console.log('开始创建管理员相关表...');
    const createAdminTablesSql = readSqlFile('create-admin-tables.sql');
    await connection.query(createAdminTablesSql);
    console.log('管理员相关表创建成功！');
    
    // 读取并执行测试数据SQL脚本
    console.log('开始插入测试数据...');
    const insertTestDataSql = readSqlFile('insert-test-data.sql');
    await connection.query(insertTestDataSql);
    console.log('测试数据插入成功！');
    
    // 读取并执行管理员数据SQL脚本
    console.log('开始插入管理员数据...');
    const insertAdminDataSql = readSqlFile('insert-admin-data.sql');
    await connection.query(insertAdminDataSql);
    console.log('管理员数据插入成功！');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接关闭');
    }
  }
};

// 运行初始化
initDatabase(); 
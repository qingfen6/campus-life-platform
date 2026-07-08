/**
 * 创建任务进度相关表的脚本
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// 创建表的SQL语句
const CREATE_TABLES_SQL = [
  // 任务进度表
  `CREATE TABLE IF NOT EXISTS mission_progress (
    progress_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mission_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    progress_percent INT NOT NULL DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,

  // 任务提交表
  `CREATE TABLE IF NOT EXISTS mission_submissions (
    submission_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mission_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'revision_required') DEFAULT 'pending',
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,

  // 任务附件表
  `CREATE TABLE IF NOT EXISTS mission_attachments (
    attachment_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    submission_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES mission_submissions(submission_id) ON DELETE CASCADE
  )`,

  // 任务评价表
  `CREATE TABLE IF NOT EXISTS mission_ratings (
    rating_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mission_id BIGINT UNSIGNED NOT NULL,
    rater_id BIGINT UNSIGNED NOT NULL,
    ratee_id BIGINT UNSIGNED NOT NULL,
    score DECIMAL(2,1) NOT NULL,
    review TEXT,
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ratee_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,

  // 任务沟通表
  `CREATE TABLE IF NOT EXISTS mission_communications (
    comm_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mission_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED,
    message TEXT NOT NULL,
    has_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE SET NULL
  )`
];

// 添加子目录
const CREATE_DIRECTORIES = [
  // 使用跨平台方式创建目录
  'uploads/mission_attachments'
];

// 执行创建表语句
async function createTables() {
  let connection;
  
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    for (const sql of CREATE_TABLES_SQL) {
      console.log('执行SQL: ', sql.substring(0, 60) + '...');
      await connection.query(sql);
      console.log('表创建成功!');
    }
    
    console.log('所有表创建完成!');
  } catch (error) {
    console.error('创建表时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 创建上传目录
function createDirectories() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    console.log('创建上传目录...');
    
    for (const dir of CREATE_DIRECTORIES) {
      const dirPath = path.join(__dirname, '../../', dir);
      console.log(`创建目录: ${dirPath}`);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`目录已创建: ${dirPath}`);
      } else {
        console.log(`目录已存在: ${dirPath}`);
      }
    }
    
    console.log('上传目录创建完成!');
  } catch (error) {
    console.error('创建目录时出错:', error);
  }
}

// 主函数
async function main() {
  try {
    // 创建表
    await createTables();
    
    // 创建目录
    createDirectories();
    
    console.log('脚本执行完成!');
  } catch (error) {
    console.error('脚本执行出错:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 
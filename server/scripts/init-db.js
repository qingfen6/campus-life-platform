/**
 * 数据库初始化脚本
 * 
 * 创建用户登录注册所需的基本表结构
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

// 创建用户表SQL
const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password CHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  real_name VARCHAR(50),
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  bio TEXT,
  gender ENUM('male', 'female', 'other', 'undisclosed') DEFAULT 'undisclosed',
  birth_date DATE,
  school_id BIGINT UNSIGNED,
  faculty_id BIGINT UNSIGNED,
  student_id VARCHAR(50),
  enrollment_year YEAR,
  user_status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_id (school_id),
  INDEX idx_faculty_id (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 创建角色表SQL
const CREATE_ROLES_TABLE = `
CREATE TABLE IF NOT EXISTS roles (
  role_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 创建用户角色关联表SQL
const CREATE_USER_ROLES_TABLE = `
CREATE TABLE IF NOT EXISTS user_roles (
  user_role_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id),
  UNIQUE KEY unique_user_role (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 创建学校表SQL
const CREATE_SCHOOLS_TABLE = `
CREATE TABLE IF NOT EXISTS schools (
  school_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  school_name VARCHAR(100) NOT NULL,
  school_code VARCHAR(50) UNIQUE,
  province VARCHAR(50),
  city VARCHAR(50),
  address TEXT,
  school_type ENUM('comprehensive', 'science', 'liberal', 'art', 'sports', 'medical', 'other'),
  founding_year YEAR,
  logo_url VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 创建学院表SQL
const CREATE_FACULTIES_TABLE = `
CREATE TABLE IF NOT EXISTS faculties (
  faculty_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  school_id BIGINT UNSIGNED NOT NULL,
  faculty_name VARCHAR(100) NOT NULL,
  faculty_code VARCHAR(50),
  director VARCHAR(50),
  faculty_type VARCHAR(50),
  founding_year YEAR,
  description TEXT,
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_id (school_id),
  FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 初始化基本角色数据
const INSERT_BASIC_ROLES = `
INSERT IGNORE INTO roles (role_name, description) VALUES 
('user', '普通用户'),
('admin', '管理员'),
('moderator', '内容审核员');
`;

/**
 * 初始化数据库
 */
async function initDatabase() {
  let connection;
  
  try {
    console.log('开始初始化数据库...');
    
    // 连接数据库
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // 创建数据库（如果不存在）
    console.log(`创建数据库 ${dbConfig.database}（如果不存在）...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // 创建表
    console.log('创建用户表...');
    await connection.query(CREATE_USERS_TABLE);
    
    console.log('创建角色表...');
    await connection.query(CREATE_ROLES_TABLE);
    
    console.log('创建用户角色关联表...');
    await connection.query(CREATE_USER_ROLES_TABLE);
    
    console.log('创建学校表...');
    await connection.query(CREATE_SCHOOLS_TABLE);
    
    console.log('创建学院表...');
    await connection.query(CREATE_FACULTIES_TABLE);
    
    // 初始化基本数据
    console.log('初始化基本角色数据...');
    await connection.query(INSERT_BASIC_ROLES);
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initDatabase(); 
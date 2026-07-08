// 手动初始化管理员表和数据
const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'campuslife',
  multipleStatements: true
};

// 创建管理员表的SQL
const createAdminTableSQL = `
-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  admin_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password CHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  real_name VARCHAR(50),
  avatar_url VARCHAR(255),
  role ENUM('super_admin', 'admin', 'operator') DEFAULT 'operator',
  status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  role_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
  permission_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  config_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value VARCHAR(255) NOT NULL,
  description TEXT,
  is_editable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_config_key (config_key)
);
`;

// 插入初始数据的SQL
const insertAdminDataSQL = `
-- 插入管理员账号(密码:123456)
INSERT INTO admins (username, password, email, real_name, role, status)
VALUES ('admin', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'admin@example.com', '系统管理员', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入角色
INSERT INTO roles (role_name, description)
VALUES ('super_admin', '超级管理员，拥有所有权限'),
       ('admin', '普通管理员，拥有大部分管理权限'),
       ('operator', '运营人员，仅拥有内容管理和基础查询权限')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入权限
INSERT INTO permissions (permission_name, description)
VALUES ('user.view', '查看用户信息'),
       ('user.edit', '编辑用户信息'),
       ('user.delete', '删除用户'),
       ('content.view', '查看内容'),
       ('content.edit', '编辑内容'),
       ('content.delete', '删除内容'),
       ('system.config', '系统配置管理'),
       ('system.log', '系统日志查看'),
       ('admin.manage', '管理员账号管理'),
       ('role.manage', '角色权限管理'),
       ('database.query', '数据库查询')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 系统配置初始值
INSERT INTO system_configs (config_key, config_value, description, is_editable)
VALUES ('site.name', 'CampusLife管理系统', '站点名称', 1),
       ('site.logo', '/logo.png', '站点Logo', 1),
       ('db.max_query_rows', '1000', '数据库查询最大返回行数', 1),
       ('db.timeout', '30', '数据库查询超时时间(秒)', 1),
       ('login.max_attempts', '5', '最大登录尝试次数', 1),
       ('login.lock_time', '30', '账号锁定时间(分钟)', 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
`;

// 设置角色-权限关系的SQL
const setupRolePermissionsSQL = `
-- 先清空现有权限
DELETE FROM role_permissions;

-- 超级管理员拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'super_admin'), 
  permission_id 
FROM permissions;

-- 普通管理员拥有除系统配置、管理员管理和角色权限管理外的所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'admin'), 
  permission_id 
FROM permissions 
WHERE permission_name NOT IN ('system.config', 'admin.manage', 'role.manage');

-- 运营人员只有基本权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'operator'), 
  permission_id 
FROM permissions 
WHERE permission_name IN ('user.view', 'content.view', 'content.edit', 'database.query');
`;

// 主函数
async function initAdminData() {
  let connection;
  
  try {
    console.log('开始初始化管理员表和数据...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 创建表
    console.log('创建管理员相关表...');
    await connection.query(createAdminTableSQL);
    console.log('管理员相关表创建成功');
    
    // 插入初始数据
    console.log('插入管理员初始数据...');
    await connection.query(insertAdminDataSQL);
    console.log('管理员初始数据插入成功');
    
    // 设置角色-权限关系
    console.log('设置角色-权限关系...');
    await connection.query(setupRolePermissionsSQL);
    console.log('角色-权限关系设置成功');
    
    console.log('管理员数据初始化完成！');
    
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化
initAdminData(); 
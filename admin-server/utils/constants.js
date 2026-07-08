/**
 * 管理后台常量配置文件
 * 
 * 包含API端点和端口设置
 */

// 导入系统端口配置
const { ADMIN_API_PORT, CLIENT_API_PORT } = require('../../server/config/ports');

// API端点和端口配置
exports.API_CONFIG = {
  // 管理后台API
  ADMIN_API_PORT,
  ADMIN_API_BASE_URL: `http://localhost:${ADMIN_API_PORT}/api`,
  
  // 客户端API
  CLIENT_API_PORT,
  CLIENT_API_BASE_URL: `http://localhost:${CLIENT_API_PORT}/api`,
  
  // 管理后台路由端点
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      PROFILE: '/auth/me'
    },
    DB: {
      TABLES: '/db/tables',
      TABLE_STRUCTURE: '/db/tables/:tableName/structure',
      TABLE_DATA: '/db/tables/:tableName/data',
      QUERY: '/db/query'
    }
  }
}; 
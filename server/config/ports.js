/**
 * 系统端口配置文件
 * 
 * 统一管理所有服务的端口，方便集中配置和修改
 */

// 客户端前端端口
const CLIENT_FRONTEND_PORT = 3000;

// 客户端API端口
const CLIENT_API_PORT = 5001;

// 管理后台前端端口
const ADMIN_FRONTEND_PORT = 3001;

// 管理后台API端口
const ADMIN_API_PORT = 8080;

// 导出端口配置
module.exports = {
  CLIENT_FRONTEND_PORT,
  CLIENT_API_PORT,
  ADMIN_FRONTEND_PORT,
  ADMIN_API_PORT
}; 
// 系统管理员后端服务器
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const { API_CONFIG } = require('./utils/constants');
const authRoutes = require('./routes/authRoutes');
const dbRoutes = require('./routes/dbRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminSchoolRoutes = require('./routes/adminSchoolRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const schoolAdminAuthRoutes = require('./routes/schoolAdminAuthRoutes');
const schoolAdminRoutes = require('./routes/schoolAdminRoutes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 测试数据库连接
testConnection()
  .then(success => {
    if (!success) {
      console.error('无法连接到数据库，服务器启动中断');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('数据库连接测试出错:', error);
    process.exit(1);
  });

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/school-admin/auth', schoolAdminAuthRoutes);
app.use('/api/db', dbRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminSchoolRoutes);
app.use('/api/admin/statistics', statisticsRoutes);
app.use('/api/auth/school-admin', schoolAdminAuthRoutes);
app.use('/api/school-admin', schoolAdminRoutes);

// 根路径响应
app.get('/', (req, res) => {
  res.json({ 
    message: 'CampusLife 系统管理员 API 服务正在运行',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// API文档路径
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'CampusLife 系统管理员 API 文档',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login - 管理员登录',
        getMe: 'GET /api/auth/me - 获取当前登录用户信息'
      },
      database: {
        getTables: 'GET /api/db/tables - 获取表名列表',
        getTableStructure: 'GET /api/db/tables/:tableName/structure - 获取表结构',
        getAllData: 'GET /api/db/tables/:tableName/data - 获取表数据',
        executeQuery: 'POST /api/db/query - 执行自定义SQL查询'
      }
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || API_CONFIG.ADMIN_API_PORT;
app.listen(PORT, () => {
  console.log(`管理员后端服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档地址: http://localhost:${PORT}/api/docs`);
}); 
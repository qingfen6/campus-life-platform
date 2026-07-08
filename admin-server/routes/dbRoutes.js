// 数据库查询路由
const express = require('express');
const router = express.Router();
const { 
  getTables, 
  executeQuery, 
  getTableStructure, 
  getAllData, 
  insertRow,
  updateRow,
  deleteRow
} = require('../controllers/dbController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { pool } = require('../config/db');

// 添加错误处理中间件
const authErrorHandler = (err, req, res, next) => {
  console.error('数据库路由 - 认证错误:', err);
  res.status(401).json({
    success: false,
    message: '认证失败，请重新登录',
    error: err.message
  });
};

// 应用中间件到所有路由
router.use(protect);
router.use(authErrorHandler); // 添加认证错误处理
router.use(authorize(['admin']));

// 路由级中间件：记录数据库请求
router.use((req, res, next) => {
  console.log(`数据库路由 - ${req.method} ${req.url} 被用户 ${req.user.username} 请求`);
  next();
});

// GET /api/db/tables - 获取表名列表
router.get('/tables', getTables);

// GET /api/db/tables/:tableName/structure - 获取表结构
router.get('/tables/:tableName/structure', getTableStructure);

// GET /api/db/tables/:tableName/data - 获取表数据
router.get('/tables/:tableName/data', getAllData);

// POST /api/db/query - 执行自定义SQL查询
router.post('/query', executeQuery);

// POST /api/db/tables/:tableName/row - 插入数据行
router.post('/tables/:tableName/row', insertRow);

// PUT /api/db/tables/:tableName/row - 更新数据行
router.put('/tables/:tableName/row', updateRow);

// DELETE /api/db/tables/:tableName/row - 删除数据行
router.delete('/tables/:tableName/row', deleteRow);

// 添加健康检查路由
router.get('/health/check', async (req, res) => {
  try {
    // 测试数据库连接
    const connection = await pool.getConnection();
    connection.release(); // 立即释放连接
    
    // 返回成功状态
    res.json({
      success: true,
      message: '数据库连接正常',
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

module.exports = router; 
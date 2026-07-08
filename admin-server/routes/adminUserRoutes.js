/**
 * @file adminUserRoutes.js
 * @description Routes for managing users in the admin panel.
 */
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// 假设有一个管理员认证中间件,保护这些路由
// const { isAdmin } = require('../middlewares/adminAuthMiddleware'); 
// router.use(isAdmin); // 应用于所有此文件中的路由

/**
 * @route GET /api/admin/users
 * @description 获取所有用户列表 (支持分页, 搜索, 筛选)
 * @access Private (Admin only)
 */
router.get('/users', adminUserController.getAllUsers);

/**
 * @route GET /api/admin/users/:userId
 * @description 根据用户ID获取用户详情
 * @access Private (Admin only)
 */
router.get('/users/:userId', adminUserController.getUserById);

/**
 * @route PUT /api/admin/users/:userId
 * @description 更新指定用户信息 (管理员操作)
 * @access Private (Admin only)
 */
router.put('/users/:userId', adminUserController.updateUserById);

// 未来可能添加：删除用户路由
// router.delete('/users/:userId', adminUserController.deleteUserById);

module.exports = router; 
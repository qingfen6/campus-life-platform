const express = require('express');
const router = express.Router();
const schoolAdminUsersController = require('../controllers/schoolAdminUsersController');
// const { verifySchoolAdminToken } = require('../middleware/authMiddleware'); // 移除，由父路由处理

// 所有学校管理员用户管理相关路由都需要验证JWT - 由父路由 schoolAdminRoutes.js 统一处理
// router.use(verifySchoolAdminToken); // 移除

// GET / - 获取本校用户列表 (相对于 /api/school-admin/users)
router.get('/', schoolAdminUsersController.getSchoolUsers);

// PUT /:userId/status - 更新用户状态 (启用/禁用) (相对于 /api/school-admin/users)
router.put('/:userId/status', schoolAdminUsersController.updateUserStatus);

module.exports = router; 
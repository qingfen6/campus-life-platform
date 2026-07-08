/**
 * @file adminSchoolRoutes.js
 * @description Routes for managing schools in the admin panel.
 */
const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/adminSchoolController');
// 假设你有一个认证中间件
// const { isAdmin } = require('../middleware/authMiddleware'); // 示例

// 所有学校管理相关路由默认需要管理员权限
// router.use(isAdmin); // 如果有isAdmin中间件，可以在这里全局应用

// POST /api/admin/schools - 创建新学校
router.post('/schools', schoolController.createSchool);

// GET /api/admin/schools - 获取所有学校
router.get('/schools', schoolController.getAllSchools);

// GET /api/admin/schools/:schoolId - 获取单个学校详情
router.get('/schools/:schoolId', schoolController.getSchoolById);

// PUT /api/admin/schools/:schoolId - 更新学校信息
router.put('/schools/:schoolId', schoolController.updateSchoolById);

// DELETE /api/admin/schools/:schoolId - 删除学校
router.delete('/schools/:schoolId', schoolController.deleteSchoolById);

module.exports = router; 
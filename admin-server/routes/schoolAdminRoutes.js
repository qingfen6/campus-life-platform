const express = require('express');
const router = express.Router();
// const schoolAdminUsersController = require('../controllers/schoolAdminUsersController'); // 不再直接使用
const schoolAdminFacultiesController = require('../controllers/schoolAdminFacultiesController');
const schoolAdminPostsController = require('../controllers/schoolAdminPostsController');
const { verifySchoolAdminToken } = require('../middleware/authMiddleware');

// 引入用户管理的子路由模块
const schoolAdminUserSubRoutes = require('./schoolAdminUsers.routes'); // 新增

// 引入悬赏管理的子路由模块
const schoolAdminMissionSubRoutes = require('./schoolAdminMissions.routes'); // 新增

// 新增引入商品管理的子路由模块
const schoolAdminProductSubRoutes = require('./schoolAdminProducts.routes');

// 新增引入公告管理的子路由模块
const schoolAdminAnnouncementSubRoutes = require('./schoolAdminAnnouncements.routes');

// 应用学校管理员认证中间件到所有 /school-admin 路由
// 注意：schoolAdminUserSubRoutes 内部也应该有自己的认证中间件，或者依赖此处的全局中间件
// 如果 schoolAdminUserSubRoutes 内部已有认证，这里的 router.use(verifySchoolAdminToken) 可能会导致重复检查
// 确认 schoolAdminUsers.routes.js 中的 router.use(verifySchoolAdminToken) 是否需要保留或移除
// 假设 schoolAdminUsers.routes.js 中间件已处理，此处可以移除对 /users 的重复中间件，或者让它作为父级统一处理
// 为了清晰和避免重复，我们假设顶层 router.use(verifySchoolAdminToken) 已足够，
// 或者 schoolAdminUsers.routes.js 里的 verifySchoolAdminToken 会被移除/调整。
// 目前 schoolAdminUsers.routes.js 已经包含了 verifySchoolAdminToken, 这里也保留，Express 会按顺序执行。
router.use(verifySchoolAdminToken);

// 用户管理路由 - 使用子路由模块
router.use('/users', schoolAdminUserSubRoutes); // 修改

// 学院管理路由
router.get('/faculties', schoolAdminFacultiesController.getFacultiesBySchool);

// 动态管理路由
router.get('/posts', schoolAdminPostsController.getSchoolPosts);
router.put('/posts/:postId/status', schoolAdminPostsController.updatePostStatus);

// 悬赏管理路由 - 使用子路由模块
router.use('/missions', schoolAdminMissionSubRoutes);

// 新增：商品管理路由 - 使用子路由模块
router.use('/products', schoolAdminProductSubRoutes);

// 新增：公告管理路由 - 使用子路由模块
router.use('/announcements', schoolAdminAnnouncementSubRoutes);

// 移除之前的 TODO 和单独的 /users GET 路由

module.exports = router; 
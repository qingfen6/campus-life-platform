const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// 假设后续会添加管理员认证中间件
// const { isAdmin } = require('../middlewares/authMiddleware'); // 示例

// 概览统计
router.get('/overview', /* isAdmin, */ statisticsController.getOverviewStats);

// 用户增长趋势
router.get('/user-growth', /* isAdmin, */ statisticsController.getUserGrowthStats);

// 内容增长趋势
router.get('/content-growth', /* isAdmin, */ statisticsController.getContentGrowthStats);

// 用户类型分布
router.get('/user-type-distribution', /* isAdmin, */ statisticsController.getUserTypeDistribution);

// 学校地域分布
router.get('/school-region-distribution', /* isAdmin, */ statisticsController.getSchoolRegionDistribution);

// 最近注册用户 (支持 ?limit=N 参数)
router.get('/recent-users', /* isAdmin, */ statisticsController.getRecentUsers);

// 新增学校 (支持 ?limit=N 参数)
router.get('/recent-schools', /* isAdmin, */ statisticsController.getRecentSchools);

module.exports = router; 
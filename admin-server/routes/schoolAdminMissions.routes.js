const express = require('express');
const router = express.Router();
const schoolAdminMissionsController = require('../controllers/schoolAdminMissionsController');

// GET / - 获取本校悬赏列表 (相对于 /api/school-admin/missions)
router.get('/', schoolAdminMissionsController.getSchoolMissions);

// PUT /:missionId/status - 更新悬赏状态 (相对于 /api/school-admin/missions)
router.put('/:missionId/status', schoolAdminMissionsController.updateMissionStatus);

// TODO: 添加获取悬赏详情、编辑悬赏等路由

module.exports = router; 
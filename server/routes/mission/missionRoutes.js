/**
 * 悬赏任务路由
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  getMissions,
  getMissionDetail,
  getCategories,
  addMission,
  takeMission,
  getMissionApplicants,
  handleMissionApplication,
  completeMission,
  confirmMissionCompletion,
  getMissionsByPublisher,
  getAcceptedMissions,
  submitMissionTake,
  cancelMissionByPublisher
} = require('../../controllers/mission/missionController');

// 公开路由
router.get('/missions', getMissions);
router.get('/missions/:id', getMissionDetail);
router.get('/categories', getCategories);

// 需要登录的路由
router.post('/missions', protect, addMission);
router.post('/take', protect, takeMission);

// 任务申请管理路由
router.get('/applications/:missionId', protect, getMissionApplicants);
router.post('/applications/:takeId', protect, handleMissionApplication);

// 任务完成相关路由
router.post('/complete/:missionId', protect, completeMission);
router.post('/confirm/:missionId', protect, confirmMissionCompletion);

// 获取用户发布的任务
router.get('/published', protect, getMissionsByPublisher);

// 获取用户接单的任务
router.get('/accepted', protect, getAcceptedMissions);

// 新增：任务接取者提交完成路由
router.post('/takes/:takeId/submit', protect, submitMissionTake);

// 新增：发布者取消任务路由
router.post('/:missionId/cancel-by-publisher', protect, cancelMissionByPublisher);

// 确保导出路由
module.exports = router; 
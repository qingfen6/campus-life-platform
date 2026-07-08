/**
 * 任务进度路由
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mission_attachments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB限制
});

const {
  getMissionStatus,
  updateMissionProgress,
  submitMissionResult,
  reviewMissionSubmission,
  submitMissionRating,
  getMissionCommunications,
  sendMissionMessage,
  cancelMission
} = require('../../controllers/mission/missionProgressController');

// 任务状态路由
router.get('/status/:id', protect, getMissionStatus);

// 任务进度路由
router.post('/progress/:id', protect, updateMissionProgress);

// 任务提交路由
router.post('/submit/:id', protect, upload.array('attachments', 5), submitMissionResult);

// 任务审核路由
router.post('/review/:id', protect, reviewMissionSubmission);

// 任务评价路由
router.post('/rate/:id', protect, submitMissionRating);

// 任务沟通路由
router.get('/communications/:id', protect, getMissionCommunications);
router.post('/communications/:id', protect, sendMissionMessage);

// 任务取消路由
router.post('/cancel/:id', protect, cancelMission);

module.exports = router;

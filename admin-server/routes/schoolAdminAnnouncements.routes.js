const express = require('express');
const router = express.Router();
const schoolAdminAnnouncementsController = require('../controllers/schoolAdminAnnouncementsController');

// 获取学校公告列表
router.get('/', schoolAdminAnnouncementsController.getSchoolAnnouncements);

// 创建学校公告
router.post('/', schoolAdminAnnouncementsController.createSchoolAnnouncement);

// 获取学校公告详情
router.get('/:id', schoolAdminAnnouncementsController.getSchoolAnnouncementDetails);

// 更新学校公告
router.put('/:id', schoolAdminAnnouncementsController.updateSchoolAnnouncement);

// 删除学校公告
router.delete('/:id', schoolAdminAnnouncementsController.deleteSchoolAnnouncement);

module.exports = router; 
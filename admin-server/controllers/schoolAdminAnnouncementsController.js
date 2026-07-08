const { SchoolAnnouncement, User, School, sequelize } = require('../config/db');
const { SchoolAdminAccount } = require('../config/db');
const { Op } = require('sequelize');

// 获取学校公告列表
const getSchoolAnnouncements = async (req, res) => {
  const { schoolId } = req.admin; // 从请求中获取学校ID
  const { page = 1, limit = 10, search = '', type, status, isPinned, sortBy = 'publish_time', sortOrder = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereCondition = { school_id: schoolId };

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }
    if (type) { whereCondition.announcement_type = type; }
    if (status) { whereCondition.status = status; }
    if (isPinned !== undefined) { whereCondition.is_pinned = isPinned === 'true'; }

    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await SchoolAnnouncement.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: offset,
      order: order,
      include: [
        // Now associated with SchoolAdminAccount model
        { model: SchoolAdminAccount, as: 'publisher', attributes: ['admin_account_id', 'username', 'full_name'] }, // Assuming name attribute is full_name
        // If school name needs to be displayed, School model can also be included
        // { model: School, attributes: ['school_id', 'school_name'] }
      ],
    });

    res.status(200).json({
      data: rows,
      total: count,
      currentPage: parseInt(page, 10),
      pageSize: parseInt(limit, 10),
    });

  } catch (error) {
    console.error('获取学校公告列表失败:', error);
    res.status(500).json({ message: '获取学校公告列表失败', error: error.message });
  }
};

// 创建学校公告
const createSchoolAnnouncement = async (req, res) => {
  const { schoolId } = req.admin; // 从请求中获取学校ID
  // !!! 假设学校管理员的ID在 req.admin.adminAccountId 中 !!!
  const publisherId = req.admin.adminAccountId; // <--- 使用学校管理员的ID
  if (!publisherId) {
    console.error('创建公告失败: 无法从 req.admin 中获取 adminAccountId', req.admin);
    return res.status(401).json({ message: '无法获取发布者信息，请确保已登录学校管理员账户' });
  }
  const { title, content, faculty_id, announcement_type, visibility, attachment_url, is_pinned, publish_time, status } = req.body;

  try {
    const newAnnouncement = await SchoolAnnouncement.create({
      school_id: schoolId,
      publisher_id: publisherId, // <--- 使用获取到的学校管理员ID
      title,
      content,
      faculty_id: faculty_id || null, // 允许为空
      announcement_type: announcement_type || 'general',
      visibility: visibility || 'school_only',
      attachment_url,
      is_pinned,
      publish_time: publish_time || new Date(),
      status: status || 'published',
    });

    res.status(201).json({ message: '学校公告创建成功', data: newAnnouncement });

  } catch (error) {
    console.error('创建学校公告失败:', error);
    // 检查是否是 SequelizeValidationError
    if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message).join(', ');
        res.status(400).json({ message: '创建公告失败: 验证错误', errors: validationErrors });
    } else {
        res.status(500).json({ message: '创建学校公告失败', error: error.message });
    }
  }
};

// 获取学校公告详情
const getSchoolAnnouncementDetails = async (req, res) => {
    const { schoolId } = req.admin; // 从请求中获取学校ID
    const { id } = req.params; // 公告ID

    try {
      const announcement = await SchoolAnnouncement.findOne({
        where: { announcement_id: id, school_id: schoolId }, // 确保只获取本校公告
        include: [
            // Now associated with SchoolAdminAccount model
            { model: SchoolAdminAccount, as: 'publisher', attributes: ['admin_account_id', 'username', 'full_name'] }, // Assuming name attribute is full_name
          ],
      });

      if (!announcement) {
        return res.status(404).json({ message: '未找到该学校公告' });
      }

      res.status(200).json({ data: announcement });

    } catch (error) {
      console.error('获取学校公告详情失败:', error);
      res.status(500).json({ message: '获取学校公告详情失败', error: error.message });
    }
  };

// 更新学校公告
const updateSchoolAnnouncement = async (req, res) => {
    const { schoolId } = req.admin; // 从请求中获取学校ID
     // !!! 假设学校管理员的ID在 req.admin.adminAccountId 中 !!!
    const publisherId = req.admin.adminAccountId; // <--- 使用学校管理员的ID
    if (!publisherId) {
      console.error('更新公告失败: 无法从 req.admin 中获取 adminAccountId', req.admin);
      return res.status(401).json({ message: '无法获取发布者信息，请确保已登录学校管理员账户' });
    }
    const { id } = req.params; // 公告ID
    const updateData = req.body;

    try {
      const announcement = await SchoolAnnouncement.findOne({
        where: { announcement_id: id, school_id: schoolId }, // 确保只更新本校公告
      });

      if (!announcement) {
        return res.status(404).json({ message: '未找到该学校公告' });
      }

      // 防止修改 publisher_id 或 school_id
      delete updateData.publisher_id;
      delete updateData.school_id;


      await announcement.update(updateData);

      // 重新加载关联数据以返回完整的更新后对象
      const updatedAnnouncement = await SchoolAnnouncement.findOne({
        where: { announcement_id: id },
        include: [
             // Now associated with SchoolAdminAccount model
            { model: SchoolAdminAccount, as: 'publisher', attributes: ['admin_account_id', 'username', 'full_name'] }, // Assuming name attribute is full_name
          ],
      });

      res.status(200).json({ message: '学校公告更新成功', data: updatedAnnouncement });

    } catch (error) {
      console.error('更新学校公告失败:', error);
       if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message).join(', ');
            res.status(400).json({ message: '更新公告失败: 验证错误', errors: validationErrors });
        } else {
            res.status(500).json({ message: '更新公告失败', error: error.message });
        }
    }
  };

// 删除学校公告
const deleteSchoolAnnouncement = async (req, res) => {
    const { schoolId } = req.admin; // 从请求中获取学校ID
    const { id } = req.params; // 公告ID

    try {
      const result = await SchoolAnnouncement.destroy({
        where: { announcement_id: id, school_id: schoolId }, // 确保只删除本校公告
      });

      if (result === 0) {
        return res.status(404).json({ message: '未找到该学校公告' });
      }

      res.status(200).json({ message: '学校公告删除成功' });

    } catch (error) {
      console.error('删除学校公告失败:', error);
      res.status(500).json({ message: '删除公告失败', error: error.message });
    }
  };

module.exports = {
  getSchoolAnnouncements,
  createSchoolAnnouncement,
  getSchoolAnnouncementDetails,
  updateSchoolAnnouncement,
  deleteSchoolAnnouncement,
}; 
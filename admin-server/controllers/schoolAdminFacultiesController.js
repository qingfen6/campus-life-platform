const db = require('../config/db');

// 获取当前学校的学院列表
exports.getFacultiesBySchool = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权访问此学校的信息' });
    }

    const faculties = await db.Faculty.findAll({
      where: { school_id: schoolId },
      attributes: ['faculty_id', 'faculty_name'],
      order: [['faculty_name', 'ASC']]
    });

    res.json({
      success: true,
      data: faculties
    });

  } catch (error) {
    console.error('获取学校学院列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}; 
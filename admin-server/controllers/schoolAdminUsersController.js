const db = require('../config/db');
const { Op } = require('sequelize'); // 用于复杂查询

// 获取本校用户列表 (分页、搜索、筛选)
exports.getSchoolUsers = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权访问此学校的信息' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { search, status, facultyId } = req.query;

    let whereClause = { school_id: schoolId };
    const includeClause = [];

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { real_name: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.user_status = status;
    }

    if (facultyId) {
      whereClause.faculty_id = facultyId;
      // 如果需要学院名称，可以考虑联表查询 faculties 表
      // includeClause.push({ model: db.Faculty, attributes: ['faculty_name'], required: false });
    }
    
    // 为了获取 faculty_name, 我们需要联表查询
    // 注意：这需要你在 User 模型中定义与 Faculty 的关联
    // 假设 users 表中有 faculty_id, faculties 表中有 faculty_id 和 faculty_name
    // 你需要在 User 和 Faculty 模型中定义好 belongsTo/hasMany 的关系
    // 例如，在 User 模型中: User.belongsTo(models.Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
    // 在 Faculty 模型中: Faculty.hasMany(models.User, { foreignKey: 'faculty_id', as: 'users' });

    const queryOptions = {
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [['created_at', 'DESC']],
        attributes: [
            'user_id', 'username', 'real_name', 'student_id', 'enrollment_year',
            'user_status', 'email', 'phone', 'created_at' // faculty_id 也会被包含，因为它是 User 表的列
        ],
        include: [{
            model: db.Faculty, // 关联 Faculty 模型
            as: 'faculty',     // 使用在 User 模型中定义的别名
            attributes: ['faculty_id', 'faculty_name'], // 只选择学院的ID和名称
            required: false // 使用 LEFT JOIN，即使没有学院信息也返回用户
        }],
        // raw: true, // 当使用 include 时，通常不设置 raw: true，除非需要非常扁平的结构并手动处理
        nest: true, // nest: true 会将关联数据嵌套在用户对象下，例如 user.faculty.faculty_name
    };

    // 暂时不直接联表查询学院名称，前端模拟或后续添加
    // 如果需要联表查询学院名称，需要正确配置Sequelize模型关联
    // 这里假设 users 表中已经有了 faculty_name 字段 (虽然数据库设计中没有，但为了模拟前端的faculty_name)
    // 或者，更好的做法是让前端根据 faculty_id 自行查找 faculty_name 或后端单独提供 faculty列表

    const { count, rows } = await db.User.findAndCountAll(queryOptions);

    // 为了匹配前端期望的 faculty_name，我们可以做一个简单的映射（如果需要且有学院列表）
    // 或者前端自行处理 faculty_id 到名称的转换
    // 这里的 mockData 中 faculty_name 是模拟的，后端应返回 faculty_id
    
    // 如果需要获取学院名称，并且User模型关联了Faculty模型 as 'faculty'
    // const usersWithFaculty = rows.map(user => {
    //   return {
    //     ...user,
    //     faculty_name: user.faculty ? user.faculty.faculty_name : null
    //   };
    // });

    res.json({
      success: true,
      data: {
        users: rows, // rows 将包含嵌套的 faculty 对象
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error('获取学校用户列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// 更新用户状态 (启用/禁用)
exports.updateUserStatus = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    const { userId } = req.params;
    const { status } = req.body; // 期望 status 为 'active' 或 'inactive'

    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权执行此操作' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    if (!status || !['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态值。只允许 active, inactive, banned。' });
    }

    const user = await db.User.findOne({
      where: {
        user_id: userId,
        school_id: schoolId // 确保管理员只能修改自己学校的用户
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '未找到指定用户或无权修改该用户' });
    }

    user.user_status = status;
    await user.save();

    res.json({ success: true, message: '用户状态更新成功', data: { userId: user.user_id, newStatus: user.user_status } });

  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// TODO: 实现其他用户管理功能，如更新用户状态、获取用户详情、批量添加等 
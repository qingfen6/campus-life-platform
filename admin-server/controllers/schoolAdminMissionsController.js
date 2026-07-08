const db = require('../config/db');
const { Op } = require('sequelize'); // 用于复杂查询

// 获取本校悬赏列表 (分页、搜索、筛选)
exports.getSchoolMissions = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权访问此学校的悬赏信息' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { search, status, category } = req.query;

    let missionWhereClause = {};
    let userWhereClause = { school_id: schoolId }; // 过滤条件放在关联的用户表上

    if (search) {
      missionWhereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      missionWhereClause.status = status;
    }

    if (category) {
      missionWhereClause.category = category;
    }

    const queryOptions = {
        where: missionWhereClause,
        limit: pageSize,
        offset: offset,
        order: [['created_at', 'DESC']],
        include: [{
            model: db.User, // 关联 User 模型
            as: 'publisher', // 假设 Mission 模型关联 User 模型时使用了别名 'publisher'
            attributes: ['user_id', 'username', 'real_name', 'student_id'], // 选择发布者的部分信息
            where: userWhereClause, // 在关联的 User 模型上应用学校过滤
            required: true // 使用 INNER JOIN，只返回本校用户的悬赏
        }],
        // attributes: [ // 可以选择 Mission 表需要的字段
        //     'mission_id', 'title', 'description', 'reward', 'category',
        //     'difficulty', 'location', 'deadline', 'status', 'created_at'
        // ],
        nest: true, // 嵌套关联数据
    };

    // 注意：你需要确保在你的 Sequelize 模型定义中，Mission 模型与 User 模型有正确的关联
    // 例如，在 Mission 模型定义中: Mission.belongsTo(models.User, { foreignKey: 'user_id', as: 'publisher' });
    // 确保 db 对象包含了 Mission 和 User 模型，并且它们已经定义了关联关系。
    // 如果你的 Sequelize 模型未定义关联，或者db对象结构不同，这里的代码需要调整。
    
    // 假设 db.Mission 和 db.User 存在且关联已定义
    const { count, rows } = await db.Mission.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        missions: rows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error('获取学校悬赏列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// 更新悬赏状态
exports.updateMissionStatus = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    const { missionId } = req.params;
    const { status } = req.body; // 期望 status 为 missions 表中的有效状态值

    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权执行此操作' });
    }

    if (!missionId) {
      return res.status(400).json({ success: false, message: '缺少悬赏ID' });
    }

    // 验证 status 是否为 missions 表 status 字段允许的值
    const validStatuses = ['open', 'in_progress', 'submitted_for_review', 'completed', 'closed', 'canceled', 'expired'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `无效的状态值。只允许 ${validStatuses.join(', ')}。` });
    }

    // 查找悬赏，并验证其是否属于当前学校管理员的学校
    const mission = await db.Mission.findOne({
      where: {
        mission_id: missionId,
      },
      include: [{
          model: db.User,
          as: 'publisher',
          where: { school_id: schoolId },
          required: true
      }]
    });

    if (!mission) {
      return res.status(404).json({ success: false, message: '未找到指定悬赏或无权修改该悬赏' });
    }

    // 更新悬赏状态
    mission.status = status;
    await mission.save();

    res.json({ success: true, message: '悬赏状态更新成功', data: { missionId: mission.mission_id, newStatus: mission.status } });

  } catch (error) {
    console.error('更新悬赏状态失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }finally {
    // 如果使用了事务，这里需要根据情况提交或回滚
  }
};

// TODO: 实现其他悬赏管理功能，如获取悬赏详情、编辑悬赏等 
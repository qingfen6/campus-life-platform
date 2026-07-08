/**
 * 悬赏任务控制器
 * 
 * 负责处理与悬赏任务相关的API请求
 */
const asyncHandler = require('express-async-handler');
const { pool } = require('../../config/db');
const { createNotification } = require('../../controllers/notification/notificationController');

/**
 * @desc    获取任务列表
 * @route   GET /api/mission/missions
 * @access  Public
 */
const getMissions = asyncHandler(async (req, res) => {
  try {
    // 解析查询参数
    const { 
      category, 
      difficulty,
      reward_min, 
      reward_max,
      sort,
      page = 1,
      limit = 10,
      status = 'open',
      search
    } = req.query;
    
    // 构建查询条件
    let conditions = ['m.status = ?'];
    let params = [status];
    
    if (category && category !== 'all' && category !== 'undefined') {
      conditions.push('m.category = ?');
      params.push(category);
    }
    
    if (difficulty && difficulty !== 'all' && difficulty !== 'undefined') {
      conditions.push('m.difficulty = ?');
      params.push(difficulty);
    }
    
    if (reward_min && reward_min !== 'undefined') {
      conditions.push('m.reward >= ?');
      params.push(parseFloat(reward_min));
    }
    
    if (reward_max && reward_max !== 'undefined') {
      conditions.push('m.reward <= ?');
      params.push(parseFloat(reward_max));
    }
    
    if (search && search !== 'undefined') {
      conditions.push('(m.title LIKE ? OR m.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // 构建排序条件
    let orderBy;
    switch (sort) {
      case 'reward-desc':
        orderBy = 'm.reward DESC';
        break;
      case 'reward-asc':
        orderBy = 'm.reward ASC';
        break;
      case 'deadline':
        orderBy = 'm.deadline ASC';
        break;
      case 'created_at-desc':
        orderBy = 'm.created_at DESC';
        break;
      case 'created_at-asc':
        orderBy = 'm.created_at ASC';
        break;
      default:
        orderBy = 'm.created_at DESC';
    }
    
    console.log('任务查询条件:', conditions, params);
    console.log('任务排序方式:', orderBy);
    
    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 执行查询
    let query = `
      SELECT 
        m.mission_id, m.title, m.description, m.reward, 
        m.category, m.difficulty, m.estimated_hours, m.location, m.deadline,
        m.status, m.view_count, m.created_at,
        u.user_id, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM mission_takes WHERE mission_id = m.mission_id) AS accepted_count
      FROM 
        missions m
      JOIN 
        users u ON m.user_id = u.user_id
      WHERE 
        ${conditions.join(' AND ')}
      ORDER BY 
        ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const [missions] = await pool.query(query, [...params, parseInt(limit), offset]);
    
    // 获取总任务数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM missions m WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = countResult[0].total;
    
    // 构建响应数据
    const formattedMissions = missions.map(mission => {
      // 生成随机图片URL (模拟数据，实际项目中应该从数据库获取)
      const imageUrls = [
        "https://images.unsplash.com/photo-1568010434570-74e9ba7126bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1581579438747-e5b5638bee13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ];
      const randomIndex = mission.mission_id % imageUrls.length;
      
      return {
        id: mission.mission_id,
        title: mission.title,
        reward: parseFloat(mission.reward),
        description: mission.description,
        category: mission.category,
        difficulty: mission.difficulty,
        estimatedHours: mission.estimated_hours,
        location: mission.location,
        deadline: mission.deadline,
        progress: 0, // 实际项目中应该从任务进度表中获取
        acceptedCount: mission.accepted_count,
        viewCount: mission.view_count,
        time: mission.created_at,
        status: mission.status,
        imageUrl: imageUrls[randomIndex], // 添加图片URL
        requestor: {
          id: mission.user_id,
          name: mission.username,
          avatar: mission.avatar_url
        }
      };
    });
    
    res.json({
      success: true,
      data: {
        missions: formattedMissions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取任务详情
 * @route   GET /api/mission/missions/:id
 * @access  Public
 */
const getMissionDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的任务ID'
      });
    }
    
    console.log(`获取任务详情，ID: ${id}`);
    
    // 增加浏览次数
    await pool.query(
      `UPDATE missions SET view_count = view_count + 1 WHERE mission_id = ?`,
      [id]
    );
    
    // 查询任务详情
    const [missions] = await pool.query(
      `SELECT 
        m.mission_id, m.title, m.description, m.reward, 
        m.category, m.difficulty, m.estimated_hours, m.location, m.deadline,
        m.status, m.view_count, m.created_at,
        u.user_id, u.username, u.avatar_url
      FROM 
        missions m
      JOIN 
        users u ON m.user_id = u.user_id
      WHERE 
        m.mission_id = ?`,
      [id]
    );
    
    if (missions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    const mission = missions[0];
    
    // 获取任务申请人数
    const [takesCount] = await pool.query(
      `SELECT COUNT(*) as count FROM mission_takes WHERE mission_id = ?`,
      [id]
    );
    
    // 生成随机图片URL (模拟数据，实际项目中应该从数据库获取)
    const imageUrls = [
      "https://images.unsplash.com/photo-1568010434570-74e9ba7126bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1581579438747-e5b5638bee13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    ];
    const randomIndex = mission.mission_id % imageUrls.length;
    
    // 构建响应数据
    const formattedMission = {
      id: mission.mission_id,
      title: mission.title,
      reward: parseFloat(mission.reward),
      description: mission.description,
      category: mission.category,
      difficulty: mission.difficulty,
      estimatedHours: mission.estimated_hours,
      location: mission.location,
      deadline: mission.deadline,
      progress: 0, // 实际项目中应该从任务进度表中获取
      acceptedCount: takesCount[0].count,
      viewCount: mission.view_count,
      createdAt: mission.created_at,
      status: mission.status,
      imageUrl: imageUrls[randomIndex], // 添加图片URL
      requestor: {
        id: mission.user_id,
        name: mission.username,
        avatar: mission.avatar_url
      }
    };
    
    res.json({
      success: true,
      data: formattedMission
    });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务详情失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取任务分类
 * @route   GET /api/mission/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  try {
    console.log('获取任务分类...');
    let formattedCategories = [];
    
    try {
      // 查询任务分类及其计数
      const [categories] = await pool.query(
        `SELECT category, COUNT(*) as count 
         FROM missions 
         WHERE status = 'open' 
         GROUP BY category 
         ORDER BY count DESC`
      );
      
      // 检查是否有分类数据
      if (categories && categories.length > 0) {
        formattedCategories = categories.map(cat => ({
          value: cat.category,
          label: cat.category,
          count: cat.count
        }));
        console.log(`找到 ${categories.length} 个任务分类`);
      }
    } catch (dbError) {
      console.warn('数据库查询任务分类出错:', dbError.message);
    }
    
    // 如果没有找到分类数据（可能是表为空或查询出错），使用默认分类
    if (formattedCategories.length === 0) {
      console.log('没有找到任务分类数据，使用默认分类');
      formattedCategories = [
        { value: 'express', label: '快递代取', count: 0 },
        { value: 'study', label: '学习辅导', count: 0 },
        { value: 'activity', label: '活动相关', count: 0 },
        { value: 'other', label: '其他任务', count: 0 }
      ];
    }
    
    // 添加"全部"选项
    const totalCount = formattedCategories.reduce((sum, cat) => sum + cat.count, 0);
    formattedCategories.unshift({
      value: 'all',
      label: '全部',
      count: totalCount
    });
    
    console.log('返回任务分类数据:', formattedCategories);
    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('获取任务分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务分类失败',
      error: error.message
    });
  }
});

/**
 * @desc    发布任务
 * @route   POST /api/mission/missions
 * @access  Private
 */
const addMission = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      title, 
      description, 
      reward, 
      category, 
      difficulty, 
      estimatedHours, 
      location, 
      deadline 
    } = req.body;
    
    const userId = req.user.id;
    
    // 验证必填字段
    if (!title || !reward || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 标题、悬赏金额、类别和难度为必填项'
      });
    }
    
    // 验证悬赏金额必须为正数
    if (isNaN(reward) || parseFloat(reward) <= 0) {
      return res.status(400).json({
        success: false,
        message: '悬赏金额必须为正数'
      });
    }
    
    console.log('发布任务:', title, category, difficulty, '悬赏金额:', reward);
    
    // 开始事务
    await connection.beginTransaction();
    
    // 检查用户账户余额是否足够（如果有账户系统）
    try {
      const [accounts] = await connection.query(
        `SELECT balance FROM accounts WHERE user_id = ?`,
        [userId]
      );
      
      if (accounts.length > 0) {
        const account = accounts[0];
        if (account.balance < parseFloat(reward)) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: '账户余额不足，无法发布任务'
          });
        }
        
        // 冻结相应金额（如果需要）
        await connection.query(
          `UPDATE accounts SET frozen_amount = frozen_amount + ? WHERE user_id = ?`,
          [parseFloat(reward), userId]
        );
      }
    } catch (error) {
      console.log('检查账户余额失败，继续处理:', error.message);
      // 如果账户表不存在，继续处理
    }
    
    // 格式化截止日期（如果提供）
    let formattedDeadline = null;
    if (deadline) {
      try {
        formattedDeadline = new Date(deadline);
        // 检查日期是否有效
        if (isNaN(formattedDeadline.getTime())) {
          formattedDeadline = null;
        }
      } catch (error) {
        console.warn('截止日期格式无效:', deadline);
        formattedDeadline = null;
      }
    }
    
    // 插入任务记录
    const [result] = await connection.query(
      `INSERT INTO missions (
        user_id, title, description, reward, 
        category, difficulty, estimated_hours, location, deadline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        userId, 
        title.trim(), 
        description ? description.trim() : null, 
        parseFloat(reward), 
        category.trim(), 
        difficulty, 
        estimatedHours ? parseFloat(estimatedHours) : null, 
        location ? location.trim() : null, 
        formattedDeadline
      ]
    );
    
    const missionId = result.insertId;
    
    // 创建交易记录（如果有交易系统）
    try {
      await connection.query(
        `INSERT INTO transactions (
          user_id, transaction_type, amount, status, 
          reference_id, description
        ) VALUES (?, 'mission', ?, 'pending', ?, ?)`,
        [
          userId,
          parseFloat(reward),
          `mission_${missionId}`,
          `发布悬赏任务: ${title}`
        ]
      );
    } catch (error) {
      console.log('创建交易记录失败，继续处理:', error.message);
      // 如果交易表不存在，继续处理
    }
    
    // 提交事务
    await connection.commit();
    
    res.status(201).json({
      success: true,
      data: {
        id: missionId,
        message: '任务发布成功'
      }
    });
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    console.error('发布任务失败:', error);
    res.status(500).json({
      success: false,
      message: '发布任务失败: ' + (error.message || '服务器内部错误'),
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @desc    接受任务
 * @route   POST /api/mission/take
 * @access  Private
 */
const takeMission = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { missionId, message } = req.body;
    const userId = req.user.id;
    
    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 任务ID为必填项'
      });
    }
    
    console.log(`用户${userId}申请接受任务${missionId}`, message ? `，申请信息: ${message}` : '');
    
    // 开始事务
    await connection.beginTransaction();
    
    // 检查任务是否存在且状态为开放
    const [missions] = await connection.query(
      `SELECT user_id, status, title FROM missions WHERE mission_id = ?`,
      [missionId]
    );
    
    if (missions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    const mission = missions[0];
    
    if (mission.status !== 'open') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `该任务当前不可接受，当前状态: ${mission.status}`
      });
    }
    
    if (mission.user_id === userId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '不能接受自己发布的任务'
      });
    }
    
    // 获取申请者的用户信息
    const [users] = await connection.query(
      `SELECT username FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const applicantUser = users[0];
    
    // 检查是否已申请过该任务
    const [existingTakes] = await connection.query(
      `SELECT take_id, status FROM mission_takes WHERE mission_id = ? AND taker_id = ?`,
      [missionId, userId]
    );
    
    if (existingTakes.length > 0) {
      await connection.rollback();
      
      // 检查现有申请的状态
      const takeStatus = existingTakes[0].status;
      let statusMessage = '';
      
      switch (takeStatus) {
        case 'applied':
          statusMessage = '你已经申请过该任务，请等待发布者审核';
          break;
        case 'accepted':
          statusMessage = '你已经被选中接受该任务';
          break;
        case 'rejected':
          statusMessage = '你的申请已被拒绝，无法再次申请';
          break;
        case 'completed':
          statusMessage = '你已经完成过该任务';
          break;
        case 'abandoned':
          statusMessage = '你已经放弃过该任务，无法再次申请';
          break;
        default:
          statusMessage = '你已经申请过该任务';
      }
      
      return res.status(400).json({
        success: false,
        message: statusMessage
      });
    }
    
    // 插入任务申请记录
    const [result] = await connection.query(
      `INSERT INTO mission_takes (
        mission_id, taker_id, status, apply_message, created_at
      ) VALUES (?, ?, 'applied', ?, NOW())`,
      [missionId, userId, message || null]
    );
    
    const takeId = result.insertId;
    
    // 创建通知
    await createNotification(
      mission.user_id,  // 任务发布者
      userId,           // 申请人
      'mission',        // 通知类型
      'application',    // 动作类型
      `用户 ${applicantUser.username} 申请接受你的任务: ${mission.title}`,
      'mission',
      missionId,
      JSON.stringify({
        takeId: takeId,
        missionId: missionId,
        applicantInfo: {
          id: userId,
          name: applicantUser.username,
          avatar: null,
          message: message || '无申请说明'
        }
      })
    );
    
    // 提交事务
    await connection.commit();
    
    res.status(201).json({
      success: true,
      data: {
        takeId: takeId,
        message: '任务申请已提交，请等待发布者审核'
      }
    });
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    console.error('申请任务失败:', error);
    res.status(500).json({
      success: false,
      message: '申请任务失败: ' + (error.message || '服务器内部错误'),
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @desc    获取任务申请列表
 * @route   GET /api/mission/applications/:missionId
 * @access  Private
 */
const getMissionApplicants = asyncHandler(async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = req.user.id;
    
    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 任务ID为必填项'
      });
    }
    
    // 检查任务是否存在，且是否为该用户发布
    const [missions] = await pool.query(
      `SELECT * FROM missions WHERE mission_id = ? AND user_id = ?`,
      [missionId, userId]
    );
    
    if (missions.length === 0) {
      return res.status(403).json({
        success: false,
        message: '任务不存在或者你不是该任务的发布者'
      });
    }
    
    const mission = missions[0];
    
    // 获取申请列表
    const [takes] = await pool.query(
      `SELECT 
        mt.take_id, mt.mission_id, mt.taker_id, mt.status, 
        mt.apply_message, mt.created_at,
        u.username, u.avatar_url, u.credit_score
      FROM 
        mission_takes mt
      JOIN 
        users u ON mt.taker_id = u.user_id
      WHERE 
        mt.mission_id = ?
      ORDER BY
        mt.created_at DESC`,
      [missionId]
    );
    
    // 格式化数据
    const applicants = takes.map(take => ({
      takeId: take.take_id,
      missionId: take.mission_id,
      status: take.status,
      message: take.apply_message,
      applyTime: take.created_at,
      applicant: {
        id: take.taker_id,
        username: take.username,
        avatar: take.avatar_url,
        creditScore: take.credit_score || 0
      }
    }));
    
    res.json({
      success: true,
      data: {
        mission: {
          id: mission.mission_id,
          title: mission.title,
          status: mission.status
        },
        applicants
      }
    });
  } catch (error) {
    console.error('获取任务申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务申请列表失败',
      error: error.message
    });
  }
});

/**
 * @desc    处理任务申请(接受或拒绝)
 * @route   POST /api/mission/applications/:takeId
 * @access  Private
 */
const handleMissionApplication = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { takeId } = req.params;
    const { action, message } = req.body;
    const userId = req.user.id;
    
    if (!takeId || !action) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 申请ID和操作类型(接受/拒绝)为必填项'
      });
    }
    
    if (action !== 'accept' && action !== 'reject') {
      return res.status(400).json({
        success: false,
        message: '操作类型不正确，只支持 accept(接受) 或 reject(拒绝)'
      });
    }
    
    // 开始事务
    await connection.beginTransaction();
    
    // 获取申请信息
    const [takes] = await connection.query(
      `SELECT mt.*, m.user_id as mission_owner_id, m.title as mission_title, m.status as mission_status
       FROM mission_takes mt
       JOIN missions m ON mt.mission_id = m.mission_id
       WHERE mt.take_id = ?`,
      [takeId]
    );
    
    if (takes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }
    
    const take = takes[0];
    
    // 检查用户是否为任务发布者
    if (take.mission_owner_id !== userId) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: '你不是该任务的发布者，无权处理该申请'
      });
    }
    
    // 检查任务状态
    if (take.mission_status !== 'open') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `该任务当前状态为 ${take.mission_status}，不能处理申请`
      });
    }
    
    // 检查申请状态
    if (take.status !== 'applied') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `该申请当前状态为 ${take.status}，不能进行此操作`
      });
    }
    
    // 处理申请
    if (action === 'accept') {
      // 更新申请状态为已接受
      await connection.query(
        `UPDATE mission_takes SET status = 'accepted', updated_at = NOW() WHERE take_id = ?`,
        [takeId]
      );
      
      // 更新任务状态为进行中
      await connection.query(
        `UPDATE missions SET status = 'in_progress', updated_at = NOW() WHERE mission_id = ?`,
        [take.mission_id]
      );
      
      // 拒绝其他申请
      await connection.query(
        `UPDATE mission_takes SET status = 'rejected', updated_at = NOW() 
         WHERE mission_id = ? AND take_id != ? AND status = 'applied'`,
        [take.mission_id, takeId]
      );
      
      // 获取申请者用户信息
      const [applicants] = await connection.query(
        `SELECT username FROM users WHERE user_id = ?`,
        [take.taker_id]
      );
      
      const applicantName = applicants.length > 0 ? applicants[0].username : '用户';
      
      // 创建通知给申请者
      await createNotification(
        take.taker_id,     // 接收通知的用户 - 申请者
        userId,           // 发送通知的用户 - 任务发布者
        'mission',        // 通知类型
        'accepted',       // 动作类型
        `你申请的任务 "${take.mission_title}" 已被接受！${message ? '留言: ' + message : ''}`,
        'mission',
        take.mission_id,
        JSON.stringify({
          takeId: takeId,
          missionId: take.mission_id,
          message: message || null
        })
      );
      
      // 创建通知给被拒绝的申请者
      const [rejectedApplicants] = await connection.query(
        `SELECT mt.taker_id 
         FROM mission_takes mt
         WHERE mt.mission_id = ? AND mt.take_id != ? AND mt.status = 'rejected'`,
        [take.mission_id, takeId]
      );
      
      for (const rejectedApplicant of rejectedApplicants) {
        await createNotification(
          rejectedApplicant.taker_id, // 接收通知的用户 - 被拒绝的申请者
          userId,                     // 发送通知的用户 - 任务发布者
          'mission',                  // 通知类型
          'rejected',                 // 动作类型
          `你申请的任务 "${take.mission_title}" 已经被其他人接受了`,
          'mission',
          take.mission_id,
          JSON.stringify({
            missionId: take.mission_id
          })
        );
      }
    } else { // action === 'reject'
      // 更新申请状态为已拒绝
      await connection.query(
        `UPDATE mission_takes SET status = 'rejected', updated_at = NOW() WHERE take_id = ?`,
        [takeId]
      );
      
      // 创建通知给申请者
      await createNotification(
        take.taker_id,     // 接收通知的用户 - 申请者
        userId,           // 发送通知的用户 - 任务发布者
        'mission',        // 通知类型
        'rejected',       // 动作类型
        `你申请的任务 "${take.mission_title}" 被拒绝了。${message ? '原因: ' + message : ''}`,
        'mission',
        take.mission_id,
        JSON.stringify({
          takeId: takeId,
          missionId: take.mission_id,
          reason: message || null
        })
      );
    }
    
    // 提交事务
    await connection.commit();
    
    res.json({
      success: true,
      data: {
        message: action === 'accept' ? '已接受此申请' : '已拒绝此申请',
        taskId: take.mission_id,
        takeId: takeId,
        applicantId: take.taker_id,
        newStatus: action === 'accept' ? 'accepted' : 'rejected'
      }
    });
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    console.error('处理任务申请失败:', error);
    res.status(500).json({
      success: false,
      message: '处理任务申请失败: ' + (error.message || '服务器内部错误'),
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @desc    完成任务
 * @route   POST /api/mission/complete/:missionId
 * @access  Private
 */
const completeMission = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { missionId } = req.params;
    const { comment, attachments } = req.body;
    const userId = req.user.id;
    
    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 任务ID为必填项'
      });
    }
    
    // 开始事务
    await connection.beginTransaction();
    
    // 检查任务是否存在且状态为进行中
    const [missions] = await connection.query(
      `SELECT m.*, u.username as publisher_name
       FROM missions m
       JOIN users u ON m.user_id = u.user_id
       WHERE m.mission_id = ?`,
      [missionId]
    );
    
    if (missions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    const mission = missions[0];
    
    if (mission.status !== 'in_progress') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `该任务当前状态为 ${mission.status}，不能标记为完成`
      });
    }
    
    // 检查是否为任务接受者
    const [takes] = await connection.query(
      `SELECT * FROM mission_takes 
       WHERE mission_id = ? AND taker_id = ? AND status = 'accepted'`,
      [missionId, userId]
    );
    
    if (takes.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: '你不是该任务的接受者，无法标记任务完成'
      });
    }
    
    const take = takes[0];
    
    // 更新任务状态为完成待确认
    await connection.query(
      `UPDATE missions SET status = 'completed', updated_at = NOW() WHERE mission_id = ?`,
      [missionId]
    );
    
    // 更新任务申请状态为已完成
    await connection.query(
      `UPDATE mission_takes SET 
         status = 'completed', 
         completed_at = NOW(),
         updated_at = NOW() 
       WHERE take_id = ?`,
      [take.take_id]
    );
    
    // 保存完成评论（如果有）
    if (comment) {
      await connection.query(
        `INSERT INTO mission_completions (
           mission_id, take_id, comment, attachments, created_at
         ) VALUES (?, ?, ?, ?, NOW())`,
        [missionId, take.take_id, comment, attachments ? JSON.stringify(attachments) : null]
      );
    }
    
    // 创建通知给任务发布者
    await createNotification(
      mission.user_id,    // 接收通知的用户 - 任务发布者
      userId,             // 发送通知的用户 - 任务接受者
      'mission',          // 通知类型
      'completed',        // 动作类型
      `你的任务 "${mission.title}" 已被标记为完成，请确认`,
      'mission',
      missionId,
      JSON.stringify({
        takeId: take.take_id,
        missionId: missionId,
        comment: comment || null
      })
    );
    
    // 提交事务
    await connection.commit();
    
    res.json({
      success: true,
      message: '任务已标记为完成，等待发布者确认',
      data: {
        missionId: parseInt(missionId),
        status: 'completed'
      }
    });
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    console.error('标记任务完成失败:', error);
    res.status(500).json({
      success: false,
      message: '标记任务完成失败: ' + (error.message || '服务器内部错误'),
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @desc    确认任务完成
 * @route   POST /api/mission/confirm/:missionId
 * @access  Private
 */
const confirmMissionCompletion = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { missionId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;
    
    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息: 任务ID为必填项'
      });
    }
    
    // 开始事务
    await connection.beginTransaction();
    
    // 检查任务是否存在且状态为已完成
    const [missions] = await connection.query(
      `SELECT m.* FROM missions m WHERE m.mission_id = ?`,
      [missionId]
    );
    
    if (missions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    const mission = missions[0];
    
    // 检查用户是否为任务发布者
    if (mission.user_id !== userId) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: '你不是该任务的发布者，无法确认任务完成'
      });
    }
    
    // 新的状态检查，期望 'submitted_for_review'
    if (mission.status !== 'submitted_for_review') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `该任务当前状态为 ${mission.status}，不是待审核状态，不能确认完成`
      });
    }
    
    // 获取任务接受者信息
    const [takes] = await connection.query(
      `SELECT mt.*, u.username as taker_name 
       FROM mission_takes mt
       JOIN users u ON mt.taker_id = u.user_id
       WHERE mt.mission_id = ? AND mt.status = 'submitted_for_review'`,
      [missionId]
    );
    
    if (takes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '未找到该任务的完成记录'
      });
    }
    
    const take = takes[0];
    
    // 更新任务状态为已确认完成(closed)
    await connection.query(
      `UPDATE missions SET status = 'completed', updated_at = NOW() WHERE mission_id = ?`,
      [missionId]
    );
    
    // 添加评分和评价(如果有)
    if (rating || review) {
      await connection.query(
        `UPDATE mission_takes SET rating = ?, review = ?, updated_at = NOW() WHERE take_id = ?`,
        [rating || null, review || null, take.take_id]
      );
    }
    
    // 处理悬赏金支付(如果有账户系统)
    try {
      // 解冻金额
      await connection.query(
        `UPDATE accounts SET frozen_amount = frozen_amount - ? WHERE user_id = ?`,
        [mission.reward, userId]
      );
      
      // 扣除发布者金额
      await connection.query(
        `UPDATE accounts SET balance = balance - ? WHERE user_id = ?`,
        [mission.reward, userId]
      );
      
      // 增加接受者金额
      await connection.query(
        `UPDATE accounts SET balance = balance + ? WHERE user_id = ?`,
        [mission.reward, take.taker_id]
      );
      
      // 创建交易记录
      await connection.query(
        `INSERT INTO transactions (
          user_id, transaction_type, amount, status, 
          reference_id, description
        ) VALUES (?, 'mission', ?, 'completed', ?, ?)`,
        [
          userId,
          -parseFloat(mission.reward),
          `mission_${missionId}_payment`,
          `支付悬赏任务: ${mission.title}`
        ]
      );
      
      await connection.query(
        `INSERT INTO transactions (
          user_id, transaction_type, amount, status, 
          reference_id, description
        ) VALUES (?, 'mission', ?, 'completed', ?, ?)`,
        [
          take.taker_id,
          parseFloat(mission.reward),
          `mission_${missionId}_reward`,
          `获得悬赏任务奖励: ${mission.title}`
        ]
      );
    } catch (error) {
      console.log('处理账户交易失败，继续处理:', error.message);
      // 如果账户表不存在，继续处理
    }
    
    // 创建通知给任务接受者
    await createNotification(
      take.taker_id,      // 接收通知的用户 - 任务接受者
      userId,             // 发送通知的用户 - 任务发布者
      'mission',          // 通知类型
      'confirmed',        // 动作类型
      `你完成的任务 "${mission.title}" 已被发布者确认完成${rating ? `，获得评分: ${rating}分` : ''}`,
      'mission',
      missionId,
      JSON.stringify({
        takeId: take.take_id,
        missionId: missionId,
        rating: rating || null,
        review: review || null
      })
    );
    
    // 提交事务
    await connection.commit();
    
    res.json({
      success: true,
      message: '任务已确认完成',
      data: {
        missionId: parseInt(missionId),
        status: 'completed',
        reward: parseFloat(mission.reward),
        rating: rating || null
      }
    });
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    console.error('确认任务完成失败:', error);
    res.status(500).json({
      success: false,
      message: '确认任务完成失败: ' + (error.message || '服务器内部错误'),
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @desc    获取用户接单的任务
 * @route   GET /api/mission/accepted
 * @access  Private
 */
const getMissionsByTaker = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const missions = await pool.query(
    'SELECT m.*, u.username, u.avatar, t.take_time, t.message AS application_message ' +
    'FROM mission_takes t ' +
    'JOIN missions m ON t.mission_id = m.mission_id ' +
    'JOIN users u ON m.user_id = u.user_id ' +
    'WHERE t.user_id = ? AND t.status = "accepted" ' +
    'ORDER BY t.take_time DESC',
    [userId]
  );
  
  res.json({
    success: true,
    data: missions
  });
});

/**
 * @desc    获取用户发布的任务
 * @route   GET /api/mission/published
 * @access  Private
 */
const getMissionsByPublisher = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取用户发布的任务
    const [missions] = await pool.query(
      `SELECT 
        m.mission_id, m.title, m.description, m.reward, 
        m.category, m.difficulty, m.status, m.created_at,
        IFNULL(
          (SELECT t.taker_id FROM mission_takes t 
           WHERE t.mission_id = m.mission_id AND t.status = 'accepted'
           LIMIT 1), 
          NULL
        ) as taker_id,
        IFNULL(
          (SELECT u.username FROM mission_takes t 
           JOIN users u ON t.taker_id = u.user_id
           WHERE t.mission_id = m.mission_id AND t.status = 'accepted' 
           LIMIT 1),
          NULL
        ) as taker_username,
        IFNULL(
          (SELECT t.created_at FROM mission_takes t 
           WHERE t.mission_id = m.mission_id AND t.status = 'accepted'
           LIMIT 1), 
          NULL
        ) as take_time
      FROM 
        missions m
      WHERE 
        m.user_id = ?
      ORDER BY 
        m.created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: missions
    });
  } catch (error) {
    console.error('获取发布的任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发布的任务列表失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取用户接单的任务
 * @route   GET /api/mission/accepted
 * @access  Private
 */
const getAcceptedMissions = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const allowedTakeStatuses = ['accepted', 'submitted_for_review', 'completed', 'rejected']; 

    const [missionsData] = await pool.query(
      `SELECT 
        m.mission_id, m.title, m.description, m.reward, 
        m.category, m.difficulty, 
        m.status AS mission_main_status, -- 主任务状态
        m.created_at AS mission_created_at,
        pub.username AS publisher_username, pub.avatar_url AS publisher_avatar, -- 发布者信息
        t.take_id,                        -- <--- 必须选择 take_id
        t.status AS take_status,          -- 接取记录的状态
        t.created_at AS take_time,
        t.completed_at AS take_completed_time,
        t.rating AS take_rating,
        t.review AS take_review
      FROM 
        mission_takes t
      JOIN 
        missions m ON t.mission_id = m.mission_id
      JOIN 
        users pub ON m.user_id = pub.user_id -- 关联任务发布者 (用 pub 别名)
      WHERE 
        t.taker_id = ? AND t.status IN (?) -- <--- 查询多种状态
      ORDER BY 
        t.updated_at DESC, t.created_at DESC`,
      [userId, allowedTakeStatuses]
    );
    
    res.json({
      success: true,
      data: missionsData
    });
  } catch (error) {
    console.error('获取接单的任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取接单的任务列表失败',
      error: error.message
    });
  }
});

/**
 * @desc    提交任务接受
 * @route   POST /api/mission/submit/:missionId
 * @access  Private
 */
const submitMissionTake = asyncHandler(async (req, res) => {
  const { takeId } = req.params;
  const userId = req.user.id; // 从 protect 中间件获取当前用户ID

  if (!takeId || isNaN(parseInt(takeId))) {
    res.status(400);
    throw new Error('无效的接取记录ID');
  }

  const takeIdInt = parseInt(takeId);
  const connection = await pool.getConnection(); 

  try {
    await connection.beginTransaction(); 

    // 1. 查询接取记录，任务信息（发布者ID，标题）并验证用户和状态
    const [takes] = await connection.query(
      `SELECT 
        mt.mission_id, 
        mt.taker_id, 
        mt.status as take_status, 
        m.user_id as publisher_id, 
        m.title as mission_title 
       FROM mission_takes mt 
       JOIN missions m ON mt.mission_id = m.mission_id 
       WHERE mt.take_id = ?`,
      [takeIdInt]
    );

    if (takes.length === 0) {
      res.status(404);
      throw new Error('未找到该任务接取记录');
    }

    const takeRecord = takes[0];

    if (takeRecord.taker_id !== userId) {
      res.status(403); 
      throw new Error('您无权提交此任务');
    }

    // 根据之前的讨论，这里应该是 'accepted'
    if (takeRecord.take_status !== 'accepted') { 
      res.status(400);
      throw new Error(`任务当前状态为 "${takeRecord.take_status}"，无法提交完成`);
    }

    // 2. 更新接取记录状态为 'submitted_for_review'
    const [updateTakeResult] = await connection.query(
      'UPDATE mission_takes SET status = ? WHERE take_id = ?',
      ['submitted_for_review', takeIdInt]
    );

    if (updateTakeResult.affectedRows === 0) {
      throw new Error('更新任务接取状态失败');
    }
    
    // 3. 更新 mission 表的主任务状态为 'submitted_for_review'
    const [updateMissionResult] = await connection.query(
      'UPDATE missions SET status = ? WHERE mission_id = ?',
      ['submitted_for_review', takeRecord.mission_id]
    );

    if (updateMissionResult.affectedRows === 0) {
      // 可以选择性地处理这个错误，或者认为即使主任务状态更新失败，接取状态更新成功也算部分成功
      console.warn(`[submitMissionTake] 更新主任务 ${takeRecord.mission_id} 状态为 'submitted_for_review' 失败，但这不影响接取状态的提交。`);
    }

    // 4. 创建通知告知发布者
    try {
      const publisherId = takeRecord.publisher_id;
      const missionTitle = takeRecord.mission_title;
      
      const [takers] = await connection.query('SELECT username FROM users WHERE user_id = ?', [userId]);
      const takerUsername = takers.length > 0 ? takers[0].username : '一位用户';

      await createNotification(
        publisherId,          // userId (通知接收者)
        userId,               // senderId (操作发起者)
        'mission',            // notification_type
        'submission_pending', // action (确保 notificationController 和表结构支持)
        `${takerUsername} 已提交您发布的任务 "${missionTitle}" 的完成申请，请审核。`, // content
        'mission_take',       // contentType (关联到 mission_takes 表)
        takeIdInt,            // contentId (take_id)
        JSON.stringify({      // data (额外信息)
          mission_id: takeRecord.mission_id,
          take_id: takeIdInt,
          mission_title: missionTitle,
          taker_id: userId,
          taker_username: takerUsername
        })
      );
      console.log(`[submitMissionTake] 已为任务 ${takeRecord.mission_id} (take_id: ${takeIdInt}) 的发布者 ${publisherId} 创建提交通知`);
    
    } catch (notificationError) {
      console.error(`[submitMissionTake] 创建通知失败 (takeId: ${takeIdInt}):`, notificationError);
      // 不回滚主事务，因为核心操作（更新状态）已成功，通知失败不应影响主流程
    }

    await connection.commit(); 

    console.log(`[submitMissionTake] 用户 ${userId} 成功提交任务接取记录 ${takeIdInt}`);
    res.status(200).json({
      success: true,
      message: '任务已成功提交审核',
      data: {
        takeId: takeIdInt,
        newStatus: 'submitted_for_review' // mission_takes.status
      }
    });

  } catch (error) {
    await connection.rollback(); 
    console.error(`[submitMissionTake] 处理提交失败 (takeId: ${takeIdInt}):`, error);
    // 根据错误类型决定状态码
    let statusCode = 500;
    if (error.message.includes('未找到该任务接取记录')) statusCode = 404;
    else if (error.message.includes('您无权提交此任务')) statusCode = 403;
    else if (error.message.includes('无法提交完成')) statusCode = 400;
    
    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        message: error.message || '提交任务审核失败'
      });
    }
  } finally {
    if (connection) connection.release(); // 确保连接被释放
  }
});

/**
 * @desc    发布者取消开放中的悬赏
 * @route   POST /api/mission/:missionId/cancel-by-publisher
 * @access  Private (Publisher only)
 */
const cancelMissionByPublisher = asyncHandler(async (req, res) => {
    const { missionId } = req.params;
    const userId = req.user.id; // 发布者 ID

    if (!missionId || isNaN(parseInt(missionId))) {
        res.status(400);
        throw new Error('无效的任务ID');
    }

    const missionIdInt = parseInt(missionId);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. 获取任务信息并验证发布者和状态
        const [missions] = await connection.query(
            'SELECT mission_id, user_id, status, reward FROM missions WHERE mission_id = ?',
            [missionIdInt]
        );

        if (missions.length === 0) {
            res.status(404);
            throw new Error('未找到该悬赏任务');
        }

        const mission = missions[0];

        // 验证是否是本人操作
        if (mission.user_id !== userId) {
            res.status(403);
            throw new Error('您无权取消此悬赏，非任务发布者');
        }

        // 验证任务状态是否允许取消 (例如，必须是 'open')
        if (mission.status !== 'open') {
            res.status(400);
            throw new Error(`任务当前状态为 "${mission.status}"，无法取消。只有开放中的任务才能被取消。`);
        }

        // 2. 更新任务状态为 'canceled'
        const [updateResult] = await connection.query(
            'UPDATE missions SET status = ? WHERE mission_id = ?',
            ['canceled', missionIdInt]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error('取消悬赏失败，未能更新任务状态');
        }

        // 3. (可选) 处理冻结金额解冻
        // 如果在发布任务时有冻结发布者账户金额的逻辑，这里需要添加解冻逻辑
        // 例如:
        // await connection.query(
        //   `UPDATE accounts SET frozen_amount = frozen_amount - ? WHERE user_id = ? AND frozen_amount >= ?`,
        //   [mission.reward, userId, mission.reward]
        // );
        // 注意：上述账户操作需要你有 accounts 表和相应的余额/冻结金额字段

        // 4. (可选) 通知已申请但未被接受的用户任务已取消
        // 查询状态为 'applied' 的 mission_takes 记录
        const [appliedTakes] = await connection.query(
            `SELECT taker_id FROM mission_takes WHERE mission_id = ? AND status = 'applied'`,
            [missionIdInt]
        );

        if (appliedTakes.length > 0) {
            for (const take of appliedTakes) {
                try {
                    await createNotification(
                        take.taker_id,        // 接收者：申请人
                        userId,               // 发送者：发布者 (系统)
                        'mission',            // notification_type
                        'mission_canceled_by_publisher', // action
                        `您申请的悬赏任务 "${mission.title || '一个任务'}" 已被发布者取消。`, // content
                        'mission',            // contentType
                        missionIdInt,         // contentId
                        JSON.stringify({ mission_id: missionIdInt, title: mission.title })
                    );
                } catch (notificationError) {
                    console.error(`[cancelMissionByPublisher] 为申请者 ${take.taker_id} 创建任务取消通知失败:`, notificationError);
                }
            }
            // （可选）可以将这些被取消的申请的 mission_takes.status 更新为 'rejected' 或类似状态
            // await connection.query(
            //    `UPDATE mission_takes SET status = 'rejected' WHERE mission_id = ? AND status = 'applied'`, // 或一个更具体的取消状态
            //    [missionIdInt]
            // );
        }


        await connection.commit();

        res.status(200).json({
            success: true,
            message: '悬赏已成功取消',
            data: {
                missionId: missionIdInt,
                newStatus: 'canceled'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error(`[cancelMissionByPublisher] 取消悬赏失败 (missionId: ${missionIdInt}):`, error);
        let statusCode = 500;
        if (error.message.includes('未找到该悬赏任务')) statusCode = 404;
        else if (error.message.includes('您无权取消此悬赏')) statusCode = 403;
        else if (error.message.includes('无法取消')) statusCode = 400;
        
        if (!res.headersSent) {
            res.status(statusCode).json({
                 success: false,
                 message: error.message || '取消悬赏失败'
            });
        }
    } finally {
        if (connection) connection.release();
    }
});

module.exports = {
  getMissions,
  getMissionDetail,
  getCategories,
  addMission,
  takeMission,
  getMissionApplicants,
  handleMissionApplication,
  completeMission,
  confirmMissionCompletion,
  getMissionsByTaker,
  getMissionsByPublisher,
  getAcceptedMissions,
  submitMissionTake,
  cancelMissionByPublisher
}; 
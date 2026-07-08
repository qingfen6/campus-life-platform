/**
 * 任务进度控制器
 */
const { pool } = require('../../config/db');
const asyncHandler = require('express-async-handler');
const { createNotification } = require('../notification/notificationController');
const { sendNotification } = require('../../services/websocket'); // 导入 websocket 服务

// 获取任务状态
const getMissionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [mission] = await pool.query(
    'SELECT m.*, u.username, u.avatar, t.user_id AS taker_id, t.take_time, t.message AS application_message ' +
    'FROM missions m ' +
    'LEFT JOIN users u ON m.user_id = u.user_id ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ?',
    [id]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  
  // 获取任务进度
  const [progress] = await pool.query(
    'SELECT * FROM mission_progress WHERE mission_id = ? ORDER BY created_at DESC LIMIT 1',
    [id]
  );
  
  // 获取任务提交
  const [submissions] = await pool.query(
    'SELECT * FROM mission_submissions WHERE mission_id = ? ORDER BY submitted_at DESC',
    [id]
  );
  
  return res.json({
    success: true,
    data: {
      mission: mission[0],
      progress: progress.length > 0 ? progress[0] : null,
      submissions
    }
  });
});

// 更新任务进度
const updateMissionProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progressPercent, remarks } = req.body;
  const userId = req.user.id;
  
  // 验证任务存在且用户是接单者
  const [mission] = await pool.query(
    'SELECT m.*, t.user_id AS taker_id FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ?',
    [id]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  
  if (mission[0].taker_id !== userId) {
    return res.status(403).json({ success: false, message: '您不是此任务的接单者' });
  }
  
  // 添加进度记录
  await pool.query(
    'INSERT INTO mission_progress (mission_id, user_id, progress_percent, remarks) VALUES (?, ?, ?, ?)',
    [id, userId, progressPercent, remarks]
  );
  
  // 创建通知
  await createNotification(
    mission[0].user_id, 
    userId,
    'mission',
    'progress',
    `您的任务"${mission[0].title}"有新的进度更新: ${progressPercent}%`,
    'mission',
    id,
    JSON.stringify({
      missionId: id,
      progressPercent,
      remarks
    })
  );
  
  return res.json({
    success: true,
    message: '进度更新成功'
  });
});

// 提交任务成果
const submitMissionResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const userId = req.user.id;
  
  // 验证任务存在且用户是接单者
  const [mission] = await pool.query(
    'SELECT m.*, t.user_id AS taker_id FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ?',
    [id]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  
  if (mission[0].taker_id !== userId) {
    return res.status(403).json({ success: false, message: '您不是此任务的接单者' });
  }
  
  // 开始事务
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    // 创建提交记录
    const [result] = await connection.query(
      'INSERT INTO mission_submissions (mission_id, user_id, description) VALUES (?, ?, ?)',
      [id, userId, description]
    );
    
    const submissionId = result.insertId;
    
    // 处理附件
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          'INSERT INTO mission_attachments (submission_id, file_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
          [submissionId, file.originalname, file.path, file.size, file.mimetype]
        );
      }
    }
    
    // 更新任务状态
    await connection.query(
      'UPDATE missions SET status = "submitted", submission_time = NOW() WHERE mission_id = ?',
      [id]
    );
    
    // 创建通知
    const notificationResult = await createNotification(
      mission[0].user_id, 
      userId,
      'mission',
      'submission',
      `您的任务"${mission[0].title}"已提交完成，请查看并确认`,
      'mission',
      id,
      JSON.stringify({
        missionId: id,
        submissionId
      })
    );
    
    await connection.commit();
    
    // 如果通知创建成功，尝试实时推送
    if (notificationResult.success) {
      // 需要获取完整的通知内容来推送
      // (注意：原 createNotification 不返回完整通知，这里需要调整或再次查询)
      // 简化处理：假设我们能拿到通知对象
      // const [newNotification] = await connection.query('SELECT * FROM notifications WHERE notification_id = ?', [notificationResult.notificationId]);
      // if (newNotification.length > 0) {
      //   sendNotification(mission[0].user_id, newNotification[0]);
      // }
      console.log(`尝试为用户 ${mission[0].user_id} 推送任务提交通知... (需要实现获取通知详情)`);
      // 实际推送逻辑需要根据获取到的通知详情来实现
    }
    
    return res.json({
      success: true,
      message: '任务提交成功',
      data: {
        submissionId
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

// 审核任务
const reviewMissionSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { submissionId, status, feedback } = req.body;
  const userId = req.user.id;
  
  // 验证任务存在且用户是发布者
  const [mission] = await pool.query(
    'SELECT * FROM missions WHERE mission_id = ? AND user_id = ?',
    [id, userId]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在或您不是发布者' });
  }
  
  // 获取提交信息
  const [submission] = await pool.query(
    'SELECT * FROM mission_submissions WHERE submission_id = ? AND mission_id = ?',
    [submissionId, id]
  );
  
  if (submission.length === 0) {
    return res.status(404).json({ success: false, message: '提交记录不存在' });
  }
  
  // 更新提交状态
  await pool.query(
    'UPDATE mission_submissions SET status = ?, feedback = ?, updated_at = NOW() WHERE submission_id = ?',
    [status, feedback, submissionId]
  );
  
  // 如果通过，更新任务状态为已完成
  if (status === 'accepted') {
    await pool.query(
      'UPDATE missions SET status = "completed", completion_time = NOW() WHERE mission_id = ?',
      [id]
    );
  } else if (status === 'rejected' || status === 'revision_required') {
    // 如果拒绝或需要修改，将任务状态改回进行中
    await pool.query(
      'UPDATE missions SET status = "in_progress" WHERE mission_id = ?',
      [id]
    );
  }
  
  // 创建通知
  const statusMessages = {
    accepted: '已通过验收，任务完成',
    rejected: '未通过验收，请查看反馈',
    revision_required: '需要修改，请查看反馈'
  };
  
  await createNotification(
    submission[0].user_id,
    userId,
    'mission',
    'review',
    `您提交的任务"${mission[0].title}"${statusMessages[status]}`,
    'mission',
    id,
    JSON.stringify({
      missionId: id,
      submissionId,
      status,
      feedback
    })
  );
  
  return res.json({
    success: true,
    message: '审核完成'
  });
});

// 提交任务评价
const submitMissionRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rateeId, score, review, tags } = req.body;
  const userId = req.user.id;
  
  if (!rateeId || !score) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  // 验证任务存在且已完成
  const [mission] = await pool.query(
    'SELECT * FROM missions WHERE mission_id = ? AND status = "completed"',
    [id]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在或未完成' });
  }
  
  // 验证评价者身份（必须是发布者或接单者）
  const [validRater] = await pool.query(
    'SELECT * FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ? AND (m.user_id = ? OR t.taker_id = ?)',
    [id, userId, userId]
  );
  
  if (validRater.length === 0) {
    return res.status(403).json({ success: false, message: '您不是此任务的参与者' });
  }
  
  // 验证被评价者身份
  const [validRatee] = await pool.query(
    'SELECT * FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ? AND (m.user_id = ? OR t.taker_id = ?)',
    [id, rateeId, rateeId]
  );
  
  if (validRatee.length === 0) {
    return res.status(403).json({ success: false, message: '被评价者不是此任务的参与者' });
  }
  
  // 不能评价自己
  if (userId === rateeId) {
    return res.status(400).json({ success: false, message: '不能评价自己' });
  }
  
  const raterId = userId;
  
  // 检查是否已评价
  const [existingRating] = await pool.query(
    'SELECT * FROM mission_ratings WHERE mission_id = ? AND rater_id = ? AND ratee_id = ?',
    [id, raterId, rateeId]
  );
  
  if (existingRating.length > 0) {
    return res.status(400).json({ success: false, message: '您已经评价过此用户' });
  }
  
  // 提交评价
  await pool.query(
    'INSERT INTO mission_ratings (mission_id, rater_id, ratee_id, score, review, tags) VALUES (?, ?, ?, ?, ?, ?)',
    [id, raterId, rateeId, score, review, tags]
  );
  
  // 创建通知
  await createNotification(
    rateeId,
    raterId,
    'mission',
    'rating',
    `您在任务"${mission[0].title}"中收到了新的评价`,
    'mission',
    id,
    JSON.stringify({
      missionId: id,
      score,
      review
    })
  );
  
  return res.json({
    success: true,
    message: '评价提交成功'
  });
});

// 获取任务沟通记录
const getMissionCommunications = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // 验证用户是任务参与者
  const [participant] = await pool.query(
    'SELECT * FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ? AND (m.user_id = ? OR t.taker_id = ?)',
    [id, userId, userId]
  );
  
  if (participant.length === 0) {
    return res.status(403).json({ success: false, message: '您不是此任务的参与者' });
  }
  
  // 获取沟通记录
  const [communications] = await pool.query(
    'SELECT c.*, u.username, u.avatar FROM mission_communications c ' +
    'JOIN users u ON c.sender_id = u.user_id ' +
    'WHERE c.mission_id = ? ' +
    'AND ((c.sender_id = ? AND c.receiver_id IS NULL) OR ' +
    '     (c.sender_id = ? AND c.receiver_id = ?) OR ' +
    '     (c.sender_id = ? AND c.receiver_id = ?)) ' +
    'ORDER BY c.created_at ASC',
    [
      id, 
      participant[0].user_id,  // 发布者的全局消息
      participant[0].user_id,  // 发布者发给接单者
      userId,
      userId,                  // 接单者发给发布者
      participant[0].user_id
    ]
  );
  
  // 标记消息为已读
  await pool.query(
    'UPDATE mission_communications SET has_read = 1 WHERE mission_id = ? AND receiver_id = ? AND has_read = 0',
    [id, userId]
  );
  
  return res.json({
    success: true,
    data: communications
  });
});

// 发送任务消息
const sendMissionMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { receiverId, message } = req.body;
  const senderId = req.user.id;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: '消息内容不能为空' });
  }
  
  // 验证用户是任务参与者
  const [participant] = await pool.query(
    'SELECT * FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ? AND (m.user_id = ? OR t.taker_id = ?)',
    [id, senderId, senderId]
  );
  
  if (participant.length === 0) {
    return res.status(403).json({ success: false, message: '您不是此任务的参与者' });
  }
  
  // 验证接收者是任务参与者
  const [receiver] = await pool.query(
    'SELECT * FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ? AND (m.user_id = ? OR t.taker_id = ?)',
    [id, receiverId, receiverId]
  );
  
  if (receiver.length === 0) {
    return res.status(403).json({ success: false, message: '接收者不是此任务的参与者' });
  }
  
  // 发送消息
  const [result] = await pool.query(
    'INSERT INTO mission_communications (mission_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
    [id, senderId, receiverId, message]
  );
  
  // 创建通知
  await createNotification(
    receiverId,
    senderId,
    'mission',
    'message',
    `您在任务"${participant[0].title}"中有新消息`,
    'mission',
    id,
    JSON.stringify({
      missionId: id,
      commId: result.insertId,
      message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    })
  );
  
  return res.json({
    success: true,
    message: '消息发送成功'
  });
});

// 取消任务
const cancelMission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;
  
  // 获取任务信息
  const [mission] = await pool.query(
    'SELECT m.*, t.user_id AS taker_id FROM missions m ' +
    'LEFT JOIN mission_takes t ON m.mission_id = t.mission_id AND t.status = "accepted" ' +
    'WHERE m.mission_id = ?',
    [id]
  );
  
  if (mission.length === 0) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  
  // 验证用户身份
  if (mission[0].user_id !== userId) {
    return res.status(403).json({ success: false, message: '只有任务发布者可以取消任务' });
  }
  
  // 验证任务状态
  if (['completed', 'cancelled', 'closed'].includes(mission[0].status)) {
    return res.status(400).json({ success: false, message: `任务状态为 ${mission[0].status}，无法取消` });
  }
  
  // 更新任务状态
  await pool.query(
    'UPDATE missions SET status = "cancelled" WHERE mission_id = ?',
    [id]
  );
  
  // 如果任务已被接单，通知接单者
  if (mission[0].taker_id) {
    await createNotification(
      mission[0].taker_id,
      userId,
      'mission',
      'cancelled',
      `您接受的任务"${mission[0].title}"已被发布者取消`,
      'mission',
      id,
      JSON.stringify({
        missionId: id,
        reason
      })
    );
  }
  
  return res.json({
    success: true,
    message: '任务已取消'
  });
});

module.exports = {
  getMissionStatus,
  updateMissionProgress,
  submitMissionResult,
  reviewMissionSubmission,
  submitMissionRating,
  getMissionCommunications,
  sendMissionMessage,
  cancelMission
};

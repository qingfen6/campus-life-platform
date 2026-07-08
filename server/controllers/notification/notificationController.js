const asyncHandler = require('express-async-handler');
const { pool } = require('../../config/db');
// const { sendNotification } = require('../../services/websocket'); // 注释掉导入

/**
 * 创建新通知
 */
const createNotification = asyncHandler(async (userId, senderId, type, action, content, contentType, contentId, data = null) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 插入通知
    const [result] = await connection.query(
      `INSERT INTO notifications 
        (user_id, sender_id, notification_type, action, content, content_type, content_id, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, senderId, type, action, content, contentType, contentId, data]
    );
    
    const notificationId = result.insertId;
    
    // 获取插入的通知
    const [notifications] = await connection.query(
      `SELECT n.* FROM notifications n WHERE n.notification_id = ?`,
      [notificationId]
    );
    
    await connection.commit();
    
    // 注释掉或删除以下实时推送逻辑
    // if (notifications.length > 0) {
    //   const delivered = sendNotification(userId, notifications[0]);
    //   if (!delivered) {
    //     console.log(`用户 ${userId} 不在线，通知将在下次连接时发送`);
    //   }
    // }
    
    return { success: true, notificationId }; // 只返回成功和ID
  } catch (error) {
    await connection.rollback();
    console.error('创建通知失败:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
});

/**
 * 获取用户通知
 */
const getNotifications = asyncHandler(async (req, res) => {
  // 检查用户是否已登录
  if (!req.user) {
    return res.json({
      success: true,
      data: {
        notifications: [],
        unread: 0
      },
      message: '用户未登录'
    });
  }
  
  const userId = req.user.id;
  const { page = 1, limit = 20, unread_only = false } = req.query;
  
  try {
    // 构建查询条件
    let conditions = 'n.user_id = ?';
    const params = [userId];
    
    if (unread_only === 'true') {
      conditions += ' AND n.has_read = FALSE';
    }
    
    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询通知
    const [notifications] = await pool.query(
      `SELECT n.*, 
        u.username as sender_name, 
        u.avatar_url as sender_avatar
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.user_id
      WHERE ${conditions}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    // 查询未读数量
    const [unreadCount] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM notifications n
       WHERE n.user_id = ? AND n.has_read = FALSE`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        notifications,
        unread: unreadCount[0].count
      }
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({
      success: false, 
      message: '获取通知失败',
      error: error.message
    });
  }
});

/**
 * 标记通知为已读
 */
const markAsRead = asyncHandler(async (req, res) => {
  // 检查用户是否已登录
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '用户未登录'
    });
  }
  
  const userId = req.user.id;
  const { notification_id } = req.body;
  
  try {
    if (notification_id) {
      // 标记单个通知
      await pool.query(
        `UPDATE notifications n
         SET n.has_read = TRUE 
         WHERE n.notification_id = ? AND n.user_id = ?`,
        [notification_id, userId]
      );
    } else {
      // 标记所有通知
      await pool.query(
        `UPDATE notifications n
         SET n.has_read = TRUE 
         WHERE n.user_id = ? AND n.has_read = FALSE`,
        [userId]
      );
    }
    
    res.json({
      success: true,
      message: '标记通知已读成功'
    });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({
      success: false, 
      message: '标记通知已读失败',
      error: error.message
    });
  }
});

/**
 * 标记所有通知为已读
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  // 检查用户是否已登录
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '用户未登录'
    });
  }
  
  const userId = req.user.id;
  
  try {
    await pool.query(
      `UPDATE notifications n
       SET n.has_read = TRUE 
       WHERE n.user_id = ? AND n.has_read = FALSE`,
      [userId]
    );
    
    res.json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    res.status(500).json({
      success: false, 
      message: '标记所有通知已读失败',
      error: error.message
    });
  }
});

/**
 * 发送离线消息
 */
const sendOfflineNotifications = asyncHandler(async (userId) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications n
       WHERE n.user_id = ? AND n.has_read = FALSE
       ORDER BY n.created_at DESC LIMIT 10`,
      [userId]
    );
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error('获取离线通知失败:', error);
    return { success: false, error: error.message };
  }
});

/**
 * @desc Sends a notification internally and saves it to the database.
 * @param {string} recipientUserId - The ID of the user who will receive the notification.
 * @param {string|null} senderUserId - The ID of the user who triggered the notification (can be null for system notifications).
 * @param {string} notificationType - Type of notification (e.g., 'market', 'order_update'). Must match ENUM in 'notifications' table.
 * @param {string} contentText - The main text content of the notification.
 * @param {string} contentType - The type of content this notification relates to (e.g., 'order', 'product'). Must match ENUM.
 * @param {string|number|null} contentRefId - The ID of the related content item (e.g., order_id, product_id).
 * @returns {Promise<object>} - { success: boolean, message: string, notificationId?: string, error?: string }
 */
const sendNotificationInternal = async (recipientUserId, senderUserId, notificationType, contentText, contentType, contentRefId) => {
    try {
        if (!recipientUserId || !notificationType || !contentText || !contentType) {
            console.error("sendNotificationInternal: Missing required parameters.", 
                { recipientUserId, notificationType, contentText, contentType });
            return { success: false, message: "Missing required notification parameters." };
        }

        const sql = `INSERT INTO notifications (user_id, sender_id, notification_type, content, content_type, content_id, created_at, has_read) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE)`; // Use ? and remove RETURNING
        
        const [result] = await pool.query( // mysql2 with INSERT typically returns [OkPacket, fields]
            sql,
            [recipientUserId, senderUserId, notificationType, contentText, contentType, contentRefId]
        );

        if (result && result.affectedRows > 0 && result.insertId) {
            const notificationId = result.insertId;
            console.log(`Notification sent to user ${recipientUserId} (ID: ${notificationId}): ${contentText}`);
            return { success: true, message: "Notification sent successfully.", notificationId };
        } else {
            console.error("Failed to send notification: Insert operation did not return expected result (no insertId or affectedRows).");
            return { success: false, message: "Failed to send notification: No record created or ID not returned." };
        }
    } catch (error) {
        console.error("Error sending notification internally:", error, { recipientUserId, notificationType });
        return { success: false, message: "Failed to send notification due to an internal error.", error: error.message };
    }
};

const existingNotificationExports = module.exports || {};

module.exports = {
  ...existingNotificationExports,
  sendNotificationInternal,
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendOfflineNotifications
};


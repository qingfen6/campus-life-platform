const WebSocket = require('ws');
const { authMiddleware } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notification/notificationController');

const wss = new WebSocket.Server({ noServer: true });
const clients = new Map();

// 处理升级请求
const handleUpgrade = (request, socket, head) => {
  authMiddleware(request, {}, () => {
    if (!request.user) {
      socket.destroy();
      return;
    }
    
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
};

// 处理消息
const handleMessage = (userId, message) => {
  try {
    const data = JSON.parse(message);
    console.log(`从用户 ${userId} 收到消息:`, data);
    
    // 根据消息类型处理不同的逻辑
    // 暂时不处理客户端发送的消息
  } catch (error) {
    console.error('处理WebSocket消息出错:', error);
  }
};

// 发送离线消息
const sendOfflineMessages = async (userId) => {
  try {
    const result = await notificationController.sendOfflineNotifications(userId);
    if (result.success && result.data.length > 0) {
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        result.data.forEach(notification => {
          client.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        });
        console.log(`已发送 ${result.data.length} 条离线通知给用户 ${userId}`);
      }
    }
  } catch (error) {
    console.error('发送离线消息失败:', error);
  }
};

// 连接建立
wss.on('connection', (ws, request) => {
  const userId = request.user.id;
  clients.set(userId, ws);
  
  console.log(`用户 ${userId} WebSocket连接已建立`);
  
  ws.on('message', (message) => handleMessage(userId, message));
  ws.on('close', () => {
    console.log(`用户 ${userId} WebSocket连接已关闭`);
    clients.delete(userId);
  });
  
  // 发送离线消息
  sendOfflineMessages(userId);
});

// 发送通知给用户
const sendNotification = (userId, notification) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
    return true;
  }
  return false;
};

module.exports = { handleUpgrade, sendNotification };

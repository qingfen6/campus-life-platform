const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // 解构导入 protect 函数

// 应用认证中间件到所有聊天路由
router.use(protect); // 使用 protect 函数

// 好友列表
router.get('/friends', chatController.getFriendList);

// 会话列表 (私信)
router.get('/conversations', chatController.getConversationList);

// 获取或创建私聊会话
router.post('/conversations/private', chatController.getOrCreatePrivateConversation); // 需要对方 userId

// 获取特定会话的消息 (包括私聊和频道)
// 频道使用固定 ID: 1=校园, 2=全国
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// 发送消息到特定会话 (包括私聊和频道)
router.post('/conversations/:conversationId/messages', chatController.sendMessage);

// 发送好友请求
router.post('/friend-requests', chatController.sendFriendRequest); // 发送好友请求

// 获取收到的待处理好友请求
router.get('/friend-requests', chatController.getFriendRequests);  // 获取收到的好友请求

// 接受好友请求
router.post('/friend-requests/:requestId/accept', chatController.acceptFriendRequest); // 接受好友请求

// 拒绝好友请求
router.post('/friend-requests/:requestId/reject', chatController.rejectFriendRequest); // 拒绝好友请求

module.exports = router; 
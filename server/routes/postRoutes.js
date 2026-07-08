const express = require('express');
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // 假设有认证中间件
// const upload = require('../middleware/uploadMiddleware'); // 暂时注释，如果 createPost 被注释

const router = express.Router();

// 获取所有帖子 (公开) - 暂时注释，因为 getPosts 可能未导出
// router.get('/', postController.getPosts); 

// 新增：获取当前用户的帖子 (需要认证)
router.get('/my', protect, postController.getMyPosts);

// 获取单个帖子详情 (公开) - 暂时注释
// router.get('/:id', postController.getPostDetail);

// 创建新帖子 - 暂时注释
// router.post('/', protect, upload.array('media', 5), postController.createPost); // upload.array 处理媒体文件

// 点赞/取消点赞帖子 - 暂时注释
// router.post('/:id/like', protect, postController.likePost);
// router.delete('/:id/like', protect, postController.unlikePost);

// 获取帖子评论 - 暂时注释
// router.get('/:id/comments', postController.getComments);

// 添加评论 - 暂时注释
// router.post('/:id/comments', protect, postController.addComment);

// 删除评论 (需要认证，且是评论作者或帖子作者)
// router.delete('/comments/:commentId', protect, postController.deleteComment);

// 点赞/取消点赞评论 (需要认证)
// router.post('/comments/:commentId/like', protect, postController.likeComment);
// router.delete('/comments/:commentId/like', protect, postController.unlikeComment);

module.exports = router; 
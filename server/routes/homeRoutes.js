/**
 * 首页相关路由
 * 
 * 处理首页展示所需的数据，如热门话题、推荐内容等
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadPostMedia, handleMulterError } = require('../middleware/uploadMiddleware');
const {
  getHotTopics,
  getPosts,
  getCarousel,
  getRecommendedUsers,
  likePost,
  getPostComments,
  addPostComment,
  likeComment,
  addPost,
  getPostDetail
} = require('../controllers/homeController');

/**
 * @route   GET /api/home/hot-topics
 * @desc    获取热门话题
 * @access  Public
 */
router.get('/hot-topics', getHotTopics);

/**
 * @route   GET /api/home/posts
 * @desc    获取动态内容
 * @access  Public
 */
router.get('/posts', getPosts);

/**
 * @route   GET /api/home/carousel
 * @desc    获取轮播内容
 * @access  Public
 */
router.get('/carousel', getCarousel);

/**
 * @route   GET /api/home/recommended-users
 * @desc    获取推荐用户
 * @access  Public
 */
router.get('/recommended-users', getRecommendedUsers);

/**
 * @route   GET /api/home/comments/:postId
 * @desc    获取帖子评论
 * @access  Public
 */
router.get('/comments/:postId', getPostComments);

/**
 * @route   POST /api/home/posts/like
 * @desc    点赞动态
 * @access  Private
 */
router.post('/posts/like', protect, likePost);

/**
 * @route   POST /api/home/comments
 * @desc    添加帖子评论
 * @access  Private
 */
router.post('/comments', protect, addPostComment);

/**
 * @route   POST /api/home/comments/like
 * @desc    点赞评论
 * @access  Private
 */
router.post('/comments/like', protect, likeComment);

/**
 * @route   POST /api/home/posts
 * @desc    发布动态
 * @access  Private
 */
router.post('/posts', protect, uploadPostMedia.any(), handleMulterError, addPost);

/**
 * @route   GET /api/home/posts/:id
 * @desc    获取动态详情
 * @access  Public
 */
router.get('/posts/:id', getPostDetail);

module.exports = router; 
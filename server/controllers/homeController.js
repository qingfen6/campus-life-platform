/**
 * 首页控制器
 * 
 * 处理首页数据获取和交互的业务逻辑
 */
const { pool } = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * @desc    获取热门话题
 * @route   GET /api/home/hot-topics
 * @access  Public
 */
const getHotTopics = asyncHandler(async (req, res) => {
  try {
    // 查询数据库中的热门话题
    // 如果tags表不存在，将返回模拟数据
    try {
      const [topics] = await pool.query(
        `SELECT 
          tag_id, tag_name, tag_type, count, hot, trending 
        FROM 
          tags 
        WHERE 
          tag_type = 'topic' 
        ORDER BY 
          trending DESC, hot DESC, count DESC 
        LIMIT 15`
      );
      
      if (topics && topics.length > 0) {
        return res.json({
          success: true,
          data: topics
        });
      }
    } catch (dbError) {
      console.warn('获取热门话题数据库查询失败，使用模拟数据:', dbError.message);
    }
    
    // 返回模拟数据
    const mockTopics = [
      { tag_id: 1, tag_name: '校园活动', tag_type: 'topic', count: 356, hot: true, trending: true },
      { tag_id: 2, tag_name: '期末考试', tag_type: 'topic', count: 289, hot: true, trending: false },
      { tag_id: 3, tag_name: '美食分享', tag_type: 'topic', count: 245, hot: true, trending: false },
      { tag_id: 4, tag_name: '社团招新', tag_type: 'topic', count: 189, hot: false, trending: true },
      { tag_id: 5, tag_name: '校园摄影', tag_type: 'topic', count: 156, hot: false, trending: false },
      { tag_id: 6, tag_name: '考研经验', tag_type: 'topic', count: 134, hot: false, trending: false },
      { tag_id: 7, tag_name: '运动健身', tag_type: 'topic', count: 121, hot: false, trending: false },
      { tag_id: 8, tag_name: '学习资料', tag_type: 'topic', count: 110, hot: false, trending: false }
    ];
    
    res.json({
      success: true,
      data: mockTopics
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取热门话题失败: ' + error.message);
  }
});

/**
 * @desc    获取帖子列表
 * @route   GET /api/home/posts
 * @access  Public
 */
const getPosts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 8, feed = 'recommended', tag } = req.query;
    
    // 查询数据库中的帖子
    // 如果posts表不存在，将返回模拟数据
    try {
      // 构建查询条件
      let whereClause = "WHERE p.status = 'active'";
      let params = [];
      
      if (tag) {
        whereClause += " AND p.post_id IN (SELECT content_id FROM content_tags ct JOIN tags t ON ct.tag_id = t.tag_id WHERE ct.content_type = 'post' AND t.tag_name = ?)";
        params.push(tag);
      }
      
      // 构建排序条件
      let orderClause = "";
      switch (feed) {
        case 'latest':
          orderClause = "ORDER BY p.created_at DESC";
          break;
        case 'hot':
          orderClause = "ORDER BY p.like_count DESC, p.comment_count DESC, p.created_at DESC";
          break;
        default: // recommended
          orderClause = "ORDER BY RAND()"; // 简单随机推荐，实际应用中应该基于算法
      }
      
      // 查询帖子总数
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
        params
      );
      
      const total = countResult[0].total;
      const offset = (page - 1) * limit;
      
      // 查询帖子列表
      const [posts] = await pool.query(
        `SELECT 
          p.post_id, p.user_id, p.content, p.post_type, p.location, 
          p.like_count, p.comment_count, p.share_count, p.created_at,
          u.username, u.avatar_url
        FROM 
          posts p
        JOIN 
          users u ON p.user_id = u.user_id
        ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );
      
      if (posts && posts.length > 0) {
        // 处理帖子数据
        const formattedPosts = await Promise.all(posts.map(async (post) => {
          // 获取帖子的标签
          const [tags] = await pool.query(
            `SELECT t.tag_name 
             FROM content_tags ct 
             JOIN tags t ON ct.tag_id = t.tag_id 
             WHERE ct.content_type = 'post' AND ct.content_id = ?`,
            [post.post_id]
          );
          
          // 获取帖子的媒体
          const [media] = await pool.query(
            `SELECT media_url, media_type, thumbnail_url 
             FROM post_media 
             WHERE post_id = ? 
             ORDER BY display_order`,
            [post.post_id]
          );
          
          return {
            post_id: post.post_id,
            title: post.content.substring(0, 30) + (post.content.length > 30 ? '...' : ''),
            content: post.content,
            image_url: media.length > 0 ? media[0].media_url : null,
            location: post.location,
            likes: post.like_count,
            comments: post.comment_count,
            time: new Date(post.created_at).toLocaleString(),
            tags: tags.map(tag => tag.tag_name),
            trending: post.like_count > 50, // 简单示例，实际应该基于算法
            user: {
              id: post.user_id,
              name: post.username,
              avatar: post.avatar_url
            }
          };
        }));
        
        return res.json({
          success: true,
          data: {
            posts: formattedPosts,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total
            }
          }
        });
      }
    } catch (dbError) {
      console.warn('获取帖子数据库查询失败，使用模拟数据:', dbError.message);
    }
    
    // 返回模拟数据
    const mockPosts = [
      {
        post_id: 1,
        title: '校园春游活动圆满结束',
        content: '昨天的校园春游活动非常成功，感谢大家的积极参与！分享一些活动照片，希望大家喜欢~',
        image_url: 'https://source.unsplash.com/random/600x400/?campus',
        location: '中央草坪',
        likes: 128,
        comments: 32,
        time: '2小时前',
        tags: ['校园活动', '摄影'],
        trending: true,
        user: {
          id: 1,
          name: '校园摄影师',
          avatar: 'https://source.unsplash.com/random/100x100/?portrait'
        }
      },
      {
        post_id: 2,
        title: '期末复习攻略分享',
        content: '分享一下我的期末复习方法和时间规划，希望对大家有所帮助！',
        image_url: 'https://source.unsplash.com/random/600x400/?study',
        location: '图书馆',
        likes: 95,
        comments: 45,
        time: '5小时前',
        tags: ['期末考试', '学习方法'],
        trending: false,
        user: {
          id: 2,
          name: '学霸一号',
          avatar: 'https://source.unsplash.com/random/100x100/?student'
        }
      },
      {
        post_id: 3,
        title: '校园美食推荐',
        content: '发现了一家超级好吃的拉面店，就在南门附近，强烈推荐给大家！',
        image_url: 'https://source.unsplash.com/random/600x400/?food',
        location: '南门美食街',
        likes: 87,
        comments: 23,
        time: '昨天',
        tags: ['美食分享', '校园周边'],
        trending: false,
        user: {
          id: 3,
          name: '吃货小王',
          avatar: 'https://source.unsplash.com/random/100x100/?chef'
        }
      },
      {
        post_id: 4,
        title: '社团招新进行中',
        content: '摄影社团正在招新中，无需专业设备，只要你热爱摄影，欢迎加入我们！',
        image_url: 'https://source.unsplash.com/random/600x400/?camera',
        location: '活动中心',
        likes: 56,
        comments: 18,
        time: '2天前',
        tags: ['社团招新', '摄影'],
        trending: true,
        user: {
          id: 4,
          name: '摄影社团',
          avatar: 'https://source.unsplash.com/random/100x100/?camera'
        }
      }
    ];
    
    // 根据查询参数过滤模拟数据
    let filteredPosts = [...mockPosts];
    
    if (tag) {
      filteredPosts = filteredPosts.filter(post => post.tags.includes(tag));
    }
    
    // 排序
    switch (feed) {
      case 'latest':
        // 已经按时间排序，无需操作
        break;
      case 'hot':
        filteredPosts.sort((a, b) => b.likes - a.likes);
        break;
      default: // recommended
        // 随机打乱
        filteredPosts.sort(() => Math.random() - 0.5);
    }
    
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPosts.length
        }
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取帖子列表失败: ' + error.message);
  }
});

/**
 * @desc    获取轮播内容
 * @route   GET /api/home/carousel
 * @access  Public
 */
const getCarousel = asyncHandler(async (req, res) => {
  try {
    // 查询数据库中的轮播内容
    try {
      const [carouselItems] = await pool.query(
        `SELECT * FROM carousel_items WHERE status = 'active' ORDER BY display_order LIMIT 5`
      );
      
      if (carouselItems && carouselItems.length > 0) {
        return res.json({
          success: true,
          data: carouselItems
        });
      }
    } catch (dbError) {
      console.warn('获取轮播内容数据库查询失败，使用模拟数据:', dbError.message);
    }
    
    // 返回模拟数据
    const mockCarousel = [
      {
        carousel_id: 1,
        title: '校园活动周',
        description: '参与校园活动周，赢取精美礼品',
        image_url: 'https://source.unsplash.com/random/1200x400/?campus,activity',
        link: '/activities',
        display_order: 1
      },
      {
        carousel_id: 2,
        title: '学术讲座',
        description: '知名教授带你探索科学前沿',
        image_url: 'https://source.unsplash.com/random/1200x400/?lecture',
        link: '/lectures',
        display_order: 2
      },
      {
        carousel_id: 3,
        title: '社团招新',
        description: '加入社团，丰富你的校园生活',
        image_url: 'https://source.unsplash.com/random/1200x400/?club',
        link: '/clubs',
        display_order: 3
      }
    ];
    
    res.json({
      success: true,
      data: mockCarousel
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取轮播内容失败: ' + error.message);
  }
});

/**
 * @desc    获取推荐用户
 * @route   GET /api/home/recommended-users
 * @access  Public
 */
const getRecommendedUsers = asyncHandler(async (req, res) => {
  try {
    // 查询数据库中的用户
    try {
      const [users] = await pool.query(
        `SELECT 
          u.user_id, u.username, u.avatar_url, u.bio,
          (SELECT COUNT(*) FROM user_relations WHERE related_user_id = u.user_id AND relation_type = 'follow') as followers_count
        FROM 
          users u
        WHERE 
          u.user_status = 'active'
        ORDER BY 
          RAND()
        LIMIT 5`
      );
      
      if (users && users.length > 0) {
        // 处理用户数据
        const formattedUsers = await Promise.all(users.map(async (user) => {
          // 获取用户的标签
          const [tags] = await pool.query(
            `SELECT t.tag_name 
             FROM content_tags ct 
             JOIN tags t ON ct.tag_id = t.tag_id 
             WHERE ct.content_type = 'user' AND ct.content_id = ?
             LIMIT 3`,
            [user.user_id]
          );
          
          return {
            id: user.user_id,
            name: user.username,
            avatar: user.avatar_url,
            bio: user.bio,
            followers: user.followers_count,
            creditScore: Math.floor(70 + Math.random() * 30), // 模拟信用分
            tags: tags.map(tag => tag.tag_name)
          };
        }));
        
        return res.json({
          success: true,
          data: formattedUsers
        });
      }
    } catch (dbError) {
      console.warn('获取推荐用户数据库查询失败，使用模拟数据:', dbError.message);
    }
    
    // 返回模拟数据
    const mockUsers = [
      {
        id: 1,
        name: '校园摄影师',
        avatar: 'https://source.unsplash.com/random/100x100/?portrait',
        bio: '记录校园的美好瞬间',
        followers: 256,
        creditScore: 92,
        tags: ['摄影', '艺术', '设计']
      },
      {
        id: 2,
        name: '学霸一号',
        avatar: 'https://source.unsplash.com/random/100x100/?student',
        bio: '分享学习方法和经验',
        followers: 189,
        creditScore: 98,
        tags: ['学习', '考研', '编程']
      },
      {
        id: 3,
        name: '校园美食家',
        avatar: 'https://source.unsplash.com/random/100x100/?chef',
        bio: '探索校园周边的美食',
        followers: 325,
        creditScore: 86,
        tags: ['美食', '探店', '烹饪']
      },
      {
        id: 4,
        name: '运动健将',
        avatar: 'https://source.unsplash.com/random/100x100/?athlete',
        bio: '热爱运动，享受生活',
        followers: 176,
        creditScore: 94,
        tags: ['篮球', '健身', '户外']
      }
    ];
    
    res.json({
      success: true,
      data: mockUsers
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取推荐用户失败: ' + error.message);
  }
});

/**
 * @desc    点赞帖子
 * @route   POST /api/home/like-post
 * @access  Private
 */
const likePost = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;
    
    if (!postId) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 检查是否已点赞
    const [existingLikes] = await pool.query(
      `SELECT * FROM likes WHERE user_id = ? AND content_id = ? AND content_type = 'post'`,
      [userId, postId]
    );
    
    let liked = false;
    
    if (existingLikes.length > 0) {
      // 已点赞，取消点赞
      await pool.query(
        `DELETE FROM likes WHERE user_id = ? AND content_id = ? AND content_type = 'post'`,
        [userId, postId]
      );
      
      // 更新帖子点赞数
      await pool.query(
        `UPDATE posts SET like_count = like_count - 1 WHERE post_id = ?`,
        [postId]
      );
      
      liked = false;
    } else {
      // 未点赞，添加点赞
      await pool.query(
        `INSERT INTO likes (user_id, content_id, content_type) VALUES (?, ?, 'post')`,
        [userId, postId]
      );
      
      // 更新帖子点赞数
      await pool.query(
        `UPDATE posts SET like_count = like_count + 1 WHERE post_id = ?`,
        [postId]
      );
      
      liked = true;
    }
    
    res.json({
      success: true,
      liked,
      message: liked ? '点赞成功' : '取消点赞成功'
    });
  } catch (error) {
    res.status(500);
    throw new Error('处理点赞操作失败: ' + error.message);
  }
});

/**
 * @desc    获取帖子评论
 * @route   GET /api/home/comments/:postId
 * @access  Public
 */
const getPostComments = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 查询数据库中的评论
    try {
      const [comments] = await pool.query(
        `SELECT 
          c.comment_id, c.user_id, c.content, c.created_at, c.like_count, c.parent_id,
          u.username, u.avatar_url
        FROM 
          comments c
        JOIN 
          users u ON c.user_id = u.user_id
        WHERE 
          c.content_id = ? AND c.content_type = 'post' AND c.status = 'active'
        ORDER BY 
          c.created_at DESC`,
        [postId]
      );
      
      if (comments) {
        console.log('查询到的评论:', JSON.stringify(comments.slice(0, 2), null, 2));
        
        // 获取用户评论点赞状态 (这里需要登录用户ID，暂时不实现)
        
        // 格式化评论数据
        const formattedComments = comments.map(comment => ({
          id: comment.comment_id,
          author: comment.username,
          avatar: comment.avatar_url,
          content: comment.content,
          createdAt: comment.created_at,
          likes: comment.like_count,
          liked: false, // 默认为未点赞状态
          parentId: comment.parent_id
        }));
        
        console.log('返回的评论数据结构:', JSON.stringify(formattedComments.slice(0, 2), null, 2));
        
        return res.json({
          success: true,
          data: formattedComments
        });
      }
    } catch (dbError) {
      console.warn('获取评论数据库查询失败，使用模拟数据:', dbError.message);
      
      // 返回模拟数据
      const mockComments = [
        {
          id: 1,
          author: '张三',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          content: '这是一条测试评论，模拟数据库故障时的显示效果。',
          createdAt: new Date().toISOString(),
          likes: 5,
          liked: false
        },
        {
          id: 2,
          author: '李四',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          content: '这是另一条测试评论，可以测试多条评论的显示效果。',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
          likes: 3,
          liked: false
        }
      ];
      
      return res.json({
        success: true,
        data: mockComments,
        message: '使用模拟数据，数据库查询失败'
      });
    }
    
    // 如果没有评论，返回空数组
    return res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取评论失败: ' + error.message);
  }
});

/**
 * @desc    添加帖子评论
 * @route   POST /api/home/comments
 * @access  Private
 */
const addPostComment = asyncHandler(async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = req.user.id;
    
    if (!postId || !content) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 添加评论到数据库
    const [result] = await pool.query(
      `INSERT INTO comments (content_id, content_type, user_id, content, parent_id, status, created_at) 
       VALUES (?, 'post', ?, ?, ?, 'active', NOW())`,
      [postId, userId, content, parentId]
    );
    
    if (result.affectedRows !== 1) {
      res.status(500);
      throw new Error('添加评论失败');
    }
    
    // 更新帖子评论数
    await pool.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?`,
      [postId]
    );
    
    // 获取新评论的信息
    const [newComment] = await pool.query(
      `SELECT 
        c.comment_id, c.user_id, c.content, c.created_at, c.like_count, c.parent_id,
        u.username, u.avatar_url
      FROM 
        comments c
      JOIN 
        users u ON c.user_id = u.user_id
      WHERE 
        c.comment_id = ?`,
      [result.insertId]
    );
    
    if (newComment.length === 0) {
      res.status(404);
      throw new Error('找不到新添加的评论');
    }
    
    // 如果是回复评论，获取父评论信息
    let parentComment = null;
    if (newComment[0].parent_id) {
      const [parentResult] = await pool.query(
        `SELECT 
          c.comment_id, c.user_id,
          u.username
        FROM 
          comments c
        JOIN 
          users u ON c.user_id = u.user_id
        WHERE 
          c.comment_id = ?`,
        [newComment[0].parent_id]
      );
      
      if (parentResult.length > 0) {
        parentComment = {
          id: parentResult[0].comment_id,
          userId: parentResult[0].user_id,
          username: parentResult[0].username
        };
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: newComment[0].comment_id,
        content: newComment[0].content,
        createdAt: newComment[0].created_at,
        likes: newComment[0].like_count,
        liked: false,
        parentId: newComment[0].parent_id,
        parentComment,
        author: newComment[0].username,
        avatar: newComment[0].avatar_url
      },
      message: '评论添加成功'
    });
  } catch (error) {
    res.status(500);
    throw new Error('添加评论失败: ' + error.message);
  }
});

/**
 * @desc    点赞评论
 * @route   POST /api/home/like-comment
 * @access  Private
 */
const likeComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.body;
    const userId = req.user.id;
    
    if (!commentId) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 检查是否已点赞
    const [existingLikes] = await pool.query(
      `SELECT * FROM likes WHERE user_id = ? AND content_id = ? AND content_type = 'comment'`,
      [userId, commentId]
    );
    
    let liked = false;
    
    if (existingLikes.length > 0) {
      // 已点赞，取消点赞
      await pool.query(
        `DELETE FROM likes WHERE user_id = ? AND content_id = ? AND content_type = 'comment'`,
        [userId, commentId]
      );
      
      // 更新评论点赞数
      await pool.query(
        `UPDATE comments SET like_count = like_count - 1 WHERE comment_id = ?`,
        [commentId]
      );
      
      liked = false;
    } else {
      // 未点赞，添加点赞
      await pool.query(
        `INSERT INTO likes (user_id, content_id, content_type) VALUES (?, ?, 'comment')`,
        [userId, commentId]
      );
      
      // 更新评论点赞数
      await pool.query(
        `UPDATE comments SET like_count = like_count + 1 WHERE comment_id = ?`,
        [commentId]
      );
      
      liked = true;
    }
    
    res.json({
      success: true,
      liked,
      message: liked ? '点赞成功' : '取消点赞成功'
    });
  } catch (error) {
    res.status(500);
    throw new Error('处理评论点赞操作失败: ' + error.message);
  }
});

/**
 * 发布动态
 * @route   POST /api/home/posts
 * @access  Private
 */
const addPost = asyncHandler(async (req, res) => {
  try {
    console.log('接收到发布动态请求:');
    console.log('请求体:', req.body);
    console.log('文件数量:', req.files ? req.files.length : 0);
    
    const { 
      content, 
      post_type = 'general', 
      visibility = 'public', 
      location,
      tags
    } = req.body;
    
    const userId = req.user.id;
    
    // 验证必填字段
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '请输入动态内容'
      });
    }
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 插入动态记录
      const [result] = await connection.query(
        `INSERT INTO posts (
          user_id, content, post_type, visibility, location, status
        ) VALUES (?, ?, ?, ?, ?, 'active')`,
        [
          userId, content, post_type, visibility, location || null
        ]
      );
      
      const postId = result.insertId;
      console.log(`创建动态成功, ID: ${postId}`);
      
      // 处理上传的媒体文件
      if (req.files && req.files.length > 0) {
        console.log("上传的文件信息:");
        const mediaValues = [];
        
        for (let index = 0; index < req.files.length; index++) {
          const file = req.files[index];
          console.log(`文件 ${index+1}:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            filename: file.filename,
            path: file.path,
            size: file.size
          });
          
          // 获取相对于public目录的路径
          let relativePath = file.path.replace(/\\/g, '/');
          const publicIndex = relativePath.indexOf('/public/');
          if (publicIndex >= 0) {
            relativePath = relativePath.substring(publicIndex + 7); // 7 是 '/public' 的长度
          } else {
            // 直接尝试获取 uploads 及之后的部分
            const uploadsIndex = relativePath.indexOf('/uploads/');
            if (uploadsIndex >= 0) {
              relativePath = relativePath.substring(uploadsIndex);
            }
          }
          
          console.log(`处理媒体 ${index+1}/${req.files.length}:`);
          console.log(`  原始路径: ${file.path}`);
          console.log(`  处理后路径: ${relativePath}`);
          
          // 确定媒体类型
          const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
          
          // 添加到媒体值数组
          mediaValues.push([
            postId,
            mediaType,
            relativePath,
            null, // 暂不生成缩略图
            index // 显示顺序
          ]);
        }
        
        // 将媒体数据插入数据库
        if (mediaValues.length > 0) {
          await connection.query(
            `INSERT INTO post_media (post_id, media_type, media_url, thumbnail_url, display_order) VALUES ?`,
            [mediaValues]
          );
          
          console.log(`保存 ${mediaValues.length} 个媒体文件到数据库成功`);
        }
      }
      
      // 处理标签
      if (tags) {
        try {
          const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
          
          if (parsedTags && parsedTags.length > 0) {
            // 先获取或创建标签
            const tagIds = [];
            
            for (const tagName of parsedTags) {
              // 检查标签是否存在
              const [existingTags] = await connection.query(
                'SELECT tag_id FROM tags WHERE tag_name = ?',
                [tagName]
              );
              
              let tagId;
              
              if (existingTags.length > 0) {
                // 使用现有标签
                tagId = existingTags[0].tag_id;
              } else {
                // 创建新标签
                const [newTag] = await connection.query(
                  'INSERT INTO tags (tag_name) VALUES (?)',
                  [tagName]
                );
                tagId = newTag.insertId;
              }
              
              tagIds.push(tagId);
            }
            
            // 关联标签到动态
            const tagRelations = tagIds.map(tagId => [postId, tagId]);
            
            await connection.query(
              'INSERT INTO post_tags (post_id, tag_id) VALUES ?',
              [tagRelations]
            );
            
            console.log(`为动态添加了 ${tagIds.length} 个标签`);
          }
        } catch (tagError) {
          console.error('处理标签出错:', tagError);
          // 继续处理，不因标签处理失败而回滚整个事务
        }
      }
      
      // 提交事务
      await connection.commit();
      
      // 准备成功响应
      const [postData] = await pool.query(
        `SELECT 
          p.post_id, p.content, p.post_type, p.visibility, p.location, 
          p.created_at, u.username, u.avatar_url
        FROM 
          posts p
        JOIN 
          users u ON p.user_id = u.user_id
        WHERE
          p.post_id = ?`,
        [postId]
      );
      
      if (postData.length === 0) {
        return res.status(404).json({
          success: false,
          message: '无法获取新创建的动态信息'
        });
      }
      
      const post = postData[0];
      
      // 获取媒体
      const [mediaData] = await pool.query(
        `SELECT media_type, media_url
         FROM post_media
         WHERE post_id = ?
         ORDER BY display_order ASC`,
        [postId]
      );
      
      // 准备响应数据
      const responseData = {
        id: post.post_id,
        content: post.content,
        type: post.post_type,
        visibility: post.visibility,
        location: post.location,
        time: post.created_at,
        user: {
          name: post.username,
          avatar: post.avatar_url
        },
        media: mediaData.map(m => ({
          type: m.media_type,
          url: m.media_url
        }))
      };
      
      res.status(201).json({
        success: true,
        message: '动态发布成功',
        data: responseData
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('发布动态失败:', error);
    res.status(500).json({
      success: false,
      message: '发布动态失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取动态详情
 * @route   GET /api/home/posts/:id
 * @access  Public
 */
const getPostDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 查询数据库中的动态
    const [posts] = await pool.query(
      `SELECT 
        p.post_id, p.user_id, p.content, p.post_type, p.visibility, p.location, 
        p.like_count, p.comment_count, p.share_count, p.created_at,
        u.username, u.avatar_url, u.bio
      FROM 
        posts p
      JOIN 
        users u ON p.user_id = u.user_id
      WHERE 
        p.post_id = ? AND p.status = 'active'`,
      [id]
    );
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该动态'
      });
    }
    
    const post = posts[0];
    
    // 获取动态的标签
    const [tags] = await pool.query(
      `SELECT t.tag_name 
       FROM post_tags pt 
       JOIN tags t ON pt.tag_id = t.tag_id 
       WHERE pt.post_id = ?`,
      [id]
    );
    
    // 获取动态的媒体
    const [media] = await pool.query(
      `SELECT media_id, media_type, media_url, thumbnail_url, display_order
       FROM post_media 
       WHERE post_id = ? 
       ORDER BY display_order`,
      [id]
    );
    
    // 检查当前用户是否已点赞
    let liked = false;
    if (req.user) {
      const [likes] = await pool.query(
        `SELECT * FROM likes 
         WHERE user_id = ? AND content_id = ? AND content_type = 'post'`,
        [req.user.id, id]
      );
      liked = likes.length > 0;
    }
    
    // 获取用户的粉丝和关注数
    const [followers] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_relations 
       WHERE related_user_id = ? AND relation_type = 'follow'`,
      [post.user_id]
    );
    
    const [following] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_relations 
       WHERE user_id = ? AND relation_type = 'follow'`,
      [post.user_id]
    );
    
    // 获取用户的动态数量
    const [userPosts] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM posts 
       WHERE user_id = ? AND status = 'active'`,
      [post.user_id]
    );
    
    // 构建响应数据
    const responseData = {
      id: post.post_id,
      content: post.content,
      type: post.post_type,
      visibility: post.visibility,
      location: post.location,
      likes: post.like_count,
      comments: post.comment_count,
      shares: post.share_count,
      time: post.created_at,
      liked,
      tags: tags.map(tag => tag.tag_name),
      media: media.map(m => ({
        id: m.media_id,
        type: m.media_type,
        url: m.media_url,
        thumbnail_url: m.thumbnail_url
      })),
      user: {
        id: post.user_id,
        name: post.username,
        avatar: post.avatar_url,
        bio: post.bio,
        followers: followers[0].count,
        following: following[0].count,
        posts: userPosts[0].count
      }
    };
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500);
    throw new Error('获取动态详情失败: ' + error.message);
  }
});

module.exports = {
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
}; 
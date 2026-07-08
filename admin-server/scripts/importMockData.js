// 导入模拟数据到数据库的脚本
const { pool } = require('../config/db');

// 热门话题数据
const hotTopics = [
  { id: 1, name: '期末考试', count: 1342, hot: true, trending: true, tag_type: 'topic' },
  { id: 2, name: '校园招聘', count: 987, hot: true, tag_type: 'topic' },
  { id: 3, name: '社团活动', count: 756, tag_type: 'topic' },
  { id: 4, name: '宿舍生活', count: 654, tag_type: 'topic' },
  { id: 5, name: '食堂美食', count: 543, hot: true, tag_type: 'topic' },
  { id: 6, name: '校园跑步', count: 432, tag_type: 'topic' },
  { id: 7, name: '考研上岸', count: 321, hot: true, trending: true, tag_type: 'topic' },
  { id: 8, name: '评教', count: 210, tag_type: 'topic' },
  { id: 9, name: '暑期实习', count: 876, hot: true, trending: true, tag_type: 'topic' },
  { id: 10, name: '毕业季', count: 765, hot: true, tag_type: 'topic' },
  { id: 11, name: '考证', count: 432, tag_type: 'topic' },
  { id: 12, name: '专业选择', count: 345, tag_type: 'topic' }
];

// 动态内容数据 (部分示例)
const samplePosts = [
  {
    id: 1,
    title: '今天的晚霞太美了',
    content: '放学路上拍到的校园晚霞，美得不像话，分享给大家！',
    post_type: 'image',
    visibility: 'public',
    location: '教学楼后花园',
    userId: 1, // 假设用户ID为1
    like_count: 124,
    comment_count: 32,
    share_count: 0,
    status: 'active',
    tags: ['校园风光', '摄影'],
    media: [
      {
        media_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        thumbnail_url: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60',
        display_order: 0
      }
    ]
  },
  {
    id: 2,
    title: '期末复习资料分享',
    content: '整理了《高等数学》期末考点，需要的同学自取～',
    post_type: 'mixed',
    visibility: 'public',
    location: '图书馆',
    userId: 2,
    like_count: 258,
    comment_count: 56,
    share_count: 45,
    status: 'active',
    tags: ['期末考试', '资料分享'],
    media: [
      {
        media_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60',
        display_order: 0
      },
      {
        media_type: 'document',
        media_url: 'https://example.com/files/math_notes.pdf',
        thumbnail_url: null,
        display_order: 1
      }
    ]
  },
  {
    id: 3,
    title: '新开的奶茶店推荐',
    content: '南门新开的"茶忆"奶茶店，他家的芝士茉莉真的绝了！',
    post_type: 'image',
    visibility: 'public',
    location: '南门商圈',
    userId: 3,
    like_count: 78,
    comment_count: 24,
    share_count: 12,
    status: 'active',
    tags: ['美食推荐', '奶茶控'],
    media: [
      {
        media_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        thumbnail_url: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60',
        display_order: 0
      }
    ]
  },
  {
    id: 4,
    title: '校园歌手大赛',
    content: '校园歌手大赛报名开始啦，展示你的才华的时候到了！',
    post_type: 'image',
    visibility: 'public',
    location: '大学生活动中心',
    userId: 4,
    like_count: 134,
    comment_count: 47,
    share_count: 23,
    status: 'active',
    tags: ['校园活动', '才艺展示'],
    media: [
      {
        media_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        thumbnail_url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60',
        display_order: 0
      }
    ]
  },
  {
    id: 5,
    title: '暑期实习offer到手！',
    content: '终于收到了字节跳动的暑期实习offer！分享一下我的准备经验~',
    post_type: 'text',
    visibility: 'public',
    location: '就业指导中心',
    userId: 5,
    like_count: 312,
    comment_count: 98,
    share_count: 56,
    status: 'active',
    tags: ['暑期实习', '求职', '程序员'],
    media: [
      {
        media_type: 'image',
        media_url: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        thumbnail_url: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60',
        display_order: 0
      }
    ]
  }
];

// 轮播内容数据
const carouselContent = [
  {
    id: 1,
    title: '校园十佳歌手大赛即将开始',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    link: '/activities/singers'
  },
  {
    id: 2,
    title: '期末复习攻略',
    imageUrl: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    link: '/study/finals'
  },
  {
    id: 3,
    title: '校园集市二手交易节',
    imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    link: '/market/festival'
  },
  {
    id: 4,
    title: '暑期实习招聘会',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    link: '/career/summer-internship'
  }
];

/**
 * 检查并清理表中的外键约束
 */
async function checkAndClearForeignKeys() {
  const connection = await pool.getConnection();
  
  try {
    console.log('检查外键约束...');
    
    // 检查并删除content_tags中的数据
    const [contentTagsExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'content_tags'
    `);
    
    if (contentTagsExists[0].count > 0) {
      console.log('清空content_tags表...');
      await connection.query('DELETE FROM content_tags WHERE tag_id IN (SELECT tag_id FROM tags)');
    }
    
    console.log('外键约束检查完成');
  } catch (error) {
    console.error('清理外键约束失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 创建必要的表结构
 */
async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    console.log('开始创建表结构...');
    
    // 创建标签表 - 使用数据库.md中定义的结构
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        tag_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        tag_name VARCHAR(50) NOT NULL UNIQUE,
        tag_type ENUM('topic', 'location', 'event', 'product', 'mission', 'system') DEFAULT 'topic',
        count INT UNSIGNED DEFAULT 0,
        hot BOOLEAN DEFAULT FALSE,
        trending BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tag_name (tag_name),
        INDEX idx_tag_type (tag_type)
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // 创建动态表 - 使用数据库.md中定义的结构
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        post_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(100),
        content TEXT,
        post_type ENUM('text', 'image', 'video', 'link', 'mixed') NOT NULL,
        visibility ENUM('public', 'school', 'private') DEFAULT 'public',
        location VARCHAR(100),
        like_count INT UNSIGNED DEFAULT 0,
        comment_count INT UNSIGNED DEFAULT 0,
        share_count INT UNSIGNED DEFAULT 0,
        status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // 创建动态媒体表 - 使用数据库.md中定义的结构
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_media (
        media_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NOT NULL,
        media_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
        media_url VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(255),
        display_order TINYINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_post_id (post_id),
        FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // 创建内容标签关联表 - 使用数据库.md中定义的结构
    await connection.query(`
      CREATE TABLE IF NOT EXISTS content_tags (
        content_tag_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        content_type ENUM('post', 'product', 'mission', 'activity', 'club') NOT NULL,
        content_id BIGINT UNSIGNED NOT NULL,
        tag_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_content (content_type, content_id),
        INDEX idx_tag_id (tag_id),
        UNIQUE KEY unique_content_tag (content_type, content_id, tag_id),
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // 创建轮播内容表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS carousel_items (
        carousel_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        image_url VARCHAR(255),
        link VARCHAR(100),
        display_order INT UNSIGNED DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('表结构创建完成');
  } catch (error) {
    console.error('创建表结构失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 导入热门话题数据
 */
async function importTags() {
  const connection = await pool.getConnection();
  
  try {
    console.log('开始导入热门话题数据...');
    
    // 清空标签数据但保留外键约束
    await connection.query('DELETE FROM tags');
    await connection.query('ALTER TABLE tags AUTO_INCREMENT = 1');
    
    // 导入热门话题数据
    for (const topic of hotTopics) {
      await connection.query(
        'INSERT INTO tags (tag_name, count, hot, trending, tag_type) VALUES (?, ?, ?, ?, ?)',
        [topic.name, topic.count, topic.hot || false, topic.trending || false, topic.tag_type]
      );
    }
    
    console.log(`已导入 ${hotTopics.length} 个热门话题`);
  } catch (error) {
    console.error('导入热门话题数据失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 导入动态内容
 */
async function importPosts() {
  const connection = await pool.getConnection();
  
  try {
    console.log('开始导入动态内容数据...');
    
    // 清空表 - 按照正确的顺序清空表以避免外键约束问题
    await connection.query('DELETE FROM content_tags WHERE content_type = "post"');
    await connection.query('DELETE FROM post_media');
    await connection.query('ALTER TABLE post_media AUTO_INCREMENT = 1');
    await connection.query('DELETE FROM posts');
    await connection.query('ALTER TABLE posts AUTO_INCREMENT = 1');
    
    // 导入动态数据
    for (const post of samplePosts) {
      // 插入帖子
      const [result] = await connection.query(
        'INSERT INTO posts (title, content, post_type, visibility, location, user_id, like_count, comment_count, share_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [post.title, post.content, post.post_type, post.visibility, post.location, post.userId, post.like_count, post.comment_count, post.share_count, post.status]
      );
      
      const postId = result.insertId;
      
      // 导入媒体数据
      if (post.media && post.media.length > 0) {
        for (let i = 0; i < post.media.length; i++) {
          const media = post.media[i];
          await connection.query(
            'INSERT INTO post_media (post_id, media_type, media_url, thumbnail_url, display_order) VALUES (?, ?, ?, ?, ?)',
            [postId, media.media_type, media.media_url, media.thumbnail_url, media.display_order]
          );
        }
      }
      
      // 处理标签
      for (const tagName of post.tags) {
        // 查询标签是否存在
        const [tagRows] = await connection.query('SELECT tag_id FROM tags WHERE tag_name = ?', [tagName]);
        
        let tagId;
        if (tagRows.length > 0) {
          // 标签已存在，更新计数
          tagId = tagRows[0].tag_id;
          await connection.query('UPDATE tags SET count = count + 1 WHERE tag_id = ?', [tagId]);
        } else {
          // 标签不存在，创建新标签
          const [newTag] = await connection.query('INSERT INTO tags (tag_name, count, tag_type) VALUES (?, 1, "topic")', [tagName]);
          tagId = newTag.insertId;
        }
        
        // 创建内容与标签的关联
        await connection.query(
          'INSERT INTO content_tags (content_type, content_id, tag_id) VALUES (?, ?, ?)',
          ['post', postId, tagId]
        );
      }
    }
    
    console.log(`已导入 ${samplePosts.length} 条动态内容`);
  } catch (error) {
    console.error('导入动态内容数据失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 导入轮播内容
 */
async function importCarouselItems() {
  const connection = await pool.getConnection();
  
  try {
    console.log('开始导入轮播内容数据...');
    
    // 清空轮播表
    await connection.query('DELETE FROM carousel_items');
    await connection.query('ALTER TABLE carousel_items AUTO_INCREMENT = 1');
    
    // 导入轮播数据
    for (let i = 0; i < carouselContent.length; i++) {
      const item = carouselContent[i];
      await connection.query(
        'INSERT INTO carousel_items (title, image_url, link, display_order) VALUES (?, ?, ?, ?)',
        [item.title, item.imageUrl, item.link, i + 1]
      );
    }
    
    console.log(`已导入 ${carouselContent.length} 个轮播内容`);
  } catch (error) {
    console.error('导入轮播内容数据失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 主函数：执行所有导入
 */
async function importAllData() {
  try {
    console.log('开始导入所有模拟数据...');
    
    // 清理外键约束
    await checkAndClearForeignKeys();
    
    // 创建表结构
    await createTables();
    
    // 导入数据
    await importTags();
    await importPosts();
    await importCarouselItems();
    
    console.log('所有数据导入完成!');
    process.exit(0);
  } catch (error) {
    console.error('导入数据失败:', error);
    process.exit(1);
  }
}

// 执行导入
importAllData(); 
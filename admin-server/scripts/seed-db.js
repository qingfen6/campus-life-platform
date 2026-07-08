// 种子数据脚本 - 使用JavaScript直接插入数据
const { pool } = require('../config/db');
require('dotenv').config();

// 主函数
async function seedDatabase() {
  let connection;
  try {
    // 创建连接
    connection = await pool.getConnection();
    console.log('数据库连接成功');

    // 清空现有数据（可选）
    console.log('清空所有表...');
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    
    const tables = ['user_relations', 'likes', 'comments', 'clubs', 'activities', 
                    'products', 'post_media', 'posts', 'users', 'faculties', 'schools'];
    
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table};`);
      console.log(`表 ${table} 已清空`);
    }
    
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    // 插入学校数据
    console.log('开始插入学校数据...');
    const schoolsResult = await connection.query(`
      INSERT INTO schools 
        (school_name, school_code, province, city, school_type, founding_year, website, description) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      '北京大学', 'PKU', '北京', '北京', 'comprehensive', 1998, 'www.pku.edu.cn', '中国最早的国立综合大学',
      '清华大学', 'THU', '北京', '北京', 'science', 2000, 'www.tsinghua.edu.cn', '中国著名理工类研究型大学',
      '浙江大学', 'ZJU', '浙江', '杭州', 'comprehensive', 2000, 'www.zju.edu.cn', '中国著名综合性研究型大学',
      '复旦大学', 'FDU', '上海', '上海', 'comprehensive', 2000, 'www.fudan.edu.cn', '中国历史最悠久的高等学府之一',
      '南京大学', 'NJU', '江苏', '南京', 'comprehensive', 2000, 'www.nju.edu.cn', '享有"南高"美誉的综合性大学'
    ]);
    console.log(`已插入 ${schoolsResult[0].affectedRows} 条学校数据`);

    // 插入学院数据
    console.log('开始插入学院数据...');
    const facultiesResult = await connection.query(`
      INSERT INTO faculties 
        (school_id, faculty_name, faculty_code, director, faculty_type, founding_year, description) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
    `, [
      1, '信息科学技术学院', 'IS', '张教授', '理工', 2000, '北京大学信息学科教学与科研机构',
      1, '光华管理学院', 'GSM', '王教授', '管理', 2000, '北京大学工商管理学科教学与科研机构',
      2, '计算机科学与技术系', 'CS', '李教授', '理工', 2000, '清华大学计算机学科教学与科研机构',
      2, '经济管理学院', 'SEM', '赵教授', '管理', 2000, '清华大学经济与管理学科教学与科研机构',
      3, '计算机科学与技术学院', 'CS', '周教授', '理工', 2000, '浙江大学计算机学科教学与科研机构',
      3, '管理学院', 'SOM', '吴教授', '管理', 2000, '浙江大学管理学科教学与科研机构',
      4, '计算机科学技术学院', 'CS', '郑教授', '理工', 2000, '复旦大学计算机学科教学与科研机构',
      5, '商学院', 'BS', '钱教授', '管理', 2000, '南京大学商学教学与科研机构'
    ]);
    console.log(`已插入 ${facultiesResult[0].affectedRows} 条学院数据`);

    // 插入用户数据
    console.log('开始插入用户数据...');
    const usersResult = await connection.query(`
      INSERT INTO users 
        (username, password, email, real_name, nickname, gender, school_id, faculty_id, user_status) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'zhangsan', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'zhangsan@example.com', '张三', '小张', 'male', 1, 1, 'active',
      'lisi', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'lisi@example.com', '李四', '阿四', 'male', 2, 3, 'active',
      'wangwu', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'wangwu@example.com', '王五', '五哥', 'male', 3, 5, 'active',
      'zhaoliu', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'zhaoliu@example.com', '赵六', '六六', 'female', 4, 7, 'active',
      'qianqi', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'qianqi@example.com', '钱七', '七仔', 'female', 5, 8, 'active'
    ]);
    console.log(`已插入 ${usersResult[0].affectedRows} 条用户数据`);

    // 插入动态数据
    console.log('开始插入动态数据...');
    const postsResult = await connection.query(`
      INSERT INTO posts 
        (user_id, content, post_type, visibility, location, like_count, comment_count) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
    `, [
      1, '今天在北大校园里看到了美丽的樱花！', 'text', 'public', '北京大学', 120, 15,
      2, '清华大学的春季运动会开幕了，今年我参加100米比赛！', 'image', 'public', '清华大学', 89, 8,
      3, '期末考试临近，大家都在图书馆复习。', 'text', 'school', '浙江大学图书馆', 45, 5,
      4, '今天参加了一个关于人工智能的讲座，收获很多。', 'text', 'public', '复旦大学', 76, 12,
      5, '分享一下我的毕业论文心得体会。', 'text', 'public', '南京大学', 52, 7,
      1, '这里有一些计算机编程学习资料，希望对大家有帮助！', 'link', 'public', null, 156, 22
    ]);
    console.log(`已插入 ${postsResult[0].affectedRows} 条动态数据`);

    // 插入商品数据
    console.log('开始插入商品数据...');
    const productsResult = await connection.query(`
      INSERT INTO products 
        (user_id, title, description, price, original_price, category, condition_type, location) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1, '二手笔记本电脑', 'MacBook Pro 2019款，配置i5/8G/256G，成色9新', 5999.00, 8999.00, '电子产品', 'like_new', '北京',
      2, '算法导论', '经典算法教材，有少量笔记，不影响阅读', 45.00, 89.00, '图书教材', 'good', '北京',
      3, '自行车', '捷安特ATX660山地车，骑行不到1000公里', 1200.00, 2499.00, '交通工具', 'good', '杭州',
      4, '篮球', '斯伯丁篮球，室内外通用，使用不到半年', 99.00, 199.00, '体育用品', 'like_new', '上海',
      5, '计算器', '卡西欧FX-991CN X，科学计算器，几乎全新', 89.00, 179.00, '学习用品', 'like_new', '南京'
    ]);
    console.log(`已插入 ${productsResult[0].affectedRows} 条商品数据`);

    // 插入活动数据
    console.log('开始插入活动数据...');
    const activitiesResult = await connection.query(`
      INSERT INTO activities 
        (title, description, organizer_type, organizer_id, location, start_time, end_time, max_participants, category, status) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      '2023校园歌手大赛', '一年一度的校园歌手大赛，欢迎各位同学踊跃报名参加！', 'school', 1, '北京大学百周年纪念讲堂', '2023-05-20 19:00:00', '2023-05-20 22:00:00', 500, '文艺', 'ended',
      '人工智能与未来讲座', '著名人工智能专家带来前沿讲座', 'faculty', 3, '清华大学主楼报告厅', '2023-06-15 14:30:00', '2023-06-15 16:30:00', 200, '学术', 'ended',
      '校园跑步马拉松', '提倡健康生活，一起来跑步吧', 'club', 2, '浙江大学操场', '2023-09-10 08:00:00', '2023-09-10 12:00:00', 300, '体育', 'upcoming',
      '创业经验分享会', '成功校友分享创业历程和经验', 'faculty', 7, '复旦大学经济学院报告厅', '2023-10-25 19:00:00', '2023-10-25 21:00:00', 150, '就业', 'upcoming',
      '校园文化节', '展示校园文化，包括各种文艺表演和展览', 'school', 5, '南京大学仙林校区', '2023-11-11 09:00:00', '2023-11-13 18:00:00', 1000, '文化', 'upcoming'
    ]);
    console.log(`已插入 ${activitiesResult[0].affectedRows} 条活动数据`);

    // 插入社团数据
    console.log('开始插入社团数据...');
    const clubsResult = await connection.query(`
      INSERT INTO clubs 
        (school_id, club_name, club_type, description, founding_date, member_count) 
      VALUES 
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?)
    `, [
      1, '北大计算机协会', '学术', '致力于计算机技术交流与学习', '2010-09-01', 120,
      2, '清华文学社', '文艺', '探讨文学作品，提高文学素养', '2005-03-15', 85,
      3, '浙大篮球俱乐部', '体育', '热爱篮球的同学交流平台', '2012-04-20', 45,
      4, '复旦辩论队', '文化', '培养辩论技巧，参加各类辩论赛', '2008-09-10', 30,
      5, '南大志愿者协会', '公益', '组织各类志愿服务活动', '2009-05-04', 150
    ]);
    console.log(`已插入 ${clubsResult[0].affectedRows} 条社团数据`);

    // 插入评论数据
    console.log('开始插入评论数据...');
    const commentsResult = await connection.query(`
      INSERT INTO comments 
        (content_type, content_id, user_id, content) 
      VALUES 
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?)
    `, [
      'post', 1, 2, '北大的樱花真的很美，我也想去看看！',
      'post', 1, 3, '请问现在还能看到吗？',
      'post', 2, 4, '加油！相信你一定能取得好成绩！',
      'post', 3, 5, '期末加油，我们都在努力！',
      'post', 4, 1, '这个讲座听起来很有意思，可以分享一下内容吗？',
      'product', 1, 3, '这个配置用来编程够用吗？',
      'activity', 1, 4, '我一定会去观看的，期待精彩表演！'
    ]);
    console.log(`已插入 ${commentsResult[0].affectedRows} 条评论数据`);

    // 插入点赞数据
    console.log('开始插入点赞数据...');
    const likesResult = await connection.query(`
      INSERT INTO likes 
        (content_type, content_id, user_id) 
      VALUES 
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?)
    `, [
      'post', 1, 2,
      'post', 1, 3,
      'post', 1, 4,
      'post', 2, 1,
      'post', 2, 3,
      'post', 3, 1,
      'post', 4, 5,
      'comment', 1, 3,
      'comment', 3, 2,
      'product', 1, 4
    ]);
    console.log(`已插入 ${likesResult[0].affectedRows} 条点赞数据`);

    // 插入用户关系数据
    console.log('开始插入用户关系数据...');
    const relationsResult = await connection.query(`
      INSERT INTO user_relations 
        (user_id, related_user_id, relation_type) 
      VALUES 
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?)
    `, [
      1, 2, 'follow',
      1, 3, 'follow',
      2, 1, 'follow',
      3, 1, 'follow',
      2, 3, 'friend',
      4, 5, 'follow',
      5, 4, 'follow',
      3, 4, 'follow'
    ]);
    console.log(`已插入 ${relationsResult[0].affectedRows} 条用户关系数据`);

    console.log('数据库种子数据添加完成！');
  } catch (error) {
    console.error('数据库种子数据添加失败:', error);
  } finally {
    if (connection) {
      await connection.release();
      console.log('数据库连接已释放');
    }
    process.exit(0);
  }
}

// 执行函数
seedDatabase(); 
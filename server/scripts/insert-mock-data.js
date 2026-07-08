/**
 * 模拟数据导入脚本
 * 
 * 此脚本用于将模拟的商品和任务数据导入数据库
 * 运行方式：node insert-mock-data.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campuslife'
};

// 商品模拟数据
const marketProducts = [
  {
    title: "限量版北极熊抱枕",
    price: 39.9,
    originalPrice: 69.9,
    imageUrl: "https://images.unsplash.com/photo-1585253835165-4e22e0e4514a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "可爱多多",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily",
    condition: "new",
    tags: ["限量版", "可爱", "抱枕"],
    category: "生活用品",
    bargain: true,
    lowestPrice: 35.0,
    location: "1号宿舍楼",
    description: "全新限量版北极熊抱枕，手感超级舒服，可爱到爆炸！"
  },
  {
    title: "二手iPad Pro 2021款",
    price: 3899,
    originalPrice: 6799,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "科技数码控",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
    condition: "like_new",
    tags: ["电子产品", "学习工具"],
    category: "电子产品",
    bargain: true,
    lowestPrice: 3500.0,
    location: "大学生活动中心",
    description: "iPad Pro 2021款，M1芯片，11英寸，256GB，九成新，无磕碰"
  },
  {
    title: "可爱猫咪造型台灯",
    price: 25.8,
    originalPrice: 49.9,
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "猫咪控",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emma",
    condition: "new",
    tags: ["照明", "装饰", "可爱"],
    category: "生活用品",
    bargain: false,
    location: "3号宿舍楼",
    description: "猫咪造型LED小夜灯，三档调光，充电款，全新未拆封"
  },
  {
    title: "高等数学习题全解",
    price: 15,
    originalPrice: 38,
    imageUrl: "https://images.unsplash.com/photo-1576872381149-7847515ce5d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "数学大神",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ryan",
    condition: "good",
    tags: ["教材", "数学", "习题"],
    category: "教材图书",
    bargain: true,
    lowestPrice: 12.0,
    location: "图书馆",
    description: "高等数学同济七版配套习题全解，有少量笔记，保存完好"
  },
  {
    title: "耐克运动鞋Air Zoom",
    price: 299,
    originalPrice: 699,
    imageUrl: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "运动达人",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chris",
    condition: "like_new",
    tags: ["运动", "鞋子", "耐克"],
    category: "服装鞋帽",
    bargain: true,
    lowestPrice: 260.0,
    location: "体育馆",
    description: "Nike Air Zoom系列跑鞋，43码，穿过几次，状态很好，原盒附带"
  },
  {
    title: "小米蓝牙耳机Pro",
    price: 129,
    originalPrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    sellerName: "音乐发烧友",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    condition: "good",
    tags: ["数码", "音乐", "耳机"],
    category: "数码配件",
    bargain: false,
    location: "信息学院",
    description: "小米真无线蓝牙耳机Pro，音质好，降噪效果出色，电池续航强"
  }
];

// 任务模拟数据
const missions = [
  {
    title: "帮我取一个快递",
    reward: 10,
    description: "菜鸟驿站有我的快递，求帮忙取一下送到9号宿舍楼，急需！",
    imageUrl: "https://images.unsplash.com/photo-1568010434570-74e9ba7126bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    requestorName: "急需快递",
    requestorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=Felix",
    difficulty: "easy",
    category: "express",
    deadline: "2023-07-10 18:00:00",
    location: "9号宿舍楼"
  },
  {
    title: "高数作业求解答",
    reward: 30,
    description: "第四章微分方程三道大题，求详细解答过程，明天之前！",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    requestorName: "数学困难户",
    requestorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=Olivia",
    difficulty: "medium",
    category: "study",
    deadline: "2023-07-09 23:59:00",
    location: "线上提交"
  },
  {
    title: "帮拍毕业照",
    reward: 50,
    description: "需要专业摄影师帮我拍摄毕业照，有单反相机最好",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    requestorName: "即将毕业",
    requestorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=Sam",
    difficulty: "medium",
    category: "activity",
    deadline: "2023-07-15 16:00:00",
    location: "校园中心广场"
  },
  {
    title: "图书馆占座",
    reward: 15,
    description: "求明天上午8点在主图二楼占个靠窗座位，占座成功发照片给我",
    imageUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    requestorName: "学习达人",
    requestorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=John",
    difficulty: "easy",
    category: "study",
    deadline: "2023-07-09 08:00:00",
    location: "图书馆二楼"
  },
  {
    title: "陪跑5公里",
    reward: 40,
    description: "找一个跑步伙伴陪我跑5公里，最好是有跑步经验的，我需要一些指导",
    imageUrl: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    requestorName: "跑步新手",
    requestorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=Emma",
    difficulty: "medium",
    category: "activity",
    deadline: "2023-07-11 17:30:00",
    location: "校园跑道"
  }
];

// 测试用户数据
const users = [
  {
    username: '可爱多多',
    email: 'cute@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lily'
  },
  {
    username: '科技数码控',
    email: 'tech@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max'
  },
  {
    username: '猫咪控',
    email: 'cat@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma'
  },
  {
    username: '数学大神',
    email: 'math@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ryan'
  },
  {
    username: '运动达人',
    email: 'sports@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chris'
  },
  {
    username: '音乐发烧友',
    email: 'music@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'
  },
  {
    username: '急需快递',
    email: 'express@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=Felix'
  },
  {
    username: '数学困难户',
    email: 'mathhelp@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=Olivia'
  },
  {
    username: '即将毕业',
    email: 'graduate@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=Sam'
  },
  {
    username: '学习达人',
    email: 'study@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=John'
  },
  {
    username: '跑步新手',
    email: 'runner@example.com',
    password: '123456',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=Emma'
  }
];

// 插入模拟数据
async function insertMockData() {
  let connection;

  try {
    console.log('开始连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功！');

    // 不使用事务，改为单独执行每个操作
    // 注释掉事务相关代码
    // await connection.execute('START TRANSACTION');

    // 检查并创建用户
    console.log('检查并创建用户...');
    const userMap = new Map();
    
    for (const user of users) {
      // 检查用户是否存在
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [user.email, user.username]
      );

      if (existingUsers.length === 0) {
        // 哈希密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // 创建用户
        const [result] = await connection.execute(
          'INSERT INTO users (username, email, password, avatar_url) VALUES (?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.avatar_url]
        );
        
        userMap.set(user.username, result.insertId);
        console.log(`用户创建成功: ${user.username}`);
      } else {
        userMap.set(user.username, existingUsers[0].user_id);
        console.log(`用户已存在: ${user.username}`);
      }
    }

    // 插入商品数据
    console.log('插入商品数据...');
    for (const product of marketProducts) {
      const userId = userMap.get(product.sellerName);
      
      if (!userId) {
        console.log(`找不到用户 ${product.sellerName} 的ID，跳过该商品`);
        continue;
      }
      
      // 插入商品
      const [result] = await connection.execute(
        `INSERT INTO products 
         (user_id, title, description, price, original_price, category, condition_type, 
          location, is_negotiable, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          userId, 
          product.title, 
          product.description, 
          product.price, 
          product.originalPrice || null, 
          product.category, 
          product.condition, 
          product.location || null, 
          product.bargain ? 1 : 0
        ]
      );
      
      const productId = result.insertId;
      
      // 插入商品图片
      if (product.imageUrl) {
        await connection.execute(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)',
          [productId, product.imageUrl]
        );
      }
      
      console.log(`商品添加成功: ${product.title}`);
    }

    // 插入任务数据
    console.log('插入任务数据...');
    for (const mission of missions) {
      const userId = userMap.get(mission.requestorName);
      
      if (!userId) {
        console.log(`找不到用户 ${mission.requestorName} 的ID，跳过该任务`);
        continue;
      }
      
      // 插入任务
      const [result] = await connection.execute(
        `INSERT INTO missions 
         (user_id, title, description, reward, category, difficulty, location, deadline, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
        [
          userId, 
          mission.title, 
          mission.description, 
          mission.reward, 
          mission.category, 
          mission.difficulty, 
          mission.location, 
          mission.deadline || null
        ]
      );
      
      console.log(`任务添加成功: ${mission.title}`);
    }

    // 不使用事务，删除提交事务代码
    // await connection.execute('COMMIT');
    console.log('所有数据添加成功！');

  } catch (error) {
    // 不使用事务，删除回滚事务代码
    // if (connection) {
    //   await connection.execute('ROLLBACK');
    // }
    console.error('插入数据时发生错误:', error);
  } finally {
    // 关闭连接
    if (connection) {
      connection.end();
    }
  }
}

// 执行数据导入
insertMockData().then(() => {
  console.log('脚本执行完毕');
  process.exit(0);
}).catch(error => {
  console.error('脚本执行出错:', error);
  process.exit(1);
}); 
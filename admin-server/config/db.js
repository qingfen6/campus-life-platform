// 数据库连接配置
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize'); // Import Sequelize
require('dotenv').config();

// 获取数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'campuslife',
  dialect: 'mysql', // Specify dialect for Sequelize
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Sequelize specific options can be added here, e.g., logging:
  // logging: console.log, 
};

console.log('数据库配置 - 连接信息 (Sequelize):', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  dialect: dbConfig.dialect,
});

// --- Sequelize Initialization --- 
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false, // Disable logging or use console.log for debugging
    pool: { // Optional: configure Sequelize pool settings if needed
      max: dbConfig.connectionLimit,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('../models/user.model.js')(sequelize); // Load User model
db.Faculty = require('../models/faculty.model.js')(sequelize); // Load Faculty model
db.Post = require('../models/post.model.js')(sequelize); // Load Post model
db.PostMedia = require('../models/postMedia.model.js')(sequelize); // Load PostMedia model
db.Mission = require('../models/mission')(sequelize); // 加载 Mission 模型
db.Product = require('../models/product')(sequelize); // 新增：加载 Product 模型
db.SchoolAnnouncement = require('../models/schoolAnnouncement')(sequelize); // 新增：加载 SchoolAnnouncement 模型
db.SchoolAdminAccount = require('../models/schoolAdminAccount')(sequelize); // 新增：加载 SchoolAdminAccount 模型
// Example: Load School model if it exists
// try {
//   db.School = require('../models/school.model.js')(sequelize);
// } catch (e) { console.log('School model not found or failed to load.'); }

// Optional: Define associations between models if associate method exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 显式定义 Mission 和 User 的关联，如果模型文件中没有 associate 方法
db.Mission.belongsTo(db.User, { foreignKey: 'user_id', as: 'publisher' }); // Mission 属于 User (发布者)
db.User.hasMany(db.Mission, { foreignKey: 'user_id', as: 'missions' }); // User 有多个 Mission

// 显式定义 Product 和 User 的关联，如果模型文件中没有 associate 方法
db.Product.belongsTo(db.User, { foreignKey: 'user_id', as: 'seller' }); // 新增：Product 属于 User (卖方)
db.User.hasMany(db.Product, { foreignKey: 'user_id', as: 'products' }); // 新增：User 有多个 Product

// 显式定义 SchoolAnnouncement 与 School 和 User 的关联
if (db.School) { // 检查 School 模型是否存在
  db.SchoolAnnouncement.belongsTo(db.School, { foreignKey: 'school_id' }); // 公告属于学校
  db.School.hasMany(db.SchoolAnnouncement, { foreignKey: 'school_id', as: 'announcements' }); // 学校有多个公告
}
db.SchoolAnnouncement.belongsTo(db.SchoolAdminAccount, { foreignKey: 'publisher_id', as: 'publisher' }); // 公告发布者
db.SchoolAdminAccount.hasMany(db.SchoolAnnouncement, { foreignKey: 'publisher_id', as: 'publishedAnnouncements' }); // 学校管理员发布多个公告

console.log('Sequelize models loaded:', Object.keys(db).filter(k => k !== 'Sequelize' && k !== 'sequelize'));
// --------------------------------

// --- Original Pool Export (for compatibility) --- 
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: dbConfig.waitForConnections,
  connectionLimit: dbConfig.connectionLimit,
  queueLimit: dbConfig.queueLimit
});

// --- Original Test Connection (uses the pool) --- 
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库配置 (Pool) - 连接成功:');
    connection.release();
    // Add Sequelize connection test
    await sequelize.authenticate();
    console.log('数据库配置 (Sequelize) - 连接认证成功.');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    if (error.name === 'SequelizeConnectionRefusedError') {
        console.error('Sequelize 无法连接到数据库，请检查服务和配置.');
    } else if (error.name === 'SequelizeAccessDeniedError') {
        console.error('Sequelize 访问被拒绝，请检查用户名和密码.');
    } else if (error.name === 'SequelizeDatabaseError') { // e.g., database doesn't exist
         console.error(`Sequelize 数据库错误: ${error.message}`);
    }
    return false;
  }
}

// Export Sequelize instance, models, and original pool/test
module.exports = {
  ...db, // Includes sequelize, Sequelize, User, etc.
  pool, // Keep exporting the pool if other parts rely on it
  testConnection,
  dbConfig
}; 
// 服务器入口文件
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { testConnection, pool } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const homeRoutes = require('./routes/homeRoutes');
const marketRoutes = require('./routes/market/marketRoutes');
const missionRoutes = require('./routes/mission/missionRoutes');
const notificationRoutes = require('./routes/notification/notificationRoutes');
const { handleUpgrade } = require('./services/websocket');
const path = require('path');
const url = require('url');
const missionProgressRoutes = require('./routes/mission/missionProgressRoutes');
const chatRoutes = require('./routes/chatRoutes');
const postRoutes = require('./routes/postRoutes');
const orderRoutes = require('./routes/orderRoutes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 设置静态文件服务
app.use(express.static(path.join(__dirname, '../public')));
console.log('静态文件目录:', path.join(__dirname, '../public'));

// 测试数据库连接
testConnection()
  .then(success => {
    if (!success) {
      console.error('无法连接到数据库，服务器启动中断');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('数据库连接测试出错:', error);
    process.exit(1);
  });

// 路由
app.use('/api/users', userRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mission/progress', missionProgressRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/orders', orderRoutes);

// 健康检查路由
app.get('/api/health/check', async (req, res) => {
  try {
    // 测试数据库连接
    const connection = await pool.getConnection();
    connection.release();
    res.json({ 
      success: true, 
      message: '数据库连接正常',
      timestamp: new Date().toISOString(),
      serverStatus: 'running'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 根路径响应
app.get('/', (req, res) => {
  res.json({ message: 'CampusLife API 服务正在运行' });
});

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 处理WebSocket升级请求
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  
  if (pathname === '/ws') {
    handleUpgrade(request, socket, head);
  } else {
    socket.destroy();
  }
});

// 启动服务器
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`WebSocket服务启动，路径: ws://localhost:${PORT}/ws`);
});

module.exports = app;
## 要求!!!
1.注意前后端分离,文件不要与前端文件有交集,后端所有使用到或调用到的文件要记录!!!
2.如果文件位置存在问题请告知我!!!
3.任务要一次生成,修改也要一次完成!!!
4.运行终端前告诉我用意,便于我记录!!!
5.后续我要汇报这个系统,因此使用了任何结构以及技术等,有什么优点请记录!
6.一次完成,注意要求!!!
7.服务器一直打开着不需要重新start

分层结构:
项目采用了经典的MVC架构，分成了以下几层:
表示层(View): React组件，如 Home.js
API封装层: api.js, constants.js, api.config.js 
路由层(Controller): homeRoutes.js
业务逻辑层(Service): homeController.js (这里包含了控制器和服务)
数据访问层(Model): 通过DB连接直接操作数据库


## 后端文件结构记录:

### admin-server 文件结构
```
admin-server/
├── config/
│   ├── db.js             # 数据库连接配置
│   └── jwt.js            # JWT令牌配置
├── controllers/
│   ├── authController.js # 认证控制器
│   ├── dbController.js   # 数据库查询控制器
│   ├── marketController.js
│   └── adminUserController.js  # 新增
├── middlewares/
│   └── authMiddleware.js # 认证中间件
│   └── adminAuthMiddleware.js # (如果创建了)
├── routes/
│   ├── authRoutes.js     # 认证路由
│   ├── dbRoutes.js       # 数据库查询路由
│   ├── marketRoutes.js
│   └── adminUserRoutes.js    # 新增
├── scripts/
│   ├── init-db.js        # 数据库初始化脚本
│   └── create-tables.sql # SQL表结构定义
├── server.js             # 服务器入口文件
├── package.json          # 项目依赖配置
└── .env                  # 环境变量配置
```

### admin-client 文件结构
```
admin-client/
├── public/               # 静态资源目录
├── src/
│   ├── components/       # 组件目录
│   │   └── layout/
│   │       └── MainLayout.js # 主布局组件
│   │   └── pages/
│   │       ├── login/
│   │       │   ├── LoginPage.js  # 登录页面
│   │       │   └── LoginPage.css # 登录页样式
│   │       └── dashboard/
│   │           ├── DashboardPage.js # 控制面板
│   │           ├── TableListPage.js # 数据表查询
│   │           └── SqlQueryPage.js  # SQL查询
│   ├── services/
│   │   └── api.js        # API服务封装
│   ├── utils/
│   │   ├── auth.js       # 认证工具函数
│   │   └── privateRoute.js # 路由保护组件
│   ├── App.js            # 应用入口组件
│   └── index.js          # 渲染入口
└── package.json          # 项目依赖配置
```


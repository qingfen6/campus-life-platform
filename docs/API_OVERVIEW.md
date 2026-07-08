# 接口概览

本文档用于快速说明项目接口边界，帮助读者理解系统如何分层。

## 用户端 API

服务目录：`server/`

默认地址：`http://localhost:5001/api`

| 前缀 | 路由文件 | 模块 |
| --- | --- | --- |
| `/api/users` | `server/routes/userRoutes.js` | 登录、注册、用户资料 |
| `/api/home` | `server/routes/homeRoutes.js` | 首页动态、热门话题、评论 |
| `/api/market` | `server/routes/market/marketRoutes.js` | 商品列表、商品详情、发布商品、议价 |
| `/api/mission` | `server/routes/mission/missionRoutes.js` | 悬赏任务列表、详情、发布、接单 |
| `/api/mission/progress` | `server/routes/mission/missionProgressRoutes.js` | 任务进度提交与查看 |
| `/api/notifications` | `server/routes/notification/notificationRoutes.js` | 通知列表、已读状态 |
| `/api/chat` | `server/routes/chatRoutes.js` | 会话与聊天记录 |
| `/api/posts` | `server/routes/postRoutes.js` | 动态详情与用户动态 |
| `/api/orders` | `server/routes/orderRoutes.js` | 订单创建、查询、模拟支付确认 |
| `/api/health/check` | `server/server.js` | 数据库与服务健康检查 |

## 管理端 API

服务目录：`admin-server/`

默认地址：`http://localhost:8080/api`

| 前缀 | 路由文件 | 模块 |
| --- | --- | --- |
| `/api/auth` | `admin-server/routes/authRoutes.js` | 平台管理员登录与资料 |
| `/api/school-admin/auth` | `admin-server/routes/schoolAdminAuthRoutes.js` | 学校管理员登录 |
| `/api/db` | `admin-server/routes/dbRoutes.js` | 数据表查看、结构查看、SQL 查询 |
| `/api/admin` | `admin-server/routes/adminUserRoutes.js` | 用户管理 |
| `/api/admin` | `admin-server/routes/adminSchoolRoutes.js` | 学校管理 |
| `/api/admin/statistics` | `admin-server/routes/statisticsRoutes.js` | 管理后台统计数据 |
| `/api/school-admin` | `admin-server/routes/schoolAdminRoutes.js` | 学校管理员综合管理入口 |

## 鉴权方式

- 用户端和管理端均使用 JWT。
- 前端登录后将 token 存储在本地，并通过 `Authorization: Bearer <token>` 发送。
- 后端中间件负责校验 token，并将用户身份写入请求上下文。

## 说明重点

1. 用户端 API 和管理端 API 分开，便于权限边界清晰。
2. 管理后台不仅查看数据，还承担内容审核和学校管理能力。
3. 健康检查接口用于快速判断数据库连接状态。
4. WebSocket 单独挂在用户 API 服务中，负责实时消息能力。

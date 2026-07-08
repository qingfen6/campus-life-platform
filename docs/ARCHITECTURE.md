# 系统架构说明

Campus Life Platform 采用前后端分离的多端结构，核心由用户端、用户 API、管理后台、管理 API 和 MySQL 数据库组成。

## 架构总览

```text
用户浏览器
  ├─ 用户端 React 应用 src/
  │   └─ 调用 server 提供的 /api/users、/api/home、/api/market 等接口
  │
  └─ 管理后台 React 应用 admin-client/
      └─ 调用 admin-server 提供的 /api/auth、/api/admin、/api/school-admin 等接口

Node.js 服务
  ├─ server/        用户端 API、WebSocket、文件上传、订单和任务流程
  └─ admin-server/  管理端 API、用户/学校/内容审核、统计看板

数据层
  └─ MySQL campuslife 数据库
```

## 子系统职责

| 子系统 | 路径 | 职责 |
| --- | --- | --- |
| 用户端前端 | `src/` | 学生端页面、状态管理、路由、集市、悬赏、动态、聊天通知 |
| 用户端后端 | `server/` | 用户认证、动态、商品、任务、订单、通知、WebSocket |
| 管理后台前端 | `admin-client/` | 管理员登录、数据看板、用户/学校/内容管理页面 |
| 管理后台后端 | `admin-server/` | 管理员鉴权、学校管理员鉴权、审核接口、统计接口 |
| 数据库脚本 | `server/scripts/`、`admin-server/scripts/` | 初始化表结构、导入模拟数据、验证数据库 |
| 设计资料 | `docs/design/` 和 `用例设计/` | 用例、通信图、顺序图、类图、关系模型、数据库设计 |

## 核心数据流

1. 用户登录后，前端保存 JWT，并在后续请求中携带 `Authorization`。
2. 用户端通过 `src/utils/api.js` 调用用户 API。
3. 用户 API 通过 `server/routes` 分发到对应 controller。
4. controller 使用 MySQL 连接池或业务脚本读写数据。
5. WebSocket 用于实时聊天、通知等即时交互。
6. 管理端通过独立后台登录后，调用 `admin-server` 的审核与管理接口。

## 关键业务闭环

| 业务 | 前端入口 | 后端入口 | 说明 |
| --- | --- | --- | --- |
| 校园动态 | `src/pages/Home.js` | `server/routes/homeRoutes.js` | 动态列表、发布、点赞、评论 |
| 二手集市 | `src/pages/MarketPage.js` | `server/routes/market/marketRoutes.js` | 商品发布、详情、议价、订单 |
| 悬赏任务 | `src/pages/MissionPage.js` | `server/routes/mission/missionRoutes.js` | 任务发布、接单、进度、确认 |
| 通知聊天 | `src/components/chat/` | `server/services/websocket.js` | 私聊、通知、实时消息 |
| 后台审核 | `admin-client/src/pages/school-admin/` | `admin-server/routes/schoolAdminRoutes.js` | 内容、用户、商品、悬赏管理 |

## 可继续优化

- 将用户 API 与管理 API 的配置统一抽象为环境变量。
- 为核心 controller 增加自动化测试。
- 清理历史调试日志，保留结构化日志。
- 补充 OpenAPI/Swagger 接口文档。
- 提供 Docker Compose，用于一键启动 MySQL 与服务。

# Campus Life Platform

Campus Life Platform 是一个面向高校场景的全栈校园生活平台，覆盖学生端、学校/平台管理端和双后端 API。项目围绕校园信息流、二手集市、悬赏任务、评论通知、订单模拟支付、学校主页、学院信息和后台审核等场景展开，适合作为 React + Node.js + MySQL 全栈项目展示。

> 当前仓库保留了项目开发过程中的设计文档、用例图、数据库设计和实验草稿，便于面试时说明需求分析、系统设计与实现演进。

## 项目亮点

- 多端架构：用户端 React 应用、管理后台 React 应用、用户 API 服务、管理 API 服务。
- 校园业务闭环：动态发布、评论互动、二手商品、悬赏任务、任务进度、模拟订单支付。
- 权限与认证：用户登录注册、JWT 鉴权、管理员与学校管理员角色入口。
- 实时能力：基于 WebSocket 的聊天与通知能力。
- 数据库设计：MySQL 表结构、初始化脚本、模拟数据导入脚本和数据库设计文档。
- 管理后台：用户管理、学校管理、动态审核、商品审核、悬赏审核、公告管理、数据看板。
- 工程资料完整：用例规约、活动图、通信图、数据库文档、开发记录和总结可作为答辩/面试材料。

## 技术栈

**前端**
- React 18
- React Router
- Redux Toolkit
- Ant Design
- Axios / Fetch
- CSS / Less

**后端**
- Node.js
- Express
- MySQL / mysql2
- Sequelize
- JWT
- Multer
- WebSocket

**工程与文档**
- npm scripts
- PlantUML
- Markdown 设计文档
- MySQL 初始化脚本

## 仓库结构

```text
.
├── src/                    # 用户端 React 应用
├── server/                 # 用户端 API 服务
├── admin-client/           # 管理后台 React 应用
├── admin-server/           # 管理后台 API 服务
├── public/                 # 用户端静态资源
├── 用例设计/               # 用例规约、通信图、顺序图等设计资料
├── README-START.md         # 早期启动说明
├── 数据库.md               # 数据库设计资料
├── 数据库表结构.docx       # 数据库表结构文档
├── 分析类图.md             # 分析类图文档
├── 关系模型.md             # 关系模型文档
├── 开发记录.md             # 开发过程记录
└── 开发经验总结.md         # 项目复盘材料
```

## 功能模块

| 模块 | 说明 |
| --- | --- |
| 全国高校平台 | 高校信息、科研成果、招生信息、排行榜入口 |
| 学校主页 | 学校公告、学院信息、社团活动、资源入口 |
| 校园动态 | 图文动态、点赞、评论、详情页 |
| 校园集市 | 商品发布、商品详情、议价、订单与模拟支付 |
| 悬赏任务 | 任务发布、接单、进度提交、任务确认 |
| 表白墙 | 匿名内容发布与互动 |
| 聊天通知 | 私聊、通知铃铛、WebSocket 消息 |
| 管理后台 | 用户、学校、动态、商品、悬赏、公告与数据分析 |

## 本地运行

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

复制示例文件并按本地 MySQL 配置修改：

```bash
copy .env.example .env
copy server\.env.example server\.env
copy admin-server\.env.example admin-server\.env
copy admin-client\.env.example admin-client\.env
```

### 3. 初始化数据库

确保本地 MySQL 已启动，并创建或允许脚本创建 `campuslife` 数据库。

```bash
cd server
npm run init-db
```

管理后台相关表和模拟数据可参考：

```bash
cd admin-server
npm run dev
```

项目内也保留了 `server/scripts` 和 `admin-server/scripts` 下的 SQL 与初始化脚本，便于按需导入。

### 4. 启动服务

用户端 API：

```bash
npm run dev:user:api
```

用户端前端：

```bash
npm run dev:user:web
```

管理后台 API：

```bash
npm run dev:admin:api
```

管理后台前端：

```bash
npm run dev:admin:web
```

也可以分组启动：

```bash
npm run dev:services
npm run dev:web
```

默认访问地址：

| 服务 | 地址 |
| --- | --- |
| 用户端前端 | http://localhost:3000 |
| 用户端 API | http://localhost:5001/api |
| 管理后台前端 | http://localhost:3001 或 CRA 分配端口 |
| 管理后台 API | http://localhost:8080/api |

## 环境变量

根目录、用户 API、管理 API 和管理前端均提供 `.env.example`。真实 `.env` 文件不会提交到 GitHub。

核心变量：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campuslife
PORT=5001
JWT_SECRET=replace_with_local_secret
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

## 求职展示建议

面试讲解时可以按下面顺序展开：

1. 先讲项目定位：校园生活综合服务平台。
2. 再讲系统架构：用户端、管理端、用户 API、管理 API、MySQL。
3. 展示核心业务：动态、集市、悬赏、通知、后台审核。
4. 展示数据库和用例设计资料，说明不是只写页面，而是从需求分析到表结构都有沉淀。
5. 最后讲可改进点：部署、测试覆盖、日志规范、接口文档和权限细化。

## 延伸文档

- [文档索引](docs/README.md)
- [系统架构说明](docs/ARCHITECTURE.md)
- [接口概览](docs/API_OVERVIEW.md)
- [面试讲解指南](docs/INTERVIEW_GUIDE.md)
- [截图与视觉资料](docs/SCREENSHOTS.md)

## 当前状态

本项目当前以本地运行和求职展示为主，尚未做真实线上部署。后续整理重点会放在 README、启动脚本、截图、接口说明、数据库说明和关键流程演示上。

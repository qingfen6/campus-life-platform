# Campus Life Platform

Campus Life Platform 是一个面向高校场景的全栈校园生活平台，覆盖学生端、管理后台、用户端 API、管理端 API 和 MySQL 数据库设计。项目围绕校园动态、二手集市、悬赏任务、订单模拟支付、评论通知、学校主页、学院信息和后台审核等场景展开，适合作为 React + Node.js + MySQL 全栈项目展示。

> 当前项目以本地运行和项目展示为主，尚未进行真实线上部署。仓库已保留有价值的需求分析、用例规约、通信图、顺序图、类图、关系模型和数据库设计资料，便于说明从需求分析到实现落地的完整过程。

## 项目亮点

- 多端架构：用户端 React 应用、管理后台 React 应用、用户 API 服务、管理 API 服务。
- 业务闭环完整：动态发布、评论互动、二手商品、悬赏任务、任务进度、订单与模拟支付。
- 权限边界清晰：学生用户、平台管理员、学校管理员分别拥有不同入口和职责。
- 实时能力：基于 WebSocket 的聊天与通知能力。
- 数据库沉淀：包含 MySQL 表结构、初始化脚本、模拟数据导入脚本、关系模型和数据库设计文档。
- 管理后台：覆盖用户管理、学校管理、动态审核、商品审核、悬赏审核、公告管理和数据看板。
- 设计资料完整：保留用例规约、通信图、顺序图、类图、数据库设计和开发复盘，便于项目讲解和复盘。

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
- Mermaid
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
├── docs/                   # 项目说明文档、架构说明、设计资料索引
│   ├── design/             # 类图、关系模型、数据库设计、用例讲解
│   └── archive/            # 早期开发记录和实验草稿归档
├── 用例设计/               # 原始用例规约、通信图、顺序图
├── 数据库表结构.docx       # 数据库表结构文档
├── image.png               # 校园氛围视觉素材
└── {C0DF...}.png           # 订单/支付相关类图素材
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

项目内保留了 `server/scripts` 和 `admin-server/scripts` 下的 SQL 与初始化脚本，便于按需导入用户端和管理端数据表。

### 4. 启动服务

```bash
npm run dev:user:api
npm run dev:user:web
npm run dev:admin:api
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

## 延伸文档

- [文档索引](docs/README.md)
- [系统架构说明](docs/ARCHITECTURE.md)
- [接口概览](docs/API_OVERVIEW.md)
- [设计资料总览](docs/design/README.md)
- [用例与业务流程](docs/design/use-cases.md)
- [数据库设计](docs/design/database-design.md)
- [项目讲解指南](docs/PROJECT_PRESENTATION.md)
- [截图与视觉资料](docs/SCREENSHOTS.md)

## 项目展示建议

1. 先讲项目定位：校园生活综合服务平台。
2. 再讲系统架构：用户端、管理端、用户 API、管理 API、MySQL。
3. 展示核心业务：动态、集市、悬赏、通知、后台审核。
4. 展示 `docs/design` 中的用例、类图、关系模型和数据库设计，说明项目不是只做页面，而是有需求分析和系统建模。
5. 最后讲可改进点：真实部署、自动化测试、日志规范、接口文档和权限细化。

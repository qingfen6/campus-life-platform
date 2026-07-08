# CampusLife - 大学生社交平台

第一个是全学校首页
这个全学校首页是整合了中国的大量学校
在这个页面用户可以查看各个高校发布成动态的研究成果,招生信息,校园宣传,以及面向社会的校园活动和各个高校的各种排行榜等
然后由这个界面点击任意一个学校这时候就会进入第二个首页--校园首页
学校首页用于查看学校向本校学生发布的一些通知,各个学院为学生发布的招聘以及其他资源,还有各个社团的活动以及招新的动态
然后当点击入园后会进入到第三个首页--学生首页
这个首页是该学校学生的动态组成的主要的模块有校园互助,校园集市等

## 要求!!!
-新生成的文件必须更新项目结构
- 功能代码都带有详细注释!!
-每个代码文件开始前有注释说明该文件代码的功能!!
-运行终端需要告诉每个步骤的目的!!
-每次生成应更新README.md的项目结构
-如若使用了相关技术请在README.md的主要页面下的功能后注释
-如有交互逻辑请把其流程以及位置记录在README.md的交互逻辑中
-生成时,按要求一次性生成!!

## 功能特点

- 🎨 现代化UI设计，符合大学生审美
- 🌓 支持明暗两种主题模式
- 📱 完全响应式设计，适配各类设备
- ❤️ 互动功能：点赞、评论
- 🛒 校园集市：二手交易平台
- 🎯 悬赏令功能：校园互助系统
- 🖼️ 图片展示优化，支持悬停放大效果
- 💌 表白墙功能：匿名告白与分享感动
- 💬 多频道聊天室：好友、校园和全国三大频道
- 🏫 校园主页：学校通知、招聘信息和社团活动展示
- 🌍 全国高校平台：展示全国高校研究成果、招生信息和排行榜
- 🎓 学院页面：展示学院详细信息，支持组件化定制和编辑

## 技术栈

- React
- Ant Design 组件库
- React Router
- CSS3动画与过渡效果
- React Beautiful DnD (拖拽排序)
我需要推荐以下技术栈：
前端：继续使用React
后端：Node.js + Express
数据库连接：mysql2或sequelize



## 项目结构

```
src/
├── pages/                 # 页面组件
│   ├── Home.js            # 首页
│   ├── MarketPage.js      # 校园集市页面
│   ├── MissionPage.js     # 悬赏令页面
│   ├── ConfessWall.js     # 表白墙页面
│   ├── SchoolHome.js      # 学校首页
│   ├── AllSchoolHome.js   # 全国高校首页
│   ├── ComputerSciencePage.js # 计算机学院页面
│   ├── SchoolRankingPage.js # 高校排行榜页面
│   ├── ResearchPage.js    # 科研成果页面
│   ├── ClubActivityPage.js # 社团活动页面
│   ├── ClubPage.js        # 社团页面新版本
│   └── ProductDetailPage.js # 商品详情页面
├── components/            # 通用组件
│   ├── common/            # 所有页面通用组件
│   │   ├── Header.js      # 头部导航组件
│   │   ├── Sidebar.js     # 侧边栏组件
│   │   ├── SchoolSidebar.js # 学校专用侧边栏组件
│   │   ├── AllSchoolSidebar.js # 全国高校专用侧边栏组件
│   │   ├── FloatingButton.js # 悬浮导航按钮组件
│   │   └── Footer.js      # 页脚组件
│   ├── faculty/           # 学院页面相关组件
│   │   ├── FacultyInfoComponent.js # 学院基本信息组件
│   │   ├── MajorSettingsComponent.js # 专业设置组件
│   │   ├── FacultyStaffComponent.js # 师资力量组件
│   │   ├── ResearchComponent.js # 科研成果组件
│   │   ├── FacultyNewsComponent.js # 学院新闻公告组件
│   │   ├── RecruitmentComponent.js # 招聘信息组件
│   │   ├── LabResourceComponent.js # 实验室资源组件
│   │   ├── StudentActivityComponent.js # 学生活动组件
│   │   └── faculty.css    # 学院组件通用样式
│   ├── club/             # 社团活动相关组件
│   │   ├── ActivityCard.js # 活动卡片组件
│   │   ├── RecruitmentCard.js # 招新卡片组件
│   │   ├── ResourceCard.js # 资源卡片组件
│   │   ├── ForumPostCard.js # 论坛帖子卡片组件
│   │   ├── CalendarCard.js # 日历卡片组件
│   │   ├── DynamicPostCard.js # 动态信息卡片组件
│   │   ├── InterviewSlotPicker.js # 面试时间选择器组件
│   │   ├── ResourceUploader.js # 资源上传组件
│   │   └── club.css      # 社团组件通用样式
│   ├── feed/              # 动态页面相关组件
│   ├── market/            # 校园集市相关组件
│   │   ├── MarketCard.js  # 集市商品卡片组件
│   │   ├── ProductCard.js # 商品卡片组件
│   │   └── AddProductModal.js # 商品发布模态框
│   └── mission/           # 悬赏令相关组件
│       └── MissionCard.js # 任务卡片组件
├── assets/                # 静态资源
│   ├── images/            # 图片资源
│   └── styles/            # 全局样式
│       ├── global.css     # 全局样式文件
│       ├── Header.css     # 头部导航样式
│       ├── Sidebar.css    # 侧边栏样式
│       ├── SchoolSidebar.css # 学校侧边栏样式
│       ├── AllSchoolSidebar.css # 全国高校侧边栏样式
│       ├── FloatingButton.css # 悬浮按钮样式
│       ├── Home.css       # 首页样式
│       ├── MarketPage.css # 集市页面样式
│       ├── MarketCard.css # 商品卡片样式
│       ├── MissionPage.css # 任务页面样式
│       ├── MissionCard.css # 任务卡片样式
│       ├── ConfessWall.css # 表白墙样式
│       ├── SchoolHome.css  # 学校首页样式
│       ├── AllSchoolHome.css # 全国高校首页样式
│       ├── ComputerSciencePage.css # 计算机学院页面样式
│       ├── SchoolRankingPage.css # 高校排行榜页面样式
│       ├── ResearchPage.css # 科研成果页面样式
│       ├── ClubActivityPage.css # 社团活动页面样式
│       ├── ProductDetailPage.css # 商品详情页面样式
│       └── AddProductModal.css # 商品发布模态框样式
├── api/                   # API 调用封装
├── store/                 # 状态管理 (可能包含 Redux, Zustand 等)
├── utils/                 # 工具函数
│   ├── api.js            # API 请求 
│   ├── helpers.js        # 辅助函数
│   └── validators.js     # 表单验证
├── hooks/                 # 自定义钩子
│   ├── useAuth.js         # 认证相关钩子
│   ├── useActivity.js     # 活动相关钩子
│   ├── useRecruitment.js  # 招新相关钩子
│   └── useResource.js     # 资源相关钩子
├── data/                  # 模拟数据 (开发用)
│   ├── activities.js     # 活动数据
│   ├── recruitments.js   # 招新数据
│   ├── resources.js      # 资源数据
│   └── forumPosts.js     # 论坛数据
├── styles/                # 另一种存放全局样式的方式 (可能与assets/styles重复或有分工)
├── App.js                 # 应用入口组件 
├── index.js               # 渲染入口 (旧，可能已迁移至 main.tsx)
├── App.tsx                # 应用入口组件 (TypeScript 版本)
├── main.tsx               # 渲染入口 (TypeScript 版本)
├── App.css                # 应用级样式
├── index.css              # 全局入口样式
├── api.config.js          # API 配置
├── react-dom-client.d.ts  # 类型定义文件
├── logo.svg               # SVG Logo
├── setupTests.js          # 测试设置
├── reportWebVitals.js     # Web Vitals 报告
└── App.test.js            # 应用测试文件
```
admin-server/
├── config/
│   ├── db.js             # 数据库连接配置
│   └── jwt.js            # JWT令牌配置
├── controllers/
│   ├── authController.js # 认证控制器
│   └── dbController.js   # 数据库查询控制器
│   └── marketController.js # 集市控制器
├── middlewares/
│   └── authMiddleware.js # 认证中间件
├── routes/
│   ├── authRoutes.js     # 认证路由
│   └── dbRoutes.js       # 数据库查询路由
│   └── marketRoutes.js   # 集市路由
├── utils/                 # 工具函数
├── scripts/               # 脚本文件 (例如数据库初始化)
│   ├── init-db.js
│   └── create-tables.sql
├── admin-client/          # (可能存在的)管理后台前端项目
├── node_modules/          # Node.js 依赖
├── server.js             # 服务器入口文件
├── package.json          # 项目和依赖配置
├── package-lock.json     # 依赖锁定文件
└── .env                  # 环境变量配置
```
server/
├── config/                # 配置 (例如数据库, JWT)
├── controllers/           # 控制器 (处理请求逻辑)
├── middleware/ or middlewares/ # 中间件 (例如认证, 日志)
├── models/                # 数据模型 (如果使用 ORM)
├── routes/                # 路由定义
├── scripts/               # 脚本 (例如数据库迁移, 初始化)
├── services/              # 服务层 (封装业务逻辑)
├── utils/                 # 工具函数
├── node_modules/          # Node.js 依赖
├── server.js             # 服务器入口文件
├── package.json          # 项目和依赖配置
└── package-lock.json     # 依赖锁定文件
```
## 主要页面

### 1. 首页 (Home)
- 动态内容流展示
- 热门话题和推荐内容

### 2. 校园集市 (MarketPage)
- 二手物品展示
- 可爱风格UI设计
- 价格显示与交易流程

### 3. 悬赏令 (MissionPage)
- 任务发布与接单
- 类游戏风格UI设计
- 悬赏金额与截止时间显示

### 4. 表白墙 (ConfessWall)
- 匿名表白发布
- 点赞与评论互动
- 按时间和热度排序
- 礼物赠送功能

### 5. 聊天室功能
- 多频道聊天系统（好友、校园、全国）
- 实时消息显示
- 未读消息通知
- 系统公告集成

### 6. 校园主页 (SchoolHome)
- 学校通知公告展示
- 各学院招聘信息
- 社团活动与招新动态
- 学校资源与快速链接
- 活动日历展示
- 专用侧边栏导航

### 7. 全国高校平台 (AllSchoolHome)
- 各高校研究成果展示
- 全国高校排行榜
- 各校招生信息汇总
- 高校区域和类型分类
- 面向社会的校园活动
- 热门教育话题讨论

### 8. 学院页面 (ComputerSciencePage)
- 学院基本信息展示
- 专业设置与课程介绍
- 师资力量展示
- 科研成果展示
- 学院新闻公告
- 招聘信息
- 实验室资源
- 学生活动
- 支持组件拖拽排序和内容编辑

### 9. 社团活动页面 (ClubActivityPage)
- 社团活动列表展示
- 活动类型筛选
- 活动状态筛选
- 活动搜索功能
- 活动报名功能
- 活动详情展示
- 活动点赞和收藏功能
- 活动分享功能
- 活动参与度进度条展示
- 活动组织者信息展示
- 卡片设计增加悬停动画效果
- 标签使用主题特定色彩
- 响应式布局设计
- 深色模式支持优化
- 美化了深色模式下的配色方案
- 增强文本可读性和对比度
- 社团招新一站式服务
  - 招新季聚合页面
  - 在线面试预约系统
  - 招新进度追踪
  - 面试时间管理
- 资源共享区
  - 活动模板下载
  - 策划案分享
  - 宣传素材库
  - 活动策划工具包
- 论坛/讨论区
  - 话题分类
  - 匿名发帖
  - 内容审核
  - 互动交流
- 活动日历与提醒
  - 可视化日历
  - 个人日历订阅
  - 活动提醒
- 动态信息流
  - 图文展示
  - 短视频支持
  - 直播回放
  - 实时互动

### 10. 社团页面 (ClubPage)
- 社团活动日历展示
  - 可切换社团活动日历和个人日历
  - 日历上标记活动日期
  - 点击日期查看活动详情
  - 支持日历订阅和活动提醒
- 社团最新动态区
  - 图文展示
  - 短视频支持
  - 动态点赞、评论、分享互动
  - 相册式图片浏览
  - 话题标签系统
- 多种卡片类型
  - 大小不一的活动卡片
  - 动态信息卡片
  - 招新信息卡片
  - 资源共享卡片
  - 论坛讨论卡片
- 统一的用户交互体验
  - 响应式设计
  - 暗色模式支持
  - 动画过渡效果

## 交互逻辑

### 导航与界面交互
1. **侧边栏收缩功能**
   - 位置：`src/components/common/Sidebar.js`
   - 逻辑流程：
     1. 点击侧边栏底部的折叠按钮 → 触发 `onCollapse` 函数
     2. 更新 `collapsed` 状态 → 侧边栏宽度变化
     3. 应用 `sidebar-collapsed` 类到内容区域 → 内容区域左边距调整
   - 技术：React useState + Ant Design Layout.Sider 组件

2. **深色模式切换**
   - 位置：`src/components/common/Sidebar.js` 和 `src/App.js`
   - 逻辑流程：
     1. 点击底部的深色模式开关 → 触发 `toggleDarkMode` 函数
     2. 更新 `darkMode` 状态 → 存储到 localStorage
     3. 向文档添加/移除 `dark-mode` 类 → 应用深色样式变量
   - 技术：React useState + useEffect + localStorage + CSS变量

3. **聊天室弹窗**
   - 位置：`src/components/common/Sidebar.js`
   - 逻辑流程：
     1. 点击聊天按钮 → 触发 `toggleChat` 函数
     2. 更新 `chatVisible` 状态 → 显示/隐藏聊天室弹窗
     3. 点击不同频道按钮 → 触发 `switchChannel` → 切换显示不同频道的消息
     4. 输入消息并发送 → 触发 `sendMessage` → 更新聊天消息列表
   - 技术：React useState + useEffect + Ant Design组件

### 集市页面交互
1. **商品筛选与搜索**
   - 位置：`src/pages/MarketPage.js`
   - 逻辑流程：
     1. 输入关键词 → 触发搜索功能 → 过滤商品列表
     2. 选择分类/价格区间 → 触发过滤器 → 更新显示的商品
     3. 点击重置按钮 → 触发 `resetFilters` → 恢复原始商品列表
   - 技术：React useState + Array.filter

2. **砍价功能**
   - 位置：`src/pages/MarketPage.js`
   - 逻辑流程：
     1. 点击商品卡片上的"砍价"按钮 → 触发 `handleBargainClick`
     2. 打开砍价对话框 → 填写期望价格
     3. 提交砍价请求 → 触发 `handleBargainSubmit` → 显示砍价成功消息
   - 技术：Ant Design Modal + Form + React状态管理

### 悬赏任务交互
1. **任务发布**
   - 位置：`src/pages/MissionPage.js`
   - 逻辑流程：
     1. 点击"发布任务"按钮 → 打开任务发布表单弹窗
     2. 填写任务信息 → 提交表单 → 触发 `handlePublishMission`
     3. 关闭弹窗并显示成功消息
   - 技术：Ant Design Modal + Form组件 + React状态管理

2. **任务筛选**
   - 位置：`src/pages/MissionPage.js`
   - 逻辑流程：
     1. 点击不同任务类型标签 → 触发 `filterMissionsByTab`
     2. 更新 `activeTab` 状态 → 过滤任务列表
   - 技术：Ant Design Tabs + React状态管理

### 表白墙交互
1. **表白发布**
   - 位置：`src/pages/ConfessWall.js`
   - 逻辑流程：
     1. 点击"发表表白"按钮 → 打开表白表单弹窗
     2. 填写表白内容 → 提交表单 → 触发 `handleSubmitConfession`
     3. 关闭弹窗并显示成功消息
   - 技术：Ant Design Modal + Form组件 + React状态管理

2. **表白排序**
   - 位置：`src/pages/ConfessWall.js`
   - 逻辑流程：
     1. 点击不同排序标签（最新/热门）→ 更新 `activeTab` 状态
     2. 触发useEffect → 重新排序表白列表
   - 技术：Ant Design Tabs + React useEffect + Array.sort

### 校园主页交互
1. **校园侧边栏导航**
   - 位置：`src/components/common/SchoolSidebar.js`
   - 逻辑流程：
     1. 点击不同导航项目 → 触发 `handleMenuClick` 函数
     2. 更新 `activeMenuItem` 状态 → 滚动到页面对应部分
     3. 点击学院或社团子菜单 → 过滤显示对应信息
   - 技术：React useState + Ant Design Menu组件 + DOM滚动

2. **学校通知互动**
   - 位置：`src/pages/SchoolHome.js`
   - 逻辑流程：
     1. 点击通知标记为重要 → 触发 `markAsImportant` 函数
     2. 更新通知重要性状态 → 添加视觉标记
     3. 点击查看更多 → 展开完整通知内容
   - 技术：React useState + Ant Design组件

3. **社团活动筛选**
   - 位置：`src/pages/SchoolHome.js`
   - 逻辑流程：
     1. 点击不同社团分类标签 → 触发 `filterClubsByCategory`
     2. 更新 `activeCategory` 状态 → 过滤显示的社团列表
   - 技术：Ant Design Tabs + React状态管理

### 全国高校平台交互
1. **高校分类与筛选**
   - 位置：`src/pages/AllSchoolHome.js` 和 `src/components/common/AllSchoolSidebar.js`
   - 逻辑流程：
     1. 点击不同高校分类或地区 → 触发 `handleMenuClick` 函数
     2. 导航到对应的筛选页面 → 展示筛选后的学校列表
   - 技术：React Router + Ant Design 菜单组件

2. **研究成果与排行榜展示**
   - 位置：`src/pages/AllSchoolHome.js`
   - 逻辑流程：
     1. 加载高校研究成果数据 → 展示学术创新成果
     2. 根据排名指标展示全国高校排行榜
   - 技术：Ant Design Card + List + Table组件

3. **页面导航悬浮按钮**
   - 位置：各页面组件 + `src/components/common/FloatingButton.js`
   - 逻辑流程：
     1. 点击悬浮按钮 → 根据当前页面提供对应导航选项
     2. 校园主页上提供"出校"(前往全国高校平台)和"入圈"(返回个人主页)按钮
     3. 全国高校平台提供"返回校园主页"和"返回个人主页"按钮
     4. 其他页面提供"前往校园主页"按钮
   - 技术：React 组件封装 + CSS固定定位

### 学院页面交互
1. **组件拖拽排序**
   - 位置：`src/pages/ComputerSciencePage.js`
   - 逻辑流程：
     1. 进入编辑模式 → 组件变为可拖拽状态
     2. 拖拽组件 → 触发 `handleDragEnd` 函数
     3. 更新 `componentOrder` 状态 → 重新排序组件
     4. 保存编辑 → 退出编辑模式，保留新的排序
   - 技术：React Beautiful DnD + React useState

2. **组件内容编辑**
   - 位置：`src/components/faculty/` 下的各组件
   - 逻辑流程：
     1. 点击组件的编辑按钮 → 显示编辑模态框
     2. 修改表单内容 → 提交表单 → 触发保存函数
     3. 更新组件数据 → 关闭模态框 → 显示新内容
   - 技术：Ant Design Modal + Form + React状态管理

3. **管理员权限控制**
   - 位置：`src/pages/ComputerSciencePage.js`
   - 逻辑流程：
     1. 点击管理员登录按钮 → 切换管理员状态
     2. 显示/隐藏编辑功能按钮 → 控制编辑权限
   - 技术：React useState + 条件渲染

### 社团活动页面交互
1. **活动筛选与搜索**
   - 位置：`src/pages/ClubActivityPage.js`
   - 逻辑流程：
     1. 选择活动类型 → 触发 `handleTypeChange` 函数 → 更新 `selectedType` 状态
     2. 选择活动状态 → 触发 `handleStatusChange` 函数 → 更新 `selectedStatus` 状态
     3. 输入搜索关键词 → 触发 `handleSearch` 函数 → 更新 `searchText` 状态
     4. 所有筛选条件更新都会调用 `filterActivities` 函数，过滤活动列表
   - 技术：React useState + 数组过滤 + Ant Design 组件

2. **活动卡片交互**
   - 位置：`src/components/club/ActivityCard.js`
   - 逻辑流程：
     1. 点赞活动 → 触发 `handleLike` 函数 → 更新活动 `isLiked` 状态和点赞数量
     2. 收藏活动 → 触发 `handleFavorite` 函数 → 更新活动 `isFavorite` 状态
     3. 分享活动 → 触发 `handleShare` 函数 → 显示分享成功消息
     4. 点击卡片 → 触发 `handleViewDetail` 函数 → 打开活动详情模态框
     5. 点击报名按钮 → 触发 `handleJoinActivity` 函数 → 打开报名表单模态框
   - 技术：React useState + 事件处理 + Ant Design Modal组件

3. **招新管理交互**
   - 位置：`src/components/club/RecruitmentCard.js` 和 `src/components/club/InterviewSlotPicker.js`
   - 逻辑流程：
     1. 发布招新信息 → 填写招新表单 → 提交并发布
     2. 设置面试时间 → 选择时间段 → 生成面试时间表
     3. 学生预约面试 → 选择时间段 → 提交预约申请
     4. 查看申请状态 → 更新申请进度 → 发送通知
   - 技术：React useState + Ant Design Form + Calendar组件

4. **资源管理交互**
   - 位置：`src/components/club/ResourceCard.js` 和 `src/components/club/ResourceUploader.js`
   - 逻辑流程：
     1. 上传资源 → 选择文件 → 填写描述 → 提交上传
     2. 下载资源 → 点击下载 → 更新下载计数
     3. 预览资源 → 点击预览 → 打开预览窗口
     4. 管理资源 → 编辑/删除 → 更新资源列表
   - 技术：React useState + Ant Design Upload + Modal组件

5. **论坛交互**
   - 位置：`src/components/club/ForumPostCard.js`
   - 逻辑流程：
     1. 发布帖子 → 选择类型 → 填写内容 → 提交发布
     2. 匿名发帖 → 勾选匿名 → 内容审核 → 发布显示
     3. 回复帖子 → 输入回复 → 提交回复 → 更新列表
     4. 点赞/收藏 → 点击按钮 → 更新状态 → 显示效果
   - 技术：React useState + Ant Design Form + List组件

6. **日历交互**
   - 位置：`src/components/club/CalendarCard.js`
   - 逻辑流程：
     1. 查看日历 → 选择日期 → 显示活动列表
     2. 订阅日历 → 点击订阅 → 生成订阅链接
     3. 添加提醒 → 设置时间 → 保存提醒
     4. 同步日历 → 选择平台 → 授权同步
   - 技术：React useState + Ant Design Calendar + Modal组件

7. **动态信息流交互**
   - 位置：`src/components/club/DynamicPostCard.js`
   - 逻辑流程：
     1. 发布动态 → 选择类型 → 上传内容 → 发布显示
     2. 图片展示 → 点击图片 → 放大预览
     3. 视频播放 → 点击播放 → 全屏显示
     4. 直播互动 → 进入直播间 → 发送消息
   - 技术：React useState + Ant Design Image + Video组件

### 社团页面交互
1. **日历切换功能**
   - 位置：`src/pages/ClubPage.js`
   - 逻辑流程：
     1. 点击日历切换开关 → 触发 `handleCalendarModeChange` 函数
     2. 更新 `calendarMode` 状态 → 切换显示社团日历或个人日历
     3. 根据日历模式不同，日历组件显示不同的活动标记

2. **日期选择功能**
   - 位置：`src/pages/ClubPage.js` 和 `src/components/club/CalendarCard.js`
   - 逻辑流程：
     1. 点击日历上的日期 → 触发 `handleDateSelect` 函数
     2. 更新 `selectedDate` 状态 → 显示该日期的活动列表
     3. 日历上以标记形式展示不同类型的活动

3. **动态内容交互**
   - 位置：`src/pages/ClubPage.js` 和 `src/components/club/DynamicCard.js`
   - 逻辑流程：
     1. 点赞动态 → 触发 `handleLike` 函数 → 更新点赞状态和计数
     2. 评论动态 → 触发 `handleComment` 函数 → 打开评论界面
     3. 分享动态 → 触发 `handleShare` 函数 → 显示分享选项
     4. 点击图片 → 触发 `handleImagePreview` 函数 → 放大预览图片

4. **内容分类浏览**
   - 位置：`src/pages/ClubPage.js`
   - 逻辑流程：
     1. 点击不同的标签页 → 触发 `handleTabChange` 函数
     2. 更新 `activeTab` 状态 → 显示对应类型的内容
     3. 切换时显示加载状态 → 加载完成后展示内容

5. **社团关注功能**
   - 位置：`src/pages/ClubPage.js`
   - 逻辑流程：
     1. 点击关注按钮 → 触发 `handleFollow` 函数
     2. 更新 `followedClubs` 状态 → 切换关注状态
     3. 显示成功消息 → 关注按钮变为已关注状态

## 快速开始

1. 安装依赖:

```bash
npm install
npm install react-beautiful-dnd
```

2. 设置数据库:

在MySQL中创建名为`campuslife`的数据库，或者使用已有数据库并更新`.env`文件中的配置。

初始化数据库表结构:
```bash
node server/scripts/init-db.js
```

或者在MySQL客户端中直接执行SQL脚本:
```bash
mysql -u root -p < server/scripts/create-tables.sql
```

3. 配置环境变量:

复制`.env.example`文件为`.env`(如果尚未创建)，并设置您的数据库连接信息:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campuslife
```

4. 启动开发服务器:

```bash
# 同时启动前端和后端服务
npm run dev

# 或者分别启动
npm start        # 启动前端
npm run server   # 启动后端API服务
```

5. 构建生产版本:

```bash
npm run build
```

## Git保存项目方法

若要使用Git保存项目，请按照以下步骤操作：

1. 初始化Git仓库（若尚未初始化）：
```bash
git init
```

2. 添加所有文件到暂存区：
```bash
git add .
```

3. 提交更改并添加描述：
```bash
git commit -m "完成CampusLife社交平台基础功能开发"
```

4. 若要推送到远程仓库（比如GitHub），首先添加远程仓库：
```bash
git remote add origin <远程仓库URL>
```

5. 推送到远程仓库：
```bash
git push -u origin main
```

## 自定义配置

如需自定义主题色彩，请修改 `global.css` 文件中的 CSS 变量:

```css
:root {
  --primary-color: #1890ff;    /* 主色调 */
  --primary-color-hover: #40a9ff;  /* 主色调悬停色 */
  /* 其他自定义变量... */
}
```

1. 文件结构规范化
我创建了符合React最佳实践的项目结构：
/components：分离了通用组件
/pages：页面级组件
/assets/styles：样式文件集中管理
使用了英文文件名和组件名


## 后端实现

后端主要有以下几个控制器和路由：

1. **marketController.js** - 处理集市相关的API请求
   - `getProducts` - 获取商品列表，支持多种筛选条件和排序
   - `getProductDetail` - 获取商品详情
   - `getCategories` - 获取商品分类
   - `addProduct` - 发布新商品
   - `bargainProduct` - 处理用户对商品的议价请求

2. **marketRoutes.js** - 定义集市API路由
   - `GET /api/market/products` - 获取商品列表
   - `GET /api/market/products/:id` - 获取商品详情
   - `GET /api/market/categories` - 获取商品分类
   - `POST /api/market/products` - 发布商品（需要认证）
   - `POST /api/market/bargain` - 发起砍价（需要认证）

## 前端实现

前端主要有以下几个组件：

1. **MarketPage.js** - 集市主页面
   - 展示商品列表
   - 提供分类、价格区间、状态等多维度筛选
   - 支持排序和搜索
   - 集成发布商品功能

2. **ProductCard.js** - 商品卡片组件
   - 展示商品基本信息（图片、标题、价格等）
   - 显示折扣信息和商品状态
   - 提供收藏、联系卖家和议价按钮

3. **MarketCard.js** - 另一种风格的商品卡片组件
   - 支持网格和列表两种显示模式
   - 更丰富的商品信息展示

4. **BargainModal.js** - 砍价模态框组件
   - 显示商品信息
   - 提供价格滑块和文本输入
   - 支持砍价留言

## API接口

前端API接口定义在`api.js`中的`marketApi`对象：

```javascript
const marketApi = {
  // 获取商品列表
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.PRODUCTS}?${queryString}`);
  },
  
  // 获取商品详情
  getProductDetail: (productId) => {
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.PRODUCT_DETAIL.replace(':id', productId);
    return apiRequest(endpoint);
  },
  
  // 获取商品分类
  getCategories: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.CATEGORIES),
  
  // 发布商品
  addProduct: (productData) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.ADD_PRODUCT, 'POST', productData, getAuthHeaders()),
  
  // 砍价商品
  bargainProduct: (productId, price, message) => 
    apiRequest('/market/bargain', 'POST', { productId, price, message }, getAuthHeaders())
};
```

API端点配置在`constants.js`中：

```javascript
// 集市相关
MARKET: {
  PRODUCTS: '/market/products',
  PRODUCT_DETAIL: '/market/products/:id',
  CATEGORIES: '/market/categories',
  SEARCH: '/market/search',
  BARGAIN: '/market/bargain',
  ADD_PRODUCT: '/market/products'
}
```

## 功能特点

1. **商品浏览与筛选**：
   - 支持分类筛选
   - 价格区间筛选
   - 商品状态筛选（全新、几乎全新等）
   - 多种排序方式（最新、价格升序/降序、折扣力度）
   - 关键词搜索

2. **商品互动**：
   - 收藏商品
   - 查看商品详情
   - 评论商品
   - 分享商品

3. **商品交易**：
   - 直接购买
   - 砍价功能（支持砍价理由）
   - 联系卖家

4. **商品发布**：
   - 支持多图上传
   - 设置商品详细信息
   - 支持标记是否可议价

## 业务逻辑亮点

1. **砍价功能**：砍价模态框提供合理价格范围，并允许用户提供砍价理由，增加砍价成功率。

2. **折扣显示**：自动计算并显示商品折扣幅度，对有原价和现价的商品增加吸引力。

3. **分类统计**：分类选项卡显示每个分类下的商品数量，方便用户快速了解。

4. **视图切换**：支持网格视图和列表视图两种模式，满足不同用户的浏览习惯。

5. **商品图片处理**：支持多图上传和预览，增强商品展示效果。

## 新增商品详情页面实现

为了提升用户体验，我为校园集市模块增加了商品详情页面，用于展示商品的完整信息。

### 实现的文件

1. **src/pages/ProductDetailPage.js** - 商品详情页面组件
   - 展示商品详细信息，包括标题、价格、折扣、描述等
   - 显示商品多张图片和轮播图
   - 提供评论、收藏、砍价和购买功能
   - 展示卖家信息和联系方式
   - 显示相关商品推荐

2. **src/assets/styles/ProductDetailPage.css** - 商品详情页面样式
   - 响应式布局设计，适配不同屏幕尺寸
   - 优化图片展示和轮播效果
   - 深色模式支持

3. **修改src/App.js** - 添加新路由
   - 添加 `/market/product/:productId` 路由，指向 ProductDetailPage 组件

4. **修改src/components/market/ProductCard.js** - 添加跳转功能
   - 点击商品卡片跳转到商品详情页面
   - 优化点击体验，防止与卡片按钮点击冲突

5. **修改src/components/market/MarketCard.js** - 添加跳转功能
   - 点击集市卡片跳转到商品详情页面
   - 确保按钮事件不被卡片点击事件覆盖

### 功能特点

1. **详细商品展示**
   - 大图展示商品，支持多图轮播
   - 缩略图导航，点击切换主图
   - 折扣标签和价格对比

2. **卖家信息展示**
   - 卖家头像和昵称
   - 评分和评价数量
   - 联系卖家按钮

3. **商品操作**
   - 收藏/取消收藏
   - 查看评论
   - 砍价操作（条件为商品可议价）
   - 购买按钮

4. **商品详情分类展示**
   - 详细描述和参数展示
   - 买家须知，提供购买和交易指南
   - 规格和状态标签展示

5. **相关推荐**
   - 基于同类别展示相关商品
   - 排除当前正在查看的商品

6. **用户体验优化**
   - 加载状态显示骨架屏
   - 错误处理和提示信息
   - 返回按钮，方便返回商品列表

### 使用的API接口

该页面使用了以下API接口：
- `marketApi.getProductDetail(productId)` - 获取商品详情
- `marketApi.getProducts({ category })` - 获取相关商品推荐
- `marketApi.likeProduct(productId)` - 收藏商品
- `marketApi.unlikeProduct(productId)` - 取消收藏
- `marketApi.bargainProduct(productId, price, message)` - 发起砍价

通过这个商品详情页面的实现，用户可以更加全面地了解商品信息，提高购买决策的准确性，同时也增强了平台的专业性和用户体验。

## 商品发布功能详细实现

### 实现的文件

1. **新增 src/components/market/AddProductModal.js** - 商品发布模态框组件
   - 提供完整的商品信息表单
   - 支持多图片上传及预览
   - 实现商品标签添加与删除
   - 提供表单验证和错误提示

2. **新增 src/assets/styles/AddProductModal.css** - 商品发布模态框样式
   - 响应式布局设计
   - 图片上传区域样式优化
   - 适配深色模式

3. **修改 src/pages/MarketPage.js** - 集成商品发布功能
   - 添加发布商品按钮
   - 集成发布商品模态框
   - 优化表单数据提交流程

4. **修改 server/routes/market/marketRoutes.js** - 添加图片上传处理
   - 配置 multer 中间件处理文件上传
   - 设置图片存储路径和文件命名
   - 实现文件类型和大小验证

5. **修改 server/controllers/market/marketController.js** - 增强后端处理逻辑
   - 使用事务确保数据一致性
   - 处理上传的图片文件
   - 添加商品标签处理
   - 优化错误处理

6. **新增数据库表结构 product_tags** - 存储商品标签
   - 支持多标签关联
   - 通过外键约束确保数据完整性

### 功能特点

4. **商品发布**：
   - **多图上传**：支持一次上传最多5张商品图片，第一张自动设为封面
   - **实时预览**：上传图片可以实时预览，点击可查看大图
   - **标签系统**：可添加多个标签，方便买家搜索和分类
   - **价格设置**：支持设置当前价格和原价，自动计算折扣
   - **详细信息**：包括商品标题、描述、分类、成色、交易地点等
   - **可议价选项**：卖家可设置商品是否支持议价
   - **表单验证**：全面的表单验证确保必要信息填写完整
   - **图片验证**：限制只能上传图片类型文件，且大小不超过5MB
   - **响应式界面**：适配不同屏幕尺寸，在移动设备上也有良好体验
   - **多入口访问**：在页面顶部、搜索栏和空状态页面均提供发布按钮

### 技术亮点

1. **前后端分离架构**：
   - 前端使用React组件化开发，实现数据与UI的解耦
   - 后端提供RESTful API，处理数据验证、存储和业务逻辑

2. **图片上传优化**：
   - 使用multer中间件处理多文件上传
   - 自动生成唯一文件名避免冲突
   - 验证文件类型和大小，提高安全性

3. **数据安全性**：
   - 使用数据库事务确保数据一致性
   - 严格的后端验证防止无效数据
   - 错误回滚机制，避免部分操作成功造成数据不一致

4. **用户体验优化**：
   - 表单字段验证即时反馈
   - 上传进度显示
   - 操作结果明确提示
   - 针对深色模式的UI适配

通过这一功能的实现，大大丰富了校园集市模块的功能完整性，用户可以方便地发布闲置物品，设置详细信息和图片，使平台上的商品信息更加丰富和直观。

# 悬赏任务模块实现总结

## 任务详情页功能实现

为了提升用户体验和增强悬赏任务功能的完整性，我们新增了任务详情页面，用于展示任务的详细信息。

### 主要功能

1. **任务详细信息展示**
   - 展示任务标题、描述、赏金、分类、难度等核心信息
   - 显示截止时间、预计耗时、任务地点等辅助信息
   - 清晰呈现任务进度和申请人数

2. **发布者信息展示**
   - 显示发布者头像、名称
   - 提供查看发布者资料和联系发布者的入口

3. **任务申请功能**
   - 用户可直接在详情页申请接受任务
   - 提供申请留言功能

4. **相关任务推荐**
   - 根据当前任务的类别和难度推荐相似任务
   - 提高用户发现更多任务的机会

### 实现文件

1. **src/pages/MissionDetailPage.js** - 任务详情页面组件
   - 实现任务详情的获取和展示
   - 处理任务申请逻辑
   - 包含Loading和错误状态处理

2. **src/assets/styles/MissionDetailPage.css** - 样式文件
   - 定义详情页布局和样式
   - 实现响应式设计和深色模式
   - 优化用户交互体验

3. **src/App.js** - 路由配置
   - 添加`/missions/:id`路由指向任务详情页

4. **src/components/mission/MissionCard.js** - 修改卡片组件
   - 添加点击卡片跳转到详情页的功能
   - 保留原有的直接接受任务按钮功能

### 技术实现

1. **数据获取和展示**
   - 使用React Hooks管理组件状态和副作用
   - 通过`missionApi.getMissionDetail()`获取任务详情
   - 使用条件渲染实现Loading和错误状态展示

2. **用户交互**
   - 使用Ant Design组件库构建用户界面
   - 实现面包屑导航和"返回"按钮提升用户体验
   - 使用模态框实现任务申请功能

3. **样式和交互**
   - 响应式设计，适配不同设备屏幕
   - 精美的卡片布局和信息展示
   - 深色模式支持，提升夜间使用体验
   - 使用CSS过渡和动画提升用户体验

4. **集成与导航**
   - 使用React Router实现页面导航
   - 任务卡片与详情页的无缝集成
   - 通过ID参数实现数据一致性

### 优化点

1. **性能优化**
   - 避免不必要的渲染
   - 使用懒加载优化图片加载

2. **用户体验**
   - 友好的错误提示
   - 状态反馈（加载中、成功、失败）
   - 截止时间临近的紧急任务特殊标记

3. **可维护性**
   - 组件化设计，职责分离
   - 状态管理清晰
   - 代码注释和文档



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

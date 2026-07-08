前端开发
以下是针对 **React技术栈** 的详细前端开发任务清单，包含可直用于 Cursor 的提示词和开发策略：

---

### **React前端开发任务清单**

---

#### **任务一：项目初始化与配置**
| 子任务               | Cursor提示词示例                                   | 技术实现                            | 输出产物                 |
| ----------------- | --------------------------------------------- | ------------------------------- | -------------------- |
| **1.1 创建React项目** | `Create a React TypeScript project with Vite` | `npm create vite@latest` + TS模板 | `package.json`       |
| **1.2 状态管理配置**    | `Setup Redux Toolkit with auth slice`         | Redux Toolkit + RTK Query       | `store/authSlice.ts` |
| **1.3 路由系统配置**    | `Implement React Router v6 with lazy loading` | `react-router-dom` + Suspense   | `router.tsx`         |
| **1.4 UI组件库集成**   | `Install and configure Ant Design v5`         | Ant Design + 自定义主题              | `antd-theme.json`    |

```bash
# Cursor可直接执行的命令
npm create vite@latest campus-react --template react-ts
npm install @reduxjs/toolkit react-redux @ant-design/icons axios
```

---

#### **任务二：核心页面开发**
##### **2.1 登录认证模块**
| 子任务 | Cursor提示词示例 | 技术实现 | 输出产物 |
|--------|----------------|----------|----------|
| **2.1.1 微信登录组件** | `Create WeChat OAuth2 login button component` | 微信开放平台JS SDK | `WechatLogin.tsx` |
| **2.1.2 学校LDAP登录** | `Build LDAP login form with Formik validation` | Formik + Yup校验规则 | `LoginForm.tsx` |
| **2.1.3 登录状态同步** | `Persist Redux state with localStorage` | redux-persist集成 | `store/persistConfig.ts` |

```tsx
// Cursor提示词：Create a login page layout with Ant Design
import { Button, Form, Input } from 'antd';

const LoginPage = () => {
  return (
    <div className="login-container">
      <Form onFinish={(values) => console.log(values)}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <Input placeholder="学号/工号" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="密码" />
        </Form.Item>
        <Button type="primary" htmlType="submit">登录</Button>
      </Form>
    </div>
  );
};
```

##### **2.2 校园互助模块**
| 子任务 | Cursor提示词示例 | 技术实现 | 输出产物 |
|--------|----------------|----------|----------|
| **2.2.1 任务发布表单** | `Create task publish form with map location picker` | 高德地图API + Antd Form | `TaskPublish.tsx` |
| **2.2.2 任务卡片列表** | `Implement virtualized task list with react-window` | react-window性能优化 | `TaskList.tsx` |
| **2.2.3 保证金支付** | `Integrate Alipay H5 payment SDK` | 支付宝沙箱环境 | `PaymentModal.tsx` |

```tsx
// Cursor提示词：Generate a task card component with hover effect
const TaskCard = ({ title, reward }: { title: string; reward: number }) => {
  return (
    <div className="task-card">
      <h3>{title}</h3>
      <div className="reward">赏金：¥{reward.toFixed(2)}</div>
      <Button type="primary">立即接单</Button>
    </div>
  );
};
```

---

#### **任务三：实时通信模块**
| 子任务 | Cursor提示词示例 | 技术实现 | 输出产物 |
|--------|----------------|----------|----------|
| **3.1 WebSocket连接** | `Setup socket.io-client with JWT auth` | socket.io-client + 自动重连 | `socket.ts` |
| **3.2 聊天界面** | `Create chat UI with message bubbles` | 虚拟滚动 + 时间格式化 | `ChatWindow.tsx` |
| **3.3 消息通知** | `Implement real-time notifications with useWebSocket` | WebSocket Hooks封装 | `useChat.ts` |

```tsx
// Cursor提示词：Create a chat message component with user avatar
const ChatMessage = ({ message, isMe }: ChatMessageProps) => (
  <div className={`message ${isMe ? 'me' : ''}`}>
    <Avatar src={message.user.avatar} />
    <div className="content">
      <div className="username">{message.user.name}</div>
      <div className="text">{message.content}</div>
    </div>
  </div>
);
```

---

#### **任务四：性能优化**
| 子任务 | Cursor提示词示例 | 技术实现 | 输出产物 |
|--------|----------------|----------|----------|
| **4.1 代码分割** | `Implement dynamic imports for routes` | React.lazy + Suspense | `router.tsx` |
| **4.2 图片优化** | `Generate image placeholder with lqip-modern` | 图片懒加载 + 模糊占位 | `ImageLoader.tsx` |
| **4.3 渲染优化** | `Memoize components with React.memo` | 性能分析工具（React Profiler） | `TaskList.tsx` |

```tsx
// Cursor提示词：Optimize form performance with useMemo
const MemoizedForm = React.memo(() => (
  <Form>
    {/* 复杂表单内容 */}
  </Form>
));
```

---

### **UI设计参考方案**
#### 1. 设计系统
- **Ant Design Pro**：https://pro.ant.design/zh-CN
- **Arco Design**：https://arco.design/react/docs/start
- **校园风格配色**：
  ```less
  @primary-color: #1890ff;   // 主蓝
  @success-color: #52c41a;   // 辅助绿
  @warning-color: #faad14;   // 警示黄
  ```

#### 2. 页面布局参考
| 模块         | 参考案例                                  | 核心交互点                   |
|--------------|-----------------------------------------|----------------------------|
| 任务发布页   | 闲鱼APP发布页                           | 地图位置选择 + 赏金滑块     |
| 二手商品详情 | 淘宝商品页                              | 图片轮播 + 担保交易提示     |
| 校园论坛     | Reddit帖子列表                          | 嵌套评论 + 投票排序         |

---

### **Cursor高效开发技巧**
#### 1. **快速生成模板**
```bash
# 在空文件中输入：
// 提示词：Generate a React functional component with TypeScript and Ant Design
# Cursor会自动生成带TS类型和Antd组件的模板
```

#### 2. **问题调试**
```bash
# 选中报错代码后按 Cmd+K 输入：
// 问题：Redux state not updating after login
# Cursor会检查并建议：
- 确保使用`configureStore`
- 检查reducer是否正确合并
```

#### 3. **代码优化**
```bash
# 选中复杂逻辑后按 Cmd+L 输入：
// 提示词：Convert class component to functional with hooks
# Cursor自动转换类组件到函数式组件
```

---

### **开发进度跟踪模板**
```markdown
## React前端开发日报
**日期**：2024-03-20  
**今日进展**：
- [x] 登录模块Redux状态集成
- [ ] 聊天室WebSocket连接稳定性

**问题记录**：
1. Ant Design Form校验规则冲突（已解决）
2. 地图组件在移动端偏移（待优化）

**明日计划**：
1. 实现任务卡片虚拟滚动
2. 对接微信支付SDK
```

---

### **下一步建议**
1. **Mock数据先行**：使用`msw`模拟API接口
   ```ts
   // 提示词：Setup mock API for task list
   rest.get('/api/tasks', (req, res, ctx) => {
     return res(ctx.json([...]))
   })
   ```
2. **组件驱动开发**：从原子组件（Button/Input）开始逐步组装
3. **自动化测试**：配置Vitest + React Testing Library

需要我提供具体模块（如支付流程）的完整代码示例吗？ 💻

### **一、核心业务需求确认**
#### 1. 校园互助模块
- **用户故事**：  
  "作为学生，我可以发布一个需要帮助的任务（如代取快递），设置悬赏金额，并看到其他同学接单。"

- **功能清单**：  
  - 发布任务：标题、描述、悬赏金额（微信/支付宝支付担保）、截止时间、分类标签（跑腿/学习/娱乐）  
  - 接单流程：接单者需缴纳保证金（防恶意取消） → 完成任务 → 双方互评 → 自动放款  
  - **关键问题**：  
    - 是否需要平台抽成？建议**免抽成**（提高活跃度）  
    - 敏感任务过滤：通过关键词（如“代考”）自动拦截  

#### 2. 二手交易模块
- **用户故事**：  
  "作为毕业生，我可以上传旧教材信息，设定价格，并与买家在线沟通交易细节。"

- **功能清单**：  
  - 商品发布：多图上传、价格（固定/可议价）、新旧程度、自提/邮寄选项  
  - 交易保障：  
    - 平台担保交易（买家付款至中间账户 → 确认收货后放款）  
    - 举报机制（虚假描述/欺诈）  
  - **关键问题**：  
    - 是否支持物流跟踪？建议**仅限校内自提**（降低复杂度）  

#### 3. 资料分享模块
- **用户故事**：  
  "作为学霸，我可以上传整理的《高等数学》复习笔记，设置下载价格，并获得收益。"

- **功能清单**：  
  - 资料上传：PDF/Word格式、预览页生成、定价（平台建议区间：1-10元）  
  - 版权声明：用户需承诺原创或已获授权  
  - **关键问题**：  
    - 资料去重：通过MD5文件哈希值检测重复内容  

#### 4. 校园论坛模块
- **用户故事**：  
  "作为社团负责人，我可以创建‘摄影协会’板块，发布活动通知，并管理成员发言。"

- **功能清单**：  
  - 版块创建：需管理员审核（防重复/敏感主题）  
  - 内容互动：发帖、评论、点赞、转发. 推荐(需要货币)@通知  
  - 权限分级：版主可删帖/禁言，普通用户仅限自身内容编辑  



# CampusLife 系统启动指南

本指南详细说明了如何启动 CampusLife 系统的各个组件。

## 端口配置

系统使用以下端口：

| 服务 | 端口 | 说明 |
|-----|-----|-----|
| 客户端前端 | 3000 | React前端应用 |
| 客户端API | 5001 | 客户端数据API服务 |
| 管理后台前端 | 3001 | 管理后台React应用 |
| 管理后台API | 8080 | 管理后台API服务 |

## 第一步：配置环境变量

1. 在`server/.env`文件中配置客户端API服务器环境变量：
   ```
   # 数据库配置
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=你的MySQL密码
   DB_NAME=campuslife
   ```

2. 在`admin-server/.env`文件中配置管理后台API服务器环境变量：
   ```
   # 数据库配置
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=123456
   DB_NAME=campuslife
   ```

## 第二步：初始化数据库

1. 创建并初始化数据库：
   ```bash
   cd server
   npm run init-db
   ```

2. 导入模拟数据：
   ```bash
   npm run import-data
   ```

## 第三步：启动服务

1. 启动客户端API服务器：
   ```bash
   cd server
   npm run dev
   ```

2. 启动管理后台API服务器：
   ```bash
   cd admin-server
   npm run dev
   ```

3. 启动前端应用：
   ```bash
   npm start
   ```

## 第四步：访问应用

- 客户端前端：http://localhost:3000
- 客户端API：http://localhost:5001/api
- 管理后台前端：http://localhost:3001
- 管理后台API：http://localhost:8080/api

## 可能遇到的问题及解决方案

1. **数据库连接错误**：
   - 检查MySQL服务是否启动
   - 确认`.env`文件中的数据库用户名和密码正确
   - 确认数据库用户有正确的权限

2. **端口冲突**：
   - 如果遇到端口冲突，可以在`server/config/ports.js`中修改端口配置
   - 修改后需要更新所有相关服务的配置

3. **模块未找到错误**：
   - 运行`npm install`安装所有依赖
   - 检查`package.json`文件是否包含所有必要的依赖

## 调试技巧

- 客户端API服务器日志：查看控制台输出
- 数据库查询：使用管理后台的SQL查询功能
- 前端React组件：使用React开发者工具 
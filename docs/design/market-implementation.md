# 校园集市模块实现总结

## 数据库结构

校园集市主要使用以下数据库表：

1. **products表** - 存储商品基本信息
   ```sql
   CREATE TABLE products (
       product_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       user_id BIGINT UNSIGNED NOT NULL,
       title VARCHAR(100) NOT NULL,
       description TEXT,
       price DECIMAL(10,2) NOT NULL,
       original_price DECIMAL(10,2),
       category VARCHAR(50) NOT NULL,
       condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL,
       location VARCHAR(100),
       is_negotiable BOOLEAN DEFAULT FALSE,
       is_sold BOOLEAN DEFAULT FALSE,
       view_count INT UNSIGNED DEFAULT 0,
       status ENUM('active', 'reserved', 'sold', 'expired', 'deleted') DEFAULT 'active',
       expired_at DATETIME,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
   )
   ```

2. **product_images表** - 存储商品图片
   ```sql
   CREATE TABLE product_images (
       image_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       product_id BIGINT UNSIGNED NOT NULL,
       image_url VARCHAR(255) NOT NULL,
       display_order TINYINT UNSIGNED DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
   )
   ```

3. **likes表** - 存储用户对商品的收藏（与其他内容类型共用）
   ```sql
   CREATE TABLE likes (
       like_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       content_type ENUM('post', 'comment', 'product', 'mission', 'activity') NOT NULL,
       content_id BIGINT UNSIGNED NOT NULL,
       user_id BIGINT UNSIGNED NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE KEY unique_like (user_id, content_type, content_id),
       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
   )
   ```

4. **comments表** - 存储用户对商品的评论（与其他内容类型共用）
   ```sql
   CREATE TABLE comments (
       comment_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       content_type ENUM('post', 'product', 'mission', 'activity') NOT NULL,
       content_id BIGINT UNSIGNED NOT NULL,
       user_id BIGINT UNSIGNED NOT NULL,
       parent_id BIGINT UNSIGNED,
       content TEXT NOT NULL,
       like_count INT UNSIGNED DEFAULT 0,
       status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
       FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE SET NULL
   )
   ```

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
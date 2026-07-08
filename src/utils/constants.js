/**
 * 前端常量配置文件
 * 
 * 包含API端点和端口设置
 */

// API端点和端口配置
export const API_CONFIG = {
  // 客户端API
  CLIENT_API: {
    BASE_URL: 'http://localhost:5001/api',
    ENDPOINTS: {
      // 首页相关
      HOME: {
        HOT_TOPICS: '/home/hot-topics',
        POSTS: '/home/posts',
        POST_DETAIL: '/home/posts/:id',
        CAROUSEL: '/home/carousel',
        RECOMMENDED_USERS: '/home/recommended-users',
        LIKE_POST: '/home/posts/like',
        COMMENTS: '/home/comments',
        LIKE_COMMENT: '/home/comments/like',
        ADD_POST: '/home/posts'
      },
      // 用户相关
      USER: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',
        PROFILE: '/users/profile',
        UPDATE: '/users/update'
      },
      // 集市相关
      MARKET: {
        PRODUCTS: '/market/products',
        PRODUCT_DETAIL: '/market/products/:id',
        CATEGORIES: '/market/categories',
        SEARCH: '/market/search',
        BARGAIN: '/market/bargain',
        ADD_PRODUCT: '/market/products'
      },
      // 悬赏任务相关
      MISSION: {
        MISSIONS: '/mission/missions',
        MISSION_DETAIL: '/mission/missions/:id',
        CATEGORIES: '/mission/categories',
        TAKE_MISSION: '/mission/take',
        ADD_MISSION: '/mission/missions',
        APPLICATIONS: '/mission/applications/:missionId',
        HANDLE_APPLICATION: '/mission/applications/:takeId',
        COMPLETE_MISSION: '/mission/complete/:missionId',
        CONFIRM_MISSION: '/mission/confirm/:missionId'
      },
      // 通知相关
      NOTIFICATION: {
        GET_NOTIFICATIONS: '/notifications',
        MARK_AS_READ: '/notifications/read',
        MARK_ALL_AS_READ: '/notifications/read-all'
      },
      // 系统相关
      SYSTEM: {
        HEALTH_CHECK: '/health/check'
      },
      // 订单相关 (新增)
      ORDER: {
        CREATE: '/orders',
        GET_MY_ORDERS: '/orders/my',
        GET_ORDER_BY_ID: '/orders/:id', // :id 将被替换为实际订单ID
        CONFIRM_MOCK_PAYMENT: '/orders/:orderId/confirm-mock-payment',
        MARK_AS_SHIPPED: '/orders/:orderId/ship', // 新增：标记为已发货
      }
    }
  },
  
  // 管理后台API
  ADMIN_API: {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/auth/login',
        PROFILE: '/auth/me'
      },
      DB: {
        TABLES: '/db/tables',
        TABLE_STRUCTURE: '/db/tables/:tableName/structure',
        TABLE_DATA: '/db/tables/:tableName/data',
        QUERY: '/db/query'
      }
    }
  }
}; 
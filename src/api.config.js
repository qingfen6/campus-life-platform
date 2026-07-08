/**
 * 全局API配置文件
 * 
 * 该文件用于配置前端应用中使用的各种API端点
 */

const API_CONFIG = {
  // API基础URL
  BASE_URL: 'http://localhost:5001/api',
  
  // 首页API端点
  HOME: {
    HOT_TOPICS: '/home/hot-topics',
    POSTS: '/home/posts',
    CAROUSEL: '/home/carousel',
    RECOMMENDED_USERS: '/home/recommended-users',
    LIKE_POST: '/home/like-post'
  },
  
  // 用户API端点
  USER: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    PROFILE: '/users/profile',
    UPDATE: '/users/update'
  }
};

export default API_CONFIG; 
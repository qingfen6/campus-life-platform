// API 服务
// 用于与后端API交互
import axios from 'axios';
import { getToken } from '../utils/auth';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端API地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在请求发送前添加认证令牌
    const token = getToken();
    console.log(`请求拦截器 - 请求地址: ${config.url}`);
    console.log(`请求拦截器 - 获取到的令牌: ${token ? '已获取' : '未获取'}`);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`请求拦截器 - 已添加Authorization头: Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('请求拦截器 - 未找到令牌，无法添加Authorization头');
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    console.log(`响应拦截器 - 请求成功: ${response.config.url}`);
    return response.data;
  },
  (error) => {
    let message = '服务器错误，请稍后重试';
    console.error(`响应拦截器 - 请求失败: ${error.config?.url || '未知URL'}`);

    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      console.error(`响应拦截器 - 状态码: ${status}`);
      
      switch (status) {
        case 401:
          message = '未授权，请重新登录';
          console.error('响应拦截器 - 认证失败，可能需要重新登录');
          // 可以在这里处理自动登出
          // logout();
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器错误';
          break;
        default:
          message = data.message || '未知错误';
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      message = '网络错误，无法连接服务器';
    } else {
      // 请求设置有误
      message = error.message;
    }

    // 返回统一格式的错误
    return Promise.reject({
      success: false,
      message,
      error
    });
  }
);

// 认证相关API
export const authAPI = {
  // 超级管理员登录 (使用 /auth/login)
  login: (credentials) => {
    console.log('调用超级管理员登录 API: /auth/login');
    return api.post('/auth/login', credentials);
  },
  
  // 【新增】学校管理员登录 (使用 /school-admin/auth/login)
  schoolAdminLogin: (credentials) => {
    console.log('调用学校管理员登录 API: /school-admin/auth/login');
    // 注意：URL路径 '/school-admin/auth/login' 需要与后端路由匹配
    return api.post('/school-admin/auth/login', credentials);
  },

  // 获取当前登录用户信息 (可能也需要区分管理员类型，暂时不变)
  getProfile: () => {
    return api.get('/auth/me');
  }
};

// 数据库查询相关API
export const dbAPI = {
  // 获取表名列表
  getTables: () => {
    return api.get('/db/tables');
  },
  
  // 获取表结构
  getTableStructure: (tableName) => {
    return api.get(`/db/tables/${tableName}/structure`);
  },
  
  // 获取表数据
  getTableData: (tableName, params) => {
    return api.get(`/db/tables/${tableName}/data`, { params });
  },
  
  // 执行自定义SQL查询
  executeQuery: (sql) => {
    return api.post('/db/query', { sql });
  },
  
  // 插入数据行
  insertRow: (tableName, data) => {
    console.log('调用API插入数据:', data);
    // 根据API接口要求确定是否需要加一层data包装
    return api.post(`/db/tables/${tableName}/row`, data);
  },
  
  // 更新数据行
  updateRow: (tableName, primaryKey, primaryValue, data) => {
    return api.put(`/db/tables/${tableName}/row`, { primaryKey, primaryValue, data });
  },
  
  // 删除数据行
  deleteRow: (tableName, primaryKey, primaryValue) => {
    return api.delete(`/db/tables/${tableName}/row`, { 
      data: { primaryKey, primaryValue } 
    });
  }
};

const ADMIN_API_PREFIX = '/admin'; // 假设后端 express app 使用 /api/admin 作为这些路由的前缀

/**
 * 获取用户列表
 * @param {object} params - 查询参数 (page, limit, search, school_id, user_status)
 * @returns {Promise<object>} - 包含用户数据和分页信息的对象
 */
export const getUsers = async (params = {}) => {
  // const queryParams = new URLSearchParams(params).toString();
  // return api.get(`${ADMIN_API_PREFIX}/users?${queryParams}`);
  return api.get(`${ADMIN_API_PREFIX}/users`, { params }); // axios 会自动处理 params 对象为 query string
};

/**
 * 根据ID获取用户详情
 * @param {string|number} userId - 用户ID
 * @returns {Promise<object>} - 用户详情数据
 */
export const getUserDetails = async (userId) => {
  return api.get(`${ADMIN_API_PREFIX}/users/${userId}`);
};

/**
 * 更新用户信息
 * @param {string|number} userId - 用户ID
 * @param {object} userData - 需要更新的用户数据
 * @returns {Promise<object>} - 更新后的用户数据
 */
export const updateUser = async (userId, userData) => {
  return api.put(`${ADMIN_API_PREFIX}/users/${userId}`, userData);
};

// 学校管理相关API
export const getSchools = async (params) => {
  return api.get(`${ADMIN_API_PREFIX}/schools`, { params });
};

export const createSchool = async (data) => {
  return api.post(`${ADMIN_API_PREFIX}/schools`, data);
};

export const updateSchool = async (id, data) => {
  return api.put(`${ADMIN_API_PREFIX}/schools/${id}`, data);
};

export const deleteSchool = async (id) => {
  return api.delete(`${ADMIN_API_PREFIX}/schools/${id}`);
};

// 学校管理员相关 API
export const schoolAdminAPI = {
  getSchoolUsers: (params) => api.get('/school-admin/users', { params }),
  getFacultiesBySchool: (schoolId) => api.get('/school-admin/faculties'),
  getSchoolPosts: (params) => api.get('/school-admin/posts', { params }),
  updatePostStatus: (postId, status) => api.put(`/school-admin/posts/${postId}/status`, { status }),
  updateUserStatus: (userId, status) => api.put(`/school-admin/users/${userId}/status`, { status }),
  // 悬赏管理API
  getSchoolMissions: (params) => api.get('/school-admin/missions', { params }),
  updateMissionStatus: (missionId, status) => api.put(`/school-admin/missions/${missionId}/status`, { status }),
  // 新增商品管理API
  getSchoolProducts: (params) => api.get('/school-admin/products', { params }),
  updateProductStatus: (productId, status) => api.put(`/school-admin/products/${productId}/status`, { status }),
  // getUserDetails: (userId) => api.get(`/school-admin/users/${userId}`), // 保持注释或按需实现
  // 新增学校公告管理API
  getSchoolAnnouncements: (params) => api.get('/school-admin/announcements', { params }),
  createSchoolAnnouncement: (data) => api.post('/school-admin/announcements', data),
  getSchoolAnnouncementDetails: (id) => api.get(`/school-admin/announcements/${id}`),
  updateSchoolAnnouncement: (id, data) => api.put(`/school-admin/announcements/${id}`, data),
  deleteSchoolAnnouncement: (id) => api.delete(`/school-admin/announcements/${id}`),
};

export default api;
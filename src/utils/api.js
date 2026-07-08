// API工具函数 - 用于前端与后端通信
import { API_CONFIG } from './constants';
import axios from 'axios';

const API_BASE_URL = API_CONFIG.CLIENT_API.BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * 执行API请求
 * @param {string} endpoint - API端点
 * @param {string} method - 请求方法(GET, POST, PUT, DELETE)
 * @param {object} data - 请求数据
 * @param {object} headers - 自定义请求头
 * @returns {Promise<any>} 响应数据
 */
async function apiRequest(endpoint, method = 'GET', data = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`发送API请求: ${method} ${url}`);
  if (data) {
    console.log('请求数据:', JSON.stringify(data).substring(0, 200));
  }
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    console.log(`收到响应: ${url}, 状态: ${response.status}`);
    
    // 检查内容类型是否为JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      console.log(`响应数据: ${JSON.stringify(responseData).substring(0, 200)}`);
      
      if (!response.ok) {
        console.error(`请求失败: ${url}, 状态码: ${response.status}, 错误:`, responseData);
        throw new Error(responseData.message || `请求失败，状态码: ${response.status}`);
      }
      
      return responseData;
    } else {
      // 非JSON响应处理
      const textData = await response.text();
      console.warn('收到非JSON响应:', textData.substring(0, 200));
      
      if (!response.ok) {
        console.error(`请求失败: ${url}, 状态码: ${response.status}, 响应:`, textData.substring(0, 200));
        throw new Error(`请求失败，状态码: ${response.status}`);
      }
      
      // 尝试将文本作为JSON解析
      try {
        return JSON.parse(textData);
      } catch (e) {
        // 如果不是JSON，则返回文本
        console.error('响应不是有效的JSON:', e);
        return { success: false, message: '服务器返回了非JSON数据' };
      }
    }
  } catch (error) {
    console.error(`API请求失败: ${url}`, error);
    throw error;
  }
}

/**
 * 处理FormData请求（用于文件上传）
 * @param {string} endpoint - API端点
 * @param {string} method - 请求方法(POST, PUT)
 * @param {FormData} formData - FormData对象
 * @param {object} headers - 自定义请求头
 * @returns {Promise<any>} 响应数据
 */
async function apiFormDataRequest(endpoint, method = 'POST', formData = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`FormData请求开始: ${method} ${url}`);
    
    // 调试信息: 记录FormData内容
    if (formData) {
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`- ${key}: 文件类型 ${value.type}, 大小: ${value.size}字节, 名称: ${value.name}`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      }
    }
    
    // 使用axios发送FormData
    const response = await axios({
      method,
      url,
      data: formData,
      headers: {
        ...headers,
        // 不设置Content-Type，让axios自动设置为multipart/form-data和正确的boundary
      }
    });
    
    console.log(`FormData请求成功: ${method} ${url}`, response.status);
    return response.data;
  } catch (error) {
    console.error('FormData API请求失败:', error);
    console.error('请求URL:', url);
    console.error('请求方法:', method);
    
    if (error.response) {
      // 服务器返回了错误响应
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('没有收到响应，请求实例:', error.request);
    } else {
      // 请求配置出错
      console.error('请求配置时出错:', error.message);
    }
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '请求失败');
    }
    throw error;
  }
}

// 添加认证令牌到请求头
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 用户API
const userApi = {
  // 登录
  login: (userData) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.LOGIN, 'POST', userData),
  
  // 注册
  createUser: (userData) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.REGISTER, 'POST', userData),
  
  // 获取用户信息
  getProfile: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.PROFILE, 'GET', null, getAuthHeaders()),
  
  // 更新用户信息 - 使用FormData请求用于头像上传
  updateProfile: (userData) => {
    // 检查userData是否为FormData类型
    if(userData instanceof FormData) {
      return apiFormDataRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.UPDATE, 'PUT', userData, getAuthHeaders());
    } else {
      return apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.UPDATE, 'PUT', userData, getAuthHeaders());
    }
  },
  
  // 检查认证状态
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      await apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.USER.PROFILE, 'GET', null, getAuthHeaders());
      return true;
    } catch (error) {
      // 认证失败，清除令牌
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },
  
  // 注销
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  }
};

// 首页API
const homeApi = {
  // 获取热门话题
  getHotTopics: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.HOT_TOPICS),
  
  // 获取动态内容
  getPosts: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.HOME.POSTS}?${queryString}`);
  },
  
  // 获取轮播内容
  getCarousel: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.CAROUSEL),
  
  // 获取推荐用户
  getRecommendedUsers: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.RECOMMENDED_USERS),
  
  // 点赞内容
  likePost: (postId) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.LIKE_POST, 'POST', { postId }, getAuthHeaders()),
  
  // 获取帖子评论
  getPostComments: (postId) => apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.HOME.COMMENTS}/${postId}`),
  
  // 添加评论
  addPostComment: (postId, content, parentId = null) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.COMMENTS, 'POST', { postId, content, parentId }, getAuthHeaders()),
  
  // 点赞评论
  likeComment: (commentId) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.LIKE_COMMENT, 'POST', { commentId }, getAuthHeaders()),
  
  // 发布动态
  addPost: (postData) => {
    // 检查postData是否为FormData类型（包含媒体文件）
    if(postData instanceof FormData) {
      return apiFormDataRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.ADD_POST, 'POST', postData, getAuthHeaders());
    } else {
      return apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.HOME.ADD_POST, 'POST', postData, getAuthHeaders());
    }
  },
  
  // 获取单个动态详情
  getPostDetail: (postId) => apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.HOME.POST_DETAIL.replace(':id', postId)}`),
  
  // 新增：获取我的动态
  getMyPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/posts/my?${queryString}`, 'GET', null, getAuthHeaders());
  },
};

// 集市API
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
  
  // 搜索商品
  searchProducts: (keyword, params = {}) => {
    const queryParams = { ...params, keyword };
    const queryString = new URLSearchParams(queryParams).toString();
    return apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.SEARCH}?${queryString}`);
  },
  
  // 发起砍价
  bargain: (productId, price) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.BARGAIN, 'POST', { productId, price }, getAuthHeaders()),
  
  // 发布商品 - 使用FormData请求
  addProduct: (productData) => apiFormDataRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MARKET.ADD_PRODUCT, 'POST', productData, getAuthHeaders()),
  
  // 收藏商品
  likeProduct: (productId) => apiRequest('/market/like', 'POST', { productId }, getAuthHeaders()),
  
  // 取消收藏商品
  unlikeProduct: (productId) => apiRequest('/market/unlike', 'POST', { productId }, getAuthHeaders()),
  
  // 砍价商品（新版，带留言）
  bargainProduct: (productId, price, message) => 
    apiRequest('/market/bargain', 'POST', { productId, price, message }, getAuthHeaders()),
  
  // 新增：获取我发布的商品
  getMyProducts: (params = {}) => {
    let queryString = new URLSearchParams(params).toString();
    if (queryString) { // 只有当 queryString 不为空时才添加 '?'
        queryString = '?' + queryString;
    }
    // 注意这里我改成了 /market/products/my，请与后端路由保持一致
    // 如果后端是 /market/my/products，则这里也应该是 /market/my/products
    return apiRequest(`/market/my/products${queryString}`, 'GET', null, getAuthHeaders());
  },
};

// 悬赏任务API
const missionApi = {
  // 获取任务列表
  getMissions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.MISSIONS}?${queryString}`);
  },
  
  // 获取任务详情
  getMissionDetail: (missionId) => {
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.MISSION_DETAIL.replace(':id', missionId);
    return apiRequest(endpoint);
  },
  
  // 获取任务分类
  getCategories: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.CATEGORIES),
  
  // 接任务
  takeMission: (missionId, message) => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.TAKE_MISSION, 'POST', { missionId, message }, getAuthHeaders()),
  
  // 发布任务
  addMission: (missionData) => {
    // 检查missionData是否为FormData类型
    if(missionData instanceof FormData) {
      return apiFormDataRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.ADD_MISSION, 'POST', missionData, getAuthHeaders());
    } else {
      return apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.ADD_MISSION, 'POST', missionData, getAuthHeaders());
    }
  },
  
  // 获取任务申请列表
  getMissionApplicants: (missionId) => {
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.APPLICATIONS.replace(':missionId', missionId);
    return apiRequest(endpoint, 'GET', null, getAuthHeaders());
  },
  
  // 处理任务申请(接受或拒绝)
  handleMissionApplication: (takeId, action, message) => {
    console.log('API调用 - 处理任务申请:', takeId, action, message);
    
    // 确保takeId是数字类型
    const numericTakeId = parseInt(takeId, 10);
    
    if (isNaN(numericTakeId)) {
      console.error('无效的takeId:', takeId);
      return Promise.reject(new Error('无效的申请ID'));
    }
    
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.HANDLE_APPLICATION.replace(':takeId', numericTakeId);
    console.log('API端点:', endpoint);
    console.log('请求数据:', { action, message });
    
    return apiRequest(endpoint, 'POST', { action, message }, getAuthHeaders());
  },
  
  // 标记任务为已完成
  completeMission: (missionId, comment, attachments) => {
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.COMPLETE_MISSION.replace(':missionId', missionId);
    return apiRequest(endpoint, 'POST', { comment, attachments }, getAuthHeaders());
  },
  
  // 确认任务完成
  confirmMissionCompletion: (missionId, rating, review) => {
    const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.MISSION.CONFIRM_MISSION.replace(':missionId', missionId);
    return apiRequest(endpoint, 'POST', { rating, review }, getAuthHeaders());
  },
  
  // 获取任务状态
  getMissionStatus: (missionId) => {
    return apiRequest(`/mission/progress/status/${missionId}`, 'GET', null, getAuthHeaders());
  },
  
  // 更新任务进度
  updateMissionProgress: (missionId, progressPercent, remarks) => {
    return apiRequest(`/mission/progress/progress/${missionId}`, 'POST', { progressPercent, remarks }, getAuthHeaders());
  },
  
  // 提交任务成果
  submitMissionResult: (missionId, formData) => {
    return apiFormDataRequest(`/mission/progress/submit/${missionId}`, 'POST', formData, getAuthHeaders());
  },
  
  // 审核任务
  reviewMission: (missionId, submissionId, status, feedback) => {
    return apiRequest(`/mission/progress/review/${missionId}`, 'POST', { submissionId, status, feedback }, getAuthHeaders());
  },
  
  // 评价任务
  rateMission: (missionId, rateeId, score, review, tags) => {
    return apiRequest(`/mission/progress/rate/${missionId}`, 'POST', { rateeId, score, review, tags }, getAuthHeaders());
  },
  
  // 获取任务沟通记录
  getMissionCommunications: (missionId) => {
    return apiRequest(`/mission/progress/communications/${missionId}`, 'GET', null, getAuthHeaders());
  },
  
  // 发送任务消息
  sendMissionMessage: (missionId, receiverId, message) => {
    return apiRequest(`/mission/progress/communications/${missionId}`, 'POST', { receiverId, message }, getAuthHeaders());
  },
  
  // 取消任务
  cancelMission: (missionId, reason) => {
    return apiRequest(`/mission/progress/cancel/${missionId}`, 'POST', { reason }, getAuthHeaders());
  },
  
  // 获取已发布的任务
  getPublishedMissions: () => {
    return apiRequest('/mission/published', 'GET', null, getAuthHeaders());
  },
  
  // 获取已接单的任务
  getAcceptedMissions: () => {
    return apiRequest('/mission/accepted', 'GET', null, getAuthHeaders());
  },

  /**
   * 新增：提交任务完成状态
   * @param {number} takeId - 任务接取记录的ID (mission_takes.take_id)
   * @param {Object} [submissionData] - 可选的提交数据 (例如消息)
   * @returns {Promise<Object>} API 响应
   */
  submitMissionCompletion: (takeId, submissionData = {}) => {
    if (!takeId) {
      return Promise.reject(new Error('提交任务完成需要提供 takeId'));
    }
    const endpoint = `/mission/takes/${takeId}/submit`; 
    // apiRequest 函数会自动在 endpoint 前加上 API_BASE_URL
    // 所以我们只需要传递 endpoint 部分
    return apiRequest(endpoint, 'POST', submissionData, getAuthHeaders()); 
  },

  cancelPublishedMission: (missionId) => {
    if (!missionId) {
      return Promise.reject(new Error('取消悬赏需要提供 missionId'));
    }
    const endpoint = `/mission/${missionId}/cancel-by-publisher`;
    return apiRequest(endpoint, 'POST', null, getAuthHeaders()); // 使用 POST
  },
};

// 健康检查API
const healthApi = {
  // 检查系统状态
  checkStatus: () => apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.SYSTEM.HEALTH_CHECK)
};

// 通知API
const notificationApi = {
  // 获取通知列表
  getNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_CONFIG.CLIENT_API.ENDPOINTS.NOTIFICATION.GET_NOTIFICATIONS}?${queryString}`, 'GET', null, getAuthHeaders());
  },
  
  // 标记单个通知为已读
  markAsRead: (notificationId) => 
    apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.NOTIFICATION.MARK_AS_READ, 'POST', { notification_id: notificationId }, getAuthHeaders()),
  
  // 标记所有通知为已读
  markAllAsRead: () => 
    apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ, 'POST', {}, getAuthHeaders())
};

// 聊天API
const chatApi = {
  getFriendList: async () => {
    const response = await axiosInstance.get('/chat/friends', { headers: getAuthHeaders() });
    return response.data; // 返回好友列表数据
  },
  getConversationList: async () => {
    const response = await axiosInstance.get('/chat/conversations', { headers: getAuthHeaders() });
    return response.data; // 返回私信会话列表
  },
  getOrCreatePrivateConversation: async (userId2) => {
    const response = await axiosInstance.post('/chat/conversations/private', { userId2 }, { headers: getAuthHeaders() });
    return response.data; // 返回 { conversationId }
  },
  getMessages: async (conversationId, page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
      headers: getAuthHeaders()
    });
    return response.data; // 返回 { messages, currentPage, totalPages }
  },
  sendMessage: async (conversationId, content, messageType = 'text') => {
    const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, { content, messageType }, { headers: getAuthHeaders() });
    return response.data; // 返回发送成功的新消息对象
  },
  sendFriendRequest: async (receiverId, message) => {
    const response = await axiosInstance.post('/chat/friend-requests', { receiverId, message }, { headers: getAuthHeaders() });
    return response.data; // 返回 { message: '...' }
  },
  likeMessage: async (messageId) => {
    const response = await axiosInstance.post(`/chat/messages/${messageId}/like`, {}, { headers: getAuthHeaders() });
    return response.data; // 返回 { success: true, likes: newLikeCount }
  },
  // 同意好友请求
  acceptFriendRequest: async (requestId) => {
    const response = await axiosInstance.post(`/chat/friend-requests/${requestId}/accept`, {}, { headers: getAuthHeaders() });
    return response.data; // 返回 { message: '好友请求已接受' }
  },
  // 拒绝好友请求
  rejectFriendRequest: async (requestId) => {
    const response = await axiosInstance.post(`/chat/friend-requests/${requestId}/reject`, {}, { headers: getAuthHeaders() });
    return response.data; // 返回 { message: '好友请求已拒绝' }
  },
  // 新增：获取好友请求列表
  getFriendRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/chat/friend-requests?${queryString}`, { headers: getAuthHeaders() });
    return response.data; // 返回好友请求列表
  },
};

// 新增：订单API (Order API) - 假设结构
const orderApi = {
    // 创建新订单
    createOrder: (orderData) => 
        apiRequest(API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.CREATE, 'POST', orderData, getAuthHeaders()),

    // 获取我的订单列表
    getMyOrders: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        // 确保端点正确拼接，如果 queryString 为空，则不加 ' ? '
        const endpoint = queryString 
            ? `${API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.GET_MY_ORDERS}?${queryString}` 
            : API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.GET_MY_ORDERS;
        return apiRequest(endpoint, 'GET', null, getAuthHeaders());
    },

    // 根据ID获取特定订单详情
    getOrderById: (orderId) => {
        const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.GET_ORDER_BY_ID.replace(':id', orderId);
        return apiRequest(endpoint, 'GET', null, getAuthHeaders());
    },

    // 确认模拟支付
    confirmMockOrderPayment: (orderId, paymentData = {}) => {
        const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.CONFIRM_MOCK_PAYMENT.replace(':orderId', orderId);
        return apiRequest(endpoint, 'POST', paymentData, getAuthHeaders());
    },

    // 新增：标记订单为已发货
    markAsShipped: (orderId) => {
        const endpoint = API_CONFIG.CLIENT_API.ENDPOINTS.ORDER.MARK_AS_SHIPPED.replace(':orderId', orderId);
        return apiRequest(endpoint, 'PUT', null, getAuthHeaders()); // 使用 PUT 方法
    }
};

// 导出API模块
export {
  apiRequest,
  apiFormDataRequest,
  userApi,
  homeApi,
  marketApi,
  missionApi,
  healthApi,
  getAuthHeaders,
  notificationApi,
  chatApi,
  orderApi // 导出新的 orderApi
}; 
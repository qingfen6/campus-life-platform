/**
 * 评论相关API
 * 
 * 包含获取评论、提交评论、点赞评论等功能
 */
import axios from 'axios';

// 基本URL
const API_URL = '/api/home';

/**
 * 获取帖子评论
 * @param {string|number} postId - 帖子ID
 * @returns {Promise<Object>} 评论数据
 */
export const getPostComments = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    throw error;
  }
};

/**
 * 添加评论
 * @param {Object} commentData - 评论数据
 * @param {string|number} commentData.postId - 帖子ID
 * @param {string} commentData.content - 评论内容
 * @returns {Promise<Object>} 新添加的评论数据
 */
export const addComment = async (commentData) => {
  try {
    // 获取存储在本地的 JWT
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const token = user ? user.token : null;

    if (!token) {
      throw new Error('用户未登录');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/comments`, commentData, config);
    return response.data;
  } catch (error) {
    console.error('添加评论失败:', error);
    throw error;
  }
};

/**
 * 点赞评论
 * @param {Object} likeData - 点赞数据
 * @param {string|number} likeData.commentId - 评论ID
 * @returns {Promise<Object>} 点赞结果
 */
export const likeComment = async (likeData) => {
  try {
    // 获取存储在本地的 JWT
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const token = user ? user.token : null;

    if (!token) {
      throw new Error('用户未登录');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/like-comment`, likeData, config);
    return response.data;
  } catch (error) {
    console.error('点赞评论失败:', error);
    throw error;
  }
};

export default {
  getPostComments,
  addComment,
  likeComment
}; 
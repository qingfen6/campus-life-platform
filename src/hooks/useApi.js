// API钩子 - 简化在React组件中使用API
import { useState, useCallback } from 'react';
import { apiRequest } from '../utils/api';

/**
 * 用于在React组件中简化API调用的自定义钩子
 * @returns {Object} API钩子对象
 */
export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * 执行API请求
   * @param {string} endpoint - API端点
   * @param {string} method - 请求方法(GET, POST, PUT, DELETE)
   * @param {object} requestData - 请求数据
   * @param {object} headers - 自定义请求头
   * @returns {Promise<any>} 响应数据
   */
  const request = useCallback(async (endpoint, method = 'GET', requestData = null, headers = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const responseData = await apiRequest(endpoint, method, requestData, headers);
      setData(responseData);
      setLoading(false);
      return responseData;
    } catch (err) {
      setError(err.message || '请求失败');
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * 重置API状态
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    request,
    reset
  };
} 
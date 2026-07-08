// 数据库操作钩子 - 简化与数据库的交互
import { useCallback } from 'react';
import useApi from './useApi';

/**
 * 用于简化与数据库交互的自定义钩子
 * @returns {Object} 数据库操作方法和状态
 */
export default function useDb() {
  const api = useApi();
  
  /**
   * 执行查询操作
   * @param {string} endpoint - API端点
   * @param {object} params - 查询参数
   * @returns {Promise<object>} 查询结果
   */
  const query = useCallback(async (endpoint, params = {}) => {
    // 构建查询字符串
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return api.request(url);
  }, [api]);
  
  /**
   * 创建记录
   * @param {string} endpoint - API端点
   * @param {object} data - 要创建的数据
   * @returns {Promise<object>} 创建结果
   */
  const create = useCallback(async (endpoint, data) => {
    return api.request(endpoint, 'POST', data);
  }, [api]);
  
  /**
   * 更新记录
   * @param {string} endpoint - API端点
   * @param {string|number} id - 记录ID
   * @param {object} data - 要更新的数据
   * @returns {Promise<object>} 更新结果
   */
  const update = useCallback(async (endpoint, id, data) => {
    return api.request(`${endpoint}/${id}`, 'PUT', data);
  }, [api]);
  
  /**
   * 删除记录
   * @param {string} endpoint - API端点
   * @param {string|number} id - 记录ID
   * @returns {Promise<object>} 删除结果
   */
  const remove = useCallback(async (endpoint, id) => {
    return api.request(`${endpoint}/${id}`, 'DELETE');
  }, [api]);
  
  return {
    loading: api.loading,
    error: api.error,
    data: api.data,
    query,
    create,
    update,
    remove,
    reset: api.reset
  };
} 
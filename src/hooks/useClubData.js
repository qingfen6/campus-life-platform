/**
 * 社团数据管理Hook
 * 
 * 功能：
 * - 数据加载状态管理
 * - 错误处理
 * - 数据过滤和搜索
 * - 数据更新
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import {
  activities,
  recruitments,
  resources,
  forumPosts,
  calendarEvents,
  dynamicPosts
} from '../data/clubData';

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useClubData = () => {
  // 加载状态
  const [loading, setLoading] = useState({
    activities: false,
    recruitments: false,
    resources: false,
    forum: false,
    calendar: false,
    dynamics: false
  });

  // 错误状态
  const [error, setError] = useState(null);

  // 数据状态
  const [data, setData] = useState({
    activities: [],
    recruitments: [],
    resources: [],
    forum: [],
    calendar: [],
    dynamics: []
  });

  // 过滤条件
  const [filters, setFilters] = useState({
    searchText: '',
    selectedType: 'all',
    selectedStatus: 'all'
  });

  // 加载数据
  const loadData = useCallback(async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError(null);

      // 模拟API调用
      await delay(1000);

      let result;
      switch (type) {
        case 'activities':
          result = activities;
          break;
        case 'recruitments':
          result = recruitments;
          break;
        case 'resources':
          result = resources;
          break;
        case 'forum':
          result = forumPosts;
          break;
        case 'calendar':
          result = calendarEvents;
          break;
        case 'dynamics':
          result = dynamicPosts;
          break;
        default:
          throw new Error('未知的数据类型');
      }

      setData(prev => ({ ...prev, [type]: result }));
    } catch (err) {
      setError(err.message);
      message.error(`加载${type}数据失败: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  // 更新过滤条件
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 过滤数据
  const getFilteredData = useCallback((type) => {
    const items = data[type];
    if (!items) return [];

    return items.filter(item => {
      // 搜索文本过滤
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
        const contentMatch = item.content?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch && !contentMatch) return false;
      }

      // 类型过滤
      if (filters.selectedType !== 'all' && item.type !== filters.selectedType) {
        return false;
      }

      // 状态过滤
      if (filters.selectedStatus !== 'all' && item.status !== filters.selectedStatus) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // 更新数据
  const updateData = useCallback((type, id, updates) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  }, []);

  // 点赞处理
  const handleLike = useCallback((type, id) => {
    updateData(type, id, {
      likes: (prev) => prev + 1,
      isLiked: true
    });
    message.success('点赞成功');
  }, [updateData]);

  // 评论处理
  const handleComment = useCallback((type, id) => {
    updateData(type, id, {
      comments: (prev) => prev + 1
    });
  }, [updateData]);

  // 分享处理
  const handleShare = useCallback((type, id) => {
    message.success('分享成功');
  }, []);

  // 图片预览处理
  const handleImagePreview = useCallback((images, index) => {
    // 实现图片预览逻辑
  }, []);

  // 订阅处理
  const handleSubscribe = useCallback(() => {
    message.success('订阅成功');
  }, []);

  // 添加提醒处理
  const handleAddReminder = useCallback(() => {
    message.success('提醒设置成功');
  }, []);

  // 初始加载
  useEffect(() => {
    const types = ['activities', 'recruitments', 'resources', 'forum', 'calendar', 'dynamics'];
    types.forEach(type => loadData(type));
  }, [loadData]);

  return {
    loading,
    error,
    data,
    filters,
    getFilteredData,
    updateFilters,
    handleLike,
    handleComment,
    handleShare,
    handleImagePreview,
    handleSubscribe,
    handleAddReminder
  };
}; 
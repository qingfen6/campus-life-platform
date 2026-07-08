/**
 * 评论抽屉组件
 * 
 * 功能：
 * - 侧边抽屉展示评论
 * - 与CommentSection组件集成
 * - 管理评论抽屉的开关状态
 */

import React, { useState } from 'react';
import { Drawer, message } from 'antd';
import CommentSection from './CommentSection';
import { homeApi } from '../../utils/api';
import '../../assets/styles/CommentDrawer.css';

/**
 * 评论抽屉组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 抽屉是否可见
 * @param {Function} props.onClose - 关闭抽屉的回调函数
 * @param {Object} props.post - 帖子数据
 * @returns {JSX.Element} 评论抽屉组件
 */
const CommentDrawer = ({ visible, onClose, post }) => {
  const [error, setError] = useState(null);

  // 获取评论列表
  const handleFetchComments = async (postId) => {
    try {
      const response = await homeApi.getPostComments(postId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError('获取评论失败');
        return [];
      }
    } catch (error) {
      console.error('获取评论出错:', error);
      setError('获取评论失败，请稍后重试');
      return [];
    }
  };

  // 提交评论
  const handleSubmitComment = async (postId, content, parentId = null) => {
    try {
      const response = await homeApi.addPostComment(postId, content, parentId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '评论提交失败');
      }
    } catch (error) {
      console.error('提交评论出错:', error);
      throw error;
    }
  };

  // 点赞评论
  const handleLikeComment = async (commentId) => {
    try {
      const response = await homeApi.likeComment(commentId);
      
      return {
        liked: response.success ? response.liked : false,
        message: response.message
      };
    } catch (error) {
      console.error('点赞评论出错:', error);
      throw error;
    }
  };

  // 清除错误
  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="comment-drawer-title">
          <span>
            评论 {post ? `(${post.comments || 0})` : ''}
          </span>
          {post && (
            <div className="comment-drawer-subtitle">
              {post.title || post.content?.substring(0, 30) || ''}
            </div>
          )}
        </div>
      }
      placement="right"
      width={480}
      onClose={handleClose}
      open={visible}
      className="comment-drawer"
    >
      {error && (
        <div className="comment-error">
          {error}
        </div>
      )}
      
      {post && (
        <CommentSection
          postId={post.id}
          onFetchComments={handleFetchComments}
          onSubmitComment={handleSubmitComment}
          onLikeComment={handleLikeComment}
        />
      )}
    </Drawer>
  );
};

export default CommentDrawer; 
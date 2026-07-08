/**
 * 评论区域组件
 * 
 * 功能：
 * - 展示评论列表
 * - 提交新评论
 * - 点赞评论
 * - 评论加载状态
 * - 评论分页
 */

import React, { useState, useEffect } from 'react';
import { Avatar, Button, Input, Empty, Spin, message, Divider } from 'antd';
import { LikeOutlined, LikeFilled, SendOutlined, CommentOutlined } from '@ant-design/icons';
import '../../assets/styles/CommentSection.css';

const { TextArea } = Input;

// 简单的时间格式化函数
const formatTimeAgo = (dateString) => {
  if (!dateString) return '刚刚';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}个月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
};

// 回复评论组件
const ReplyComment = ({ reply, onLike }) => {
  const { id, author, avatar, content, createdAt, likes, liked } = reply;
  const timeAgo = formatTimeAgo(createdAt);

  return (
    <div className="reply-comment">
      <div className="reply-header">
        <Avatar src={avatar} alt={author} size={24}>
          {!avatar && author ? author.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <div className="reply-author">{author || '匿名用户'}</div>
      </div>
      <div className="reply-text">{content}</div>
      <div className="reply-footer">
        <span className="reply-time">{timeAgo}</span>
        <span 
          className={`reply-like ${liked ? 'liked' : ''}`}
          onClick={() => onLike(id)}
        >
          {liked ? <LikeFilled /> : <LikeOutlined />} {likes > 0 ? likes : '赞'}
        </span>
      </div>
    </div>
  );
};

// 自定义评论组件
const CustomComment = ({ comment, onLike, onReply }) => {
  const { id, author, avatar, content, createdAt, likes, liked, replies = [] } = comment;
  const timeAgo = formatTimeAgo(createdAt);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // 处理回复按钮点击
  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
  };

  // 提交回复
  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      message.warning('回复内容不能为空');
      return;
    }

    setSubmittingReply(true);
    try {
      if (onReply) {
        await onReply(id, replyContent);
        setReplyContent('');
        setShowReplyInput(false);
        setShowReplies(true);
        message.success('回复发布成功');
      }
    } catch (error) {
      console.error('回复发布失败:', error);
      message.error('回复发布失败，请稍后重试');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="custom-comment" key={id}>
      <div className="comment-header">
        <Avatar src={avatar} alt={author} size={40}>
          {!avatar && author ? author.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <div className="comment-author">{author || '匿名用户'}</div>
      </div>
      <div className="comment-text">{content}</div>
      <div className="comment-footer">
        <span className="comment-time">{timeAgo}</span>
        <span 
          className="comment-reply"
          onClick={handleReplyClick}
        >
          <CommentOutlined /> 回复
        </span>
        <span 
          className={`comment-like ${liked ? 'liked' : ''}`}
          onClick={() => onLike(id)}
        >
          {liked ? <LikeFilled /> : <LikeOutlined />} {likes > 0 ? likes : '赞'}
        </span>
      </div>

      {/* 回复列表 */}
      {replies && replies.length > 0 && (
        <div className="replies-section">
          <div 
            className="view-replies" 
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? '收起回复' : `查看全部 ${replies.length} 条回复`}
          </div>
          
          {showReplies && (
            <div className="replies-container">
              {replies.map(reply => (
                <ReplyComment
                  key={reply.id}
                  reply={reply}
                  onLike={onLike}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showReplyInput && (
        <div className="reply-form">
          <TextArea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder={`回复 ${author || '匿名用户'}...`}
            autoSize={{ minRows: 1, maxRows: 3 }}
            maxLength={200}
          />
          <div className="reply-form-actions">
            <Button
              size="small"
              onClick={() => setShowReplyInput(false)}
            >
              取消
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleSubmitReply}
              loading={submittingReply}
              disabled={!replyContent.trim()}
            >
              发布回复
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// 评论区组件
const CommentSection = ({ 
  postId,
  onFetchComments,
  onSubmitComment,
  onLikeComment
}) => {
  const [commentValue, setCommentValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 获取当前用户信息
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (error) {
        console.error('解析用户信息出错:', error);
      }
    }
  }, []);

  // 初始加载评论
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setLoading(true);
      try {
        const commentData = await onFetchComments(postId);
        
        // 处理评论数据，整理回复结构
        const parentComments = [];
        const replyMap = new Map();
        
        // 先遍历评论，将回复按父评论ID分组
        commentData.forEach(comment => {
          if (!comment.parentId) {
            // 如果是一级评论，直接添加到父评论数组
            comment.replies = [];
            parentComments.push(comment);
            replyMap.set(comment.id, comment);
          }
        });
        
        // 再次遍历，将回复添加到对应的父评论
        commentData.forEach(comment => {
          if (comment.parentId) {
            const parentComment = replyMap.get(comment.parentId);
            if (parentComment) {
              parentComment.replies.push(comment);
            } else {
              // 如果找不到父评论，当作普通评论处理
              comment.replies = [];
              parentComments.push(comment);
            }
          }
        });
        
        setComments(parentComments);
      } catch (error) {
        console.error('获取评论失败:', error);
        message.error('获取评论失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, onFetchComments]);

  // 处理评论提交
  const handleSubmit = async () => {
    if (!commentValue.trim()) {
      message.warning('评论内容不能为空');
      return;
    }

    if (!currentUser) {
      message.warning('请先登录后再评论');
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await onSubmitComment(postId, commentValue.trim());
      
      // 添加当前用户信息到新评论
      if (newComment && !newComment.author && currentUser) {
        newComment.author = currentUser.username;
        // 如果服务器没有返回头像，可以使用用户的默认头像
      }
      
      // 确保新评论有replies属性
      newComment.replies = [];
      
      setComments(prev => [newComment, ...prev]);
      setCommentValue('');
      message.success('评论发布成功');
    } catch (error) {
      console.error('评论发布失败:', error);
      message.error('评论发布失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理评论点赞
  const handleLike = async (commentId) => {
    try {
      const result = await onLikeComment(commentId);
      if (result.liked !== undefined) {
        setComments(prev => {
          // 创建新的评论数组
          const newComments = [...prev];
          
          // 遍历所有一级评论
          for (let i = 0; i < newComments.length; i++) {
            // 检查当前评论是否是要点赞的评论
            if (newComments[i].id === commentId) {
              newComments[i] = {
                ...newComments[i],
                liked: result.liked,
                likes: result.liked 
                  ? (newComments[i].likes || 0) + 1 
                  : Math.max((newComments[i].likes || 0) - 1, 0)
              };
              return newComments;
            }
            
            // 检查回复中是否有要点赞的评论
            const replies = newComments[i].replies || [];
            for (let j = 0; j < replies.length; j++) {
              if (replies[j].id === commentId) {
                const newReplies = [...replies];
                newReplies[j] = {
                  ...newReplies[j],
                  liked: result.liked,
                  likes: result.liked 
                    ? (newReplies[j].likes || 0) + 1 
                    : Math.max((newReplies[j].likes || 0) - 1, 0)
                };
                newComments[i] = {
                  ...newComments[i],
                  replies: newReplies
                };
                return newComments;
              }
            }
          }
          
          return newComments;
        });
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 处理评论回复
  const handleReply = async (commentId, content) => {
    if (!currentUser) {
      message.warning('请先登录后再回复');
      return;
    }
    
    try {
      const result = await onSubmitComment(postId, content, commentId);
      
      // 添加当前用户信息到新回复
      if (result && !result.author && currentUser) {
        result.author = currentUser.username;
      }
      
      // 找到父评论并添加回复
      setComments(prev => {
        return prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), result]
            };
          }
          return comment;
        });
      });
      
      return result;
    } catch (error) {
      console.error('评论回复失败:', error);
      throw error;
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-list-container">
        {loading ? (
          <div className="comment-loading">
            <Spin tip="加载评论中..." />
          </div>
        ) : comments.length === 0 ? (
          <Empty 
            className="comment-empty"
            description="暂无评论，来发表第一条评论吧" 
          />
        ) : (
          <div className="comment-list">
            {comments.map(comment => (
              <CustomComment 
                key={comment.id} 
                comment={comment} 
                onLike={handleLike}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>

      <div className="comment-form-container">
        <div className="comment-form">
          {currentUser ? (
            <>
              <div className="current-user-info">
                <Avatar src={currentUser.avatar}>
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <span className="username">{currentUser.username}</span>
              </div>
              <TextArea
                rows={3}
                value={commentValue}
                onChange={e => setCommentValue(e.target.value)}
                placeholder="写下你的评论..."
                maxLength={500}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                disabled={!commentValue.trim()}
              >
                发布评论
              </Button>
            </>
          ) : (
            <div className="login-prompt">
              请先登录后再发表评论
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection; 
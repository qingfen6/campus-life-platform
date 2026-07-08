import React, { useState, useEffect } from 'react';
import { List, Empty, Spin, Pagination, Typography, Button } from 'antd';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import '../../assets/styles/CommentSection.css';

const { Title, Text } = Typography;

const CommentList = ({ 
  comments = [], 
  postId, 
  loading = false, 
  total = 0, 
  onAddComment, 
  onLikeComment,
  highlightedCommentId = null,
  pageSize = 10,
  pageNumber = 1,
  onPageChange,
  canComment = true,
  title = '评论',
  user = null
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // 创建一个默认用户对象
  const defaultUser = {
    id: 1,
    username: '当前用户',
    avatar: 'https://source.unsplash.com/random/100x100/?portrait'
  };
  
  // 使用传入的用户或默认用户
  const currentUser = user || defaultUser;

  // 处理下一页加载
  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // 处理添加评论
  const handleAddComment = (content, replyToId = null) => {
    if (onAddComment) {
      onAddComment(content, replyToId);
      setShowCommentForm(false);
    }
  };

  // 处理点赞评论
  const handleLikeComment = (commentId) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <div>
          <Title level={5} className="comment-title">
            {title} <Text type="secondary" className="comment-count">({total})</Text>
          </Title>
        </div>
        {canComment && (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            {showCommentForm ? '取消评论' : '我要评论'}
          </Button>
        )}
      </div>

      {showCommentForm && (
        <CommentForm 
          postId={postId} 
          onSubmit={(content) => handleAddComment(content)} 
          autoFocus
          className="comment-form"
          user={currentUser}
        />
      )}

      {loading ? (
        <div className="comments-loading">
          <Spin />
        </div>
      ) : comments && comments.length > 0 ? (
        <>
          <List
            itemLayout="vertical"
            dataSource={comments}
            renderItem={(comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onLike={handleLikeComment}
                onReply={handleAddComment}
                highlighted={highlightedCommentId === comment.id}
                user={currentUser}
              />
            )}
          />
          
          {total > pageSize && (
            <div className="comment-pagination">
              <Pagination
                current={pageNumber}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                size="small"
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ) : (
        <div className="empty-comments">
          <Empty description="暂无评论" />
        </div>
      )}
    </div>
  );
};

export default CommentList; 
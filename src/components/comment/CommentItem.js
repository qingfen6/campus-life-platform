import React, { useState } from 'react';
import { Avatar, Button, Tooltip, List, Tag } from 'antd';
import { 
  LikeOutlined, 
  LikeFilled, 
  CommentOutlined, 
  UserOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import '../../assets/styles/CommentSection.css';

// 自定义评论组件，替代 antd 的 Comment 组件
const CustomComment = ({ author, avatar, content, datetime, actions, children }) => {
  return (
    <div className="custom-comment">
      <div className="custom-comment-header">
        <div className="custom-comment-avatar">{avatar}</div>
        <div className="custom-comment-content">
          <div className="custom-comment-author">{author}</div>
          <div className="custom-comment-datetime">{datetime}</div>
          <div className="custom-comment-body">{content}</div>
          {actions && <ul className="custom-comment-actions">{actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}</ul>}
        </div>
      </div>
      {children && <div className="custom-comment-children">{children}</div>}
    </div>
  );
};

const CommentItem = ({ 
  comment, 
  postId, 
  onLike, 
  onReply, 
  highlighted = false,
  user = null
}) => {
  const [replyVisible, setReplyVisible] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);

  const defaultUser = {
    id: 1,
    username: '当前用户',
    avatar: 'https://source.unsplash.com/random/100x100/?portrait'
  };
  
  const currentUser = user || defaultUser;

  const { 
    id, 
    content, 
    createdAt, 
    user: commentUser, 
    author,
    avatar,
    isLiked, 
    likesCount, 
    replies = [] 
  } = comment;

  const toggleReplyForm = () => {
    setReplyVisible(!replyVisible);
  };

  const toggleRepliesVisibility = () => {
    setRepliesVisible(!repliesVisible);
  };

  const handleReplySubmit = async (content) => {
    try {
      const success = await onReply(content, id);
      if (success) {
        setReplyVisible(false);
        setRepliesVisible(true);
      }
      return success;
    } catch (error) {
      console.error('回复评论失败:', error);
      throw error;
    }
  };

  const handleLike = () => {
    onLike(id);
  };

  const formattedTime = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: zhCN })
    : '未知时间';

  const actions = [
    <Tooltip key="like" title={isLiked ? '取消点赞' : '点赞'}>
      <span onClick={handleLike} className="comment-action">
        {isLiked ? <LikeFilled /> : <LikeOutlined />}
        <span className="action-count">{likesCount > 0 ? likesCount : ''}</span>
      </span>
    </Tooltip>,
    <Tooltip key="reply" title="回复">
      <span onClick={toggleReplyForm} className="comment-action">
        <CommentOutlined />
        <span className="action-text">回复</span>
      </span>
    </Tooltip>
  ];

  if (replies && replies.length > 0) {
    actions.push(
      <span 
        key="view-replies" 
        onClick={toggleRepliesVisibility}
        className="comment-action"
      >
        {repliesVisible ? '收起回复' : `查看全部 ${replies.length} 条回复`}
      </span>
    );
  }

  const userAvatar = commentUser?.avatar 
    ? <Avatar src={commentUser.avatar} /> 
    : avatar
      ? <Avatar src={avatar} />
      : <Avatar icon={<UserOutlined />} />;

  console.log('评论数据:', comment);
  console.log('评论用户信息:', commentUser);
  const authorName = commentUser?.nickname || commentUser?.username || author || '匿名用户';
  
  return (
    <div className={`comment-item ${highlighted ? 'comment-highlighted' : ''}`}>
      <CustomComment
        author={
          <span className="comment-author">
            {authorName}
            {commentUser?.isAdmin && <Tag color="red" className="user-tag">管理员</Tag>}
            {commentUser?.role && <Tag color="blue" className="user-tag">{commentUser.role}</Tag>}
          </span>
        }
        avatar={userAvatar}
        content={<p>{content}</p>}
        datetime={
          <Tooltip title={createdAt}>
            <span>
              <ClockCircleOutlined /> {formattedTime}
            </span>
          </Tooltip>
        }
        actions={actions}
      />

      {replyVisible && (
        <div className="reply-form">
          <CommentForm
            postId={postId}
            parentId={id}
            onSubmit={handleReplySubmit}
            placeholder={`回复 ${authorName}...`}
            autoFocus
            user={currentUser}
          />
        </div>
      )}

      {repliesVisible && replies.length > 0 && (
        <div className="replies-container">
          <List
            className="replies-list"
            itemLayout="horizontal"
            dataSource={replies}
            renderItem={reply => (
              <CustomComment
                author={
                  <span className="comment-author">
                    {reply.user?.nickname || reply.user?.username || reply.author || '匿名用户'}
                    {reply.user?.isAdmin && <Tag color="red" className="user-tag">管理员</Tag>}
                    {reply.user?.role && <Tag color="blue" className="user-tag">{reply.user.role}</Tag>}
                  </span>
                }
                avatar={
                  reply.user?.avatar 
                    ? <Avatar src={reply.user.avatar} size="small" /> 
                    : reply.avatar
                      ? <Avatar src={reply.avatar} size="small" />
                      : <Avatar icon={<UserOutlined />} size="small" />
                }
                content={<p>{reply.content}</p>}
                datetime={
                  <Tooltip title={reply.createdAt}>
                    <span className="reply-time">
                      {reply.createdAt 
                        ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: zhCN })
                        : '未知时间'
                      }
                    </span>
                  </Tooltip>
                }
                actions={[
                  <Tooltip key="like-reply" title={reply.isLiked ? '取消点赞' : '点赞'}>
                    <span onClick={() => onLike(reply.id)} className="comment-action">
                      {reply.isLiked ? <LikeFilled /> : <LikeOutlined />}
                      <span className="action-count">{reply.likesCount > 0 ? reply.likesCount : ''}</span>
                    </span>
                  </Tooltip>
                ]}
              />
            )}
          />
        </div>
      )}
    </div>
  );
};

export default CommentItem; 
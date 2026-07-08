/**
 * 论坛帖子卡片组件
 * 
 * 功能：
 * - 展示帖子内容
 * - 支持匿名发帖
 * - 显示互动数据
 * - 支持点赞和评论
 * - 响应式设计
 * - 暗色模式支持
 */

import React, { useState } from 'react';
import { Card, Space, Tag, Button, Avatar, Tooltip } from 'antd';
import { 
  UserOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  LockOutlined,
  EyeOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';
import CommentDrawer from '../comment/CommentDrawer';

const ForumPostCard = ({ 
  post, 
  onLike,
  onComment,
  onShare,
  onViewDetail,
  isLiked
}) => {
  // 添加评论抽屉状态
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false);

  // 处理评论按钮点击
  const handleCommentClick = (postId) => {
    setCommentDrawerVisible(true);
    if (onComment) {
      onComment(postId);
    }
  };

  // 处理关闭评论抽屉
  const handleCloseCommentDrawer = () => {
    setCommentDrawerVisible(false);
  };

  return (
    <>
      <Card
        className="forum-post-card"
        actions={[
          <Space>
            <Tooltip title="点赞">
              <Button 
                icon={<HeartOutlined className={isLiked ? 'liked' : ''} />}
                onClick={() => onLike(post.id)}
              >
                {post.likes}
              </Button>
            </Tooltip>
            <Tooltip title="评论">
              <Button 
                icon={<CommentOutlined />}
                onClick={() => handleCommentClick(post.id)}
              >
                {post.replies}
              </Button>
            </Tooltip>
            <Tooltip title="分享">
              <Button 
                icon={<ShareAltOutlined />}
                onClick={() => onShare(post)}
              />
            </Tooltip>
          </Space>
        ]}
      >
        <Card.Meta
          avatar={
            <Avatar 
              src={post.isAnonymous ? null : post.authorAvatar}
              icon={post.isAnonymous ? <LockOutlined /> : <UserOutlined />}
            />
          }
          title={
            <Space>
              {post.isAnonymous ? '匿名用户' : post.author}
              <Tag color="blue">{post.isAnonymous ? '匿名' : '实名'}</Tag>
              {post.isTop && <Tag color="red">置顶</Tag>}
              {post.isHot && <Tag color="orange">热门</Tag>}
            </Space>
          }
          description={
            <Space direction="vertical" size="small" className="post-description">
              <h4 className="post-title">{post.title}</h4>
              
              <div className="post-content">{post.content}</div>

              {post.images && post.images.length > 0 && (
                <div className="post-images">
                  {post.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`图片${index + 1}`}
                      className="post-image"
                    />
                  ))}
                </div>
              )}

              <Space className="post-meta">
                <Space>
                  <ClockCircleOutlined />
                  {post.publishTime}
                </Space>
                <Space>
                  <EyeOutlined />
                  {post.views}
                </Space>
              </Space>

              <Space wrap>
                {post.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            </Space>
          }
        />
      </Card>

      {/* 评论抽屉 */}
      <CommentDrawer
        visible={commentDrawerVisible}
        onClose={handleCloseCommentDrawer}
        post={post}
      />
    </>
  );
};

export default ForumPostCard; 
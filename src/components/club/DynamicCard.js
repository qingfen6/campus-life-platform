/**
 * 动态信息卡片组件
 * 
 * 功能：
 * - 展示动态信息流
 * - 支持点赞和评论
 * - 支持图片预览
 * - 支持动态分享
 * - 响应式设计
 * - 暗色模式支持
 */

import React, { useState } from 'react';
import { Card, Space, Avatar, Button, Tooltip, Image, Tag } from 'antd';
import { 
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  PictureOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
  LikeFilled
} from '@ant-design/icons';
import '../../assets/styles/club.css';
import CommentDrawer from '../comment/CommentDrawer';

const DynamicCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onImagePreview,
  onFollow,
  isFollowed,
  onClick
}) => {
  // 添加评论抽屉状态
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false);

  // 处理点赞
  const handleLike = (e) => {
    e.stopPropagation(); // 阻止卡片点击事件
    onLike(post.id);
  };

  // 处理评论
  const handleComment = (e) => {
    e.stopPropagation(); // 阻止卡片点击事件
    setCommentDrawerVisible(true);
    if (onComment) {
      onComment(post.id);
    }
  };

  // 处理关闭评论抽屉
  const handleCloseCommentDrawer = () => {
    setCommentDrawerVisible(false);
  };

  // 处理分享
  const handleShare = (e) => {
    e.stopPropagation(); // 阻止卡片点击事件
    onShare(post.id);
  };

  // 处理图片预览
  const handleImagePreview = (index, e) => {
    if (e) e.stopPropagation(); // 阻止卡片点击事件
    onImagePreview(post.images, index);
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick && post.id) {
      onClick(post.id);
    }
  };

  // 处理关注按钮点击
  const handleFollowClick = (e) => {
    e.stopPropagation(); // 阻止卡片点击事件
    onFollow(post.username);
  };

  // 根据图片数量决定布局
  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;
    
    // 设置图片布局样式
    let gridStyle = {};
    switch (post.images.length) {
      case 1:
        gridStyle = {
          display: 'block',
          height: '280px',
          objectFit: 'cover',
          width: '100%'
        };
        break;
      case 2:
        gridStyle = {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px',
        };
        break;
      case 3:
        gridStyle = {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
        };
        break;
      default:
        gridStyle = {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 140px)',
          gap: '4px',
        };
    }
    
    return (
      <div style={gridStyle} className="dynamic-images">
        {post.images.slice(0, 4).map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`动态图片 ${index + 1}`}
            onClick={(e) => handleImagePreview(index, e)}
            style={{
              height: post.images.length === 1 ? '280px' : '140px',
              objectFit: 'cover',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            preview={false}
          />
        ))}
        {post.images.length > 4 && (
          <div 
            style={{
              position: 'relative',
              height: '140px',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={post.images[4]}
              alt="更多图片"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.7)',
              }}
              preview={false}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
              }}
              onClick={(e) => handleImagePreview(4, e)}
            >
              +{post.images.length - 4}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="dynamic-card" bordered={false} onClick={handleCardClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={post.avatar} size={40} />
            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>{post.username}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{post.time}</div>
            </div>
          </div>
          <Button 
            type={isFollowed ? "primary" : "default"}
            size="small"
            icon={isFollowed ? <StarFilled /> : <StarOutlined />}
            onClick={handleFollowClick}
          >
            {isFollowed ? '已关注' : '关注'}
          </Button>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          {post.content}
        </div>
        
        {renderImages()}
        
        {post.link && (
          <a 
            href={post.link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'block', margin: '12px 0', color: '#1890ff' }}
            onClick={(e) => e.stopPropagation()}
          >
            {post.link}
          </a>
        )}
        
        <div style={{ margin: '12px 0' }}>
          {post.tags && post.tags.map(tag => (
            <Tag 
              key={tag} 
              color="blue" 
              style={{ marginRight: '8px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </Tag>
          ))}
        </div>
        
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="dynamic-action" onClick={handleLike}>
            {post.liked ? 
              <LikeFilled style={{ color: '#1890ff' }} /> : 
              <LikeOutlined />} 
            <span style={{ marginLeft: '4px' }}>{post.likes || 0}</span>
          </div>
          <div className="dynamic-action" onClick={handleComment}>
            <CommentOutlined />
            <span style={{ marginLeft: '4px' }}>{post.comments || 0}</span>
          </div>
          <div className="dynamic-action" onClick={handleShare}>
            <ShareAltOutlined />
            <span style={{ marginLeft: '4px' }}>分享</span>
          </div>
        </div>
      </Card>
      
      <CommentDrawer
        visible={commentDrawerVisible}
        onClose={handleCloseCommentDrawer}
        post={post}
      />
    </>
  );
};

export default DynamicCard; 
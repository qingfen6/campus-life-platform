/**
 * 动态详情页面
 * 
 * 功能：
 * - 显示动态完整内容
 * - 展示媒体文件（图片/视频）
 * - 显示用户信息和互动数据
 * - 提供点赞、评论等互动功能
 * - 显示相关动态推荐
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Row, Col, Card, Avatar, Button, Divider, Tag, message, 
  Skeleton, Image, Carousel, Tabs, Comment, Form, Input, List, Typography
} from 'antd';
import { 
  LikeOutlined, LikeFilled, MessageOutlined, ShareAltOutlined, 
  EnvironmentOutlined, LeftOutlined, EyeOutlined, TagOutlined, CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import { homeApi } from '../utils/api';
import CommentForm from '../components/comment/CommentForm';
import CommentList from '../components/comment/CommentList';
import '../assets/styles/PostDetailPage.css';

// 设置dayjs本地化和相对时间插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

/**
 * 动态详情页面组件
 * @returns {JSX.Element} 动态详情页面
 */
const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  // 状态管理
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  
  // 获取localStorage中的用户信息
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('解析用户信息出错:', error);
    }
    
    // 如果没有用户信息或解析失败，返回默认用户
    return {
      id: 1,
      username: '当前用户',
      avatar: 'https://source.unsplash.com/random/100x100/?portrait'
    };
  };
  
  // 获取当前登录用户信息
  const currentUser = getCurrentUser();
  
  // 获取动态详情
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用API获取动态详情
        const response = await homeApi.getPostDetail(postId);
        
        if (response.success) {
          setPost(response.data);
          setLiked(response.data.liked || false);
          setLikeCount(response.data.likes || 0);
          setCommentCount(response.data.comments || 0);
          
          // 获取标签相关动态
          if (response.data.tags && response.data.tags.length > 0) {
            fetchRelatedPosts(response.data.tags[0]);
          } else {
            setRelatedLoading(false);
          }
        } else {
          setError('获取动态详情失败');
          message.error('获取动态详情失败');
        }
      } catch (error) {
        console.error('获取动态详情出错:', error);
        setError('获取动态详情出错');
        message.error(`获取动态详情出错: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetail();
  }, [postId]);
  
  // 获取评论
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      try {
        setCommentsLoading(true);
        const response = await homeApi.getPostComments(postId);
        
        if (response.success) {
          // 处理评论数据，整理回复结构
          const parentComments = [];
          const replyMap = new Map();
          
          // 先遍历评论，将回复按父评论ID分组
          response.data.forEach(comment => {
            // 格式化评论对象，确保所需字段存在
            const formattedComment = {
              ...comment,
              id: comment.id || comment.comment_id,
              isLiked: comment.isLiked || comment.liked || false,
              likesCount: comment.likesCount || comment.likes || 0,
              replies: []
            };
            
            if (!comment.parentId) {
              // 如果是一级评论，直接添加到父评论数组
              parentComments.push(formattedComment);
              replyMap.set(formattedComment.id, formattedComment);
            }
          });
          
          // 再次遍历，将回复添加到对应的父评论
          response.data.forEach(comment => {
            if (comment.parentId) {
              const formattedReply = {
                ...comment,
                id: comment.id || comment.comment_id,
                isLiked: comment.isLiked || comment.liked || false,
                likesCount: comment.likesCount || comment.likes || 0
              };
              
              const parentComment = replyMap.get(comment.parentId);
              if (parentComment) {
                parentComment.replies.push(formattedReply);
              } else {
                // 如果找不到父评论，当作普通评论处理
                formattedReply.replies = [];
                parentComments.push(formattedReply);
              }
            }
          });
          
          setComments(parentComments);
        } else {
          message.error('获取评论失败');
        }
      } catch (error) {
        console.error('获取评论出错:', error);
        message.error(`获取评论出错: ${error.message}`);
      } finally {
        setCommentsLoading(false);
      }
    };
    
    fetchComments();
  }, [postId]);
  
  // 获取相关动态
  const fetchRelatedPosts = async (tag) => {
    try {
      setRelatedLoading(true);
      const response = await homeApi.getPosts({ tag, limit: 4 });
      
      if (response.success) {
        // 过滤掉当前动态
        const filtered = response.data.posts.filter(p => p.post_id.toString() !== postId);
        setRelatedPosts(filtered.slice(0, 3)); // 最多显示3个相关动态
      } else {
        message.error('获取相关动态失败');
      }
    } catch (error) {
      console.error('获取相关动态出错:', error);
    } finally {
      setRelatedLoading(false);
    }
  };
  
  // 处理点赞
  const handleLike = async () => {
    try {
      const response = await homeApi.likePost(postId);
      
      if (response.success) {
        setLiked(response.liked);
        setLikeCount(prev => response.liked ? prev + 1 : prev - 1);
        message.success(response.liked ? '点赞成功' : '取消点赞成功');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      console.error('点赞操作出错:', error);
      message.error(`操作失败: ${error.message}`);
    }
  };
  
  // 处理评论提交
  const handleCommentSubmit = async (content, parentId = null) => {
    try {
      const response = await homeApi.addPostComment(postId, content, parentId);
      
      if (response.success) {
        message.success('评论发表成功');
        
        const newComment = {
          ...response.data,
          id: response.data.id || response.data.comment_id,
          isLiked: response.data.isLiked || response.data.liked || false,
          likesCount: response.data.likesCount || response.data.likes || 0
        };
        
        if (parentId) {
          // 如果是回复评论，将回复添加到对应的父评论中
          setComments(prev => 
            prev.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [newComment, ...(comment.replies || [])]
                };
              }
              return comment;
            })
          );
        } else {
          // 如果是新评论，直接添加到评论列表
          newComment.replies = [];
          setComments(prev => [newComment, ...prev]);
        }
        
        setCommentCount(prev => prev + 1);
        return newComment;
      } else {
        message.error('评论发表失败');
        return null;
      }
    } catch (error) {
      console.error('发表评论出错:', error);
      message.error(`发表评论失败: ${error.message}`);
      return null;
    }
  };
  
  // 处理评论点赞
  const handleCommentLike = async (commentId) => {
    try {
      const response = await homeApi.likeComment(commentId);
      
      if (response.success) {
        // 更新评论列表中的点赞状态
        setComments(prev => {
          const updatedComments = [...prev];
          
          // 遍历所有评论
          for (let i = 0; i < updatedComments.length; i++) {
            if (updatedComments[i].id === commentId) {
              // 如果是当前评论，更新点赞状态
              updatedComments[i] = {
                ...updatedComments[i],
                isLiked: response.liked,
                likesCount: response.liked 
                  ? (updatedComments[i].likesCount || 0) + 1 
                  : Math.max((updatedComments[i].likesCount || 0) - 1, 0)
              };
              return updatedComments;
            }
            
            // 检查评论的回复
            const replies = updatedComments[i].replies || [];
            for (let j = 0; j < replies.length; j++) {
              if (replies[j].id === commentId) {
                const updatedReplies = [...replies];
                updatedReplies[j] = {
                  ...updatedReplies[j],
                  isLiked: response.liked,
                  likesCount: response.liked 
                    ? (updatedReplies[j].likesCount || 0) + 1 
                    : Math.max((updatedReplies[j].likesCount || 0) - 1, 0)
                };
                updatedComments[i] = {
                  ...updatedComments[i],
                  replies: updatedReplies
                };
                return updatedComments;
              }
            }
          }
          
          return updatedComments;
        });
        
        return { liked: response.liked };
      } else {
        message.error('操作失败');
        return null;
      }
    } catch (error) {
      console.error('点赞操作出错:', error);
      message.error(`操作失败: ${error.message}`);
      return null;
    }
  };
  
  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };
  
  // 加载中或错误状态显示
  if (loading) {
    return (
      <div className="post-detail-container">
        <Card className="post-detail-card">
          <Skeleton avatar active paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="post-detail-container">
        <Card className="post-detail-card">
          <div className="post-error">
            <h3>内容加载失败</h3>
            <p>{error || '未找到该动态'}</p>
            <Button type="primary" onClick={handleBack}>返回</Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // 媒体渲染
  const renderMedia = () => {
    if (!post.media || post.media.length === 0) {
      return null;
    }
    
    // 检查是否为多张图片/视频
    const hasMultipleMedia = post.media.length > 1;
    console.log(`动态有${post.media.length}个媒体文件`);
    
    return (
      <div className="post-media-container">
        {!hasMultipleMedia ? (
          // 单个媒体文件
          post.media[0].type === 'image' ? (
            <Image
              className="post-single-image"
              src={post.media[0].url}
              alt="动态图片"
            />
          ) : (
            <video
              className="post-single-video"
              src={post.media[0].url}
              controls
              poster={post.media[0].thumbnail_url}
            />
          )
        ) : (
          // 多个媒体文件
          <Carousel
            arrows
            dots
            style={{ width: '100%' }}
          >
            {post.media.map((media, index) => (
              <div key={index} className="post-carousel-item">
                {media.type === 'image' ? (
                  <Image
                    className="post-carousel-image"
                    src={media.url}
                    alt={`动态图片${index + 1}`}
                    preview={false} // 禁用默认预览，使用自定义预览
                  />
                ) : (
                  <video
                    className="post-carousel-video"
                    src={media.url}
                    controls
                    poster={media.thumbnail_url}
                  />
                )}
              </div>
            ))}
          </Carousel>
        )}
      </div>
    );
  };
  
  return (
    <div className="post-detail-container">
      <Button
        type="text"
        icon={<LeftOutlined />}
        onClick={handleBack}
        className="back-button"
      >
        返回
      </Button>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* 主内容卡片 */}
          <Card className="post-detail-card">
            {/* 作者信息 */}
            <div className="post-author">
              <Avatar src={post.user.avatar} size={48} />
              <div className="author-info">
                <h3>{post.user.name}</h3>
                <div className="post-meta">
                  <span className="post-time">
                    <CalendarOutlined /> {dayjs(post.time).fromNow()}
                  </span>
                  {post.visibility && (
                    <span className="post-visibility">
                      <EyeOutlined /> {
                        post.visibility === 'public' ? '公开' : 
                        post.visibility === 'school' ? '校内' : 
                        post.visibility === 'followers' ? '关注者' : '未知'
                      }
                    </span>
                  )}
                  {post.location && (
                    <span className="post-location">
                      <EnvironmentOutlined /> {post.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 动态内容 */}
            <div className="post-content">
              <Paragraph className="post-text">
                {post.content}
              </Paragraph>
              
              {/* 媒体内容 */}
              {renderMedia()}
              
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  <TagOutlined />
                  {post.tags.map((tag, index) => (
                    <Tag key={index} color="blue">{tag}</Tag>
                  ))}
                </div>
              )}
            </div>
            
            {/* 互动信息 */}
            <div className="post-actions">
              <Button
                type="text"
                icon={liked ? <LikeFilled /> : <LikeOutlined />}
                onClick={handleLike}
                className={liked ? 'liked' : ''}
              >
                赞 ({likeCount})
              </Button>
              <Button
                type="text"
                icon={<MessageOutlined />}
              >
                评论 ({commentCount})
              </Button>
              <Button
                type="text"
                icon={<ShareAltOutlined />}
              >
                分享
              </Button>
            </div>
            
            <Divider />
            
            {/* 评论区 */}
            <div className="post-comments">
              <CommentForm 
                onSubmit={handleCommentSubmit} 
                user={currentUser}
                postId={postId}
              />
              <CommentList 
                comments={comments} 
                loading={commentsLoading}
                total={commentCount}
                postId={postId}
                onAddComment={handleCommentSubmit}
                onLikeComment={handleCommentLike}
                user={currentUser}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          {/* 相关动态 */}
          <Card 
            title="相关动态" 
            className="related-posts-card"
            loading={relatedLoading}
          >
            {relatedPosts.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={relatedPosts}
                renderItem={item => (
                  <List.Item
                    className="related-post-item"
                    onClick={() => navigate(`/post/${item.post_id}`)}
                  >
                    {item.image_url && (
                      <div className="related-post-image">
                        <img src={item.image_url} alt={item.title} />
                      </div>
                    )}
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <div className="related-post-meta">
                          <span>{dayjs(item.time).fromNow()}</span>
                          <span>{item.likes} 赞</span>
                          <span>{item.comments} 评论</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="no-related-posts">
                <p>暂无相关动态</p>
              </div>
            )}
          </Card>
          
          {/* 用户信息卡片 */}
          <Card className="user-info-card">
            <div className="user-header">
              <Avatar src={post.user.avatar} size={64} />
              <div className="user-details">
                <h3>{post.user.name}</h3>
                <Button type="primary" size="small">关注</Button>
              </div>
            </div>
            {post.user.bio && (
              <Paragraph className="user-bio">
                {post.user.bio}
              </Paragraph>
            )}
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-value">{post.user.posts || '—'}</div>
                <div className="stat-label">动态</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{post.user.followers || '—'}</div>
                <div className="stat-label">关注者</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{post.user.following || '—'}</div>
                <div className="stat-label">关注</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PostDetailPage;

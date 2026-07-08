/**
 * 首页组件
 * 
 * 功能：
 * - 展示用户动态信息流
 * - 显示热门话题和标签
 * - 提供个性化推荐内容
 * - 支持点赞、评论互动
 * - 内容分页加载
 * - 热门话题实时更新
 * - 智能推荐算法
 */
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Pagination, Button, Tooltip, Tabs, Tag, Card, List, Avatar, Badge, Carousel, Skeleton, message } from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  CommentOutlined,
  EnvironmentOutlined,
  FireOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  StarOutlined,
  TrophyOutlined,
  EyeOutlined,
  ShopOutlined,
  TeamOutlined,
  BellOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FloatingButton from '../components/common/FloatingButton';
import CommentDrawer from '../components/comment/CommentDrawer';
import { homeApi } from '../utils/api';
import '../assets/styles/Home.css';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 设置dayjs本地化和相对时间插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');
const { Content } = Layout;

/**
 * 首页组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 深色模式状态
 * @param {function} props.toggleDarkMode - 切换深色模式的函数
 * @returns {JSX.Element} 首页组件
 */
const Home = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [feedTab, setFeedTab] = useState('recommended');
  const [displayPosts, setDisplayPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [hotTopics, setHotTopics] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
  const pageSize = 8;
  
  // 从API获取热门话题
  useEffect(() => {
    const fetchHotTopics = async () => {
      try {
        setLoading(true);
        const response = await homeApi.getHotTopics();
        
        if (response.success) {
          setHotTopics(response.data);
        } else {
          console.error('获取热门话题失败:', response.message);
        }
      } catch (error) {
        console.error('获取热门话题出错:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotTopics();
  }, []);
  
  // 从API获取推荐用户
  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        setLoading(true);
        const response = await homeApi.getRecommendedUsers();
        
        if (response.success) {
          setRecommendedUsers(response.data);
        } else {
          console.error('获取推荐用户失败:', response.message);
        }
      } catch (error) {
        console.error('获取推荐用户出错:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedUsers();
  }, []);
  
  // 从API获取轮播内容
  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        setLoading(true);
        const response = await homeApi.getCarousel();
        
        if (response.success) {
          setCarouselItems(response.data);
        } else {
          console.error('获取轮播内容失败:', response.message);
        }
      } catch (error) {
        console.error('获取轮播内容出错:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarouselItems();
  }, []);
  
  // 从API获取动态内容
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const params = {
          page: currentPage,
          limit: pageSize,
          feed: feedTab
        };
        
        if (selectedTags.length > 0) {
          params.tag = selectedTags[0];
        }
        
        const response = await homeApi.getPosts(params);
        
        if (response.success) {
          setDisplayPosts(response.data.posts);
          setTotalPosts(response.data.pagination.total);
        } else {
          console.error('获取动态内容失败:', response.message);
        }
      } catch (error) {
        console.error('获取动态内容出错:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage, pageSize, feedTab, selectedTags]);
  
  /**
   * 处理点赞操作
   * @param {number} postId - 动态ID
   */
  const handleLike = async (postId, e) => {
    // 阻止事件冒泡，避免触发卡片点击事件
    e.stopPropagation();
    
    // 乐观更新UI
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    try {
      // 发送服务器请求
      const response = await homeApi.likePost(postId);
      
      // 如果结果与预期不一致，回滚UI更新
      if (!response.success || response.liked !== likedPosts[postId]) {
        setLikedPosts(prev => ({
          ...prev,
          [postId]: response.liked
        }));
      }
    } catch (error) {
      console.error('点赞请求失败:', error);
      // 出错时回滚
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
    }
  };
  
  /**
   * 处理评论操作
   * @param {number} postId - 动态ID
   */
  const handleComment = (post, e) => {
    // 阻止事件冒泡，避免触发卡片点击事件
    e.stopPropagation();
    
    setCurrentPost({
      id: post.post_id,
      title: post.title,
      content: post.content,
      comments: post.comments
    });
    setCommentDrawerVisible(true);
  };

  /**
   * 关闭评论抽屉
   */
  const handleCloseCommentDrawer = () => {
    setCommentDrawerVisible(false);
    setCurrentPost(null);
  };
  
  /**
   * 处理分页切换
   * @param {number} page - 页码
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 回到顶部
    document.querySelector('.app-content').scrollTop = 0;
  };

  /**
   * 处理卡片点击跳转到动态详情页
   * @param {number} postId - 动态ID
   */
  const handlePostCardClick = (postId) => {
    console.log('点击动态卡片，跳转到详情页:', postId);
    if (postId) {
      navigate(`/post/${postId}`);
    } else {
      console.error('无效的动态ID');
      message.error('无法查看详情：动态ID无效');
    }
  };

  /**
   * 处理标签点击
   * @param {string} tag - 标签名称
   */
  const handleTagClick = (tag, e) => {
    // 阻止事件冒泡，避免触发卡片点击事件
    e.stopPropagation();
    
    console.log(`查看标签: ${tag}`);
    setSelectedTags([tag]);
    setCurrentPage(1); // 重置到第一页
  };
  
  /**
   * 处理关注/取消关注用户
   * @param {number} userId - 用户ID
   */
  const handleFollowUser = (userId) => {
    setFollowedUsers({
      ...followedUsers,
      [userId]: !followedUsers[userId]
    });
    
    // 这里可以添加关注用户的API请求
  };
  
  /**
   * 获取热门话题，按趋势和热度排序
   * @returns {Array} 排序后的热门话题
   */
  const getSortedHotTopics = () => {
    if (!hotTopics || hotTopics.length === 0) {
      return [];
    }
    
    return [...hotTopics].sort((a, b) => {
      // 优先按trending排序
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      
      // 然后按hot排序
      if (a.hot && !b.hot) return -1;
      if (!a.hot && b.hot) return 1;
      
      // 最后按count排序
      return b.count - a.count;
    });
  };

  return (
    <Layout className="app-layout">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content>
          {/* 轮播图区域 */}
          <div className="carousel-container">
            <Carousel autoplay className="home-carousel">
              {carouselItems.map(item => (
                <div key={item.carousel_id} className="carousel-item">
                  <div className="carousel-content" style={{backgroundImage: `url(${item.image_url})`}}>
                    <div className="carousel-overlay">
                      <h3>{item.title}</h3>
                      <Button type="primary" ghost>了解更多</Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
          
          <Row gutter={[24, 24]}>
            {/* 左侧边栏：热门话题和推荐用户 */}
            <Col xs={24} md={6}>
              <div className="sidebar-container">
                {/* 热门话题区域 */}
                <Card 
                  title={<div className="section-title"><FireOutlined /> 热门话题</div>} 
                  className="topic-card"
                  extra={<Button type="link" size="small">更多</Button>}
                >
                  <div className="topic-list">
                    {getSortedHotTopics().slice(0, 10).map(topic => (
                      <Tag 
                        key={topic.tag_id}
                        color={topic.trending ? "volcano" : topic.hot ? "blue" : "default"}
                        className="topic-tag"
                        onClick={(e) => handleTagClick(topic.tag_name, e)}
                      >
                        {topic.tag_name}
                        {topic.trending && <Badge status="processing" className="trending-badge" />}
                        <span className="topic-count">{topic.count}</span>
                      </Tag>
                    ))}
                  </div>
                </Card>
                
                {/* 推荐用户区域 */}
                <Card 
                  title={<div className="section-title"><StarOutlined /> 推荐关注</div>} 
                  className="recommend-card"
                  extra={<Button type="link" size="small">换一批</Button>}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={recommendedUsers}
                    renderItem={user => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={user.avatar} size="large" />}
                          title={
                            <div className="user-title">
                              <span className="user-name">{user.name}</span>
                              <Tooltip title={`信用分: ${user.creditScore}`}>
                                <span className={`credit-score ${user.creditScore >= 90 ? 'high' : user.creditScore >= 80 ? 'medium' : 'low'}`}>
                                  {user.creditScore}
                                </span>
                              </Tooltip>
                            </div>
                          }
                          description={
                            <div className="user-info">
                              <span className="follower-count">{user.followers} 粉丝</span>
                              <div className="user-tags">
                                {user.tags.map((tag, index) => (
                                  <Tag key={index} color="blue" className="small-tag">{tag}</Tag>
                                ))}
                              </div>
                            </div>
                          }
                        />
                        <Button 
                          size="small" 
                          type={followedUsers[user.id] ? "default" : "primary"}
                          onClick={() => handleFollowUser(user.id)}
                        >
                          {followedUsers[user.id] ? "已关注" : "关注"}
                        </Button>
                      </List.Item>
                    )}
                  />
                </Card>
                
                {/* 校园活动快捷入口 */}
                <Card 
                  title={<div className="section-title"><TeamOutlined /> 校园活动</div>} 
                  className="shortcut-card"
                  variant="bordered"
                >
                  <div className="shortcut-container">
                    <div className="shortcut-item">
                      <div className="shortcut-icon trophy">
                        <TrophyOutlined />
                      </div>
                      <span>悬赏任务</span>
                    </div>
                    <div className="shortcut-item">
                      <div className="shortcut-icon shop">
                        <ShopOutlined />
                      </div>
                      <span>校园集市</span>
                    </div>
                    <div className="shortcut-item">
                      <div className="shortcut-icon study">
                        <BellOutlined />
                      </div>
                      <span>通知公告</span>
                    </div>
                    <div className="shortcut-item">
                      <div className="shortcut-icon activity">
                        <EyeOutlined />
                      </div>
                      <span>发现更多</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
            
            {/* 主内容区：动态内容 */}
            <Col xs={24} md={18}>
              {/* 内容分类标签页 */}
              <div className="content-tabs">
                <Tabs 
                  activeKey={feedTab} 
                  onChange={setFeedTab}
                  className="feed-tabs"
                  items={[
                    {
                      key: 'recommended',
                      label: <span><RiseOutlined /> 推荐</span>
                    },
                    {
                      key: 'latest',
                      label: <span><ThunderboltOutlined /> 最新</span>
                    },
                    {
                      key: 'hot',
                      label: <span><FireOutlined /> 热门</span>
                    }
                  ]}
                />
                
                {/* 显示已选标签 */}
                {selectedTags.length > 0 && (
                  <div className="selected-tags">
                    <span>当前筛选: </span>
                    {selectedTags.map(tag => (
                      <Tag 
                        key={tag} 
                        closable 
                        onClose={() => setSelectedTags([])}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 动态内容列表 */}
              <Row gutter={[16, 16]}>
                {loading ? (
                  // 加载状态
                  Array(4).fill().map((_, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`}>
                      <Card className="post-card skeleton-card" variant="bordered">
                        <Skeleton.Image className="skeleton-image" active />
                        <Skeleton active paragraph={{ rows: 3 }} />
                      </Card>
                    </Col>
                  ))
                ) : (
                  displayPosts.map(post => (
                    <Col xs={24} sm={12} md={8} lg={6} key={post.post_id}>
                      <div 
                        className="post-card" 
                        onClick={() => handlePostCardClick(post.post_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {post.trending && (
                          <div className="trending-flag">
                            <FireOutlined /> 热门
                          </div>
                        )}
                        <div className="post-image-container">
                          <img alt={post.title} src={post.image_url} className="post-image" />
                        </div>
                        <div className="post-content-container">
                          <h3 className="post-title">{post.title}</h3>
                          <p className="post-content">{post.content}</p>
                          
                          {/* 标签显示 */}
                          <div className="post-tags">
                            {post.tags && post.tags.map((tag, index) => (
                              <Tag 
                                key={index} 
                                color="blue" 
                                className="post-tag" 
                                onClick={(e) => {
                                  e.stopPropagation(); // 确保阻止事件冒泡到卡片
                                  handleTagClick(tag, e);
                                }}
                              >
                                {tag}
                              </Tag>
                            ))}
                          </div>
                          
                          <div className="post-location">
                            <EnvironmentOutlined /> {post.location}
                          </div>
                          <div className="post-user">
                            <img src={post.user.avatar} alt={post.user.name} className="post-avatar" />
                            <div className="user-info">
                              <span className="username">{post.user.name}</span>
                              <span className="post-time">{dayjs(post.time).fromNow()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="post-actions">
                          <div className="post-action" onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            handleLike(post.post_id, e);
                          }}>
                            {likedPosts[post.post_id] ? 
                              <HeartFilled className="liked" /> : 
                              <HeartOutlined />
                            }
                            <span>{likedPosts[post.post_id] ? post.likes + 1 : post.likes}</span>
                          </div>
                          <div className="post-action" onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            handleComment(post, e);
                          }}>
                            <CommentOutlined />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))
                )}
              </Row>
              
              {/* 分页器 */}
              <div className="pagination-container">
                <Pagination 
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalPosts}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </Col>
          </Row>
          
          {/* 评论抽屉 */}
          <CommentDrawer
            visible={commentDrawerVisible}
            onClose={handleCloseCommentDrawer}
            post={currentPost}
          />
          
          {/* 添加悬浮按钮 */}
          <FloatingButton />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home; 
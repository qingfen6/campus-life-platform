/**
 * 商品详情页面组件
 * 
 * 功能：
 * - 展示商品详细信息
 * - 显示商品多张图片和轮播图
 * - 提供评论、收藏、砍价和购买功能
 * - 展示卖家信息和联系方式
 * - 显示相关商品推荐
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, Row, Col, Typography, Button, Card, Tag, Space, Avatar, Image, 
  Divider, Carousel, Badge, Skeleton, message, Tabs, Descriptions, List, Comment, Result
} from 'antd';
import { 
  HeartOutlined, HeartFilled, ShoppingCartOutlined, ScissorOutlined,
  ShareAltOutlined, EnvironmentOutlined, SafetyOutlined, ContactsOutlined,
  StarFilled, MessageOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BargainModal from '../components/market/BargainModal';
import ProductCard from '../components/market/ProductCard';
import CommentSection from '../components/comment/CommentSection';
import { marketApi, homeApi, orderApi } from '../utils/api';
import '../assets/styles/ProductDetailPage.css';
import { useDispatch, useSelector } from 'react-redux';
import { openChatPopup } from '../store/slices/chatPopupSlice';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * 商品详情页面组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 商品详情页面
 */
const ProductDetailPage = ({ darkMode, toggleDarkMode }) => {
  // 获取路由参数中的商品ID
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 状态定义
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [bargainModalVisible, setBargainModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [commentsVisible, setCommentsVisible] = useState(false);
  
  const dispatch = useDispatch();
  
  // Obtener el usuario actual del estado de Redux (o de donde sea que lo manejes)
  const currentUser = useSelector(state => state.user?.profile);
  
  // 获取商品详情
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await marketApi.getProductDetail(productId);
        
        if (response.success) {
          setProduct(response.data);
          
          // 获取相关商品（同类别）
          const relatedResponse = await marketApi.getProducts({
            category: response.data.category,
            limit: 4
          });
          
          if (relatedResponse.success) {
            // 过滤掉当前商品
            const filteredProducts = relatedResponse.data.products.filter(
              p => p.id !== parseInt(productId)
            );
            setRelatedProducts(filteredProducts);
          }
        } else {
          message.error('获取商品详情失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取商品详情出错:', error);
        message.error('获取商品详情出错: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetail();
  }, [productId]);
  
  // 处理收藏/取消收藏
  const handleLike = async () => {
    try {
      if (isLiked) {
        await marketApi.unlikeProduct(productId);
        message.success('已取消收藏');
      } else {
        await marketApi.likeProduct(productId);
        message.success('已收藏');
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('操作收藏失败:', error);
      message.error('操作失败: ' + error.message);
    }
  };
  
  // 处理砍价提交
  const handleBargainSubmit = async (price, message) => {
    try {
      setSubmitting(true);
      const response = await marketApi.bargainProduct(productId, price, message);
      
      if (response.success) {
        setBargainModalVisible(false);
        message.success('砍价请求已发送，等待卖家回复');
      } else {
        message.error('砍价失败: ' + response.message);
      }
    } catch (error) {
      console.error('砍价失败:', error);
      message.error('砍价失败: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 处理购买
  const handleBuy = async () => {
    if (!product) {
        message.error('商品信息尚未加载，请稍候。');
        return;
    }
    if (product.is_sold || product.status !== 'active') {
        message.warn('抱歉，该商品已售出或当前不可购买。');
        return;
    }
    if (currentUser && product.seller && currentUser.id === product.seller.id) {
        message.warn('您不能购买自己发布的商品。');
        return;
    }

    setIsBuying(true);
    message.loading({ content: '正在创建订单...', key: 'buyProcess' });

    try {
        const orderData = {
            productId: product.id, // o el productId que tengas
            // buyer_address: '...' // si es necesario
        };
        const response = await orderApi.createOrder(orderData);

        if (response.success && response.orderId) {
            message.success({ content: '订单创建成功！正在跳转到支付页面...', key: 'buyProcess', duration: 2 });
            // Redirigir a la página de pago simulado con los datos necesarios
            navigate(`/mock-payment?orderId=${response.orderId}&amount=${response.amount}&productTitle=${encodeURIComponent(response.productTitle)}&productIdFromPreviousPage=${product.id}`);
            // Se añade productIdFromPreviousPage para el botón de "cancelar" o "volver"
        } else {
            message.error({ content: `创建订单失败: ${response.message || '未知错误'}`, key: 'buyProcess', duration: 5 });
        }
    } catch (error) {
        console.error('处理购买出错 (ProductDetailPage):', error);
        message.error({ content: `创建订单时发生错误: ${error.message || '请稍后再试'}`, key: 'buyProcess', duration: 5 });
    } finally {
        setIsBuying(false);
    }
  };
  
  // 处理联系卖家
  const handleContactSeller = () => {
    if (product && product.seller && product.seller.id) {
       const sellerInfo = {
          id: product.seller.id,
          name: product.seller.name,
          avatar: product.seller.avatar
       };
       console.log(`[Product Detail] Dispatching openChatPopup for seller:`, sellerInfo);
       dispatch(openChatPopup(sellerInfo)); // Dispatch action
    } else {
       console.error('[Product Detail] Seller information is missing, cannot contact.');
       message.error('无法获取卖家信息，暂时无法联系');
    }
  };
  
  // 处理返回上一页
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 处理评论展示
  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };
  
  // 获取商品状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: '在售' },
      'reserved': { color: 'orange', text: '已预定' },
      'sold': { color: 'red', text: '已售出' },
      'expired': { color: 'gray', text: '已过期' },
      'deleted': { color: 'gray', text: '已删除' }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };
  
  // 获取商品状态标签
  const getConditionTag = (condition) => {
    const conditionMap = {
      'new': { color: 'green', text: '全新' },
      'like_new': { color: 'cyan', text: '几乎全新' },
      'good': { color: 'blue', text: '良好' },
      'fair': { color: 'orange', text: '较旧' },
      'poor': { color: 'red', text: '旧' }
    };
    
    const conditionInfo = conditionMap[condition] || { color: 'default', text: '未知' };
    return <Tag color={conditionInfo.color}>{conditionInfo.text}</Tag>;
  };
  
  // 商品详情骨架屏
  const renderSkeleton = () => (
    <div className="product-detail-skeleton">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Skeleton.Image className="product-image-skeleton" active />
          <Row gutter={[8, 8]} className="mt-2">
            {[1, 2, 3, 4].map(i => (
              <Col span={6} key={i}>
                <Skeleton.Image className="product-thumbnail-skeleton" active />
              </Col>
            ))}
          </Row>
        </Col>
        <Col xs={24} md={12}>
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Button active size="large" className="mt-2" />
          <Skeleton active paragraph={{ rows: 3 }} className="mt-3" />
          <Skeleton.Button active size="large" className="mt-3" />
          <Skeleton.Button active size="large" className="mt-2 ml-2" />
        </Col>
      </Row>
      <Divider />
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
  
  // 如果正在加载商品详情，显示加载状态
  if (loading) {
    return (
      <Layout className="app-layout">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Layout>
          <Sidebar />
          <Content className="main-content">
            <div className="go-back-btn">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={handleGoBack}
              >
                返回
              </Button>
            </div>
            <div className="product-detail-container">
              {renderSkeleton()}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
  
  // 如果商品不存在
  if (!product) {
    return (
      <Layout className="app-layout">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Layout>
          <Sidebar />
          <Content className="main-content">
            <div className="product-detail-container">
              <Result
                status="404"
                title="商品不存在"
                subTitle="您查看的商品不存在或已被删除"
                extra={
                  <Button type="primary" onClick={() => navigate('/market')}>
                    返回集市
                  </Button>
                }
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
  
  // 计算折扣
  const discount = product.originalPrice ? 
    Math.round(100 - (product.price / product.originalPrice * 100)) : null;
  
  return (
    <Layout className="app-layout">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Layout>
        <Sidebar />
        <Content className="main-content">
          <div className="go-back-btn">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
            >
              返回
            </Button>
          </div>
          
          <div className="product-detail-container">
            <Row gutter={[24, 24]}>
              {/* 商品图片区 */}
              <Col xs={24} md={12}>
                <div className="product-image-container">
                  {discount && discount > 0 && (
                    <Badge.Ribbon 
                      text={`${discount}% OFF`} 
                      color="red"
                      className="discount-badge"
                    />
                  )}
                  <Carousel autoplay className="product-image-carousel">
                    {product.images && product.images.length > 0 ? (
                      product.images.map((image, index) => (
                        <div key={index} className="carousel-item">
                          <Image
                            src={image}
                            alt={`${product.title} - 图片 ${index + 1}`}
                            className="product-main-image"
                            fallback="https://via.placeholder.com/400x400?text=No+Image"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="carousel-item">
                        <Image
                          src="https://via.placeholder.com/400x400?text=No+Image"
                          alt="暂无图片"
                          className="product-main-image"
                        />
                      </div>
                    )}
                  </Carousel>
                  
                  {/* 缩略图 */}
                  {product.images && product.images.length > 1 && (
                    <Row gutter={[8, 8]} className="product-thumbnails">
                      {product.images.slice(0, 4).map((image, index) => (
                        <Col span={6} key={index}>
                          <Image
                            src={image}
                            alt={`缩略图 ${index + 1}`}
                            className="product-thumbnail"
                            fallback="https://via.placeholder.com/100x100?text=No+Image"
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Col>
              
              {/* 商品信息区 */}
              <Col xs={24} md={12}>
                <div className="product-info">
                  <div className="product-title-section">
                    <Title level={3}>{product.title}</Title>
                    <Space>
                      {getStatusTag(product.status)}
                      {getConditionTag(product.condition)}
                      {product.bargain && (
                        <Tag color="purple" icon={<ScissorOutlined />}>可议价</Tag>
                      )}
                    </Space>
                  </div>
                  
                  <div className="product-price-section">
                    <Text className="current-price">¥{product.price}</Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Text className="original-price" delete>¥{product.originalPrice}</Text>
                    )}
                    {discount && discount > 0 && (
                      <Tag color="red" className="discount-tag">{discount}% 折扣</Tag>
                    )}
                  </div>
                  
                  <div className="product-meta">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">分类：</Text>
                        <Tag>{product.category}</Tag>
                      </div>
                      
                      <div>
                        <Text type="secondary">发布时间：</Text>
                        <Text>{new Date(product.time).toLocaleString()}</Text>
                      </div>
                      
                      <div>
                        <Text type="secondary">浏览次数：</Text>
                        <Text>{product.viewCount}</Text>
                      </div>
                      
                      {product.location && (
                        <div>
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          <Text>{product.location}</Text>
                        </div>
                      )}
                    </Space>
                  </div>
                  
                  <Divider />
                  
                  <div className="seller-info">
                    <Space>
                      <Avatar 
                        src={product.seller.avatar || "https://via.placeholder.com/50x50?text=User"} 
                        size="large"
                      />
                      <div>
                        <div>{product.seller.name}</div>
                        <div className="seller-rating">
                          <StarFilled style={{ color: '#ffc53d' }} />
                          <Text>4.8</Text>
                          <Text type="secondary">（32 评价）</Text>
                        </div>
                      </div>
                    </Space>
                    <Button 
                      type="default" 
                      icon={<ContactsOutlined />}
                      onClick={handleContactSeller}
                    >
                      联系卖家
                    </Button>
                  </div>
                  
                  <div className="product-actions">
                    <Button 
                      icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      onClick={handleLike}
                    >
                      {isLiked ? '已收藏' : '收藏'}
                    </Button>
                    
                    <Button
                      type="default"
                      icon={<MessageOutlined />}
                      onClick={toggleComments}
                    >
                      评论
                    </Button>
                    
                    <Button
                      type="default"
                      icon={<ShareAltOutlined />}
                    >
                      分享
                    </Button>
                    
                    {product.bargain && (
                      <Button 
                        type="primary" 
                        ghost
                        icon={<ScissorOutlined />}
                        onClick={() => setBargainModalVisible(true)}
                      >
                        砍价
                      </Button>
                    )}
                    
                    <Button 
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleBuy}
                      loading={isBuying}
                      disabled={isBuying || (product && (product.is_sold || product.status !== 'active'))}
                    >
                      {product && (product.is_sold || product.status !== 'active') ? '已售罄' : '立即购买'}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            {/* 详细描述和评论区 */}
            <div className="product-detail-tabs">
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
              >
                <TabPane tab="商品描述" key="description">
                  <div className="product-description">
                    <Card bordered={false}>
                      <Paragraph>
                        {product.description || '卖家没有提供详细描述'}
                      </Paragraph>
                      
                      <Divider />
                      
                      <Descriptions title="商品详情" bordered column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="商品分类">{product.category}</Descriptions.Item>
                        <Descriptions.Item label="商品状态">{getConditionTag(product.condition)}</Descriptions.Item>
                        <Descriptions.Item label="交易地点">{product.location || '未指定'}</Descriptions.Item>
                        <Descriptions.Item label="是否可议价">{product.bargain ? '是' : '否'}</Descriptions.Item>
                        <Descriptions.Item label="发布时间">{new Date(product.time).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="浏览次数">{product.viewCount}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                </TabPane>
                
                <TabPane tab="买家须知" key="notice">
                  <Card bordered={false}>
                    <div className="buyer-notice">
                      <Title level={4}>购买须知</Title>
                      <Paragraph>
                        <ul>
                          <li>商品以实物为准，图片仅供参考</li>
                          <li>建议在校园内见面交易，当面检查物品</li>
                          <li>交易前请详细沟通物品细节，避免交易纠纷</li>
                          <li>若对物品有疑问，请联系卖家获取更多信息</li>
                          <li>平台仅提供信息展示服务，请自行判断商品真实性</li>
                        </ul>
                      </Paragraph>
                      
                      <Title level={4}>退换政策</Title>
                      <Paragraph>
                        <ul>
                          <li>二手交易一般不支持无理由退换</li>
                          <li>如商品与描述严重不符，可与卖家协商退换</li>
                          <li>平台不提供担保交易服务，请谨慎交易</li>
                        </ul>
                      </Paragraph>
                    </div>
                  </Card>
                </TabPane>
              </Tabs>
            </div>
            
            {/* 评论区 */}
            {commentsVisible && (
              <div className="product-comments">
                <Card
                  title="商品评论"
                  extra={
                    <Button 
                      type="text" 
                      onClick={toggleComments}
                    >
                      关闭
                    </Button>
                  }
                  className="comments-card"
                >
                  <CommentSection 
                    contentType="product" 
                    contentId={productId}
                  />
                </Card>
              </div>
            )}
            
            {/* 相关商品推荐 */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="related-products">
                <Divider orientation="left">相关商品推荐</Divider>
                <Row gutter={[16, 16]}>
                  {relatedProducts.map(item => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                      <ProductCard 
                        product={item}
                        isLiked={false} 
                        onLike={() => {}}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
          
          {/* 砍价模态框 */}
          <BargainModal
            visible={bargainModalVisible}
            onClose={() => setBargainModalVisible(false)}
            onSubmit={handleBargainSubmit}
            product={product}
            loading={submitting}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductDetailPage; 
import React from 'react';
import { Card, Badge, Tag, Avatar, Space, Button, Typography, Tooltip, message } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import '../../assets/styles/ProductCard.css';
import noImagePlaceholder from '../../assets/images/no-image.png';
import { useDispatch } from 'react-redux';
import { openChatPopup } from '../../store/slices/chatPopupSlice';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Title } = Typography;

/**
 * 商品卡片组件
 * @param {Object} product - 商品数据
 * @param {Boolean} isLiked - 是否已收藏
 * @param {Function} onLike - 收藏点击处理函数
 * @param {Function} onBargain - 砍价点击处理函数
 * @param {Function} onContact - 联系卖家点击处理函数
 */
const ProductCard = ({ 
  product, 
  isLiked, 
  onLike, 
  onBargain, 
  onContact 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const conditionMap = {
    'new': { color: 'green', text: '全新' },
    'like_new': { color: 'cyan', text: '几乎全新' },
    'good': { color: 'blue', text: '良好' },
    'used': { color: 'orange', text: '使用过' },
    'poor': { color: 'red', text: '破损' }
  };

  // 格式化价格
  const formatPrice = (price) => {
    return `¥${parseFloat(price).toFixed(2)}`;
  };

  // 计算折扣
  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }
    
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    return discount > 0 ? discount : null;
  };
  
  // 处理商品点击，跳转到详情页
  const handleCardClick = () => {
    navigate(`/market/product/${product.id}`);
  };

  const discount = calculateDiscount();
  const condition = conditionMap[product.condition] || { color: 'default', text: '未知' };
  const postTime = product.time ? dayjs(product.time).fromNow() : '未知时间';

  return (
    <Card
      className="product-card"
      cover={
        <div className="product-image-container" onClick={handleCardClick}>
          {discount && (
            <Badge.Ribbon 
              className="discount-ribbon" 
              text={`${discount}% OFF`} 
              color="red"
            />
          )}
          <img
            alt={product.title}
            src={product.imageUrl || noImagePlaceholder}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = noImagePlaceholder;
            }}
          />
        </div>
      }
      actions={[
        <Tooltip title={isLiked ? '取消收藏' : '收藏'}>
          <Button 
            type="text" 
            icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onLike(product.id);
            }}
          />
        </Tooltip>,
        <Tooltip title="联系卖家">
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (product && product.seller && product.seller.id) {
                const sellerInfo = {
                  id: product.seller.id,
                  name: product.seller.name,
                  avatar: product.seller.avatar
                };
                console.log(`[Product Card] Dispatching openChatPopup for seller:`, sellerInfo);
                dispatch(openChatPopup(sellerInfo));
              } else {
                message.error('无法获取卖家信息');
                console.error('[Product Card] Seller information missing for product:', product);
              }
            }}
          />
        </Tooltip>,
        <Tooltip title="议价">
          <Button 
            type="text" 
            icon={<ShoppingOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onBargain && onBargain(product);
            }}
          />
        </Tooltip>
      ]}
      onClick={handleCardClick}
      hoverable
    >
      <div className="product-title" onClick={handleCardClick}>
        <Title level={5} ellipsis={{ rows: 2 }}>{product.title}</Title>
      </div>
      
      <div className="product-price" onClick={handleCardClick}>
        <Text className="current-price" strong>{formatPrice(product.price)}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <Text className="original-price" delete>{formatPrice(product.originalPrice)}</Text>
        )}
      </div>
      
      <div className="product-meta" onClick={handleCardClick}>
        <Space>
          <Tag color={condition.color}>{condition.text}</Tag>
          {product.bargain && <Tag color="purple">可议价</Tag>}
          {product.category && <Tag>{product.category}</Tag>}
        </Space>
      </div>
      
      <div className="seller-info" onClick={handleCardClick}>
        <Space>
          <Avatar size="small" src={product.seller.avatar || noImagePlaceholder} />
          <Text className="seller-name">{product.seller.name || '匿名用户'}</Text>
        </Space>
        <Text className="post-time">{postTime}</Text>
      </div>
    </Card>
  );
};

export default ProductCard; 
/**
 * 校园集市商品卡片组件
 * 
 * 功能：
 * - 展示商品信息（图片、标题、价格等）
 * - 显示折扣信息和商品状态
 * - 提供收藏、咨询和购买按钮
 * - 支持砍价功能
 * - 支持网格和列表两种显示模式
 */
import React from 'react';
import { Card, Tag, Avatar, Button, Tooltip, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  HeartOutlined, 
  HeartFilled, 
  MessageOutlined, 
  ShoppingCartOutlined,
  StarFilled,
  EnvironmentOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import '../../assets/styles/MarketCard.css';

/**
 * 校园集市商品卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.product - 商品信息对象
 * @param {Function} props.onLike - 收藏按钮点击处理函数
 * @param {boolean} props.isLiked - 是否已收藏
 * @param {Function} props.onBargain - 砍价按钮点击处理函数
 * @param {string} props.viewType - 视图类型 'grid' 或 'list'
 * @returns {JSX.Element} 商品卡片
 */
const MarketCard = ({ product, onLike, isLiked, onBargain, viewType = 'grid' }) => {
  const navigate = useNavigate();
  
  const { 
    id, 
    title, 
    price, 
    originalPrice, 
    imageUrl, 
    seller, 
    condition, 
    tags, 
    time,
    bargain,
    location
  } = product;

  // 计算折扣百分比
  const discountPercentage = originalPrice 
    ? Math.round(100 - (price / originalPrice * 100)) 
    : 0;

  // 商品状态标签颜色
  const conditionColor = condition === 'new' ? '#52c41a' : '#1890ff';
  
  // 商品状态文本
  const conditionText = condition === 'new' ? '全新' : '几乎全新';
  
  // 跳转到商品详情页
  const handleCardClick = () => {
    navigate(`/market/product/${id}`);
  };

  return (
    <Card 
      className={`market-card ${viewType === 'list' ? 'list-view' : ''}`}
      cover={viewType === 'grid' ? (
        <div className="market-card-img-container" onClick={handleCardClick}>
          {originalPrice && discountPercentage > 0 && (
            <div className="discount-badge">
              <span>{discountPercentage}%</span>
              <span>OFF</span>
            </div>
          )}
          <img alt={title} src={imageUrl} className="market-card-img" />
        </div>
      ) : null}
      onClick={handleCardClick}
      hoverable
    >
      {viewType === 'list' && (
        <div className="list-image-container" onClick={handleCardClick}>
          {originalPrice && discountPercentage > 0 && (
            <div className="discount-badge">
              <span>{discountPercentage}%</span>
              <span>OFF</span>
            </div>
          )}
          <img alt={title} src={imageUrl} className="list-image" />
        </div>
      )}
      
      <div className="market-card-content">
        <div className="market-card-tags">
          <Tag color={conditionColor}>{conditionText}</Tag>
          {bargain && <Tag color="volcano" icon={<ScissorOutlined />}>可砍价</Tag>}
          {tags && tags.map((tag, index) => (
            <Tag key={index} className="product-tag">{tag}</Tag>
          ))}
        </div>
        
        <div className="market-card-title" onClick={handleCardClick}>{title}</div>
        
        <div className="market-card-price" onClick={handleCardClick}>
          <span className="current-price">¥{price}</span>
          {originalPrice && (
            <span className="original-price">¥{originalPrice}</span>
          )}
        </div>
        
        <div className="market-card-seller" onClick={handleCardClick}>
          <Avatar 
            src={seller.avatar} 
            size="small" 
            className="seller-avatar" 
          />
          <span className="seller-name">{seller.name}</span>
          <div className="seller-rating">
            <StarFilled className="rating-icon" />
            <span>{seller.rating}</span>
          </div>
        </div>
        
        <div className="market-card-meta" onClick={handleCardClick}>
          <span className="market-card-time">{time}</span>
          <span className="market-card-location">
            <EnvironmentOutlined /> {location}
          </span>
        </div>
        
        <div className="market-card-actions">
          <Tooltip title={isLiked ? "取消收藏" : "收藏"}>
            <Button 
              type="text" 
              icon={isLiked ? <HeartFilled className="liked" /> : <HeartOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onLike(id);
              }}
              className="action-button like-button"
            />
          </Tooltip>
          
          <Tooltip title="咨询">
            <Button 
              type="text" 
              icon={<MessageOutlined />} 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                // 咨询功能待实现
              }}
            />
          </Tooltip>
          
          {bargain ? (
            <Tooltip title="砍价">
              <Button 
                type="primary" 
                ghost
                icon={<ScissorOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onBargain();
                }}
                className="action-button bargain-button"
              >
                砍价
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="购买">
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                className="action-button buy-button"
                onClick={(e) => {
                  e.stopPropagation();
                  // 购买功能待实现
                }}
              >
                购买
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MarketCard; 
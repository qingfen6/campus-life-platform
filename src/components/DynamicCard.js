/**
 * 动态信息卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.post - 动态数据对象
 * @param {number} props.post.id - 动态ID
 * @param {string} props.post.username - 发布者用户名
 * @param {string} props.post.avatar - 发布者头像
 * @param {string} props.post.content - 动态内容
 * @param {string[]} props.post.images - 图片URL数组
 * @param {string} props.post.time - 发布时间
 * @param {number} props.post.likes - 点赞数
 * @param {number} props.post.comments - 评论数
 * @param {string[]} props.post.tags - 标签数组
 * @param {boolean} props.post.isLiked - 是否已点赞
 * @param {Function} props.onLike - 点赞回调函数
 * @param {Function} props.onComment - 评论回调函数
 * @param {Function} props.onShare - 分享回调函数
 * @param {Function} props.onImagePreview - 图片预览回调函数
 * @param {Function} props.onFollow - 关注用户回调函数
 * @param {boolean} props.isFollowed - 是否已关注
 * @param {Function} props.onClick - 卡片点击回调函数
 * @returns {JSX.Element} 动态信息卡片组件
 */
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
  const { 
    id, 
    username, 
    avatar, 
    content, 
    images, 
    time, 
    likes, 
    comments,
    tags,
    isLiked
  } = post;

  // 根据图片数量确定网格布局
  const getImageGrid = () => {
    if (!images || images.length === 0) return null;
    
    if (images.length === 1) {
      return (
        <div className="single-image">
          <Image
            src={images[0]}
            alt="动态图片"
            style={{ maxHeight: 250, objectFit: 'cover', borderRadius: '8px' }}
            preview={false}
            onClick={() => onImagePreview(images, 0)}
          />
        </div>
      );
    }
    
    return (
      <div className="dynamic-image-grid">
        {images.slice(0, 6).map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`动态图片${index + 1}`}
            preview={false}
            onClick={() => onImagePreview(images, index)}
          />
        ))}
        {images.length > 6 && (
          <div className="more-images">
            +{images.length - 6}
          </div>
        )}
      </div>
    );
  };

  // 提取内容中的链接和标签
  const renderContentWithLinks = () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#([^\s#]+)/g;
    
    let parts = content.split(urlRegex);
    let result = [];
    
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // 普通文本，检查标签
        let tagParts = part.split(hashtagRegex);
        tagParts.forEach((tagPart, tagIndex) => {
          if (tagIndex % 2 === 0) {
            // 普通文本
            result.push(tagPart);
          } else {
            // 标签
            result.push(
              <Tag key={`tag-${index}-${tagIndex}`} color="blue">
                #{tagPart}
              </Tag>
            );
          }
        });
      } else {
        // 链接
        result.push(
          <a 
            key={`link-${index}`} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1890ff' }}
          >
            {part}
          </a>
        );
      }
    });
    
    return result;
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick && post.id) {
      onClick(post.id);
    }
  };

  // 处理子元素点击事件，防止冒泡
  const handleChildClick = (e, callback) => {
    e.stopPropagation();
    if (callback) {
      callback();
    }
  };

  return (
    <Card className="dynamic-card" size="small" onClick={handleCardClick}>
      <div className="dynamic-card-header">
        <div className="dynamic-card-user">
          <Avatar 
            src={avatar} 
            alt={username} 
            size={40} 
            className="dynamic-card-avatar"
          />
          <div className="dynamic-card-userinfo">
            <div className="dynamic-card-username">
              {username}
              <Button 
                type={isFollowed ? "primary" : "default"}
                size="small"
                shape="round"
                onClick={(e) => handleChildClick(e, () => onFollow(username))}
                style={{ 
                  marginLeft: 8, 
                  fontSize: 12, 
                  height: 24, 
                  padding: '0 8px',
                  opacity: isFollowed ? 1 : 0.8
                }}
              >
                {isFollowed ? "已关注" : "关注"}
              </Button>
            </div>
            <div className="dynamic-card-time">
              {time}
            </div>
          </div>
        </div>
      </div>
      
      <div className="dynamic-card-content">
        {renderContentWithLinks()}
      </div>
      
      {images && images.length > 0 && (
        <div className="dynamic-card-images">
          {getImageGrid()}
        </div>
      )}
      
      {tags && tags.length > 0 && (
        <div className="dynamic-card-tags" style={{ padding: '0 16px 16px' }}>
          <Space wrap size={4}>
            {tags.map((tag, index) => (
              <Tag 
                key={index}
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      <div className="dynamic-card-footer">
        <div className="dynamic-card-actions">
          <div 
            className={`dynamic-card-action ${isLiked ? 'liked' : ''}`} 
            onClick={(e) => handleChildClick(e, onLike)}
          >
            <span className="dynamic-card-action-icon">
              {isLiked ? <LikeFilled /> : <LikeOutlined />}
            </span>
            <span>{likes}</span>
          </div>
          
          <div className="dynamic-card-action" onClick={(e) => handleChildClick(e, onComment)}>
            <span className="dynamic-card-action-icon">
              <MessageOutlined />
            </span>
            <span>{comments}</span>
          </div>
          
          <div className="dynamic-card-action" onClick={(e) => handleChildClick(e, onShare)}>
            <span className="dynamic-card-action-icon">
              <ShareAltOutlined />
            </span>
            <span>分享</span>
          </div>
        </div>
      </div>
    </Card>
  );
}; 
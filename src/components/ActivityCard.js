/**
 * 活动卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.activity - 活动数据对象
 * @param {number} props.activity.id - 活动ID
 * @param {string} props.activity.title - 活动标题
 * @param {string} props.activity.club - 举办社团
 * @param {string} props.activity.date - 活动日期
 * @param {string} props.activity.time - 活动时间
 * @param {string} props.activity.location - 活动地点
 * @param {string} props.activity.description - 活动描述
 * @param {string} props.activity.coverImg - 封面图片
 * @param {string} props.activity.type - 活动类型
 * @param {string} props.activity.status - 活动状态
 * @param {number} props.activity.participants - 参与人数
 * @param {number} props.activity.maxParticipants - 最大参与人数
 * @param {number} props.activity.likes - 点赞数
 * @param {number} props.activity.comments - 评论数
 * @param {string[]} props.activity.tags - 标签数组
 * @param {boolean} props.activity.isRegistered - 是否已报名
 * @param {Function} props.onLike - 点赞回调函数
 * @param {Function} props.onComment - 评论回调函数
 * @param {Function} props.onShare - 分享回调函数
 * @param {Function} props.onJoin - 报名参加回调函数
 * @param {Function} props.onFavorite - 收藏回调函数 
 * @param {Function} props.onViewDetail - 查看详情回调函数
 * @param {boolean} props.isLiked - 是否已点赞
 * @param {boolean} props.isFavorite - 是否已收藏
 * @returns {JSX.Element} 活动卡片组件
 */
const ActivityCard = ({ 
  activity, 
  onLike, 
  onComment, 
  onShare, 
  onJoin, 
  onFavorite, 
  onViewDetail,
  isLiked,
  isFavorite
}) => {
  const { 
    id, 
    title, 
    club, 
    date, 
    time, 
    location, 
    description, 
    coverImg, 
    type, 
    status, 
    participants, 
    maxParticipants, 
    likes, 
    comments,
    tags,
    isRegistered
  } = activity;

  // 计算参与度百分比
  const participationRate = Math.floor((participants / maxParticipants) * 100);
  
  // 根据状态确定标签颜色
  const getStatusColor = () => {
    switch(status) {
      case '进行中':
        return 'green';
      case '已结束':
        return 'red';
      case '即将开始':
        return 'blue';
      default:
        return 'default';
    }
  };
  
  // 根据类型确定标签颜色
  const getTypeColor = () => {
    switch(type) {
      case '讲座':
        return 'purple';
      case '比赛':
        return 'volcano';
      case '聚会':
        return 'cyan';
      case '工作坊':
        return 'gold';
      default:
        return 'blue';
    }
  };

  return (
    <Card
      className="activity-card"
      cover={
        <div className="activity-card-cover">
          <img alt={title} src={coverImg} />
          <div className={`activity-card-status activity-card-status-${status === '进行中' ? 'open' : status === '已结束' ? 'closed' : 'upcoming'}`}>
            {status}
          </div>
          {isRegistered && (
            <div className="activity-card-registered">
              已报名
            </div>
          )}
        </div>
      }
      hoverable
      actions={[
        <Tooltip title={isLiked ? "取消点赞" : "点赞"}>
          <span onClick={onLike}>
            {isLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
            <span className="action-count">{likes}</span>
          </span>
        </Tooltip>,
        <Tooltip title="评论">
          <span onClick={onComment}>
            <MessageOutlined />
            <span className="action-count">{comments}</span>
          </span>
        </Tooltip>,
        <Tooltip title={isFavorite ? "取消收藏" : "收藏"}>
          <span onClick={onFavorite}>
            {isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          </span>
        </Tooltip>,
        <Tooltip title="分享">
          <ShareAltOutlined onClick={onShare} />
        </Tooltip>
      ]}
      size="small"
    >
      <div className="activity-card-meta">
        <div className="activity-card-title" onClick={onViewDetail}>
          {title}
        </div>
        <div className="activity-card-info">
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div>
              <TeamOutlined style={{ marginRight: 4 }} />
              {club}
            </div>
            <div>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {date} {time}
            </div>
            <div>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {location}
            </div>
          </Space>
        </div>
        <div className="activity-card-tags">
          <Space wrap size={4}>
            <Tag color={getTypeColor()}>{type}</Tag>
            {tags && tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </Space>
        </div>
        <div className="activity-card-participation">
          <div className="participation-text">
            <span>{participants}/{maxParticipants} 人已报名</span>
            <span>{participationRate}%</span>
          </div>
          <Progress 
            percent={participationRate} 
            size="small" 
            strokeColor={participationRate > 80 ? '#ff4d4f' : '#1890ff'} 
            showInfo={false}
          />
        </div>
        <Button 
          type="primary" 
          block 
          onClick={onJoin} 
          disabled={status === '已结束' || participants >= maxParticipants || isRegistered}
          className={isRegistered ? 'join-button-registered' : ''}
        >
          {isRegistered ? '已报名' : participants >= maxParticipants ? '名额已满' : '立即报名'}
        </Button>
      </div>
    </Card>
  );
}; 
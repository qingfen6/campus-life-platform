import React from 'react';
import { Card, Tag, Progress, Avatar, Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  TrophyOutlined,
  UserOutlined,
  RocketOutlined
} from '@ant-design/icons';
import '../../assets/styles/MissionCard.css';
import noImagePlaceholder from '../../assets/images/no-image.png';

const MissionCard = ({ mission, onAccept }) => {
  const navigate = useNavigate();
  const { 
    id, 
    title, 
    reward, 
    description, 
    imageUrl, 
    requestor, 
    difficulty, 
    category, 
    deadline,
    progress,
    acceptedCount
  } = mission;
  
  // 计算剩余时间
  const deadlineDate = deadline ? new Date(deadline) : new Date();
  const now = new Date();
  const diffTime = Math.max(0, deadlineDate - now);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // 根据剩余时间设置紧急程度
  const isUrgent = diffDays === 0 && diffHours < 12;
  
  // 根据难度级别设置颜色
  const difficultyColor = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  };
  
  const difficultyText = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  
  // 时间显示字符串
  const timeDisplay = diffDays > 0 
    ? `${diffDays}天${diffHours}小时` 
    : `${diffHours}小时`;
  
  // 点击卡片跳转到详情页
  const handleCardClick = () => {
    navigate(`/missions/${id}`);
  };
  
  // 点击接受按钮
  const handleAcceptClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onAccept && onAccept(id);
  };
  
  return (
    <Card
      hoverable
      className={`mission-card ${isUrgent ? 'urgent-mission' : ''}`}
      onClick={handleCardClick}
      cover={
        <div className="mission-image-container" onClick={handleCardClick}>
          <img 
            alt={title} 
            src={imageUrl || noImagePlaceholder} 
            className="mission-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = noImagePlaceholder;
            }}  
          />
          <div className={`mission-difficulty ${difficulty}`}>
            <span className="difficulty-level">{difficultyText[difficulty] || '未知'}</span>
          </div>
          <div className="mission-reward">
            <TrophyOutlined className="reward-icon" />
            <span className="reward-amount">¥{reward}</span>
          </div>
        </div>
      }
    >
      <div className="mission-card-content" onClick={handleCardClick}>
        <h3 className="mission-title">
          {category === 'express' && <Tag color="blue" className="mission-category">快递</Tag>}
          {category === 'study' && <Tag color="green" className="mission-category">学习</Tag>}
          {category === 'activity' && <Tag color="purple" className="mission-category">活动</Tag>}
          {category === 'other' && <Tag color="orange" className="mission-category">其他</Tag>}
          {title}
        </h3>
        
        <p className="mission-description">{description}</p>
        
        <div className="mission-progress-container">
          <div className="progress-label">
            <span>任务进度</span>
            <span>{progress || 0}%</span>
          </div>
          <Progress 
            percent={progress || 0} 
            size="small" 
            showInfo={false}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
        
        <div className="mission-meta" onClick={handleCardClick}>
          <div className="mission-deadline">
            <ClockCircleOutlined className={isUrgent ? 'urgent-time' : ''} />
            <span className={isUrgent ? 'urgent-time' : ''}>剩余: {timeDisplay}</span>
          </div>
          
          <div className="mission-requestor">
            <Avatar 
              src={requestor?.avatar || null} 
              size="small" 
              icon={<UserOutlined />}
              onError={(e) => {
                e.target.onerror = null;
                // 图像加载失败时显示默认图标 (这里我们已经有UserOutlined作为icon默认值)
              }}
            />
            <span className="requestor-name">{requestor?.name || '匿名用户'}</span>
          </div>
        </div>
        
        <div className="mission-footer">
          <Tooltip title="已有人接受的数量">
            <span className="accepted-count">
              <FireOutlined /> {acceptedCount || 0}人接单
            </span>
          </Tooltip>
          
          <Button 
            type="primary" 
            className="accept-btn"
            icon={<RocketOutlined />}
            onClick={handleAcceptClick}
          >
            接受任务
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MissionCard; 
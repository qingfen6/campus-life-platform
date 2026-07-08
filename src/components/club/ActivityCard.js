/**
 * 活动卡片组件
 * 
 * 功能：
 * - 展示活动基本信息
 * - 支持点赞、收藏、分享
 * - 显示活动状态和参与人数
 * - 支持报名功能
 * - 响应式设计
 * - 暗色模式支持
 */

import React from 'react';
import { Card, Space, Badge, Button, Tag, Tooltip } from 'antd';
import { 
  HeartOutlined, 
  StarOutlined, 
  ShareAltOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CommentOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';

const ActivityCard = ({ 
  activity, 
  onLike, 
  onFavorite, 
  onShare, 
  onJoin, 
  onViewDetail,
  isLiked,
  isFavorite
}) => {
  // 计算参与度百分比
  const participationRate = (activity.participants / activity.maxParticipants) * 100;

  return (
    <Card
      className="activity-card"
      cover={
        <div className="activity-cover">
          <img
            alt={activity.title}
            src={activity.coverImage}
            className="cover-image"
          />
          <div className="participation-bar">
            <div 
              className="participation-progress"
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>
      }
      actions={[
        <Button 
          type="primary" 
          onClick={() => onJoin(activity)}
          disabled={activity.status !== '报名中'}
        >
          立即报名
        </Button>
      ]}
    >
      <Card.Meta
        title={
          <Space>
            {activity.title}
            <Badge 
              status={activity.status === '报名中' ? 'success' : 'default'} 
              text={activity.status}
            />
          </Space>
        }
        description={
          <Space direction="vertical" size="small" className="activity-description">
            <Space>
              <TeamOutlined />
              {activity.club}
            </Space>
            <Space>
              <ClockCircleOutlined />
              {activity.date} {activity.time}
            </Space>
            <Space>
              <EnvironmentOutlined />
              {activity.location}
            </Space>
            <div className="activity-summary">{activity.description}</div>
            <Space wrap>
              {activity.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>
            <Space className="activity-stats">
              <Tooltip title="点赞">
                <Space>
                  <HeartOutlined 
                    className={isLiked ? 'liked' : ''} 
                    onClick={() => onLike(activity.id)}
                  />
                  {activity.likes}
                </Space>
              </Tooltip>
              <Tooltip title="评论">
                <Space>
                  <CommentOutlined />
                  {activity.comments}
                </Space>
              </Tooltip>
              <Tooltip title="参与人数">
                <Space>
                  <TeamOutlined />
                  {activity.participants}/{activity.maxParticipants}
                </Space>
              </Tooltip>
              <Tooltip title="收藏">
                <StarOutlined 
                  className={isFavorite ? 'favorite' : ''} 
                  onClick={() => onFavorite(activity.id)}
                />
              </Tooltip>
              <Tooltip title="分享">
                <ShareAltOutlined onClick={() => onShare(activity)} />
              </Tooltip>
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default ActivityCard; 
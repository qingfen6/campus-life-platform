/**
 * 招新卡片组件
 * 
 * 功能：
 * - 展示招新信息
 * - 显示招新要求和面试时间
 * - 支持在线预约面试
 * - 显示申请进度
 * - 响应式设计
 * - 暗色模式支持
 */

import React from 'react';
import { Card, Space, Tag, Button, Progress, Tooltip } from 'antd';
import { 
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';

const RecruitmentCard = ({ 
  recruitment, 
  onScheduleInterview,
  onViewDetail
}) => {
  // 计算申请进度
  const applicationProgress = (recruitment.applications / recruitment.maxApplications) * 100;

  return (
    <Card
      className="recruitment-card"
      cover={
        <div className="recruitment-cover">
          <img
            alt={recruitment.title}
            src={recruitment.coverImage}
            className="cover-image"
          />
          <div className="application-progress">
            <Progress 
              percent={applicationProgress} 
              status={applicationProgress >= 100 ? "exception" : "active"}
            />
          </div>
        </div>
      }
      actions={[
        <Button 
          type="primary" 
          onClick={() => onScheduleInterview(recruitment)}
          disabled={recruitment.status !== '报名中'}
        >
          预约面试
        </Button>
      ]}
    >
      <Card.Meta
        title={recruitment.title}
        description={
          <Space direction="vertical" size="small" className="recruitment-description">
            <Space>
              <TeamOutlined />
              {recruitment.club}
            </Space>
            <Space>
              <ClockCircleOutlined />
              {recruitment.date} {recruitment.time}
            </Space>
            <Space>
              <EnvironmentOutlined />
              {recruitment.location}
            </Space>
            
            <div className="recruitment-requirements">
              <h4>招新要求：</h4>
              <ul>
                {recruitment.requirements.map((req, index) => (
                  <li key={index}>
                    <CheckCircleOutlined /> {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="interview-slots">
              <h4>面试时间：</h4>
              <Space wrap>
                {recruitment.interviewSlots.map((slot, index) => (
                  <Tag key={index} color="green">
                    <CalendarOutlined /> {slot.date} {slot.time}
                  </Tag>
                ))}
              </Space>
            </div>

            <Space className="recruitment-stats">
              <Tooltip title="申请人数">
                <Space>
                  <UserOutlined />
                  {recruitment.applications}/{recruitment.maxApplications}
                </Space>
              </Tooltip>
              <Tooltip title="面试通过率">
                <Space>
                  <CheckCircleOutlined />
                  {recruitment.acceptanceRate}%
                </Space>
              </Tooltip>
            </Space>

            <Space wrap>
              {recruitment.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default RecruitmentCard; 
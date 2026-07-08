import React from 'react';
import { Typography, Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, NotificationOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SchoolAdminDashboardPage = () => {
  // Placeholder data - replace with actual data fetching later
  const stats = {
    totalUsers: 1250,
    officialAnnouncements: 15,
    userPostsToday: 78,
  };

  return (
    <div>
      <Title level={2}>学校管理首页</Title>
      <Paragraph>
        欢迎来到本校管理后台。您可以在这里管理本校的用户、发布官方公告以及管理用户发布的内容。
      </Paragraph>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="本校注册用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已发布官方公告数"
              value={stats.officialAnnouncements}
              prefix={<NotificationOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日用户动态数"
              value={stats.userPostsToday}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Add more dashboard widgets or summaries here */}
    </div>
  );
};

export default SchoolAdminDashboardPage;

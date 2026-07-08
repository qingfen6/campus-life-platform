import React from 'react';
import { Row, Col, Card, Avatar, Button } from 'antd';
import { LikeOutlined, CommentOutlined, ShareAltOutlined } from '../../utils/iconUtils';
import type { ICardItem } from './types';

// 定义按钮组件
const LikeButton = () => (
  <Button type="text" icon={<LikeOutlined />} />
);

const CommentButton = () => (
  <Button type="text" icon={<CommentOutlined />} />
);

const ShareButton = () => (
  <Button type="text" icon={<ShareAltOutlined />} />
);

const CardList = ({ items }: { items: ICardItem[] }) => {
  return (
    <Row gutter={[16, 16]} className="card-grid">
      {items.map(item => (
        <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            cover={<img alt={item.title} src={item.cover} />}
            actions={[
              <LikeButton />,
              <CommentButton />,
              <ShareButton />
            ]}
          >
            <Card.Meta
              title={item.title}
              description={item.description}
              avatar={<Avatar src={item.user.avatar} />}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CardList; 
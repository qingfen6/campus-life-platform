import React from 'react';
import { SearchOutlined, BellOutlined, MailOutlined, LikeOutlined, MessageOutlined, ShareAltOutlined } from '../../utils/iconUtils';
import { Avatar, Input, Space, Button } from 'antd';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo.png" alt="校园互助平台" className="logo" />
        <Input
          placeholder="搜索内容..."
          prefix={<SearchOutlined />}
          className="search-bar"
        />
      </div>
      
      <Space className="nav-buttons" size="middle">
        <Button type="primary">发布</Button>
        <BellOutlined className="nav-icon" />
        <MailOutlined className="nav-icon" />
        <Avatar src="https://i.pravatar.cc/40" />
      </Space>
    </header>
  );
};

export default Header; 

// 新增类型定义文件
export interface ICardItem {
  id: string;
  title: string;
  description: string;
  cover: string;
  user: {
    avatar: string;
    name: string;
  };
  likes: number;
  comments: number;
  shares: number;
} 

// 新增按钮组件
export const LikeButton = ({ count = 0 }) => (
  <Button type="text" icon={<LikeOutlined />}>{count}</Button>
);

export const CommentButton = ({ count = 0 }) => (
  <Button type="text" icon={<MessageOutlined />}>{count}</Button>
);

export const ShareButton = ({ count = 0 }) => (
  <Button type="text" icon={<ShareAltOutlined />}>{count}</Button>
); 
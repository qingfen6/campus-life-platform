import React from 'react';
import { Menu } from 'antd';
import {
  MessageOutlined,
  ShopOutlined,
  AlertOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  HeartOutlined
} from '../../utils/iconUtils';

const menuItems = [
  { key: 'chat', icon: <MessageOutlined />, label: '聊天室' },
  { key: 'market', icon: <ShopOutlined />, label: '校园市集' },
  { key: 'bounty', icon: <AlertOutlined />, label: '悬赏令' },
  { key: 'activity', icon: <TeamOutlined />, label: '活动号召' },
  { key: 'map', icon: <EnvironmentOutlined />, label: '美食地图' },
  { key: 'wall', icon: <HeartOutlined />, label: '表白墙' }
];

const Sidebar = () => {
  return (
    <nav className="app-sidebar">
      <Menu
        mode="inline"
        defaultSelectedKeys={['chat']}
        items={menuItems}
        className="sidebar-menu"
      />
    </nav>
  );
};

export default Sidebar; 
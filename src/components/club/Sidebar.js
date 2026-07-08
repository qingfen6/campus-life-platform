/**
 * 侧边栏组件
 * 
 * 功能：
 * - 展示导航菜单
 * - 支持快速操作
 * - 展示用户信息
 * - 展示通知中心
 * - 响应式设计
 * - 暗色模式支持
 */

import React from 'react';
import { Layout, Menu, Avatar, Badge, Button, Space, Tooltip } from 'antd';
import { 
  HomeOutlined,
  TeamOutlined,
  FileOutlined,
  MessageOutlined,
  CalendarOutlined,
  FireOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';

const { Sider } = Layout;

const Sidebar = ({
  selectedKey,
  onMenuSelect,
  user,
  notifications,
  onLogout
}) => {
  // 菜单项配置
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: 'activities',
      icon: <TeamOutlined />,
      label: '活动管理'
    },
    {
      key: 'resources',
      icon: <FileOutlined />,
      label: '资源中心'
    },
    {
      key: 'forum',
      icon: <MessageOutlined />,
      label: '论坛讨论'
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: '活动日历'
    },
    {
      key: 'dynamics',
      icon: <FireOutlined />,
      label: '动态信息'
    }
  ];

  // 处理菜单选择
  const handleMenuSelect = ({ key }) => {
    onMenuSelect(key);
  };

  return (
    <Sider 
      className="club-sidebar"
      width={250}
      theme="light"
    >
      <div className="sidebar-header">
        <Space direction="vertical" align="center" size="large">
          <Avatar 
            size={64} 
            src={user.avatar}
            icon={<UserOutlined />}
          />
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.role}</p>
          </div>
        </Space>
      </div>

      <div className="sidebar-content">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuSelect}
        />
      </div>

      <div className="sidebar-footer">
        <Space direction="vertical" size="middle">
          <Tooltip title="通知中心">
            <Badge count={notifications.length}>
              <Button 
                icon={<BellOutlined />}
                type="text"
                block
              />
            </Badge>
          </Tooltip>
          
          <Tooltip title="设置">
            <Button 
              icon={<SettingOutlined />}
              type="text"
              block
            />
          </Tooltip>

          <Button 
            icon={<LogoutOutlined />}
            type="text"
            danger
            block
            onClick={onLogout}
          >
            退出登录
          </Button>
        </Space>
      </div>
    </Sider>
  );
};

export default Sidebar; 
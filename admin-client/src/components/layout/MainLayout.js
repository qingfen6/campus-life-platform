// 主布局组件
import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  TableOutlined,
  CodeOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  DotChartOutlined
} from '@ant-design/icons';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { logout, getUser } from '../../utils/auth';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();
  const user = getUser();
  const location = useLocation();

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // 退出登录
  const handleLogout = () => {
    logout();
    message.success('退出登录成功');
    history.push('/login');
  };

  // 用户菜单选项
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录'
      }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'profile') {
        message.info('功能开发中...');
      }
    }
  };

  // 根据当前路径确定 selectedKeys 和 openKeys
  const getCurrentKeys = () => {
    const currentPath = location.pathname;
    let selectedKey = currentPath;
    let openKey = '';

    if (currentPath.startsWith('/dashboard/tables')) {
      selectedKey = '/dashboard/tables';
      openKey = 'database';
    } else if (currentPath.startsWith('/dashboard/sql')) {
      selectedKey = '/dashboard/sql';
      openKey = 'database';
    } else if (currentPath === '/dashboard/users') {
      selectedKey = '/dashboard/users';
    } else if (currentPath === '/dashboard/schools') {
      selectedKey = '/dashboard/schools';
    } else if (currentPath === '/dashboard/analytics') {
      selectedKey = '/dashboard/analytics';
    } else if (currentPath === '/dashboard') {
      selectedKey = '/dashboard';
    }
    return { selectedKey: [selectedKey], openKey: openKey ? [openKey] : [] };
  };

  const { selectedKey, openKey } = getCurrentKeys();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider trigger={null} collapsible collapsed={collapsed} 
        theme="dark" width={250}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            {!collapsed ? 'CampusLife 管理系统' : 'CL'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey}
          defaultOpenKeys={openKey}
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">控制面板</Link>
            },
            {
              key: '/dashboard/analytics',
              icon: <DotChartOutlined />,
              label: <Link to="/dashboard/analytics">数据分析</Link>
            },
            {
              key: 'database',
              icon: <DatabaseOutlined />,
              label: '数据库管理',
              children: [
                {
                  key: '/dashboard/tables',
                  icon: <TableOutlined />,
                  label: <Link to="/dashboard/tables">数据表查询</Link>
                },
                {
                  key: '/dashboard/sql',
                  icon: <CodeOutlined />,
                  label: <Link to="/dashboard/sql">SQL查询</Link>
                }
              ]
            },
            {
              key: '/dashboard/users',
              icon: <UserOutlined />,
              label: <Link to="/dashboard/users">用户管理</Link>
            },
            {
              key: '/dashboard/schools',
              icon: <BankOutlined />,
              label: <Link to="/dashboard/schools">学校管理</Link>,
            }
          ]}
        />
      </Sider>
      <Layout>
        {/* 头部 */}
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>
                {user?.username || '管理员'}
              </span>
              <Avatar icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </Header>
        {/* 内容 */}
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: '#fff',
          borderRadius: '4px'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 
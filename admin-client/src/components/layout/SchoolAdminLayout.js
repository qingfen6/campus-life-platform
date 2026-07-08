import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, message } from 'antd';
import {
  UserOutlined,
  NotificationOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
  FundProjectionScreenOutlined, // For Dashboard
  TeamOutlined, // For User Management
  SoundOutlined, // For School Announcements
  ProfileOutlined, // For general Content Management (can be removed if PostManagement is preferred)
  ReadOutlined, // For Post Management (ensure it's imported once)
  DollarCircleOutlined, // 新增：悬赏管理图标
  ShoppingOutlined, // 新增：商品管理图标
} from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth'; // Assuming you have a logout function
import './SchoolAdminLayout.css'; // Change CSS import

const { Header, Content, Sider, Footer } = Layout;

const SchoolAdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const user = getUser();
    if (user && user.role === 'school_admin') { // Ensure only school admins access this layout
      setCurrentUser(user);
    } else {
      // If not a school admin or not logged in, redirect to login or an appropriate page
      message.error('无权访问学校管理后台或未登录');
      history.push('/login'); 
    }
  }, [history]);

  const handleLogout = () => {
    logout();
    message.success('您已成功退出登录');
    history.push('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<SettingOutlined />}>
        {/* Update path if you create a specific profile page for school admins */}
        <Link to="/school-admin/profile">账户设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/school-admin/dashboard')) return ['dashboard'];
    if (path.startsWith('/school-admin/user-management')) return ['user-management'];
    if (path.startsWith('/school-admin/announcement-management')) return ['announcement-management'];
    if (path.startsWith('/school-admin/content-management')) return ['content-management'];
    if (path.startsWith('/school-admin/post-management')) return ['post-management'];
    if (path.startsWith('/school-admin/mission-management')) return ['mission-management'];
    if (path.startsWith('/school-admin/product-management')) return ['product-management'];
    return ['dashboard'];
  };

  if (!currentUser) {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', lineHeight: '32px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {collapsed ? 'SA' : `${currentUser.schoolName || '学校管理'}`}
        </div>
        <Menu theme="dark" selectedKeys={getSelectedKeys()} mode="inline">
          <Menu.Item key="dashboard" icon={<FundProjectionScreenOutlined />}>
            <Link to="/school-admin/dashboard">管理首页</Link>
          </Menu.Item>
          <Menu.Item key="user-management" icon={<TeamOutlined />}>
            <Link to="/school-admin/user-management">用户管理</Link>
          </Menu.Item>
          <Menu.Item key="announcement-management" icon={<SoundOutlined />}>
            <Link to="/school-admin/announcement-management">学校公告</Link>
          </Menu.Item>
          <Menu.Item key="post-management" icon={<ReadOutlined />}>
            <Link to="/school-admin/post-management">动态管理</Link>
          </Menu.Item>
          <Menu.Item key="mission-management" icon={<DollarCircleOutlined />}>
            <Link to="/school-admin/mission-management">悬赏管理</Link>
          </Menu.Item>
          <Menu.Item key="product-management" icon={<ShoppingOutlined />}>
            <Link to="/school-admin/product-management">商品管理</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px' }}>{currentUser.schoolName ? `${currentUser.schoolName} - 管理后台` : '学校管理后台'}</span>
            <Dropdown overlay={userMenu}>
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()} href="!#">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {currentUser.fullName || currentUser.username}
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><Link to="/school-admin/dashboard">学校管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{location.pathname.split('/').filter(i => i).pop() || '首页'}</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>CampusLife 学校管理后台 ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
};

export default SchoolAdminLayout; 
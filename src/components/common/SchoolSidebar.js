/**
 * 学校侧边栏组件
 * 
 * 功能：
 * - 学校导航菜单
 * - 学院列表
 * - 社团组织入口
 * - 主题切换开关
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Switch, Avatar } from 'antd';
import { 
  HomeOutlined, 
  ReadOutlined, 
  NotificationOutlined, 
  BulbOutlined,
  TeamOutlined, 
  BankOutlined,
  ScheduleOutlined,
  BookOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import '../../assets/styles/SchoolSidebar.css';

const { Sider } = Layout;

const SchoolSidebar = ({ darkMode, toggleDarkMode, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNotifications, setActiveNotifications] = useState(3);

  // 确定当前激活的菜单项
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/school') return '1';
    if (path === '/school/notifications') return '2';
    if (path === '/school/recruitment') return '3';
    if (path === '/school/clubs') return '4';
    if (path === '/school/resources') return '5';
    return '1'; // 默认选中学校首页
  };

  // 处理菜单项点击
  const handleMenuClick = (key) => {
    switch (key) {
      case '1':
        navigate('/school');
        break;
      case '2':
        navigate('/school/notifications');
        break;
      case '3':
        navigate('/school/recruitment');
        break;
      case '4':
        navigate('/school/clubs');
        break;
      case '5':
        navigate('/school/resources');
        break;
      case 'back':
        navigate('/');
        break;
      default:
        navigate('/school');
    }
  };

  // 渲染学院列表
  const facultySubmenu = [
    {
      key: 'faculty-cs',
      icon: <BookOutlined />,
      label: '计算机学院',
      onClick: () => navigate('/school/faculty/cs')
    },
    {
      key: 'faculty-literature',
      icon: <BookOutlined />,
      label: '文学院',
      onClick: () => navigate('/school/faculty/literature')
    },
    {
      key: 'faculty-science',
      icon: <BookOutlined />,
      label: '理学院',
      onClick: () => navigate('/school/faculty/science')
    },
    {
      key: 'faculty-engineering',
      icon: <BookOutlined />,
      label: '工学院',
      onClick: () => navigate('/school/faculty/engineering')
    },
    {
      key: 'faculty-business',
      icon: <BookOutlined />,
      label: '商学院',
      onClick: () => navigate('/school/faculty/business')
    },
    {
      key: 'faculty-arts',
      icon: <BookOutlined />,
      label: '艺术学院',
      onClick: () => navigate('/school/faculty/arts')
    }
  ];

  // 渲染热门社团列表
  const clubsSubmenu = [
    {
      key: 'club-photo',
      icon: <FireOutlined />,
      label: '摄影协会',
      onClick: () => navigate('/school/clubs/photo')
    },
    {
      key: 'club-debate',
      icon: <FireOutlined />,
      label: '辩论社',
      onClick: () => navigate('/school/clubs/debate')
    },
    {
      key: 'club-music',
      icon: <FireOutlined />,
      label: '音乐社',
      onClick: () => navigate('/school/clubs/music')
    },
    {
      key: 'club-tech',
      icon: <FireOutlined />,
      label: '科技创新社',
      onClick: () => navigate('/school/clubs/tech')
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="school-sider"
      theme={darkMode ? "dark" : "light"}
    >
      <div className="school-logo-container">
        <h2 className="school-logo">校园通</h2>
      </div>
      
      <Menu
        theme={darkMode ? "dark" : "light"}
        mode="inline"
        defaultSelectedKeys={[getActiveKey()]}
        selectedKeys={[getActiveKey()]}
        items={[
          {
            key: '1',
            icon: <HomeOutlined />,
            label: '校园主页',
            onClick: () => handleMenuClick('1')
          },
          {
            key: '2',
            icon: (
              <Badge count={activeNotifications} offset={[10, 0]} size="small">
                <NotificationOutlined />
              </Badge>
            ),
            label: '学校通知',
            onClick: () => handleMenuClick('2')
          },
          {
            key: '3',
            icon: <BankOutlined />,
            label: '学院资讯',
            children: facultySubmenu
          },
          {
            key: '4',
            icon: <TeamOutlined />,
            label: '社团活动',
            children: clubsSubmenu
          },
          {
            key: '5',
            icon: <ReadOutlined />,
            label: '教学资源',
            onClick: () => handleMenuClick('5')
          },
          {
            key: 'divider',
            type: 'divider'
          },
          {
            key: 'back',
            icon: <HomeOutlined />,
            label: '返回个人主页',
            onClick: () => handleMenuClick('back'),
            className: 'back-menu-item'
          }
        ]}
      />
      
      <div className="school-sidebar-footer">
        <div className="theme-switch">
          <BulbOutlined />
          <Switch 
            checked={darkMode} 
            onChange={toggleDarkMode} 
            className="dark-mode-switch" 
          />
        </div>
        
        <div className="school-info">
          <Avatar className="school-avatar" src="https://api.dicebear.com/7.x/shapes/svg?seed=University" />
          <div className="school-name">XX大学</div>
        </div>
      </div>
    </Sider>
  );
};

export default SchoolSidebar; 
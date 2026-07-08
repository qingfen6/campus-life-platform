/**
 * 全学校侧边栏组件
 * 
 * 功能：
 * - 全国高校导航菜单
 * - 高校分类列表
 * - 高校排行榜入口
 * - 主题切换开关
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Switch, Avatar, Tooltip } from 'antd';
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
  FireOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  StarOutlined,
  ApartmentOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import '../../assets/styles/AllSchoolSidebar.css';

const { Sider } = Layout;
const { SubMenu } = Menu;

const AllSchoolSidebar = ({ darkMode, toggleDarkMode, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNotifications, setActiveNotifications] = useState(5);

  // 确定当前激活的菜单项
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/allschool') return '1';
    if (path === '/allschool/rankings') return '2';
    if (path === '/allschool/research') return '3';
    if (path === '/allschool/admission') return '4';
    if (path === '/allschool/activities') return '5';
    return '1'; // 默认选中全校首页
  };

  // 处理菜单项点击
  const handleMenuClick = (key) => {
    switch (key) {
      case '1':
        navigate('/allschool');
        break;
      case '2':
        navigate('/school-ranking');
        break;
      case '3':
        navigate('/research');
        break;
      case '4':
        navigate('/allschool/admission');
        break;
      case '5':
        navigate('/allschool/activities');
        break;
      case 'back':
        navigate('/school');
        break;
      case 'home':
        navigate('/');
        break;
      default:
        navigate('/allschool');
    }
  };

  // 渲染高校分类列表
  const universityTypes = [
    {
      key: 'type-985',
      icon: <StarOutlined />,
      label: '985工程高校',
      onClick: () => navigate('/allschool/type/985')
    },
    {
      key: 'type-211',
      icon: <StarOutlined />,
      label: '211工程高校',
      onClick: () => navigate('/allschool/type/211')
    },
    {
      key: 'type-double-first',
      icon: <StarOutlined />,
      label: '双一流高校',
      onClick: () => navigate('/allschool/type/double-first')
    },
    {
      key: 'type-normal',
      icon: <BookOutlined />,
      label: '师范类院校',
      onClick: () => navigate('/allschool/type/normal')
    },
    {
      key: 'type-tech',
      icon: <ExperimentOutlined />,
      label: '理工类院校',
      onClick: () => navigate('/allschool/type/tech')
    },
    {
      key: 'type-art',
      icon: <BookOutlined />,
      label: '艺术类院校',
      onClick: () => navigate('/allschool/type/art')
    }
  ];

  // 渲染地区高校分类
  const regionUniversities = [
    {
      key: 'region-north',
      icon: <EnvironmentOutlined />,
      label: '华北地区',
      onClick: () => navigate('/allschool/region/north')
    },
    {
      key: 'region-east',
      icon: <EnvironmentOutlined />,
      label: '华东地区',
      onClick: () => navigate('/allschool/region/east')
    },
    {
      key: 'region-south',
      icon: <EnvironmentOutlined />,
      label: '华南地区',
      onClick: () => navigate('/allschool/region/south')
    },
    {
      key: 'region-central',
      icon: <EnvironmentOutlined />,
      label: '华中地区',
      onClick: () => navigate('/allschool/region/central')
    },
    {
      key: 'region-northeast',
      icon: <EnvironmentOutlined />,
      label: '东北地区',
      onClick: () => navigate('/allschool/region/northeast')
    },
    {
      key: 'region-northwest',
      icon: <EnvironmentOutlined />,
      label: '西北地区',
      onClick: () => navigate('/allschool/region/northwest')
    },
    {
      key: 'region-southwest',
      icon: <EnvironmentOutlined />,
      label: '西南地区',
      onClick: () => navigate('/allschool/region/southwest')
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="all-school-sider"
      theme={darkMode ? "dark" : "light"}
    >
      <div className="all-school-logo-container">
        <h2 className="all-school-logo">全国高校</h2>
      </div>
      
      <Menu
        theme={darkMode ? "dark" : "light"}
        mode="inline"
        defaultSelectedKeys={[getActiveKey()]}
        selectedKeys={[getActiveKey()]}
        items={[
          {
            key: '1',
            icon: <GlobalOutlined />,
            label: '高校首页',
            onClick: () => handleMenuClick('1')
          },
          {
            key: '2',
            icon: <TrophyOutlined />,
            label: '高校排行',
            onClick: () => handleMenuClick('2')
          },
          {
            key: '3',
            icon: <ExperimentOutlined />,
            label: '科研成果',
            onClick: () => handleMenuClick('3')
          },
          {
            key: '4',
            icon: <NotificationOutlined />,
            label: (
              <Badge count={activeNotifications} offset={[10, 0]} size="small">
                招生信息
              </Badge>
            ),
            onClick: () => handleMenuClick('4')
          },
          {
            key: '5',
            icon: <ScheduleOutlined />,
            label: '校园活动',
            onClick: () => handleMenuClick('5')
          },
          {
            key: 'type',
            icon: <ApartmentOutlined />,
            label: '高校分类',
            children: universityTypes
          },
          {
            key: 'region',
            icon: <EnvironmentOutlined />,
            label: '地区分类',
            children: regionUniversities
          },
          {
            key: 'divider',
            type: 'divider'
          },
          {
            key: 'back',
            icon: <BankOutlined />,
            label: '返回校园主页',
            onClick: () => handleMenuClick('back'),
            className: 'back-menu-item'
          },
          {
            key: 'home',
            icon: <HomeOutlined />,
            label: '返回个人主页',
            onClick: () => handleMenuClick('home'),
            className: 'home-menu-item'
          }
        ]}
      />
      
      <div className="all-school-sidebar-footer">
        <div className="theme-switch">
          <BulbOutlined />
          <Switch 
            checked={darkMode} 
            onChange={toggleDarkMode} 
            className="dark-mode-switch" 
          />
        </div>
        
        <div className="all-school-info">
          <Tooltip title="全国高校信息平台">
            <Avatar className="all-school-avatar" src="https://api.dicebear.com/7.x/shapes/svg?seed=Universities" />
          </Tooltip>
          <div className="all-school-name">高校资讯</div>
        </div>
      </div>
    </Sider>
  );
};

export default AllSchoolSidebar; 
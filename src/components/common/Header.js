import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Input, Button, Badge, Dropdown, List, Avatar, Typography, Space, Divider, Tabs, Empty, Tag, Menu, message, Spin } from 'antd';
import { 
  SearchOutlined, 
  MessageOutlined, 
  UserOutlined,
  CloseOutlined,
  CheckOutlined,
  SettingOutlined,
  HeartOutlined,
  CommentOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  DeleteOutlined,
  LikeOutlined,
  LogoutOutlined,
  SettingFilled,
  BookOutlined,
  TeamOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { logout } from '../../store/slices/authSlice';
import { chatApi } from '../../utils/api';
import '../../assets/styles/Header.css';

const { Header: AntHeader } = Layout;
const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Header = () => {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [headerConversations, setHeaderConversations] = useState([]);
  const [loadingHeaderConversations, setLoadingHeaderConversations] = useState(false);

  const loadHeaderConversations = useCallback(async () => {
    if (!user?.id) return;
    console.log(`[Header PM] Loading conversations for user ID: ${user.id}`);
    setLoadingHeaderConversations(true);
    try {
        const conversationsData = await chatApi.getConversationList();
        console.log('[Header PM] Received conversationsData:', conversationsData);
        setHeaderConversations(conversationsData || []);
    } catch (error) {
        console.error("[Header PM] 加载私信列表失败:", error);
    } finally {
        setLoadingHeaderConversations(false);
    }
}, [user]);

  const renderMessagesContent = () => (
    <div className="dropdown-panel header-pm-dropdown">
      <div className="dropdown-header">
        <div className="dropdown-title">私信列表</div>
      </div>
      
      <div className="dropdown-content">
        {loadingHeaderConversations ? (
          <div style={{ padding: '20px', textAlign: 'center' }}><Spin /></div>
        ) : headerConversations.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无私信" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={headerConversations}
            renderItem={item => (
              <List.Item 
                className={`message-item ${item.unread ? 'unread' : ''}`}
                onClick={() => {
                  if (item.user?.id) {
                    navigate(`${location.pathname}?openChat=private&userId=${item.user.id}`, { replace: true });
                    setMessagesOpen(false);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={false} offset={[-2, 28]}>
                      <Avatar src={item.user?.avatar} icon={<UserOutlined />} />
                    </Badge>
                  }
                  title={
                    <div className="message-title-row">
                      <Text strong>{item.user?.name || '未知用户'}</Text>
                      <Text type="secondary" className="message-time">{item.timestamp || ''}</Text>
                    </div>
                  }
                  description={
                    <div className="message-content-row">
                      <Text className="message-content" ellipsis={{rows: 1}}>
                        {item.lastMessage || ' '}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
  
  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else {
      message.info(`点击了菜单项: ${key}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人中心
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingFilled />}>
        账号设置
      </Menu.Item>
      <Menu.Item key="collections" icon={<BookOutlined />}>
        我的收藏
      </Menu.Item>
      <Menu.Item key="friends" icon={<TeamOutlined />}>
        我的好友
      </Menu.Item>
      <Menu.Item key="posts" icon={<EditOutlined />}>
        我的发布
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <div className="logo">Campus Life</div>
      </div>
      
      <div className="header-search">
        <Input
          placeholder="搜索..."
          prefix={<SearchOutlined />}
          className="search-input"
        />
      </div>
      
      <div className="header-right">
        <NotificationBell />
        
        <Dropdown
          overlay={renderMessagesContent()}
          trigger={['click']}
          open={messagesOpen}
          onOpenChange={(visible) => {
            setMessagesOpen(visible);
            if (visible) {
              loadHeaderConversations();
            }
          }}
          placement="bottomRight"
          overlayClassName="dropdown-large header-pm-overlay"
        >
          <Badge count={0} dot={false}>
            <Button className="header-icon-btn" type="text" icon={<MessageOutlined />} />
          </Badge>
        </Dropdown>
        
        <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
          <Button className="user-btn" type="text">
            <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
            <span className="username">{user ? user.username : '用户'}</span>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header; 
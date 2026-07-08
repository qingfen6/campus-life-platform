import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Avatar, Typography, Button } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { notificationApi } from '../../utils/api';
import websocketService from '../../utils/websocket';
import '../../assets/styles/NotificationBell.css';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications({ limit: 10 });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, has_read: true }))
        );
      }
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };
  
  // 处理通知类型和图标
  const getNotificationMeta = (notification) => {
    const types = {
      system: { icon: '🔔', color: '#1890ff' },
      mission: { icon: '🏆', color: '#f5a623' },
      market: { icon: '🛒', color: '#52c41a' },
      comment: { icon: '💬', color: '#722ed1' },
      like: { icon: '❤️', color: '#eb2f96' }
    };
    
    return types[notification.notification_type] || { icon: '📌', color: '#666' };
  };
  
  // 初始加载通知
  useEffect(() => {
    fetchNotifications();
    
    // 监听新通知
    const removeListener = websocketService.addListener('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    return () => removeListener();
  }, []);
  
  // 下拉菜单内容
  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>通知中心</h3>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            icon={<CheckOutlined />}
            onClick={markAllAsRead}
          >
            全部已读
          </Button>
        )}
      </div>
      
      <List
        className="notification-list"
        loading={loading}
        dataSource={notifications}
        renderItem={item => {
          const meta = getNotificationMeta(item);
          return (
            <List.Item className={!item.has_read ? 'unread-notification' : ''}>
              <List.Item.Meta
                avatar={
                  item.sender_avatar ? (
                    <Avatar src={item.sender_avatar} />
                  ) : (
                    <Avatar style={{ backgroundColor: meta.color }}>
                      {meta.icon}
                    </Avatar>
                  )
                }
                title={
                  <Text ellipsis>{item.content}</Text>
                }
                description={new Date(item.created_at).toLocaleString()}
              />
            </List.Item>
          );
        }}
        locale={{ emptyText: '暂无通知' }}
      />
      
      <div className="notification-footer">
        <Button type="link" onClick={() => {/* 查看全部通知 */}}>
          查看全部
        </Button>
      </div>
    </div>
  );
  
  return (
    <Dropdown 
      overlay={notificationMenu} 
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="notification-dropdown-wrapper"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button 
          className="notification-bell-btn" 
          type="text" 
          icon={<BellOutlined style={{ fontSize: '20px' }} />} 
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;

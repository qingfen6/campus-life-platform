import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Dropdown, List, Avatar, Typography, Button, notification, Modal, message, Input, Space, Tooltip } from 'antd';
import { BellOutlined, CheckOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, MessageOutlined, ClockCircleOutlined, TrophyOutlined, ShoppingOutlined, HeartOutlined, UserAddOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { notificationApi, missionApi, chatApi } from '../../utils/api';
import websocketService from '../../utils/websocket';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/NotificationBell.css';
import { API_CONFIG } from '../../utils/constants';

const { Text, Paragraph } = Typography;

// 通知提示音URL，可替换为实际的音频文件
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3';
let notificationSound = null;

// 初始化通知提示音
const initNotificationSound = () => {
  notificationSound = new Audio(NOTIFICATION_SOUND_URL);
  notificationSound.volume = 0.5;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [isFriendRequestModalVisible, setIsFriendRequestModalVisible] = useState(false);
  const [selectedFriendRequest, setSelectedFriendRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  
  // 初始化提示音
  useEffect(() => {
    initNotificationSound();
  }, []);
  
  // 检测暗色模式
  useEffect(() => {
    // 初始检测
    const isDarkMode = document.body.classList.contains('dark-mode');
    setDarkMode(isDarkMode);
    
    // 监听body class变化以检测暗色模式切换
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.body.classList.contains('dark-mode'));
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // 清理函数
    return () => observer.disconnect();
  }, []);
  
  // 处理通知图标点击
  const handleIconClick = (e) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };
  
  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    console.log('[NotificationBell (common)] Fetching notifications and friend requests...');
    try {
      setLoading(true);
      // 同时获取普通通知和好友请求
      const [notifResponse, friendRequests] = await Promise.all([
        notificationApi.getNotifications({ limit: 10 }),
        chatApi.getFriendRequests() // 获取待处理的好友请求
      ]).catch(err => {
        console.error("Error fetching initial data:", err); // 添加错误捕获
        message.error("加载部分通知数据失败");
        return [null, null]; // 返回 null 或空数组以避免后续处理错误
      });

      let combinedNotifications = [];
      let currentUnread = 0;

      if (notifResponse?.success) {
        combinedNotifications = [...notifResponse.data.notifications];
        currentUnread = notifResponse.data.unread || 0;
        console.log('[NotificationBell (common)] Fetched regular notifications:', combinedNotifications.length, 'Unread:', currentUnread);
      }

      // 将好友请求转换为通知格式
      if (friendRequests && Array.isArray(friendRequests)) {
          console.log('[NotificationBell (common)] Raw Friend Requests:', friendRequests);
          const formattedRequests = friendRequests.map(req => ({
              notification_id: `fr_${req.request_id}`,
              id: `fr_${req.request_id}`, // 添加 id 属性以匹配普通通知结构
              user_id: req.receiver_id,
              sender_id: req.sender_id,
              notification_type: 'friend',
              action: 'request_received',
              content: req.request_message || `${req.sender_nickname || req.sender_username} 想添加你为好友`,
              content_type: 'user',
              content_id: req.sender_id,
              has_read: false,
              created_at: req.created_at,
              sender_name: req.sender_nickname || req.sender_username,
              sender_avatar: req.sender_avatar,
              request_id: req.request_id,
              request_message: req.request_message,
              // data 字段也可能需要统一，但这里暂时省略
          }));
          console.log('[NotificationBell (common)] Formatted Friend Requests:', formattedRequests);
          combinedNotifications = [...formattedRequests, ...combinedNotifications];
          // 好友请求计入未读数 (如果它们不包含在notificationApi的未读计数中)
          // 注意：如果 notificationApi.getNotifications 返回的未读数已包含好友请求，这里不应重复加
          // 假设 notificationApi 不包含好友请求的未读数
          currentUnread += formattedRequests.length;
      }

      combinedNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log('[NotificationBell (common)] Combined Notifications Set to State:', combinedNotifications);
      setNotifications(combinedNotifications);
      setUnreadCount(currentUnread);
    } catch (error) {
      console.error('获取通知/好友请求失败:', error);
      message.error('加载通知失败');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        // 只标记非好友请求的通知为已读
        setNotifications(prev =>
          prev.map(n => (n.notification_type !== 'friend' && !n.notification_id?.startsWith('fr_')) ? { ...n, has_read: true } : n)
        );
        // 重新计算未读数（只计算非好友请求的）
        setUnreadCount(prev => prev - notifications.filter(n => !n.has_read && n.notification_type !== 'friend' && !n.notification_id?.startsWith('fr_')).length);
      }
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };
  
  // 标记单个通知为已读
  const markNotificationAsRead = async (notificationId) => {
     // 确保好友请求的临时 ID 不会被发送到后端
     if (String(notificationId).startsWith('fr_')) return;
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(item =>
          item.id === notificationId ? { ...item, has_read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };
  
  // 处理通知类型和图标
  const getNotificationMeta = (notification) => {
    const types = {
      system: { icon: <BellOutlined />, color: '#1890ff' },
      mission: { icon: <TrophyOutlined />, color: '#f5a623' },
      market: { icon: <ShoppingOutlined />, color: '#52c41a' },
      comment: { icon: <MessageOutlined />, color: '#722ed1' },
      like: { icon: <HeartOutlined />, color: '#eb2f96' },
      friend: { icon: <UserAddOutlined />, color: '#faad14' }
    };
    
    return types[notification.notification_type] || { icon: <QuestionCircleOutlined />, color: '#666' };
  };
  
  // 播放通知提示音
  const playNotificationSound = () => {
    if (notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(error => {
        console.warn('播放通知提示音失败:', error);
      });
    }
  };
  
  // 显示桌面通知
  const showDesktopNotification = (notificationData) => {
    const meta = getNotificationMeta(notificationData);
    
    // 使用Ant Design的通知组件
    notification.open({
      message: `新${typeof meta.icon === 'string' ? meta.icon : React.cloneElement(meta.icon)}通知`,
      description: notificationData.content,
      icon: <Avatar style={{ backgroundColor: meta.color }}>{typeof meta.icon === 'string' ? meta.icon : React.cloneElement(meta.icon)}</Avatar>,
      placement: 'topRight',
      duration: 5
    });
  };
  
  // 处理新通知
  const handleNewNotification = (notificationData) => {
      console.log('[NotificationBell (common)] WebSocket received:', notificationData);
      let formattedNotification = notificationData;
      let isNewUnread = false;

      // 检查是否是好友请求
      if (notificationData.notification_type === 'friend' && notificationData.action === 'request_received' && notificationData.data) {
          try {
              const requestData = JSON.parse(notificationData.data);
              if (requestData.requestId) {
                  formattedNotification = {
                      ...notificationData,
                      notification_id: `fr_${requestData.requestId}`,
                      id: `fr_${requestData.requestId}`, // 添加 id
                      request_id: requestData.requestId,
                      sender_name: notificationData.sender_name || '有人',
                      sender_avatar: notificationData.sender_avatar,
                      request_message: notificationData.content,
                      has_read: false // 好友请求总是未读
                  };
                  console.log('[NotificationBell (common)] Formatted WS Friend Request:', formattedNotification);
                  isNewUnread = true; // 好友请求算作新的未读
              } else {
                  console.warn("WS friend request missing requestId:", notificationData);
              }
          } catch (e) {
              console.error("Failed to parse WS friend request data:", e, notificationData);
          }
      } else if (!notificationData.has_read) {
          isNewUnread = true; // 普通未读通知
      }

      // 添加到通知列表并排序
      setNotifications(prev => [formattedNotification, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      // 更新未读计数
      if (isNewUnread) {
          setUnreadCount(prev => prev + 1);
      }

      playNotificationSound();
      showDesktopNotification(formattedNotification);
  };
  
  // 检查并获取有效的takeId
  const getValidTakeId = (notification) => {
    // 尝试从多个可能的来源获取takeId
    let takeId = null;
    let notificationData = {};

    // 如果有data字段，尝试解析
    if (notification.data) {
      try {
        if (typeof notification.data === 'object') {
          notificationData = notification.data;
        } else {
          // 尝试解析JSON
          try {
            notificationData = JSON.parse(notification.data);
          } catch (e) {
            console.error('无法解析通知数据:', e);
            // 尝试清理非法JSON并重新解析
            const cleanJson = notification.data
              .replace(/(\w+):/g, '"$1":')
              .replace(/'/g, '"')
              .replace(/\\/g, '\\\\');
            
            try {
              notificationData = JSON.parse(cleanJson);
            } catch (e2) {
              console.error('清理后仍无法解析通知数据:', e2);
            }
          }
        }
      } catch (e) {
        console.error('处理通知数据出错:', e);
      }
    }
    
    // 从不同来源尝试获取takeId
    if (notificationData && notificationData.takeId) {
      // 来源1: 直接从解析的data中获取
      takeId = notificationData.takeId;
    } else if (notification.content_id) {
      // 来源2: 从content_id获取
      takeId = notification.content_id;
    } else if (notification.content) {
      // 来源3: 从内容文本提取
      const match = notification.content.match(/takeId:(\d+)/i) || 
                   notification.content.match(/申请.*?[^0-9]([0-9]+)/);
      if (match && match[1]) {
        takeId = parseInt(match[1], 10);
      }
    }

    // 确保takeId是数字
    if (takeId) {
      takeId = parseInt(takeId, 10);
      if (isNaN(takeId)) {
        takeId = null;
      }
    }

    console.log('从通知中提取的takeId:', takeId);
    console.log('从通知中提取的任务数据:', notificationData);
    
    return { 
      takeId, 
      notificationData,
      missionId: notificationData.missionId || notification.content_id
    };
  };
  
  // 处理通知点击事件
  const handleNotificationClick = async (notification) => {
    console.log("--- CLICKED --- notification:", notification); 

    // --- 处理好友请求 --- 
    if (notification.notification_type === 'friend' && notification.request_id) {
        console.log("--- Friend Request Clicked ---");
        setSelectedFriendRequest(notification);
        setIsFriendRequestModalVisible(true);
        setDropdownVisible(false);
        return;
    }

    // --- 处理任务申请 --- 
    if (notification.notification_type === 'mission' && notification.action === 'application') {
        console.log("--- Mission Application Clicked ---");
        // 先标记通知为已读 (如果未读)
        if (!notification.has_read && notification.id && !String(notification.id).startsWith('fr_')) {
            await markNotificationAsRead(notification.id);
        }
        const { takeId, missionId } = getValidTakeId(notification);
        if (takeId) {
            setCurrentNotification({ ...notification, data: { ...notification.data, takeId, missionId } });
            setConfirmModalVisible(true);
            setShowRejectReason(false);
            setRejectReason('');
        } else {
            message.error('无法识别任务申请信息');
        }
        setDropdownVisible(false);
        return;
    }

    // --- 处理其他普通通知 --- 
    console.log("--- Normal Notification Clicked ---");
    // 先标记为已读
    if (!notification.has_read && notification.id && !String(notification.id).startsWith('fr_')) {
        await markNotificationAsRead(notification.id);
    }
    // 再进行导航
    // TODO: 根据通知类型和内容进行导航
    if (notification.notification_type === 'comment') {
        navigate(`/post/${notification.content_id}`);
    } else if (notification.notification_type === 'like') {
        navigate(`/post/${notification.content_id}`);
    } else if (notification.notification_type === 'mission' && notification.action === 'completed') {
        navigate(`/mission/${notification.content_id}`);
    } else if (notification.notification_type === 'mission' && notification.action === 'accepted') {
        navigate(`/mission/${notification.content_id}`);
    } else if (notification.notification_type === 'mission' && notification.action === 'rejected') {
        navigate(`/mission/${notification.content_id}`);
    } else {
        console.log('未定义导航的通知类型:', notification.notification_type);
    }
    setDropdownVisible(false);
  };
  
  // 处理任务申请通知 - 接受
  const handleAcceptApplication = async () => {
    try {
      console.log('当前通知数据:', currentNotification);
      
      // 获取有效的takeId
      const { takeId, missionId } = getValidTakeId(currentNotification);
      
      if (!takeId) {
        message.error('无效的申请信息，找不到申请ID');
        console.error('找不到有效的takeId:', currentNotification);
      return;
    }
    
    setAcceptLoading(true);
      console.log('使用takeId接受申请:', takeId);
      
      // 显示请求信息
      console.log('请求URL:', `${API_CONFIG.CLIENT_API.BASE_URL}/mission/applications/${takeId}`);
      console.log('请求方法: POST');
      console.log('请求体:', { action: 'accept', message: '申请已接受，请尽快完成任务' });
      
      const response = await missionApi.handleMissionApplication(
        takeId, 
        'accept', 
        '申请已接受，请尽快完成任务'
      );
      
      if (response.success) {
        message.success('已接受任务申请');
        setConfirmModalVisible(false);
        setRejectReason(''); // 清空拒绝原因
        
        // 刷新通知列表
        fetchNotifications();
        
        // 如果有missionId，可以跳转到任务详情页
        if (missionId) {
          setTimeout(() => {
            navigate(`/mission/missions/${missionId}`);
          }, 1000);
        }
      } else {
        message.error('操作失败: ' + (response.message || '请稍后重试'));
      }
    } catch (error) {
      console.error('处理任务申请失败:', error);
      // 提供更详细的错误信息
      if (error.response) {
        message.error(`处理失败: ${error.response.status} - ${error.response.data?.message || '服务器错误'}`);
      } else if (error.message) {
        message.error(`处理失败: ${error.message}`);
      } else {
      message.error('处理任务申请失败，请检查网络连接');
      }
    } finally {
      setAcceptLoading(false);
    }
  };
  
  // 处理任务申请通知 - 拒绝
  const handleRejectApplication = async () => {
    try {
      console.log('当前通知数据:', currentNotification);
      
      // 获取有效的takeId
      const { takeId } = getValidTakeId(currentNotification);
      
      if (!takeId) {
        message.error('无效的申请信息，找不到申请ID');
        console.error('找不到有效的takeId:', currentNotification);
      return;
    }
    
    setRejectLoading(true);
      console.log('使用takeId拒绝申请:', takeId);
      
      // 显示请求信息
      console.log('请求URL:', `${API_CONFIG.CLIENT_API.BASE_URL}/mission/applications/${takeId}`);
      console.log('请求方法: POST');
      console.log('请求体:', { action: 'reject', message: rejectReason || '很抱歉，您的申请未被接受' });
      
      const response = await missionApi.handleMissionApplication(
        takeId, 
        'reject', 
        rejectReason || '很抱歉，您的申请未被接受'
      );
      
      if (response.success) {
        message.success('已拒绝任务申请');
        setConfirmModalVisible(false);
        setRejectReason(''); // 清空拒绝原因
        
        // 刷新通知列表
        fetchNotifications();
      } else {
        message.error('操作失败: ' + (response.message || '请稍后重试'));
      }
    } catch (error) {
      console.error('处理任务申请失败:', error);
      // 提供更详细的错误信息
      if (error.response) {
        message.error(`处理失败: ${error.response.status} - ${error.response.data?.message || '服务器错误'}`);
      } else if (error.message) {
        message.error(`处理失败: ${error.message}`);
      } else {
      message.error('处理任务申请失败，请检查网络连接');
      }
    } finally {
      setRejectLoading(false);
    }
  };
  
  // 好友请求 Modal 相关处理函数
  const handleAcceptFriendRequestAction = async () => {
      if (!selectedFriendRequest?.request_id) return;
      const requestId = selectedFriendRequest.request_id;
      // 添加 Loading 状态 (可选)
      try {
          const response = await chatApi.acceptFriendRequest(requestId);
          message.success(response.message || '好友请求已接受');
          setNotifications(prev => prev.filter(n => !(n.notification_type === 'friend' && n.request_id === requestId)));
          setUnreadCount(prev => Math.max(0, prev - 1));
          setIsFriendRequestModalVisible(false);
          setSelectedFriendRequest(null);
          // TODO: 处理接受后的逻辑，如打开聊天
      } catch (error) {
          console.error("接受好友请求失败:", error);
          message.error(error.response?.data?.message || '接受好友请求失败');
      }
  };

  const handleRejectFriendRequestAction = async () => {
       if (!selectedFriendRequest?.request_id) return;
       const requestId = selectedFriendRequest.request_id;
       // 添加 Loading 状态 (可选)
      try {
          const response = await chatApi.rejectFriendRequest(requestId);
          message.success(response.message || '好友请求已拒绝');
          setNotifications(prev => prev.filter(n => !(n.notification_type === 'friend' && n.request_id === requestId)));
          setUnreadCount(prev => Math.max(0, prev - 1));
          setIsFriendRequestModalVisible(false);
          setSelectedFriendRequest(null);
      } catch (error) {
          console.error("拒绝好友请求失败:", error);
          message.error(error.response?.data?.message || '拒绝好友请求失败');
      }
  };
  
  // 初始加载通知
  useEffect(() => {
    fetchNotifications();
    
    // 监听新通知
    const removeListener = websocketService.addListener('notification', handleNewNotification);
    
    return () => removeListener();
  }, [fetchNotifications]);
  
  // 下拉菜单内容
  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>通知中心</h3>
        {unreadCount > 0 && (
          <Button type="link" icon={<CheckOutlined />} onClick={markAllAsRead}>
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
          // 好友请求也视为未读，直到处理
          const isUnread = !item.has_read || item.notification_type === 'friend';
          return (
            <List.Item
              className={isUnread ? 'unread-notification' : ''}
              onClick={() => handleNotificationClick(item)} // 统一使用 handleNotificationClick
            >
              <List.Item.Meta
                avatar={
                  item.sender_avatar ? (
                    <Avatar src={item.sender_avatar} />
                  ) : (
                    <Avatar style={{ backgroundColor: meta.color }}>
                      {typeof meta.icon === 'string' ? meta.icon : React.cloneElement(meta.icon)}
                    </Avatar>
                  )
                }
                title={<Text ellipsis>{item.content}</Text>}
                description={new Date(item.created_at).toLocaleString()}
              />
            </List.Item>
          );
        }}
        locale={{ emptyText: '暂无通知' }}
      />
      
      <div className="notification-footer">
        <Button type="link" onClick={() => navigate('/notifications')}>
          查看全部
        </Button>
      </div>
    </div>
  );
  
  // 使用当前darkMode状态确定类名
  const badgeClassName = darkMode ? 'notification-badge dark' : 'notification-badge';
  
  return (
    <>
      <Badge count={unreadCount} size="small" className={badgeClassName}>
        <Dropdown
          overlay={notificationMenu}
          placement="bottomRight"
          trigger={['click']}
          visible={dropdownVisible}
          onVisibleChange={setDropdownVisible}
        >
          <div className="notification-icon" onClick={handleIconClick}>
            <BellOutlined />
          </div>
        </Dropdown>
      </Badge>

      <Modal
        title="任务申请处理"
        visible={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={null}
        className="notification-confirm-modal"
        width={480}
      >
        <div className="mission-application-header">
          <h3>任务申请审核</h3>
          <p>请查看申请者信息并决定是否接受此申请</p>
        </div>

        <div className="applicant-info-card">
          <div className="applicant-header">
            <Avatar 
              size={50} 
              icon={<UserOutlined />} 
              src={currentNotification?.data?.applicantInfo?.avatar} 
              className="applicant-avatar"
            />
            <div className="applicant-details">
              <div className="applicant-name">{currentNotification?.data?.applicantInfo?.name || '申请者'}</div>
              <div className="application-time">
                <ClockCircleOutlined style={{ marginRight: 5 }} />
                {new Date(currentNotification?.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="application-message-box">
            <div className="message-label">
              <MessageOutlined style={{ marginRight: 5 }} />
              申请说明
            </div>
            <div className="message-content">
              {currentNotification?.data?.applicantInfo?.message || '申请者没有留下任何说明'}
            </div>
          </div>
        </div>

        <div className="decision-section">
          <h4>申请处理决定</h4>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="large"
              block
              onClick={handleAcceptApplication}
              loading={acceptLoading}
            >
              接受申请
            </Button>

            <div className="button-space"></div>
            
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="large"
              block
              onClick={() => setShowRejectReason(true)}
            >
              拒绝申请
            </Button>
          </div>

          {showRejectReason && (
            <div className="reject-reason">
              <Input.TextArea
                placeholder="请输入拒绝理由（可选）"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="reject-reason-input"
                rows={3}
              />
              <div className="reject-tip">提示：拒绝理由将通过通知发送给申请者</div>
              <Space style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowRejectReason(false)}>取消</Button>
                <Button 
                  type="primary" 
                  danger
                  onClick={handleRejectApplication}
                  loading={rejectLoading}
                >
                  确认拒绝
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="好友请求"
        visible={isFriendRequestModalVisible}
        onCancel={() => {
            setIsFriendRequestModalVisible(false);
            setSelectedFriendRequest(null);
        }}
        footer={[
          <Button key="reject" onClick={handleRejectFriendRequestAction}>拒绝</Button>,
          <Button key="accept" type="primary" onClick={handleAcceptFriendRequestAction}>接受</Button>,
        ]}
        width={400}
        className="friend-request-modal"
      >
        {selectedFriendRequest && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={selectedFriendRequest.sender_avatar} size={64} icon={<UserAddOutlined />} style={{ marginRight: 16 }} />
            <div>
              <Text strong>{selectedFriendRequest.sender_name || '用户'}</Text> 想添加你为好友。
              {selectedFriendRequest.request_message && (
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  留言：{selectedFriendRequest.request_message}
                </Paragraph>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default NotificationBell; 
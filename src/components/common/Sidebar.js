/**
 * 侧边栏组件
 * 
 * 功能：
 * - 应用导航菜单
 * - 主题切换开关
 * - 聊天室入口
 * - 表白墙入口
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Switch, Avatar, List, Divider, Input, Dropdown, Space, Tooltip, Popover, message, Spin } from 'antd';
import { 
  HomeOutlined, ShoppingOutlined, TrophyOutlined, 
  MessageOutlined, BulbOutlined, HeartOutlined,
  UserOutlined, SendOutlined, CloseOutlined,
  TeamOutlined, GlobalOutlined, SmileOutlined,
  BankOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
  ArrowLeftOutlined, // 返回图标
  LikeOutlined, // 点赞图标
  UserAddOutlined // 添加好友图标
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { chatApi } from '../../utils/api';
import '../../assets/styles/Sidebar.css';

const { Sider } = Layout;

// 定义公共频道 ID (可以移到常量文件)
const CAMPUS_CHANNEL_ID = 1;
const GLOBAL_CHANNEL_ID = 2;

const Sidebar = ({ darkMode, toggleDarkMode, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams(); // 获取 searchParams
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user); // 获取当前登录用户信息

  const [chatVisible, setChatVisible] = useState(false);
  const [activeChannel, setActiveChannel] = useState('friends'); // 'friends', 'campus', 'global', 'private'
  const [selectedConversation, setSelectedConversation] = useState(null); // 存储当前选中的会话信息 { id, name, avatar, type: 'private'/'channel'/'friend_list' }
  const [hideTags, setHideTags] = useState(false); // 新增: 隐藏标签状态
  const [hasNewMessages, setHasNewMessages] = useState(false); // 新增: 新消息状态

  // API 数据状态
  const [friendsList, setFriendsList] = useState([]);
  const [conversationsList, setConversationsList] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [totalMessagePages, setTotalMessagePages] = useState(1);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const messagesEndRef = useRef(null); // 用于自动滚动到底部
  const chatMessagesRef = useRef(null); // 用于加载更多

  // --- 数据加载 Hooks ---

  // 加载好友列表和私信列表
  const loadLists = useCallback(async () => {
    console.log('[Chat] loadLists called. currentUser:', currentUser); // Log currentUser object
    if (!currentUser?.id) {
        console.warn('[Chat] loadLists aborted: currentUser.id is missing.'); // Log reason for exit
        return;
    }
    console.log(`[Chat] Loading lists for user ID: ${currentUser.userId}`); // Log start
    setIsLoadingLists(true);
    try {
      console.log('[Chat] Calling chatApi.getFriendList()...'); // Log API call
      const friendsData = await chatApi.getFriendList();
      console.log('[Chat] Received friendsData:', friendsData); // Log response

      console.log('[Chat] Calling chatApi.getConversationList()...'); // Log API call
      const conversationsData = await chatApi.getConversationList();
      console.log('[Chat] Received conversationsData:', conversationsData); // Log response

      setFriendsList(friendsData || []);
      setConversationsList(conversationsData || []);
    } catch (error) {
      console.error("[Chat] 加载列表失败:", error); // Log error
      message.error('加载好友/私信列表失败');
    } finally {
      setIsLoadingLists(false);
    }
  }, [currentUser]);

  // 加载消息
  const loadMessages = useCallback(async (conversationId, page = 1, append = false) => {
      if (!conversationId || isLoadingMessages) return;
      setIsLoadingMessages(true);
      try {
          const data = await chatApi.getMessages(conversationId, page);
          if (append) {
              // 追加旧消息到顶部
              setCurrentMessages(prev => [...data.messages, ...prev]);
          } else {
              // 首次加载或切换会话
              setCurrentMessages(data.messages || []);
              setMessagePage(data.currentPage);
              setTotalMessagePages(data.totalPages);
              // 首次加载滚动到底部
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          }
          setMessagePage(data.currentPage); // 更新当前页码
          setTotalMessagePages(data.totalPages); // 更新总页数

      } catch (error) {
          console.error(`加载会话 ${conversationId} 消息失败:`, error);
          message.error('加载消息失败');
      } finally {
          setIsLoadingMessages(false);
      }
  }, [isLoadingMessages]);


  // 聊天窗口可见时加载初始列表
  useEffect(() => {
    console.log(`[Chat] useEffect for chatVisible triggered. chatVisible: ${chatVisible}`); 
    if (chatVisible) {
      // 先设置激活频道为 friends
      setActiveChannel('friends'); 
      // 然后加载列表
      loadLists(); 
      // 重置选中会话和消息
      setSelectedConversation(null);
      setCurrentMessages([]);
      setMessagePage(1);
      setTotalMessagePages(1);
    }
  }, [chatVisible, loadLists]); // 保持依赖项不变

  // 滚动到底部
   useEffect(() => {
     if (!isLoadingMessages && currentMessages.length > 0 && messagePage === 1) { // 只在第一页加载完成时滚动
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
   }, [currentMessages, isLoadingMessages, messagePage]);


  // 处理滚动加载更多消息
   const handleScroll = () => {
       if (chatMessagesRef.current && !isLoadingMessages && messagePage < totalMessagePages) {
           // 检查是否滚动到顶部
           if (chatMessagesRef.current.scrollTop === 0) {
               console.log("滚动到顶部，加载更多...");
               const nextPage = messagePage + 1;
               if (selectedConversation?.id) { // 确保有选中的会话
                  loadMessages(selectedConversation.id, nextPage, true); // append = true
               }
           }
       }
   };


  // --- 事件处理函数 (修改后) ---

  const toggleChat = () => setChatVisible(!chatVisible);

  // 新增: 获取当前激活菜单项的 Key
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/') return '1';
    if (path.startsWith('/market')) return '2';
    if (path.startsWith('/missions')) return '3';
    if (path.startsWith('/confess')) return '4';
    if (path.startsWith('/school')) return '5';
    if (path.startsWith('/club')) return '6';
    // 可以添加其他路径的映射
    return ''; // 默认返回空
  };

  const switchChannel = (channelKey) => {
    console.log(`[Chat] switchChannel called with key: ${channelKey}`); // Log switchChannel call
    setActiveChannel(channelKey);
    setSelectedConversation(null); // 清空选中会话
    setCurrentMessages([]);     // 清空消息
    setMessagePage(1);
    setTotalMessagePages(1);

    // 如果是校园或全国频道，立即加载消息
    if (channelKey === 'campus') {
      setSelectedConversation({ id: CAMPUS_CHANNEL_ID, name: '校园频道', type: 'channel' });
      loadMessages(CAMPUS_CHANNEL_ID);
    } else if (channelKey === 'global') {
      setSelectedConversation({ id: GLOBAL_CHANNEL_ID, name: '全国频道', type: 'channel' });
      loadMessages(GLOBAL_CHANNEL_ID);
    } else if (channelKey === 'friends' || channelKey === 'private') {
       // 加载或刷新列表数据
       loadLists();
    }
  };

  const handleSelectChatUser = async (user) => {
      if (!user || !user.id || user.id === currentUser?.userId) return; // 防止选择无效用户或自己

      // 查找是否已有私信会话 ID (从 conversationsList 或调用 API)
      const existingConv = conversationsList.find(c => c.user.id === user.id);
      let conversationId;

      if (existingConv) {
          conversationId = existingConv.id;
          setSelectedConversation({ id: conversationId, name: user.name, avatar: user.avatar, type: 'private' });
          loadMessages(conversationId);
      } else {
          // 如果不在当前私信列表 (可能是从好友列表点过来的)，尝试获取或创建会话
          setIsLoadingMessages(true); // 显示加载状态
          try {
              const convData = await chatApi.getOrCreatePrivateConversation(user.id);
              conversationId = convData.conversationId;
              setSelectedConversation({ id: conversationId, name: user.name, avatar: user.avatar, type: 'private' });
              loadMessages(conversationId);
              // 可选：创建成功后刷新会话列表
              // loadLists();
          } catch (error) {
              message.error('无法开始私信');
              console.error("获取/创建私聊失败:", error);
              setIsLoadingMessages(false);
          }
      }
  };


  const handleBackToList = () => {
    setSelectedConversation(null);
    setCurrentMessages([]);
    setMessagePage(1);
    setTotalMessagePages(1);
    // 返回时可能需要根据 activeChannel 决定显示哪个列表，
    // 但 switchChannel 已经处理了列表加载，所以这里只需清空选中状态
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation?.id) return;

    const conversationId = selectedConversation.id;
    const content = messageInput;
    setMessageInput(''); // 清空输入框

    // 优化：立即将消息添加到本地状态
    const optimisticMessage = {
        id: `temp_${Date.now()}`, // 临时 ID
        senderId: currentUser.userId,
        sender: currentUser.username, // 用当前用户名
        avatar: currentUser.avatar_url,
        content: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        major: currentUser.faculty_name, // 假设 Redux 中有
        school: currentUser.school_name, // 假设 Redux 中有
        isSelf: true,
        likes: 0,
        isSystem: false,
        status: 'sending' // 可选：发送中状态
    };
    setCurrentMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);


    try {
      const sentMessage = await chatApi.sendMessage(conversationId, content);
      // 更新本地状态中的消息为服务器返回的真实消息
       setCurrentMessages(prev => prev.map(msg =>
           msg.id === optimisticMessage.id ? { ...sentMessage, isSelf: true } : msg // 确保 isSelf 仍然是 true
       ));

    } catch (error) {
      console.error("发送消息失败:", error);
      message.error('发送失败');
       // 可选：标记发送失败的消息
       setCurrentMessages(prev => prev.map(msg =>
           msg.id === optimisticMessage.id ? { ...msg, status: 'failed' } : msg
       ));
    }
  };

    const handleLikeMessage = async (messageId) => {
        // 优化：立即更新本地状态
        setCurrentMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
        ));
        try {
            const response = await chatApi.likeMessage(messageId);
            // 可选：用服务器返回的精确点赞数更新状态
            setCurrentMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, likes: response.likes } : msg
            ));
        } catch (error) {
            console.error("点赞失败:", error);
            message.error('点赞失败');
             // 回滚本地状态
             setCurrentMessages(prev => prev.map(msg =>
                 msg.id === messageId ? { ...msg, likes: (msg.likes || 1) - 1 } : msg
             ));
        }
    };


    const handleStartPrivateChat = async (userInfo) => {
        if (userInfo.id === currentUser?.userId) {
            message.info('不能和自己私信哦');
            return;
        }
        // 直接调用 handleSelectChatUser 来处理，它包含了获取/创建逻辑
         handleSelectChatUser(userInfo);

         // 关闭 Popover (如果 Popover 没有自动关闭)
         // 你可能需要管理 Popover 的 visible 状态来实现手动关闭
    };


    const handleAddFriend = async (userInfo) => {
        if (userInfo.id === currentUser?.userId) {
            message.info('不能添加自己为好友');
            return;
        }
        try {
            const response = await chatApi.sendFriendRequest(userInfo.id);
            message.success(response.message || '好友请求已发送');
             // 关闭 Popover
        } catch (error) {
            console.error("发送好友请求失败:", error);
            message.error(error.response?.data?.message || '发送好友请求失败');
        }
    };


  // --- 渲染函数 (修改后) ---

  const renderChatHeaderTitle = () => {
    if (selectedConversation) {
      return selectedConversation.name;
    }
    switch (activeChannel) {
      case 'friends': return '好友列表';
      case 'private': return '私信列表';
      case 'campus': return '校园频道'; // 应该不会显示这个，因为会直接进 selectedConversation
      case 'global': return '全国频道'; // 同上
      default: return '聊天';
    }
  };

  const renderChatContent = () => {
      if (isLoadingMessages && currentMessages.length === 0) { // 初始加载
          return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin /></div>;
      }

      if (selectedConversation) { // 显示聊天窗口或频道消息
        return (
          <>
            <div className="chat-messages" ref={chatMessagesRef} onScroll={handleScroll}>
               {/* 加载更多按钮或提示 */}
               {isLoadingMessages && messagePage > 1 && (
                   <div style={{ textAlign: 'center', padding: '10px' }}><Spin size="small" /></div>
               )}
               {messagePage >= totalMessagePages && currentMessages.length > 0 && messagePage > 1 && (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '12px', padding: '10px 0' }}>没有更多消息了</div>
               )}
              <List
                itemLayout="horizontal"
                dataSource={currentMessages} // 使用 state 中的消息
                renderItem={item => {
                   // 头像的 Popover 内容 (仅对非自己、非系统消息显示)
                  const canInteract = !item.isSelf && !item.isSystem;
                  const popoverContent = canInteract ? (
                      <Space direction="vertical">
                          <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleStartPrivateChat({ id: item.senderId, name: item.sender, avatar: item.avatar })}>发送私信</Button>
                          <Button type="link" size="small" icon={<UserAddOutlined />} onClick={() => handleAddFriend({ id: item.senderId, name: item.sender })}>添加好友</Button>
                      </Space>
                  ) : null;

                  return (
                      <List.Item key={item.id} className={`chat-message ${item.isSelf ? 'self-message' : ''} ${item.isSystem ? 'system-message' : ''}`}>
                          {/* 头像 */}
                          {!item.isSystem && (
                              canInteract ? (
                                  <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                                      <span style={{ cursor: 'pointer' }}><Avatar src={item.avatar} className="chat-avatar" /></span>
                                  </Popover>
                              ) : (
                                  <Avatar src={item.avatar || undefined} icon={!item.avatar ? <UserOutlined /> : null} className="chat-avatar" />
                              )
                          )}
                          {/* 消息气泡 */}
                          <div className="message-bubble">
                             {!item.isSystem && (
                                  <div className="message-header">
                                      {/* Sender Name & Meta (only for others in channels) */}
                                      {!item.isSelf && (selectedConversation.type === 'channel') && (
                                          <span className="sender-name">
                                              {item.sender}
                                              {activeChannel === 'campus' && item.major && <span className="sender-meta"> ({item.major})</span>}
                                              {activeChannel === 'global' && item.school && <span className="sender-meta"> ({item.school})</span>}
                                          </span>
                                      )}
                                      <span className="message-time">{item.time}</span>
                                  </div>
                              )}
                              <div className="message-text">{item.content}</div>
                              {/* Actions (Likes) - for channels and non-system messages */}
                              {!item.isSystem && selectedConversation.type === 'channel' && (
                                  <div className="message-actions">
                                      <Button type="text" size="small" icon={<LikeOutlined />} onClick={() => handleLikeMessage(item.id)} className="like-button" />
                                      {item.likes > 0 && <span className="like-count">{item.likes}</span>}
                                  </div>
                              )}
                          </div>
                          {/* 可选：显示发送状态 */}
                          {item.status === 'sending' && <Spin size="small" style={{ marginLeft: '8px', alignSelf: 'center' }} />}
                          {item.status === 'failed' && <Tooltip title="发送失败"><CloseCircleOutlined style={{ color: 'red', marginLeft: '8px', alignSelf: 'center', cursor: 'pointer' }} /* onClick={retrySend} */ /></Tooltip>}
                      </List.Item>
                  );
                }}
              />
               <div ref={messagesEndRef} /> {/* 用于滚动到底部 */}
            </div>
            <Divider style={{ margin: '0' }} />
            <div className="chat-input">
              <Input placeholder={`说点什么...`} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onPressEnter={sendMessage} />
              <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
            </div>
          </>
        );
      }

    // 显示列表
    switch (activeChannel) {
      case 'friends':
           return (
              <div className="chat-list-container">
                 {isLoadingLists ? <div style={{textAlign: 'center', padding: '20px'}}><Spin /></div> :
                   <List
                     itemLayout="horizontal"
                     dataSource={friendsList} // 使用 state 中的好友列表
                     renderItem={item => (
                       <List.Item className="chat-list-item" onClick={() => handleSelectChatUser(item)}>
                         <List.Item.Meta
                           avatar={<Avatar src={item.avatar} />}
                           title={item.name}
                           description={item.lastMessage || ' '} // 显示最后消息或空
                         />
                         <div className="message-time">{item.timestamp}</div>
                       </List.Item>
                     )}
                     locale={{ emptyText: '暂无好友' }}
                   />
                 }
              </div>
           );
        case 'private':
           return (
              <div className="chat-list-container">
                 {isLoadingLists ? <div style={{textAlign: 'center', padding: '20px'}}><Spin /></div> :
                    <List
                       itemLayout="horizontal"
                       dataSource={conversationsList} // 使用 state 中的会话列表
                       renderItem={item => (
                          <List.Item className="chat-list-item" onClick={() => handleSelectChatUser(item.user)}>
                             <List.Item.Meta
                                avatar={<Avatar src={item.user.avatar} />}
                                title={item.user.name}
                                description={item.lastMessage}
                             />
                             <div className="message-time">{item.timestamp}</div>
                          </List.Item>
                       )}
                       locale={{ emptyText: '暂无私信' }}
                    />
                 }
              </div>
           );
        default: // campus and global are handled by selectedConversation now
           return null;
    }
  };

  // 处理侧边栏收缩
  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // 处理标签隐藏设置
  const handleHideTagsChange = (checked) => {
    // 获取所有带有特定类名的标签
    const tags = document.querySelectorAll('.ant-tag.ant-tag-blue');
    tags.forEach(tag => {
      tag.style.display = checked ? 'none' : '';
    });
    setHideTags(checked); // 更新状态
  };

  // 处理退出登录
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 设置菜单项
  const settingsMenu = {
    items: [
      {
        key: '1',
        label: '默认首页设置',
        icon: <HomeOutlined />,
      },
      {
        key: '2',
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>深浅模式</span>
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
              size="small"
              style={{ marginLeft: 8 }}
            />
          </div>
        ),
        icon: <BulbOutlined />,
      },
      {
        key: '3',
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>隐藏标签</span>
            <Switch
              checked={hideTags}
              onChange={handleHideTagsChange}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </div>
        ),
        icon: <CloseCircleOutlined />,
      },
      {
        key: '4',
        label: '通用设置',
        icon: <SettingOutlined />,
      },
      {
        key: '5',
        label: '键盘快捷键',
        icon: <MenuOutlined />,
      },
      {
        key: '6',
        label: '常见问题',
        icon: <QuestionCircleOutlined />,
      },
      {
        key: '7',
        label: '意见反馈',
        icon: <MessageOutlined />,
      },
    ],
  };
  
  // 新增：监听 URL 查询参数以打开聊天
  useEffect(() => {
    const chatToOpen = searchParams.get('openChat');
    const userIdToOpen = searchParams.get('userId');

    if (chatToOpen === 'private' && userIdToOpen) {
      const userIdNum = parseInt(userIdToOpen, 10);
      if (!isNaN(userIdNum) && userIdNum !== currentUser?.id) {
        console.log(`[Sidebar] Detected URL request to open chat with user ID: ${userIdNum}`);
        // 调用 handleSelectChatUser 来打开聊天窗口
        // 注意：handleSelectChatUser 现在需要能处理仅传入 user ID 的情况
        // 它内部会调用 getOrCreatePrivateConversation 来获取/创建会话
        handleSelectChatUser({ id: userIdNum }); 

        // 处理完后，从 URL 中移除查询参数，避免重复触发
        // 使用 navigate 而不是 setSearchParams 来完全替换历史记录项
        navigate(location.pathname, { replace: true });
      }
    }
  }, [searchParams, location.pathname, navigate, currentUser?.id, handleSelectChatUser]); // 添加依赖项

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed} // 使用传入的 setCollapsed
        className="app-sider"
        theme={darkMode ? "dark" : "light"}
        // trigger={null} // 移除默认触发器
      >
        <div className="logo-container">
         {!collapsed && <h2 className="logo">CampusLife</h2>}
        </div>
        
        {/* 主导航菜单 */}
        <Menu
          theme={darkMode ? "dark" : "light"}
          mode="inline"
          // defaultSelectedKeys={[getActiveKey()]} // 移除 defaultSelectedKeys，避免冲突
          selectedKeys={[getActiveKey()]} // 仅使用 selectedKeys
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: <Link to="/">首页</Link>,
            },
            {
              key: '2',
              icon: <ShoppingOutlined />,
              label: <Link to="/market">校园集市</Link>,
            },
            {
              key: '3',
              icon: <TrophyOutlined />,
              label: <Link to="/missions">悬赏任务</Link>,
            },
            {
              key: '4',
              icon: <HeartOutlined />,
              label: <Link to="/confess">表白墙</Link>,
              className: 'confession-menu-item'
            },
            {
              key: '6', // 社团活动现在是第5个主要导航项（逻辑上）
              icon: <TeamOutlined />,
              label: <Link to="/club">社团活动</Link>,
              className: 'club-menu-item'
            },
            {
              key: '5', // 校园主页调整到社团活动下方，key保持为'5'以兼容getActiveKey
              icon: <BankOutlined />,
              label: <Link to="/school">校园主页</Link>,
              className: 'school-menu-item',
              style: { marginTop: '10px' } // 增加顶部间隙
            },
            {
              key: '7', // 新增全国主页
              icon: <GlobalOutlined />,
              label: <Link to="/allschool">全国主页</Link>, // 假设路由为 /allschool
              className: 'allschool-menu-item' // 可以添加自定义类名
            }
            // 聊天不再是主导航项
          ]}
        />
        
        {/* 底部按钮区域 */}
        <div className="sidebar-footer">
          <Space direction={collapsed ? 'vertical' : 'horizontal'} size={collapsed ? "middle" : "small"}>
            <Tooltip title={collapsed ? "展开菜单" : "收起菜单"} placement="right">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={handleCollapse}
            />
            </Tooltip>
            
            <Dropdown
              menu={settingsMenu}
              placement="topRight"
              trigger={['click']} // 改为 click 触发
              getPopupContainer={(trigger) => trigger.closest('.sidebar-footer') || document.body} // 确保在 footer 内
            >
               <Tooltip title="设置" placement="right">
              <Button
                type="text"
                icon={<SettingOutlined />}
              />
               </Tooltip>
            </Dropdown>
            
             <Tooltip title="退出登录" placement="right">
            <Button
              type="text"
              icon={<LogoutOutlined />}
                 onClick={handleLogout}
            />
             </Tooltip>

          <Badge count={hasNewMessages ? 1 : 0} dot={hasNewMessages}>
              <Tooltip title="聊天室" placement="right">
            <Button 
              type="text" 
              icon={<MessageOutlined />} 
              onClick={toggleChat}
              className="chat-button"
            >
                 {!collapsed && <span className="chat-button-text">聊天室</span>}
            </Button>
               </Tooltip>
          </Badge>
          </Space>
        </div>
      </Sider>
      
      {/* 聊天室覆盖层 */}
      {chatVisible && (
        <div className={`chat-overlay ${darkMode ? 'dark-mode' : ''}`} style={{ left: collapsed ? `calc(80px + 15px)` : `calc(200px + 15px)` }}> {/* 调整间距 */}
          {/* 聊天频道侧边栏 */}
          <div className="chat-sidebar">
             <Tooltip title="好友" placement="right" mouseEnterDelay={0.5}>
            <Button 
              type="text"
              className={`chat-channel-btn ${activeChannel === 'friends' ? 'active' : ''}`}
              onClick={() => switchChannel('friends')}
              icon={<SmileOutlined />}
            >
                <span>好友</span>
            </Button>
             </Tooltip>
             <Tooltip title="校园" placement="right" mouseEnterDelay={0.5}>
            <Button 
              type="text"
              className={`chat-channel-btn ${activeChannel === 'campus' ? 'active' : ''}`}
              onClick={() => switchChannel('campus')}
              icon={<TeamOutlined />}
            >
                 <span>校园</span>
            </Button>
             </Tooltip>
             <Tooltip title="全国" placement="right" mouseEnterDelay={0.5}>
            <Button 
              type="text"
              className={`chat-channel-btn ${activeChannel === 'global' ? 'active' : ''}`}
              onClick={() => switchChannel('global')}
              icon={<GlobalOutlined />}
            >
                <span>全国</span>
              </Button>
              </Tooltip>
            <Divider style={{ margin: '8px 10px' }} /> {/* 调整分隔线样式 */}
             <Tooltip title="私信" placement="right" mouseEnterDelay={0.5}>
              <Button 
                type="text"
                className={`chat-channel-btn ${activeChannel === 'private' ? 'active' : ''}`}
                onClick={() => switchChannel('private')}
                icon={<MessageOutlined />}
              >
                 <span>私信</span>
            </Button>
             </Tooltip>
          </div>
          
          {/* 聊天主区域 */}
          <div className="chat-main">
            <div className="chat-container">
              <div className="chat-header">
                {/* 添加返回按钮 */}
                {selectedConversation && (
                  <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleBackToList} 
                    style={{ marginRight: '8px' }} 
                  />
                )}
                <h3>{renderChatHeaderTitle()}</h3>
                <Button type="text" icon={<CloseOutlined />} onClick={toggleChat} title="关闭聊天" />
              </div>
              
              {/* 渲染内容：列表或聊天窗口 */}
              {renderChatContent()}
              
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
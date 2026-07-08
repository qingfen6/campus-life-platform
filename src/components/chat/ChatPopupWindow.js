import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, Button, List, Avatar, Spin, Empty, Tooltip, message } from 'antd';
import { SendOutlined, CloseOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
    closeChatPopup,
    initializeChatPopup,
    sendChatMessageViaPopup,
    appendOptimisticMessage, // Assuming WebSocket updates might use this or a similar action
    // TODO: Add actions for loading more messages if needed
} from '../../store/slices/chatPopupSlice'; // Adjusted path
import '../../assets/styles/ChatPopupWindow.css'; 

const ChatPopupWindow = () => {
    const dispatch = useDispatch();
    const { isVisible, targetUser, conversationId, messages, isLoading, error, currentPage, totalPages } = useSelector(state => state.chatPopup);
    const currentUser = useSelector(state => state.auth.user); 
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const chatBodyRef = useRef(null); // Ref for the scrollable message body

    // Initialize chat when the popup becomes visible with a target user
    useEffect(() => {
        // Dispatch initializeChatPopup when the modal becomes visible
        // and we have a target user, but haven't initialized the conversation yet (conversationId is null).
        if (isVisible && targetUser && !conversationId) {
             // We don't need to check isLoading here, the thunk handles its own loading state.
             console.log('[ChatPopupWindow Effect] Triggering initialization for:', targetUser); // Add log
             dispatch(initializeChatPopup(targetUser));
        }
        // Note: If the same popup needs to be reused for *different* targetUsers without closing,
        // more complex logic might be needed here to reset state when targetUser changes.
        // For now, this handles the initial opening correctly.

    }, [isVisible, targetUser, conversationId, dispatch]); // Remove isLoading from dependency array

    // Scroll to bottom logic
     useEffect(() => {
        if (isVisible && messages.length > 0) {
           // Scroll to bottom when messages change, especially on initial load or new messages
            // Use a short timeout to ensure the DOM has updated
           setTimeout(() => {
               messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
           }, 100);
        }
     }, [messages, isVisible]);


    const handleSendMessage = () => {
        if (!messageInput.trim() || !conversationId || isLoading) return;
        const content = messageInput;
        setMessageInput('');
        dispatch(sendChatMessageViaPopup({ conversationId, content }));
    };

    const handleClose = () => {
        dispatch(closeChatPopup());
    };

    // TODO: Implement loading more messages on scroll
    const handleScroll = useCallback((e) => {
        // const { scrollTop } = e.currentTarget;
        // if (scrollTop === 0 && !isLoading && currentPage < totalPages) {
        //     console.log("Loading more messages...");
        //     // dispatch(loadMoreMessagesThunk(conversationId, currentPage + 1));
        // }
    }, [isLoading, currentPage, totalPages, conversationId, dispatch]);

    // TODO: Handle WebSocket incoming messages
    // useEffect(() => { ... }, [conversationId, dispatch]);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={targetUser?.avatar} icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
                    <span>与 {targetUser?.name || '用户'} 的对话</span>
                </div>
            }
            open={isVisible}
            onCancel={handleClose}
            footer={null} 
            width={500} 
            bodyStyle={{ padding: 0, height: '60vh', display: 'flex', flexDirection: 'column' }} 
            className="chat-popup-window"
            destroyOnClose 
        >
            <div className="chat-popup-messages" ref={chatBodyRef} onScroll={handleScroll}>
                {isLoading && messages.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin tip="加载中..." /></div>
                ) : error ? (
                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                         <Empty description={<span style={{color: 'red'}}>{`加载失败: ${error}`}</span>} />
                     </div>
                ) : messages.length === 0 && !isLoading ? ( // Only show empty if not loading
                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                         <Empty description="开始对话吧！" />
                     </div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={messages}
                        renderItem={item => {
                             // Determine if the previous message was from the same sender
                            // const previousMessage = messages[messages.indexOf(item) - 1];
                            // const showAvatar = !item.isSelf && (!previousMessage || previousMessage.senderId !== item.senderId);
                            const showAvatar = !item.isSelf; // Simplified: always show avatar for others for now

                            return (
                                <List.Item key={item.id} className={`chat-popup-message-item ${item.isSelf ? 'self' : 'other'}`}>
                                     {showAvatar && (
                                        <Avatar className="message-avatar" src={item.avatar} icon={<UserOutlined />} size="small"/>
                                     )}
                                     {!item.isSelf && !showAvatar && <div className="avatar-placeholder"></div>} {/* Placeholder for alignment */}

                                    <div className="message-content-wrapper">
                                         {!item.isSelf && showAvatar && <span className="sender-name">{item.sender}</span>}
                                        <div className="message-bubble-popup">
                                           <div className="message-content-popup">{item.content}</div>
                                           <div className="message-time-popup">{item.time}</div>
                                        </div>
                                    </div>
                                     {item.isSelf && (
                                        <div className="message-status-icons">
                                             {item.status === 'sending' && <Spin size="small" />}
                                             {item.status === 'failed' && <Tooltip title="发送失败"><CloseCircleOutlined style={{ color: 'red', cursor: 'pointer' }} /></Tooltip>}
                                             {/* Add checkmark for sent/delivered if needed */}
                                         </div>
                                     )}
                                     {item.isSelf && !showAvatar && <div className="avatar-placeholder"></div>} {/* Placeholder for alignment */}
                                     {item.isSelf && (
                                         <Avatar className="message-avatar self-avatar" src={currentUser?.avatar_url} icon={<UserOutlined />} size="small"/>
                                     )}
                                </List.Item>
                            );
                        }}

                    />
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-popup-input">
                <Input.TextArea
                    placeholder="输入消息..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={(e) => {
                       if (!e.shiftKey && !isLoading && conversationId && messageInput.trim()) { 
                           e.preventDefault();
                           handleSendMessage();
                       }
                    }}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    disabled={isLoading || !conversationId}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={isLoading || !conversationId || !messageInput.trim()}
                    // loading={isLoading && messages.some(m => m.status === 'sending')} 
                />
            </div>
        </Modal>
    );
};

export default ChatPopupWindow; // Ensure default export

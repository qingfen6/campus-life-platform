import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Avatar, message } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import '../../assets/styles/CommentSection.css';

const CommentForm = ({ 
  postId, 
  parentId = null, 
  onSubmit, 
  placeholder = '发表你的评论... 按 Ctrl+Enter 发送', 
  autoFocus = false,
  disabled = false,
  user = {}
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('评论内容不能为空');
      return;
    }

    if (!user || !user.id) {
      message.warning('请先登录后再评论');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(content, parentId);
      setContent('');
      message.success('评论发表成功');
    } catch (error) {
      console.error('评论提交失败:', error);
      message.error('评论提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter 提交评论
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="comment-form">
      <div className="comment-form-content">
        <Avatar 
          src={user?.avatar} 
          icon={!user?.avatar && <UserOutlined />}
          size="large"
          className="comment-avatar"
        >
          {user?.username?.[0]}
        </Avatar>
        <Form className="comment-input-form" layout="vertical">
          <Form.Item className="comment-input-container">
            <Input.TextArea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={disabled || submitting}
              maxLength={500}
              showCount
              className="comment-input"
            />
          </Form.Item>
          <div className="comment-submit">
            
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={submitting}
              disabled={disabled || !content.trim()}
              icon={<SendOutlined />}
            >
              发表评论
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CommentForm;

 
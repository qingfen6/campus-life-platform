import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Tabs, message, Spin, Layout } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { userApi } from '../utils/api';
import websocketService from '../utils/websocket';
import '../assets/styles/LoginPage.css';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';

const { Content } = Layout;

/**
 * 登录页面组件
 * 
 * 功能：
 * - 用户登录
 * - 用户注册
 * - 表单验证
 * - 与后端API交互
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 深色模式状态
 * @returns {JSX.Element} 登录页面组件
 */
const LoginPage = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // 从 Redux store 获取状态 (虽然在这里可能不直接用，但引入了 useSelector)
  // const { isAuthenticated } = useSelector(state => state.auth);

  /**
   * 处理登录表单提交
   * @param {Object} values - 表单值
   */
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      console.log('[LoginPage] 开始登录请求，email:', values.email);

      const response = await userApi.login(values); // 调用登录API
      console.log('[LoginPage] 登录响应:', response);

      if (response && response.token && response.id) { // 确保响应包含必要信息
        console.log('[LoginPage] 登录成功，获取到token:', response.token ? '有token' : '无token', '用户ID:', response.id);
        message.success('登录成功');

        // 构造传递给 loginSuccess 的 payload (仅含基本信息)
        const userPayload = {
          id: response.id,
          username: response.username,
          email: response.email,
          avatar: response.avatar,
          // ... 其他登录接口返回的基本字段
        };
        const tokenPayload = response.token;

        // Dispatch loginSuccess 来更新 Redux 状态
        dispatch(loginSuccess({ user: userPayload, token: tokenPayload }));
        console.log('[LoginPage] Dispatched loginSuccess with basic user info and token.');

        // --- 跳转逻辑 ---
        const from = location.state?.from?.pathname || '/school'; // 默认跳转到 /school
        console.log(`[LoginPage] 准备跳转到: ${from}`);
        navigate(from, { replace: true }); // 使用 replace: true

      } else {
        console.error('[LoginPage] 登录响应错误或缺少信息:', response);
        message.error(response?.message || '登录失败，请检查账号和密码');
      }
    } catch (err) {
      console.error('[LoginPage] 登录过程出错:', err);
      const errorMessage = err.response?.data?.message || err.message || '登录失败，请稍后再试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理注册表单提交
   * @param {Object} values - 表单值
   */
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      console.log('[LoginPage] 尝试注册，邮箱:', values.email, '用户名:', values.username);
      
      const { confirm, ...userData } = values;
      
      const response = await userApi.createUser(userData);
      console.log('[LoginPage] 注册响应:', response);
      
      if (response) {
        message.success('注册成功，请登录');
        setActiveTab('login');
        loginForm.resetFields();
        registerForm.resetFields();
      } else {
        throw new Error('注册接口未返回预期响应');
      }
    } catch (error) {
      console.error('[LoginPage] 注册失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后再试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Spin spinning={loading}>
          <Form
            name="login-form"
            className="login-form"
            onFinish={handleLogin}
            form={loginForm}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入您的邮箱' },
                { type: 'email', message: '请输入有效的邮箱格式' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入您的密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="login-form-button"
                size="large"
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Spin spinning={loading}>
          <Form
            name="register-form"
            className="register-form"
            onFinish={handleRegister}
            form={registerForm}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入您的姓名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="姓名" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入您的邮箱' },
                { type: 'email', message: '请输入有效的邮箱格式' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能少于6个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认您的密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="确认密码" 
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="register-form-button"
                size="large"
                block
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    }
  ];

  return (
    <Layout className={`login-layout ${darkMode ? 'dark' : 'light'}`}>
      <Content className="login-content">
        <div className="login-container">
          <Card 
            className="login-card"
            variant="bordered"
            title={<div className="login-title">校园生活平台</div>}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={tabItems}
            />
            <div className="login-footer">
              <p>校园生活平台 © {new Date().getFullYear()}</p>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage; 
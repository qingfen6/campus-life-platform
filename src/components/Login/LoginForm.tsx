import { LockOutlined, UserOutlined } from '../../utils/iconUtils';
import { Button, Form, Input, Card, Divider, message } from 'antd';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FormData {
  username: string;
  password: string;
}

const LDAPLoginForm: React.FC = () => {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: FormData) => {
    setLoading(true);
    try {
      // 实际应替换为真实API调用
      await axios.post('/api/ldap-login', values);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查凭证');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e6fffa 0%, #ebf4ff 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        title="校园认证登录"
        style={{
          width: 400,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: 15
        }}
      >
        <Form
          form={form}
          name="ldap_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入学工号!' },
              { pattern: /^\d{8,12}$/, message: '学工号格式不正确' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="学工号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入统一认证密码!' },
              { min: 8, message: '密码长度至少8位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="统一认证密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>其他登录方式</Divider>
        
        <Button 
          icon={<img src="/assets/wechat.svg" alt="微信" style={{width: 20}} />}
          block
          style={{ background: '#07C160', color: 'white' }}
        >
          微信登录
        </Button>
      </Card>
    </div>
  );
};

export default LDAPLoginForm; 
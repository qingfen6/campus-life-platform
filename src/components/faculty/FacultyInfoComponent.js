/**
 * 学院基本信息组件
 * 
 * 功能：
 * - 展示学院名称、简介
 * - 展示学院成立时间
 * - 展示使命与愿景
 * - 展示院长致辞
 * - 展示学院联系方式
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { Row, Col, Typography, Card, Descriptions, Divider, Button, Modal, Form, Input, message } from 'antd';
import { EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, EnvironmentOutlined } from '@ant-design/icons';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/**
 * 学院基本信息组件
 * @param {Object} props 组件属性
 * @param {Object} props.data 学院信息数据
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 学院基本信息组件
 */
const FacultyInfoComponent = ({ data, isEditMode }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingData, setEditingData] = useState({ ...data });
  const [form] = Form.useForm();
  
  // 打开编辑模态框
  const showEditModal = () => {
    form.setFieldsValue(data);
    setEditModalVisible(true);
  };
  
  // 关闭编辑模态框
  const handleCancel = () => {
    setEditModalVisible(false);
  };
  
  // 保存编辑内容
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        setEditingData(values);
        message.success('学院信息已更新');
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };
  
  // 显示数据（如果有编辑则显示编辑后的，否则显示原始数据）
  const displayData = editingData || data;

  return (
    <div className="faculty-info-component">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <div className="faculty-intro">
            <Title level={4}>学院介绍</Title>
            <Paragraph>{displayData.intro}</Paragraph>
            
            <Title level={4}>学院使命</Title>
            <Paragraph>{displayData.mission}</Paragraph>
            
            <Title level={4}>学院愿景</Title>
            <Paragraph>{displayData.vision}</Paragraph>
            
            <Title level={4}>院长致辞</Title>
            <Paragraph>{displayData.deanMessage}</Paragraph>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="faculty-contact-card">
            <Title level={4}>基本信息</Title>
            <Descriptions column={1}>
              <Descriptions.Item label="学院名称">{displayData.name}</Descriptions.Item>
              <Descriptions.Item label="英文名称">{displayData.englishName}</Descriptions.Item>
              <Descriptions.Item label="成立时间">{displayData.establishYear}年</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={4}>联系方式</Title>
            <ul className="faculty-contact-list">
              <li>
                <EnvironmentOutlined className="contact-icon" />
                <span>{displayData.contact.address}</span>
              </li>
              <li>
                <PhoneOutlined className="contact-icon" />
                <span>{displayData.contact.phone}</span>
              </li>
              <li>
                <MailOutlined className="contact-icon" />
                <span>{displayData.contact.email}</span>
              </li>
              <li>
                <GlobalOutlined className="contact-icon" />
                <span>{displayData.contact.website}</span>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
      
      {/* 编辑按钮（仅在编辑模式下显示） */}
      {isEditMode && (
        <div className="edit-component-buttons">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={showEditModal}
          >
            编辑学院信息
          </Button>
        </div>
      )}
      
      {/* 编辑模态框 */}
      <Modal
        title="编辑学院基本信息"
        open={editModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={data}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="学院名称"
                rules={[{ required: true, message: '请输入学院名称' }]}
              >
                <Input placeholder="请输入学院名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="englishName"
                label="英文名称"
                rules={[{ required: true, message: '请输入英文名称' }]}
              >
                <Input placeholder="请输入英文名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shortName"
                label="学院简称"
              >
                <Input placeholder="请输入学院简称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="establishYear"
                label="成立时间"
                rules={[{ required: true, message: '请输入成立时间' }]}
              >
                <Input placeholder="请输入成立年份" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="intro"
            label="学院介绍"
            rules={[{ required: true, message: '请输入学院介绍' }]}
          >
            <TextArea rows={4} placeholder="请输入学院介绍" />
          </Form.Item>
          
          <Form.Item
            name="mission"
            label="学院使命"
            rules={[{ required: true, message: '请输入学院使命' }]}
          >
            <TextArea rows={3} placeholder="请输入学院使命" />
          </Form.Item>
          
          <Form.Item
            name="vision"
            label="学院愿景"
            rules={[{ required: true, message: '请输入学院愿景' }]}
          >
            <TextArea rows={3} placeholder="请输入学院愿景" />
          </Form.Item>
          
          <Form.Item
            name="deanMessage"
            label="院长致辞"
            rules={[{ required: true, message: '请输入院长致辞' }]}
          >
            <TextArea rows={4} placeholder="请输入院长致辞" />
          </Form.Item>
          
          <Divider orientation="left">联系方式</Divider>
          
          <Form.Item
            name={['contact', 'address']}
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入地址" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['contact', 'phone']}
                label="电话"
                rules={[{ required: true, message: '请输入电话' }]}
              >
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['contact', 'email']}
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name={['contact', 'website']}
            label="网站"
            rules={[{ required: true, message: '请输入网站' }]}
          >
            <Input placeholder="请输入网站" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyInfoComponent; 
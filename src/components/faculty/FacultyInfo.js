/**
 * 学院基本信息组件
 * 
 * 功能：
 * - 显示学院基本信息（名称、简介、成立时间）
 * - 学院使命与愿景展示
 * - 院长致辞
 * - 学院联系方式
 * - 支持管理员编辑内容
 */
import React, { useState } from 'react';
import { Card, Typography, Descriptions, Avatar, Row, Col, Button, Modal, Form, Input, Divider, Tooltip } from 'antd';
import { EditOutlined, PhoneOutlined, MailOutlined, HomeOutlined, ClockCircleOutlined, UserOutlined, SaveOutlined } from '@ant-design/icons';
import './FacultyInfo.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const FacultyInfo = ({ facultyData, isAdmin = false, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();
  
  // 处理编辑按钮点击
  const handleEditClick = () => {
    editForm.setFieldsValue(facultyData);
    setIsEditing(true);
  };
  
  // 处理保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      onSave(values);
      setIsEditing(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };
  
  // 渲染学院基本信息
  const renderFacultyInfo = () => (
    <div className="faculty-info-container">
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} md={8}>
          <div className="faculty-logo-container">
            <Avatar 
              src={facultyData.logo} 
              size={150} 
              shape="square" 
            />
          </div>
        </Col>
        <Col xs={24} md={16}>
          <Title level={2}>{facultyData.name}</Title>
          <Descriptions column={1} className="faculty-meta">
            <Descriptions.Item label={<><ClockCircleOutlined /> 成立时间</>}>
              {facultyData.foundingTime}
            </Descriptions.Item>
          </Descriptions>
          <Paragraph>{facultyData.introduction}</Paragraph>
        </Col>
      </Row>
      
      <Divider orientation="left">学院使命与愿景</Divider>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="使命" bordered={false} className="mission-card">
            <Paragraph>{facultyData.mission}</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="愿景" bordered={false} className="vision-card">
            <Paragraph>{facultyData.vision}</Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">院长致辞</Divider>
      <Row gutter={[24, 24]} className="dean-speech">
        <Col xs={24} md={6}>
          <Avatar 
            src={facultyData.deanPhoto} 
            size={120} 
            className="dean-avatar"
          />
          <div className="dean-name">
            <Text strong>{facultyData.deanName}</Text>
            <br />
            <Text type="secondary">院长</Text>
          </div>
        </Col>
        <Col xs={24} md={18}>
          <Paragraph className="speech-content">
            {facultyData.deanSpeech}
          </Paragraph>
        </Col>
      </Row>
      
      <Divider orientation="left">联系我们</Divider>
      <Row className="contact-info">
        <Col xs={24} md={24}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={<><PhoneOutlined /> 电话</>}>
              {facultyData.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined /> 邮箱</>}>
              {facultyData.contactEmail}
            </Descriptions.Item>
            <Descriptions.Item label={<><HomeOutlined /> 地址</>}>
              {facultyData.contactAddress}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      
      {isAdmin && (
        <div className="edit-button-container">
          <Tooltip title="编辑学院信息">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={handleEditClick}
              className="edit-button"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
  
  // 编辑表单
  const renderEditForm = () => (
    <Modal
      title="编辑学院基本信息"
      open={isEditing}
      onCancel={() => setIsEditing(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsEditing(false)}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} icon={<SaveOutlined />}>
          保存
        </Button>
      ]}
      width={800}
    >
      <Form
        form={editForm}
        layout="vertical"
        initialValues={facultyData}
      >
        <Form.Item name="name" label="学院名称" rules={[{ required: true, message: '请输入学院名称' }]}>
          <Input placeholder="请输入学院名称" />
        </Form.Item>
        
        <Form.Item name="foundingTime" label="成立时间" rules={[{ required: true, message: '请输入成立时间' }]}>
          <Input placeholder="如：1978年" />
        </Form.Item>
        
        <Form.Item name="introduction" label="学院简介" rules={[{ required: true, message: '请输入学院简介' }]}>
          <TextArea rows={4} placeholder="请输入学院简介" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="mission" label="学院使命" rules={[{ required: true, message: '请输入学院使命' }]}>
              <TextArea rows={4} placeholder="请输入学院使命" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="vision" label="学院愿景" rules={[{ required: true, message: '请输入学院愿景' }]}>
              <TextArea rows={4} placeholder="请输入学院愿景" />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>院长信息</Divider>
        
        <Form.Item name="deanName" label="院长姓名" rules={[{ required: true, message: '请输入院长姓名' }]}>
          <Input placeholder="请输入院长姓名" />
        </Form.Item>
        
        <Form.Item name="deanPhoto" label="院长照片URL">
          <Input placeholder="请输入院长照片URL" />
        </Form.Item>
        
        <Form.Item name="deanSpeech" label="院长致辞" rules={[{ required: true, message: '请输入院长致辞' }]}>
          <TextArea rows={6} placeholder="请输入院长致辞" />
        </Form.Item>
        
        <Divider>联系方式</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="contactEmail" label="联系邮箱" rules={[{ required: true, message: '请输入联系邮箱' }]}>
              <Input placeholder="请输入联系邮箱" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="contactAddress" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
              <Input placeholder="请输入地址" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="logo" label="学院Logo URL">
          <Input placeholder="请输入学院Logo URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
  
  return (
    <div className="faculty-info-component">
      {renderFacultyInfo()}
      {renderEditForm()}
    </div>
  );
};

export default FacultyInfo; 
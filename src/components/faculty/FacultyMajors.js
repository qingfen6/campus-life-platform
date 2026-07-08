/**
 * 学院专业设置组件
 * 
 * 功能：
 * - 展示本科专业列表及介绍
 * - 展示研究生专业列表及介绍
 * - 显示各专业课程体系
 * - 展示专业负责人信息
 * - 支持管理员编辑内容
 */
import React, { useState } from 'react';
import { Tabs, Card, Typography, List, Avatar, Button, Tag, Modal, Form, Input, Select, Collapse, Row, Col, Tooltip, Divider } from 'antd';
import { EditOutlined, SaveOutlined, UserOutlined, BookOutlined, ExperimentOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './FacultyMajors.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const FacultyMajors = ({ majorsData, isAdmin = false, onSave }) => {
  const [activeTab, setActiveTab] = useState('undergraduate');
  const [editingMajor, setEditingMajor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 处理专业编辑
  const handleEditMajor = (major, type) => {
    setEditingMajor({ ...major, type });
    form.setFieldsValue({
      ...major,
      type,
      // 课程列表转换为字符串，方便编辑
      coreCourses: major.courses.core.join('\n'),
      electiveCourses: major.courses.elective.join('\n')
    });
    setIsModalVisible(true);
  };
  
  // 添加新专业
  const handleAddMajor = (type) => {
    const newMajor = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      courses: {
        core: [],
        elective: []
      },
      director: {
        name: '',
        title: '',
        avatar: ''
      },
      type
    };
    
    setEditingMajor(newMajor);
    form.resetFields();
    form.setFieldsValue({ type });
    setIsModalVisible(true);
  };
  
  // 保存专业信息
  const handleSaveMajor = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理课程列表
      const transformedValues = {
        ...values,
        courses: {
          core: values.coreCourses.split('\n').filter(course => course.trim() !== ''),
          elective: values.electiveCourses.split('\n').filter(course => course.trim() !== '')
        }
      };
      
      // 删除临时字段
      delete transformedValues.coreCourses;
      delete transformedValues.electiveCourses;
      
      onSave(editingMajor.id, transformedValues, editingMajor.type);
      setIsModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };
  
  // 渲染专业列表
  const renderMajorList = (majors, type) => {
    return (
      <div className="majors-list">
        {majors.map(major => (
          <Card 
            key={major.id}
            className="major-card"
            title={
              <div className="major-title">
                <span>{major.name}</span>
                {major.tags && major.tags.map(tag => (
                  <Tag key={tag} color="blue" className="major-tag">{tag}</Tag>
                ))}
              </div>
            }
            extra={
              isAdmin && (
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditMajor(major, type)}
                >
                  编辑
                </Button>
              )
            }
          >
            <div className="major-content">
              <Paragraph>{major.description}</Paragraph>
              
              <Divider orientation="left">课程体系</Divider>
              <Collapse defaultActiveKey={['core']} ghost>
                <Panel 
                  header={<span className="course-category"><BookOutlined /> 核心课程</span>} 
                  key="core"
                >
                  <List
                    size="small"
                    dataSource={major.courses.core}
                    renderItem={course => (
                      <List.Item>
                        <Text>{course}</Text>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel 
                  header={<span className="course-category"><ExperimentOutlined /> 选修课程</span>} 
                  key="elective"
                >
                  <List
                    size="small"
                    dataSource={major.courses.elective}
                    renderItem={course => (
                      <List.Item>
                        <Text>{course}</Text>
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
              
              <Divider orientation="left">专业负责人</Divider>
              <div className="major-director">
                <Avatar src={major.director.avatar} size={64} icon={<UserOutlined />} />
                <div className="director-info">
                  <Text strong>{major.director.name}</Text>
                  <br />
                  <Text type="secondary">{major.director.title}</Text>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {isAdmin && (
          <div className="add-major-container">
            <Button 
              type="dashed" 
              className="add-major-button"
              icon={<PlusOutlined />} 
              onClick={() => handleAddMajor(type)}
            >
              添加专业
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // 编辑表单
  const renderEditForm = () => {
    if (!editingMajor) return null;
    
    return (
      <Modal
        title={editingMajor.id.startsWith('new') ? "添加专业" : "编辑专业信息"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveMajor} icon={<SaveOutlined />}>
            保存
          </Button>
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item name="name" label="专业名称" rules={[{ required: true, message: '请输入专业名称' }]}>
            <Input placeholder="请输入专业名称" />
          </Form.Item>
          
          <Form.Item name="description" label="专业介绍" rules={[{ required: true, message: '请输入专业介绍' }]}>
            <TextArea rows={4} placeholder="请输入专业介绍" />
          </Form.Item>
          
          <Form.Item name="tags" label="专业标签">
            <Select mode="tags" placeholder="输入标签后按Enter">
              <Option value="国家一流专业">国家一流专业</Option>
              <Option value="省级特色专业">省级特色专业</Option>
              <Option value="新工科">新工科</Option>
              <Option value="热门专业">热门专业</Option>
            </Select>
          </Form.Item>
          
          <Divider>课程体系</Divider>
          
          <Form.Item name="coreCourses" label="核心课程（每行一个课程）" rules={[{ required: true, message: '请输入至少一门核心课程' }]}>
            <TextArea rows={6} placeholder="每行输入一门课程，例如：\n数据结构\n计算机组成原理\n操作系统" />
          </Form.Item>
          
          <Form.Item name="electiveCourses" label="选修课程（每行一个课程）">
            <TextArea rows={6} placeholder="每行输入一门课程，例如：\n人工智能导论\n云计算\n区块链技术" />
          </Form.Item>
          
          <Divider>专业负责人</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['director', 'name']} label="负责人姓名" rules={[{ required: true, message: '请输入负责人姓名' }]}>
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['director', 'title']} label="职称" rules={[{ required: true, message: '请输入负责人职称' }]}>
                <Input placeholder="如：教授、副教授" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name={['director', 'avatar']} label="负责人头像URL">
            <Input placeholder="请输入头像URL地址" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  
  return (
    <div className="faculty-majors-component">
      <Title level={3} className="majors-title">专业设置</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="majors-tabs">
        <TabPane tab="本科专业" key="undergraduate">
          {renderMajorList(majorsData.undergraduate, 'undergraduate')}
        </TabPane>
        <TabPane tab="研究生专业" key="graduate">
          {renderMajorList(majorsData.graduate, 'graduate')}
        </TabPane>
      </Tabs>
      
      {renderEditForm()}
    </div>
  );
};

export default FacultyMajors; 
/**
 * 专业设置组件
 * 
 * 功能：
 * - 展示本科专业列表及介绍
 * - 展示研究生专业列表及介绍
 * - 展示各专业课程体系
 * - 展示专业负责人信息
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { Tabs, List, Typography, Card, Tag, Button, Collapse, Modal, Form, Input, message, Select, Avatar, Divider, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BookOutlined, ExperimentOutlined, TeamOutlined } from '@ant-design/icons';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

// 模拟专业数据
const INITIAL_MAJORS = {
  undergraduate: [
    {
      id: 1,
      name: '计算机科学与技术',
      englishName: 'Computer Science and Technology',
      code: '080901',
      description: '计算机科学与技术专业是研究计算机系统结构、程序设计与算法分析等理论和方法的专业，旨在培养具备计算机科学与技术相关知识，能从事计算机软硬件系统设计、开发和应用的高级人才。',
      establish: '1978年',
      courseSystem: [
        { name: '程序设计基础', type: '必修', credit: 4, description: '介绍C/C++编程语言及基础算法' },
        { name: '数据结构', type: '必修', credit: 4, description: '介绍常用数据结构及其应用' },
        { name: '操作系统', type: '必修', credit: 3.5, description: '介绍操作系统基本原理与设计方法' },
        { name: '计算机网络', type: '必修', credit: 3, description: '介绍计算机网络基本概念和协议' },
        { name: '数据库系统', type: '必修', credit: 3, description: '介绍数据库系统的设计与实现' },
        { name: '编译原理', type: '必修', credit: 3, description: '介绍编程语言的编译原理' },
        { name: '软件工程', type: '必修', credit: 3, description: '介绍软件开发流程和方法' },
        { name: '人工智能导论', type: '选修', credit: 2, description: '介绍人工智能基础知识' }
      ],
      leader: {
        name: '张教授',
        title: '教授、博士生导师',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Prof1',
        contact: 'zhang@university.edu.cn'
      }
    },
    {
      id: 2,
      name: '软件工程',
      englishName: 'Software Engineering',
      code: '080902',
      description: '软件工程专业是一门研究用工程化方法建造和维护有效的、实用的软件系统的学科，强调软件开发的工程规范、方法和技术，培养能从事软件开发、测试和项目管理的高级人才。',
      establish: '1998年',
      courseSystem: [
        { name: '面向对象程序设计', type: '必修', credit: 4, description: '介绍Java和面向对象编程思想' },
        { name: '软件工程', type: '必修', credit: 4, description: '介绍软件工程方法和过程' },
        { name: '需求工程', type: '必修', credit: 3, description: '介绍软件需求分析与管理' },
        { name: '软件测试与质量保证', type: '必修', credit: 3, description: '介绍软件测试理论和技术' },
        { name: '软件项目管理', type: '必修', credit: 3, description: '介绍软件项目管理方法' },
        { name: '软件架构', type: '必修', credit: 3, description: '介绍软件架构设计原则' },
        { name: '移动应用开发', type: '选修', credit: 2, description: '介绍移动应用开发技术' },
        { name: '云计算技术', type: '选修', credit: 2, description: '介绍云计算基础与实践' }
      ],
      leader: {
        name: '李教授',
        title: '教授、博士生导师',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Prof2',
        contact: 'li@university.edu.cn'
      }
    }
  ],
  graduate: [
    {
      id: 3,
      name: '计算机科学与技术',
      englishName: 'Computer Science and Technology',
      degree: '硕士、博士',
      code: '081200',
      description: '本专业主要研究计算机科学理论、计算机系统结构、计算机软件与硬件、人工智能等领域的前沿问题，培养能够在科研院所和企业从事研究与开发的高层次人才。',
      researchAreas: ['人工智能与机器学习', '大数据分析与挖掘', '计算机视觉', '分布式系统', '高性能计算'],
      courseSystem: [
        { name: '高级算法分析', type: '必修', credit: 3, description: '介绍高级算法设计与分析方法' },
        { name: '机器学习', type: '必修', credit: 3, description: '介绍机器学习理论与应用' },
        { name: '深度学习', type: '选修', credit: 2, description: '介绍深度学习理论与框架' },
        { name: '自然语言处理', type: '选修', credit: 2, description: '介绍NLP基本原理与技术' }
      ],
      leader: {
        name: '王教授',
        title: '教授、博士生导师、博士后站负责人',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Prof3',
        contact: 'wang@university.edu.cn'
      }
    },
    {
      id: 4,
      name: '软件工程',
      englishName: 'Software Engineering',
      degree: '硕士、博士',
      code: '083500',
      description: '本专业主要研究软件开发方法、软件测试与质量保障、软件架构与系统集成等领域的理论与工程实践问题，培养能够在各行业从事软件技术研究和软件工程管理的高层次人才。',
      researchAreas: ['软件系统工程', '软件服务工程', '智能软件工程', '软件安全与可信技术', '软件测试与验证'],
      courseSystem: [
        { name: '高级软件工程', type: '必修', credit: 3, description: '介绍软件工程高级方法与实践' },
        { name: '软件架构', type: '必修', credit: 3, description: '介绍软件架构设计与评估' },
        { name: '形式化方法', type: '选修', credit: 2, description: '介绍软件形式化验证方法' },
        { name: '服务计算', type: '选修', credit: 2, description: '介绍面向服务的计算技术' }
      ],
      leader: {
        name: '刘教授',
        title: '教授、博士生导师',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Prof4',
        contact: 'liu@university.edu.cn'
      }
    }
  ]
};

/**
 * 专业设置组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 专业设置组件
 */
const MajorSettingsComponent = ({ isEditMode }) => {
  const [majors, setMajors] = useState(INITIAL_MAJORS);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditMajor, setCurrentEditMajor] = useState(null);
  const [majorType, setMajorType] = useState('');
  const [form] = Form.useForm();
  
  // 打开编辑模态框
  const showEditModal = (major, type) => {
    setMajorType(type);
    setCurrentEditMajor(major);
    form.resetFields();
    
    if (major) {
      // 编辑现有专业
      const formValues = { ...major };
      form.setFieldsValue(formValues);
    }
    
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
        let newMajors = { ...majors };
        
        if (currentEditMajor) {
          // 更新现有专业
          const updatedMajors = majors[majorType].map(m => 
            m.id === currentEditMajor.id ? { ...values, id: m.id } : m
          );
          newMajors[majorType] = updatedMajors;
        } else {
          // 添加新专业
          const newId = Math.max(0, ...majors[majorType].map(m => m.id)) + 1;
          newMajors[majorType] = [...majors[majorType], { ...values, id: newId }];
        }
        
        setMajors(newMajors);
        message.success(`专业${currentEditMajor ? '更新' : '添加'}成功`);
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };
  
  // 渲染本科专业列表
  const renderUndergraduateMajors = () => (
    <>
      <List
        itemLayout="vertical"
        dataSource={majors.undergraduate}
        renderItem={major => (
          <List.Item
            key={major.id}
            actions={isEditMode ? [
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => showEditModal(major, 'undergraduate')}
              >
                编辑
              </Button>
            ] : []}
          >
            <Card className="major-card">
              <div className="major-header">
                <div>
                  <Title level={4}>{major.name}</Title>
                  <Text type="secondary">{major.englishName}</Text>
                </div>
                <Tag color="blue">{major.code}</Tag>
              </div>
              
              <Paragraph>{major.description}</Paragraph>
              
              <Collapse ghost>
                <Panel header="课程体系" key="courses">
                  <List
                    size="small"
                    dataSource={major.courseSystem}
                    renderItem={course => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<BookOutlined />}
                          title={course.name}
                          description={
                            <>
                              <Tag color={course.type === '必修' ? 'red' : 'green'}>{course.type}</Tag>
                              <Tag>{course.credit} 学分</Tag>
                              <div>{course.description}</div>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
                
                <Panel header="专业负责人" key="leader">
                  <div className="major-leader">
                    <Avatar src={major.leader.avatar} size={64} />
                    <div className="leader-info">
                      <Title level={5}>{major.leader.name}</Title>
                      <Text>{major.leader.title}</Text>
                      <Text type="secondary">{major.leader.contact}</Text>
                    </div>
                  </div>
                </Panel>
              </Collapse>
            </Card>
          </List.Item>
        )}
      />
      
      {isEditMode && (
        <div className="add-major-button">
          <Button 
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => showEditModal(null, 'undergraduate')}
            block
          >
            添加本科专业
          </Button>
        </div>
      )}
    </>
  );
  
  // 渲染研究生专业列表
  const renderGraduateMajors = () => (
    <>
      <List
        itemLayout="vertical"
        dataSource={majors.graduate}
        renderItem={major => (
          <List.Item
            key={major.id}
            actions={isEditMode ? [
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => showEditModal(major, 'graduate')}
              >
                编辑
              </Button>
            ] : []}
          >
            <Card className="major-card">
              <div className="major-header">
                <div>
                  <Title level={4}>{major.name}</Title>
                  <Text type="secondary">{major.englishName}</Text>
                </div>
                <div>
                  <Tag color="purple">{major.degree}</Tag>
                  <Tag color="blue">{major.code}</Tag>
                </div>
              </div>
              
              <Paragraph>{major.description}</Paragraph>
              
              <div className="research-areas">
                <Title level={5}>研究方向</Title>
                <div>
                  {major.researchAreas.map((area, index) => (
                    <Tag key={index} color="blue">{area}</Tag>
                  ))}
                </div>
              </div>
              
              <Collapse ghost>
                <Panel header="课程体系" key="courses">
                  <List
                    size="small"
                    dataSource={major.courseSystem}
                    renderItem={course => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<BookOutlined />}
                          title={course.name}
                          description={
                            <>
                              <Tag color={course.type === '必修' ? 'red' : 'green'}>{course.type}</Tag>
                              <Tag>{course.credit} 学分</Tag>
                              <div>{course.description}</div>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
                
                <Panel header="专业负责人" key="leader">
                  <div className="major-leader">
                    <Avatar src={major.leader.avatar} size={64} />
                    <div className="leader-info">
                      <Title level={5}>{major.leader.name}</Title>
                      <Text>{major.leader.title}</Text>
                      <Text type="secondary">{major.leader.contact}</Text>
                    </div>
                  </div>
                </Panel>
              </Collapse>
            </Card>
          </List.Item>
        )}
      />
      
      {isEditMode && (
        <div className="add-major-button">
          <Button 
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => showEditModal(null, 'graduate')}
            block
          >
            添加研究生专业
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="major-settings-component">
      <Tabs defaultActiveKey="undergraduate">
        <TabPane tab="本科专业" key="undergraduate">
          {renderUndergraduateMajors()}
        </TabPane>
        <TabPane tab="研究生专业" key="graduate">
          {renderGraduateMajors()}
        </TabPane>
      </Tabs>
      
      {/* 编辑模态框 */}
      <Modal
        title={`${currentEditMajor ? '编辑' : '添加'}专业信息`}
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
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="专业名称"
                rules={[{ required: true, message: '请输入专业名称' }]}
              >
                <Input placeholder="请输入专业名称" />
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
                name="code"
                label="专业代码"
                rules={[{ required: true, message: '请输入专业代码' }]}
              >
                <Input placeholder="请输入专业代码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {majorType === 'undergraduate' ? (
                <Form.Item
                  name="establish"
                  label="成立时间"
                  rules={[{ required: true, message: '请输入成立时间' }]}
                >
                  <Input placeholder="请输入成立时间" />
                </Form.Item>
              ) : (
                <Form.Item
                  name="degree"
                  label="授予学位"
                  rules={[{ required: true, message: '请输入授予学位' }]}
                >
                  <Input placeholder="请输入授予学位，如：硕士、博士" />
                </Form.Item>
              )}
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="专业描述"
            rules={[{ required: true, message: '请输入专业描述' }]}
          >
            <TextArea rows={4} placeholder="请输入专业描述" />
          </Form.Item>
          
          {majorType === 'graduate' && (
            <Form.Item
              name="researchAreas"
              label="研究方向"
              rules={[{ required: true, message: '请输入研究方向' }]}
            >
              <Select mode="tags" placeholder="请输入研究方向，按Enter键确认">
                <Option value="人工智能与机器学习">人工智能与机器学习</Option>
                <Option value="大数据分析与挖掘">大数据分析与挖掘</Option>
                <Option value="计算机视觉">计算机视觉</Option>
                <Option value="软件系统工程">软件系统工程</Option>
                <Option value="软件服务工程">软件服务工程</Option>
              </Select>
            </Form.Item>
          )}
          
          <Divider orientation="left">专业负责人</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['leader', 'name']}
                label="姓名"
                rules={[{ required: true, message: '请输入负责人姓名' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['leader', 'title']}
                label="职称"
                rules={[{ required: true, message: '请输入职称' }]}
              >
                <Input placeholder="请输入职称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['leader', 'avatar']}
                label="头像URL"
              >
                <Input placeholder="请输入头像URL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['leader', 'contact']}
                label="联系方式"
                rules={[{ required: true, message: '请输入联系方式' }]}
              >
                <Input placeholder="请输入联系方式" />
              </Form.Item>
            </Col>
          </Row>
          
          {/* 简化版的课程体系编辑，实际项目中可能需要更复杂的编辑表单 */}
          <Divider orientation="left">课程体系</Divider>
          <Text type="secondary">注意: 此处课程体系编辑功能已简化，实际项目中应使用动态表单</Text>
        </Form>
      </Modal>
    </div>
  );
};

export default MajorSettingsComponent; 
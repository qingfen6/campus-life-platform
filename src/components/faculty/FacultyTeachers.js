/**
 * 学院师资力量组件
 * 
 * 功能：
 * - 展示教授/副教授/讲师列表
 * - 展示教师个人简介
 * - 显示研究方向
 * - 展示导师招生信息
 * - 支持管理员编辑内容
 */
import React, { useState } from 'react';
import { Card, Typography, List, Avatar, Button, Modal, Tabs, Form, Input, Row, Col, Divider, Select, Badge, Tooltip, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PlusOutlined, SearchOutlined, BookOutlined, TeamOutlined, ExperimentOutlined, FilterOutlined } from '@ant-design/icons';
import './FacultyTeachers.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// 教师职称类型
const TITLES = [
  { value: 'professor', label: '教授' },
  { value: 'associate-professor', label: '副教授' },
  { value: 'lecturer', label: '讲师' },
  { value: 'assistant', label: '助教' }
];

// 研究方向分类
const RESEARCH_FIELDS = [
  { value: 'ai', label: '人工智能' },
  { value: 'big-data', label: '大数据' },
  { value: 'network', label: '计算机网络' },
  { value: 'security', label: '网络安全' },
  { value: 'software', label: '软件工程' },
  { value: 'hardware', label: '计算机硬件' }
];

const FacultyTeachers = ({ teachersData, isAdmin = false, onSave }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedFields, setSelectedFields] = useState([]);
  
  // 搜索和筛选老师
  const getFilteredTeachers = () => {
    let filtered = [...teachersData];
    
    // 按标签筛选
    if (activeTab !== 'all') {
      filtered = filtered.filter(teacher => teacher.title === activeTab);
    }
    
    // 按研究领域筛选
    if (selectedFields.length > 0) {
      filtered = filtered.filter(teacher => {
        return teacher.researchFields.some(field => selectedFields.includes(field));
      });
    }
    
    // 搜索
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(lowerSearchText) || 
        teacher.introduction.toLowerCase().includes(lowerSearchText) ||
        teacher.researchDirection.toLowerCase().includes(lowerSearchText)
      );
    }
    
    return filtered;
  };
  
  // 处理老师编辑
  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({
      ...teacher,
      researchFields: teacher.researchFields || []
    });
    setIsModalVisible(true);
  };
  
  // 添加新老师
  const handleAddTeacher = () => {
    const newTeacher = {
      id: `new-${Date.now()}`,
      name: '',
      title: 'lecturer',
      avatar: '',
      introduction: '',
      researchDirection: '',
      researchFields: [],
      email: '',
      phone: '',
      office: '',
      recruiting: false,
      recruitingInfo: ''
    };
    
    setEditingTeacher(newTeacher);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // 保存老师信息
  const handleSaveTeacher = async () => {
    try {
      const values = await form.validateFields();
      onSave(editingTeacher.id, values);
      setIsModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };
  
  // 标题映射
  const getTitleLabel = (titleValue) => {
    const title = TITLES.find(t => t.value === titleValue);
    return title ? title.label : '未知职称';
  };
  
  // 渲染老师卡片
  const renderTeacherCard = (teacher) => (
    <Card 
      key={teacher.id}
      className="teacher-card"
      extra={
        isAdmin && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditTeacher(teacher)}
          >
            编辑
          </Button>
        )
      }
    >
      <div className="teacher-header">
        <Avatar src={teacher.avatar} size={80} icon={<UserOutlined />} />
        <div className="teacher-basic-info">
          <div className="teacher-name-title">
            <Title level={4}>{teacher.name}</Title>
            <Tag color="blue">{getTitleLabel(teacher.title)}</Tag>
            {teacher.recruiting && (
              <Badge dot color="green">
                <Tag color="green" className="recruiting-tag">招生中</Tag>
              </Badge>
            )}
          </div>
          <div className="teacher-contact">
            <Text type="secondary">{teacher.email}</Text>
            {teacher.phone && <Text type="secondary"> | {teacher.phone}</Text>}
            {teacher.office && <Text type="secondary"> | 办公室: {teacher.office}</Text>}
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="teacher-introduction">
        <Title level={5}>个人简介</Title>
        <Paragraph>{teacher.introduction}</Paragraph>
      </div>
      
      <div className="teacher-research">
        <Title level={5}>研究方向</Title>
        <Paragraph>{teacher.researchDirection}</Paragraph>
        <div className="research-fields">
          {teacher.researchFields && teacher.researchFields.map(field => {
            const fieldInfo = RESEARCH_FIELDS.find(f => f.value === field);
            return (
              <Tag key={field} color="purple">{fieldInfo ? fieldInfo.label : field}</Tag>
            );
          })}
        </div>
      </div>
      
      {teacher.recruiting && (
        <div className="teacher-recruiting">
          <Title level={5}>招生信息</Title>
          <Paragraph>{teacher.recruitingInfo || '欢迎优秀学生报考！'}</Paragraph>
        </div>
      )}
    </Card>
  );
  
  // 编辑表单
  const renderEditForm = () => {
    if (!editingTeacher) return null;
    
    return (
      <Modal
        title={editingTeacher.id.startsWith('new') ? "添加教师" : "编辑教师信息"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveTeacher} icon={<SaveOutlined />}>
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
              <Form.Item name="name" label="教师姓名" rules={[{ required: true, message: '请输入教师姓名' }]}>
                <Input placeholder="请输入教师姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="职称" rules={[{ required: true, message: '请选择职称' }]}>
                <Select placeholder="请选择职称">
                  {TITLES.map(title => (
                    <Option key={title.value} value={title.value}>{title.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="avatar" label="头像URL">
            <Input placeholder="请输入头像URL" />
          </Form.Item>
          
          <Form.Item name="introduction" label="个人简介" rules={[{ required: true, message: '请输入个人简介' }]}>
            <TextArea rows={4} placeholder="请输入个人简介" />
          </Form.Item>
          
          <Form.Item name="researchDirection" label="研究方向" rules={[{ required: true, message: '请输入研究方向' }]}>
            <TextArea rows={3} placeholder="请输入研究方向描述" />
          </Form.Item>
          
          <Form.Item name="researchFields" label="研究领域标签" rules={[{ required: true, message: '请选择至少一个研究领域' }]}>
            <Select 
              mode="multiple" 
              placeholder="请选择研究领域"
              optionLabelProp="label"
            >
              {RESEARCH_FIELDS.map(field => (
                <Option key={field.value} value={field.value} label={field.label}>
                  {field.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Divider>联系方式</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="office" label="办公室">
                <Input placeholder="请输入办公室地点" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>招生信息</Divider>
          
          <Form.Item name="recruiting" valuePropName="checked" label="是否招生">
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="recruitingInfo" label="招生信息">
            <TextArea rows={3} placeholder="请输入招生要求和信息" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  
  return (
    <div className="faculty-teachers-component">
      <Title level={3} className="teachers-title">师资力量</Title>
      
      <div className="teachers-toolbar">
        <div className="search-box">
          <Input
            placeholder="搜索教师姓名或研究方向"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="filter-box">
          <Tooltip title="按研究领域筛选">
            <Select
              mode="multiple"
              placeholder="研究领域筛选"
              value={selectedFields}
              onChange={setSelectedFields}
              style={{ width: 250 }}
              maxTagCount={2}
              allowClear
            >
              {RESEARCH_FIELDS.map(field => (
                <Option key={field.value} value={field.value}>{field.label}</Option>
              ))}
            </Select>
          </Tooltip>
        </div>
        
        {isAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddTeacher}
          >
            添加教师
          </Button>
        )}
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="teachers-tabs">
        <TabPane tab="全部" key="all" />
        <TabPane tab="教授" key="professor" />
        <TabPane tab="副教授" key="associate-professor" />
        <TabPane tab="讲师" key="lecturer" />
      </Tabs>
      
      <div className="teachers-list">
        {getFilteredTeachers().length > 0 ? (
          <Row gutter={[24, 24]}>
            {getFilteredTeachers().map(teacher => (
              <Col xs={24} sm={24} md={12} lg={8} key={teacher.id}>
                {renderTeacherCard(teacher)}
              </Col>
            ))}
          </Row>
        ) : (
          <div className="no-teachers">
            <Text type="secondary">没有找到符合条件的教师</Text>
          </div>
        )}
      </div>
      
      {renderEditForm()}
    </div>
  );
};

export default FacultyTeachers; 
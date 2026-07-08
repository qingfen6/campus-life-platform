/**
 * 师资力量组件
 * 
 * 功能：
 * - 展示学院师资力量情况
 * - 展示学科带头人和杰出教师
 * - 展示教授、副教授等不同职级的教师数量
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { Row, Col, Typography, Card, Avatar, Tabs, Button, Modal, Form, Input, Upload, message, Select, Divider, Statistic, Tag } from 'antd';
import { TeamOutlined, EditOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// 模拟师资数据
const INITIAL_FACULTY_DATA = {
  overview: {
    totalTeachers: 168,
    professors: 42,
    associateProfessors: 58,
    lecturers: 68,
    doctorSupervisors: 36,
    masterSupervisors: 72,
    academicians: 2,
    featuredScholars: 14,
  },
  leadingTeachers: [
    {
      id: 1,
      name: '王大明',
      title: '教授，博导',
      photo: 'https://picsum.photos/100',
      research: '人工智能，机器学习',
      awards: '国家杰出青年科学基金获得者，教育部长江学者',
      contact: 'wangdaming@cs.edu.cn',
      introduction: '王大明教授于1998年在清华大学计算机系获得博士学位，现任计算机学院院长，人工智能研究中心主任，主要研究方向为机器学习、深度学习、计算机视觉等。曾主持多项国家级重点研发项目，发表论文200余篇，获得国家自然科学二等奖1项。'
    },
    {
      id: 2,
      name: '张芳',
      title: '教授，博导',
      photo: 'https://picsum.photos/101',
      research: '数据库系统，大数据',
      awards: '国家优秀青年科学基金获得者',
      contact: 'zhangfang@cs.edu.cn',
      introduction: '张芳教授于2002年在北京大学计算机系获得博士学位，现任数据科学研究所所长，主要研究方向为数据库系统、大数据处理与分析。曾参与多项国家863计划项目和国家自然科学基金重点项目，发表论文150余篇，获得教育部自然科学一等奖1项。'
    },
    {
      id: 3,
      name: '李强',
      title: '教授，博导',
      photo: 'https://picsum.photos/102',
      research: '计算机网络，网络安全',
      awards: '教育部新世纪优秀人才',
      contact: 'liqiang@cs.edu.cn',
      introduction: '李强教授于2005年在中国科学院计算技术研究所获得博士学位，现任网络与信息安全实验室主任，主要研究方向为网络安全、密码学、区块链技术。曾主持多项国家级和省部级科研项目，发表论文120余篇，获得国家技术发明二等奖1项。'
    }
  ],
  teachersByDepartment: {
    '人工智能': [
      { id: 1, name: '王大明', title: '教授', direction: '深度学习' },
      { id: 4, name: '刘志强', title: '教授', direction: '计算机视觉' },
      { id: 5, name: '钱小平', title: '副教授', direction: '自然语言处理' },
      { id: 6, name: '孙丽', title: '副教授', direction: '机器学习' },
      { id: 7, name: '周明亮', title: '讲师', direction: '知识图谱' }
    ],
    '数据科学': [
      { id: 2, name: '张芳', title: '教授', direction: '数据库系统' },
      { id: 8, name: '吴建国', title: '教授', direction: '数据挖掘' },
      { id: 9, name: '赵鑫', title: '副教授', direction: '大数据分析' },
      { id: 10, name: '陈思思', title: '副教授', direction: '数据可视化' },
      { id: 11, name: '杨小军', title: '讲师', direction: '数据库安全' }
    ],
    '网络与信息安全': [
      { id: 3, name: '李强', title: '教授', direction: '网络安全' },
      { id: 12, name: '朱光', title: '教授', direction: '密码学' },
      { id: 13, name: '高明', title: '副教授', direction: '区块链技术' },
      { id: 14, name: '林静', title: '副教授', direction: '系统安全' },
      { id: 15, name: '郑伟', title: '讲师', direction: '物联网安全' }
    ],
    '计算机系统': [
      { id: 16, name: '马超', title: '教授', direction: '操作系统' },
      { id: 17, name: '董鹏', title: '教授', direction: '编译技术' },
      { id: 18, name: '沈勇', title: '副教授', direction: '分布式系统' },
      { id: 19, name: '黄佳', title: '副教授', direction: '高性能计算' },
      { id: 20, name: '邓海洋', title: '讲师', direction: '云计算技术' }
    ]
  }
};

/**
 * 师资力量组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 师资力量组件
 */
const FacultyStaffComponent = ({ isEditMode }) => {
  // 状态管理
  const [facultyData, setFacultyData] = useState(INITIAL_FACULTY_DATA);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState('');
  const [form] = Form.useForm();
  
  // 打开编辑师资概况模态框
  const showEditOverviewModal = () => {
    form.setFieldsValue(facultyData.overview);
    setEditModalVisible(true);
    setCurrentTeacher(null);
    setEditingDepartment('');
  };
  
  // 打开编辑教师模态框
  const showEditTeacherModal = (teacher, department = '') => {
    setCurrentTeacher(teacher);
    setEditingDepartment(department);
    form.resetFields();
    
    if (teacher) {
      form.setFieldsValue(teacher);
    } else {
      form.setFieldsValue({
        title: department ? '讲师' : '教授，博导',
      });
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
        // 复制现有数据
        const newFacultyData = { ...facultyData };
        
        // 根据编辑对象不同进行操作
        if (!currentTeacher && !editingDepartment) {
          // 编辑师资概况
          newFacultyData.overview = values;
          message.success('师资概况已更新');
        } else if (currentTeacher && !editingDepartment) {
          // 编辑学科带头人
          const index = newFacultyData.leadingTeachers.findIndex(t => t.id === currentTeacher.id);
          if (index > -1) {
            newFacultyData.leadingTeachers[index] = { ...currentTeacher, ...values };
          } else {
            // 添加新学科带头人
            const newId = Math.max(0, ...newFacultyData.leadingTeachers.map(t => t.id)) + 1;
            newFacultyData.leadingTeachers.push({ id: newId, ...values });
          }
          message.success('学科带头人信息已更新');
        } else if (editingDepartment) {
          // 编辑或添加普通教师
          if (currentTeacher) {
            // 编辑现有教师
            const index = newFacultyData.teachersByDepartment[editingDepartment].findIndex(t => t.id === currentTeacher.id);
            if (index > -1) {
              newFacultyData.teachersByDepartment[editingDepartment][index] = { ...currentTeacher, ...values };
            }
          } else {
            // 添加新教师
            const allTeachers = Object.values(newFacultyData.teachersByDepartment).flat();
            const newId = Math.max(0, ...allTeachers.map(t => t.id)) + 1;
            
            if (!newFacultyData.teachersByDepartment[editingDepartment]) {
              newFacultyData.teachersByDepartment[editingDepartment] = [];
            }
            
            newFacultyData.teachersByDepartment[editingDepartment].push({ id: newId, ...values });
          }
          message.success('教师信息已更新');
        }
        
        setFacultyData(newFacultyData);
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };
  
  // 删除教师
  const handleDeleteTeacher = (teacherId, department = '') => {
    let newFacultyData = { ...facultyData };
    
    if (!department) {
      // 删除学科带头人
      newFacultyData.leadingTeachers = newFacultyData.leadingTeachers.filter(t => t.id !== teacherId);
      message.success('已删除学科带头人信息');
    } else {
      // 删除普通教师
      newFacultyData.teachersByDepartment[department] = newFacultyData.teachersByDepartment[department].filter(t => t.id !== teacherId);
      message.success('已删除教师信息');
    }
    
    setFacultyData(newFacultyData);
  };
  
  // 渲染师资概况
  const renderOverview = () => {
    const { overview } = facultyData;
    
    return (
      <div className="faculty-staff-overview">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="教师总数" 
                value={overview.totalTeachers} 
                prefix={<TeamOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="教授" 
                value={overview.professors} 
                suffix={`/${overview.totalTeachers}`} 
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="副教授" 
                value={overview.associateProfessors} 
                suffix={`/${overview.totalTeachers}`} 
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="讲师" 
                value={overview.lecturers} 
                suffix={`/${overview.totalTeachers}`} 
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="博士生导师" 
                value={overview.doctorSupervisors}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="硕士生导师" 
                value={overview.masterSupervisors}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="院士" 
                value={overview.academicians}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Statistic 
                title="特聘教授/杰青/长江学者" 
                value={overview.featuredScholars}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
        
        {isEditMode && (
          <div className="edit-buttons" style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={showEditOverviewModal}
            >
              编辑师资概况
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染学科带头人
  const renderLeadingTeachers = () => {
    const { leadingTeachers } = facultyData;
    
    return (
      <div className="leading-teachers">
        {isEditMode && (
          <div className="edit-buttons" style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showEditTeacherModal(null)}
            >
              添加学科带头人
            </Button>
          </div>
        )}
        
        <Row gutter={[24, 24]}>
          {leadingTeachers.map(teacher => (
            <Col xs={24} md={12} lg={8} key={teacher.id}>
              <Card 
                className="teacher-card"
                actions={isEditMode ? [
                  <EditOutlined key="edit" onClick={() => showEditTeacherModal(teacher)} />,
                  <DeleteOutlined key="delete" onClick={() => handleDeleteTeacher(teacher.id)} />
                ] : undefined}
              >
                <div className="teacher-header">
                  <Avatar size={64} src={teacher.photo} />
                  <div className="teacher-title">
                    <Title level={4}>{teacher.name}</Title>
                    <Text type="secondary">{teacher.title}</Text>
                  </div>
                </div>
                
                <Divider />
                
                <div className="teacher-info">
                  <p><strong>研究方向：</strong>{teacher.research}</p>
                  <p><strong>荣誉称号：</strong>{teacher.awards}</p>
                  <p><strong>联系方式：</strong>{teacher.contact}</p>
                  <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '更多' }}>
                    <strong>个人简介：</strong>{teacher.introduction}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // 渲染按系别教师
  const renderTeachersByDepartment = () => {
    const { teachersByDepartment } = facultyData;
    
    return (
      <div className="teachers-by-department">
        <Tabs type="card">
          {Object.entries(teachersByDepartment).map(([department, teachers]) => (
            <TabPane tab={department} key={department}>
              {isEditMode && (
                <div className="edit-buttons" style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => showEditTeacherModal(null, department)}
                  >
                    添加{department}教师
                  </Button>
                </div>
              )}
              
              <Row gutter={[16, 16]}>
                {teachers.map(teacher => (
                  <Col xs={24} sm={12} md={8} lg={6} key={teacher.id}>
                    <Card 
                      size="small"
                      className="department-teacher-card"
                      actions={isEditMode ? [
                        <EditOutlined key="edit" onClick={() => showEditTeacherModal(teacher, department)} />,
                        <DeleteOutlined key="delete" onClick={() => handleDeleteTeacher(teacher.id, department)} />
                      ] : undefined}
                    >
                      <div className="department-teacher-info">
                        <div className="teacher-name">{teacher.name}</div>
                        <div className="teacher-title">{teacher.title}</div>
                        <div className="teacher-direction">
                          <Tag color="blue">{teacher.direction}</Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  };
  
  // 渲染编辑模态框
  const renderEditModal = () => {
    const modalTitle = !currentTeacher && !editingDepartment 
      ? '编辑师资概况' 
      : currentTeacher 
        ? '编辑教师信息' 
        : '添加教师';
    
    return (
      <Modal
        title={modalTitle}
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
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!currentTeacher && !editingDepartment ? (
            // 师资概况表单
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="totalTeachers"
                    label="教师总数"
                    rules={[{ required: true, message: '请输入教师总数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="professors"
                    label="教授人数"
                    rules={[{ required: true, message: '请输入教授人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="associateProfessors"
                    label="副教授人数"
                    rules={[{ required: true, message: '请输入副教授人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lecturers"
                    label="讲师人数"
                    rules={[{ required: true, message: '请输入讲师人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="doctorSupervisors"
                    label="博士生导师人数"
                    rules={[{ required: true, message: '请输入博士生导师人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="masterSupervisors"
                    label="硕士生导师人数"
                    rules={[{ required: true, message: '请输入硕士生导师人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="academicians"
                    label="院士人数"
                    rules={[{ required: true, message: '请输入院士人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="featuredScholars"
                    label="特聘教授/杰青/长江学者人数"
                    rules={[{ required: true, message: '请输入特聘教授人数' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : currentTeacher && !editingDepartment ? (
            // 学科带头人表单
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="职称"
                    rules={[{ required: true, message: '请输入职称' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="photo"
                label="照片URL"
              >
                <Input placeholder="输入照片URL或上传照片" />
              </Form.Item>
              
              <Form.Item
                name="research"
                label="研究方向"
                rules={[{ required: true, message: '请输入研究方向' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="awards"
                label="荣誉称号"
                rules={[{ required: true, message: '请输入荣誉称号' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="contact"
                label="联系方式"
                rules={[{ required: true, message: '请输入联系方式' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="introduction"
                label="个人简介"
                rules={[{ required: true, message: '请输入个人简介' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </>
          ) : (
            // 普通教师表单
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="职称"
                    rules={[{ required: true, message: '请输入职称' }]}
                  >
                    <Select>
                      <Option value="教授">教授</Option>
                      <Option value="副教授">副教授</Option>
                      <Option value="讲师">讲师</Option>
                      <Option value="助教">助教</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="direction"
                label="研究方向"
                rules={[{ required: true, message: '请输入研究方向' }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    );
  };
  
  return (
    <div className="faculty-staff-component">
      {/* 师资力量选项卡 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="师资概况" key="overview" />
        <TabPane tab="学科带头人" key="leadingTeachers" />
        <TabPane tab="系别师资" key="departments" />
      </Tabs>
      
      {/* 选项卡内容 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'leadingTeachers' && renderLeadingTeachers()}
      {activeTab === 'departments' && renderTeachersByDepartment()}
      
      {/* 编辑模态框 */}
      {renderEditModal()}
    </div>
  );
};

export default FacultyStaffComponent; 
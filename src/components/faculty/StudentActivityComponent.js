/**
 * 学生活动组件
 * 
 * 功能：
 * - 展示学生社团活动
 * - 展示学科竞赛信息
 * - 展示学生成就与荣誉
 * - 支持在编辑模式下修改内容
 */
import React, { useState } from 'react';
import { 
  Card, Typography, Button, Tabs, List, Tag, Modal, Form, 
  Input, DatePicker, Select, Space, Tooltip, Row, Col, Avatar, Divider 
} from 'antd';
import { 
  EditOutlined, SaveOutlined, CalendarOutlined, TeamOutlined,
  TrophyOutlined, PlusOutlined
} from '@ant-design/icons';
import './faculty.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 模拟学生活动数据
const INITIAL_ACTIVITIES = {
  clubs: [
    {
      id: 1,
      name: '计算机科学与技术协会',
      members: 56,
      description: '以培养学生对计算机科学的兴趣和技能为目标的学生组织，定期举办技术讲座、编程比赛和项目实践活动。',
      foundedYear: '2005',
      presidentName: '王明',
      contactEmail: 'csclub@university.edu.cn',
      activities: [
        { id: 101, title: '新生编程培训营', date: '2023-09-15', location: '计算机楼102', status: 'upcoming' },
        { id: 102, title: '人工智能学术讲座', date: '2023-08-20', location: '计算机楼305', status: 'completed' },
        { id: 103, title: '软件开发工作坊', date: '2023-10-05', location: '创新实验室', status: 'upcoming' }
      ]
    },
    {
      id: 2,
      name: '算法竞赛兴趣小组',
      members: 28,
      description: '专注于算法竞赛的学习和训练，为ACM-ICPC等国际大学生程序设计竞赛做准备。',
      foundedYear: '2010',
      presidentName: '李华',
      contactEmail: 'acm@university.edu.cn',
      activities: [
        { id: 201, title: '算法训练营', date: '2023-09-10', location: '计算机楼203', status: 'upcoming' },
        { id: 202, title: '模拟竞赛', date: '2023-07-15', location: '在线', status: 'completed' }
      ]
    }
  ],
  competitions: [
    {
      id: 1,
      name: '全国大学生计算机设计大赛',
      category: '设计创新',
      startDate: '2023-10-15',
      endDate: '2023-10-20',
      registrationDeadline: '2023-09-30',
      description: '全国性大学生计算机应用能力大赛，包括软件应用与开发、人工智能应用、微课与教学辅助等多个赛道。',
      awards: [
        { year: 2022, prize: '一等奖', team: '创新者队', project: '智能校园导航系统' },
        { year: 2021, prize: '二等奖', team: '数据魔法师', project: '学生学习行为分析平台' }
      ]
    },
    {
      id: 2,
      name: '中国高校计算机大赛-大数据挑战赛',
      category: '数据分析',
      startDate: '2023-11-05',
      endDate: '2023-11-10',
      registrationDeadline: '2023-10-15',
      description: '以大数据应用开发为主题的全国性大学生竞赛，注重大数据技术在实际问题中的应用。',
      awards: [
        { year: 2022, prize: '优秀奖', team: '大数据探索者', project: '城市交通流量预测系统' }
      ]
    }
  ],
  achievements: [
    {
      id: 1,
      studentName: '张三',
      year: 2022,
      achievement: 'ACM国际大学生程序设计竞赛亚洲区铜牌',
      details: '在ACM-ICPC亚洲区域赛中获得铜牌，展现了出色的算法设计和编程能力。'
    },
    {
      id: 2,
      studentName: '李四、王五、赵六(团队)',
      year: 2023,
      achievement: '互联网+创新创业大赛金奖',
      details: '项目"智能校园助手"获得全国总决赛金奖，并获得风投100万元。'
    },
    {
      id: 3,
      studentName: '孙七',
      year: 2023,
      achievement: '发表IEEE Transactions on Software Engineering论文',
      details: '以第一作者身份发表高水平学术论文，研究方向为软件可靠性分析。'
    }
  ]
};

/**
 * 学生活动组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isEditMode - 是否处于编辑模式
 * @returns {JSX.Element} 学生活动组件
 */
const StudentActivityComponent = ({ isEditMode }) => {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [activeTab, setActiveTab] = useState('clubs');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [form] = Form.useForm();
  
  // 展示编辑模态框
  const showEditModal = (type, data = null) => {
    setModalType(type);
    setModalData(data);
    setModalVisible(true);
    
    // 设置表单初始值
    if (data) {
      const formValues = { ...data };
      
      // 处理特殊字段
      if (type === 'club-activity' && data.date) {
        formValues.date = data.date ? data.date : null;
      }
      
      if (type === 'competition' && data.startDate) {
        formValues.startDate = data.startDate ? data.startDate : null;
        formValues.endDate = data.endDate ? data.endDate : null;
        formValues.registrationDeadline = data.registrationDeadline ? data.registrationDeadline : null;
      }
      
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  };
  
  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };
  
  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newActivities = { ...activities };
      
      if (modalType === 'club') {
        if (modalData) {
          // 编辑现有社团
          const clubIndex = newActivities.clubs.findIndex(club => club.id === modalData.id);
          if (clubIndex !== -1) {
            newActivities.clubs[clubIndex] = { ...newActivities.clubs[clubIndex], ...values };
          }
        } else {
          // 添加新社团
          const newId = Math.max(...newActivities.clubs.map(club => club.id), 0) + 1;
          newActivities.clubs.push({ ...values, id: newId, activities: [] });
        }
      } else if (modalType === 'club-activity') {
        const clubId = modalData ? modalData.clubId : values.clubId;
        const clubIndex = newActivities.clubs.findIndex(club => club.id === clubId);
        
        if (clubIndex !== -1) {
          if (modalData && modalData.id) {
            // 编辑现有活动
            const activityIndex = newActivities.clubs[clubIndex].activities.findIndex(act => act.id === modalData.id);
            if (activityIndex !== -1) {
              newActivities.clubs[clubIndex].activities[activityIndex] = { 
                ...newActivities.clubs[clubIndex].activities[activityIndex], 
                ...values 
              };
            }
          } else {
            // 添加新活动
            const newId = Math.max(...newActivities.clubs[clubIndex].activities.map(act => act.id || 0), 100) + 1;
            newActivities.clubs[clubIndex].activities.push({ ...values, id: newId, clubId });
          }
        }
      } else if (modalType === 'competition') {
        if (modalData) {
          // 编辑现有竞赛
          const compIndex = newActivities.competitions.findIndex(comp => comp.id === modalData.id);
          if (compIndex !== -1) {
            newActivities.competitions[compIndex] = { ...newActivities.competitions[compIndex], ...values };
          }
        } else {
          // 添加新竞赛
          const newId = Math.max(...newActivities.competitions.map(comp => comp.id), 0) + 1;
          newActivities.competitions.push({ ...values, id: newId, awards: [] });
        }
      } else if (modalType === 'competition-award') {
        const compId = modalData ? modalData.compId : values.compId;
        const compIndex = newActivities.competitions.findIndex(comp => comp.id === compId);
        
        if (compIndex !== -1) {
          if (modalData && modalData.id) {
            // 编辑现有奖项
            const awardIndex = newActivities.competitions[compIndex].awards.findIndex(award => award.id === modalData.id);
            if (awardIndex !== -1) {
              newActivities.competitions[compIndex].awards[awardIndex] = { 
                ...newActivities.competitions[compIndex].awards[awardIndex], 
                ...values 
              };
            }
          } else {
            // 添加新奖项
            const newId = Math.max(...(newActivities.competitions[compIndex].awards.map(award => award.id || 0) || [0]), 0) + 1;
            newActivities.competitions[compIndex].awards.push({ ...values, id: newId, compId });
          }
        }
      } else if (modalType === 'achievement') {
        if (modalData) {
          // 编辑现有成就
          const achieveIndex = newActivities.achievements.findIndex(achieve => achieve.id === modalData.id);
          if (achieveIndex !== -1) {
            newActivities.achievements[achieveIndex] = { ...newActivities.achievements[achieveIndex], ...values };
          }
        } else {
          // 添加新成就
          const newId = Math.max(...newActivities.achievements.map(achieve => achieve.id), 0) + 1;
          newActivities.achievements.push({ ...values, id: newId });
        }
      }
      
      setActivities(newActivities);
      setModalVisible(false);
      form.resetFields();
    });
  };
  
  // 渲染社团内容
  const renderClubs = () => (
    <div className="student-clubs-section">
      <List
        itemLayout="vertical"
        dataSource={activities.clubs}
        renderItem={club => (
          <List.Item
            actions={isEditMode ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => showEditModal('club', club)}>编辑社团</Button>,
              <Button key="add-activity" type="primary" ghost icon={<PlusOutlined />} onClick={() => showEditModal('club-activity', { clubId: club.id })}>添加活动</Button>
            ] : []}
          >
            <Card title={
              <Space>
                <TeamOutlined /> {club.name}
                <Tag color="blue">{club.members} 名成员</Tag>
                <Tag color="green">创立于 {club.foundedYear}</Tag>
              </Space>
            }>
              <Paragraph>{club.description}</Paragraph>
              <Row>
                <Col span={12}>
                  <Text strong>社长: </Text>
                  <Text>{club.presidentName}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>联系方式: </Text>
                  <Text>{club.contactEmail}</Text>
                </Col>
              </Row>
              
              <Divider orientation="left">社团活动</Divider>
              
              <List
                itemLayout="horizontal"
                dataSource={club.activities}
                renderItem={activity => (
                  <List.Item
                    actions={isEditMode ? [
                      <Button key="edit-activity" size="small" icon={<EditOutlined />} onClick={() => showEditModal('club-activity', { ...activity, clubId: club.id })}>编辑</Button>
                    ] : []}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: activity.status === 'upcoming' ? '#1890ff' : '#52c41a' }} />}
                      title={activity.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Space>
                            <CalendarOutlined /> {activity.date}
                          </Space>
                          <Space>
                            <Text type="secondary">{activity.location}</Text>
                            <Tag color={activity.status === 'upcoming' ? 'blue' : 'green'}>
                              {activity.status === 'upcoming' ? '即将举行' : '已结束'}
                            </Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </List.Item>
        )}
      />
      
      {isEditMode && (
        <div className="add-section">
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => showEditModal('club')}>
            添加社团
          </Button>
        </div>
      )}
    </div>
  );
  
  // 渲染竞赛内容
  const renderCompetitions = () => (
    <div className="student-competitions-section">
      <List
        itemLayout="vertical"
        dataSource={activities.competitions}
        renderItem={competition => (
          <List.Item
            actions={isEditMode ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => showEditModal('competition', competition)}>编辑竞赛</Button>,
              <Button key="add-award" type="primary" ghost icon={<PlusOutlined />} onClick={() => showEditModal('competition-award', { compId: competition.id })}>添加奖项</Button>
            ] : []}
          >
            <Card title={
              <Space>
                <TrophyOutlined /> {competition.name}
                <Tag color="purple">{competition.category}</Tag>
              </Space>
            }>
              <Paragraph>{competition.description}</Paragraph>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>开始日期: </Text>
                  <Text>{competition.startDate}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>结束日期: </Text>
                  <Text>{competition.endDate}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>报名截止: </Text>
                  <Text type="warning">{competition.registrationDeadline}</Text>
                </Col>
              </Row>
              
              {competition.awards && competition.awards.length > 0 && (
                <>
                  <Divider orientation="left">历年获奖</Divider>
                  
                  <List
                    itemLayout="horizontal"
                    dataSource={competition.awards}
                    renderItem={award => (
                      <List.Item
                        actions={isEditMode ? [
                          <Button key="edit-award" size="small" icon={<EditOutlined />} onClick={() => showEditModal('competition-award', { ...award, compId: competition.id })}>编辑</Button>
                        ] : []}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                          title={`${award.year}年 ${award.prize}`}
                          description={
                            <Space direction="vertical" size={0}>
                              <Text>团队: {award.team}</Text>
                              <Text>项目: {award.project}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Card>
          </List.Item>
        )}
      />
      
      {isEditMode && (
        <div className="add-section">
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => showEditModal('competition')}>
            添加竞赛信息
          </Button>
        </div>
      )}
    </div>
  );
  
  // 渲染学生成就内容
  const renderAchievements = () => (
    <div className="student-achievements-section">
      <List
        itemLayout="vertical"
        dataSource={activities.achievements}
        renderItem={achievement => (
          <List.Item
            actions={isEditMode ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => showEditModal('achievement', achievement)}>编辑成就</Button>
            ] : []}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#52c41a' }} />
              }
              title={
                <Space>
                  <Text strong>{achievement.achievement}</Text>
                  <Tag color="gold">{achievement.year}年</Tag>
                </Space>
              }
              description={
                <>
                  <Text>获奖者: {achievement.studentName}</Text>
                  <Paragraph style={{ marginTop: 8 }}>{achievement.details}</Paragraph>
                </>
              }
            />
          </List.Item>
        )}
      />
      
      {isEditMode && (
        <div className="add-section">
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => showEditModal('achievement')}>
            添加学生成就
          </Button>
        </div>
      )}
    </div>
  );
  
  // 渲染模态框内容
  const renderModalContent = () => {
    if (modalType === 'club') {
      return (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="社团名称" rules={[{ required: true, message: '请输入社团名称' }]}>
            <Input placeholder="请输入社团名称" />
          </Form.Item>
          <Form.Item name="description" label="社团简介" rules={[{ required: true, message: '请输入社团简介' }]}>
            <TextArea rows={4} placeholder="请输入社团简介" />
          </Form.Item>
          <Form.Item name="members" label="成员数量" rules={[{ required: true, message: '请输入成员数量' }]}>
            <Input type="number" placeholder="请输入成员数量" />
          </Form.Item>
          <Form.Item name="foundedYear" label="创立年份" rules={[{ required: true, message: '请输入创立年份' }]}>
            <Input placeholder="请输入创立年份，如2005" />
          </Form.Item>
          <Form.Item name="presidentName" label="社长姓名" rules={[{ required: true, message: '请输入社长姓名' }]}>
            <Input placeholder="请输入社长姓名" />
          </Form.Item>
          <Form.Item name="contactEmail" label="联系邮箱" rules={[{ required: true, message: '请输入联系邮箱' }]}>
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
        </Form>
      );
    } else if (modalType === 'club-activity') {
      return (
        <Form form={form} layout="vertical">
          {!modalData?.id && (
            <Form.Item name="clubId" label="所属社团" rules={[{ required: true, message: '请选择所属社团' }]}>
              <Select placeholder="请选择所属社团">
                {activities.clubs.map(club => (
                  <Option key={club.id} value={club.id}>{club.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="title" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
            <Input placeholder="请输入活动名称" />
          </Form.Item>
          <Form.Item name="date" label="活动日期" rules={[{ required: true, message: '请选择活动日期' }]}>
            <Input placeholder="请输入日期，如2023-10-15" />
          </Form.Item>
          <Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入活动地点' }]}>
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          <Form.Item name="status" label="活动状态" rules={[{ required: true, message: '请选择活动状态' }]}>
            <Select placeholder="请选择活动状态">
              <Option value="upcoming">即将举行</Option>
              <Option value="completed">已结束</Option>
            </Select>
          </Form.Item>
        </Form>
      );
    } else if (modalType === 'competition') {
      return (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="竞赛名称" rules={[{ required: true, message: '请输入竞赛名称' }]}>
            <Input placeholder="请输入竞赛名称" />
          </Form.Item>
          <Form.Item name="category" label="竞赛类别" rules={[{ required: true, message: '请输入竞赛类别' }]}>
            <Input placeholder="请输入竞赛类别，如编程、设计等" />
          </Form.Item>
          <Form.Item name="description" label="竞赛描述" rules={[{ required: true, message: '请输入竞赛描述' }]}>
            <TextArea rows={4} placeholder="请输入竞赛描述" />
          </Form.Item>
          <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请输入开始日期' }]}>
            <Input placeholder="请输入日期，如2023-10-15" />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期" rules={[{ required: true, message: '请输入结束日期' }]}>
            <Input placeholder="请输入日期，如2023-10-20" />
          </Form.Item>
          <Form.Item name="registrationDeadline" label="报名截止日期" rules={[{ required: true, message: '请输入报名截止日期' }]}>
            <Input placeholder="请输入日期，如2023-09-30" />
          </Form.Item>
        </Form>
      );
    } else if (modalType === 'competition-award') {
      return (
        <Form form={form} layout="vertical">
          {!modalData?.id && (
            <Form.Item name="compId" label="所属竞赛" rules={[{ required: true, message: '请选择所属竞赛' }]}>
              <Select placeholder="请选择所属竞赛">
                {activities.competitions.map(comp => (
                  <Option key={comp.id} value={comp.id}>{comp.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="year" label="获奖年份" rules={[{ required: true, message: '请输入获奖年份' }]}>
            <Input placeholder="请输入获奖年份，如2022" />
          </Form.Item>
          <Form.Item name="prize" label="奖项" rules={[{ required: true, message: '请输入奖项名称' }]}>
            <Input placeholder="请输入奖项名称，如一等奖" />
          </Form.Item>
          <Form.Item name="team" label="获奖团队" rules={[{ required: true, message: '请输入获奖团队名称' }]}>
            <Input placeholder="请输入获奖团队名称" />
          </Form.Item>
          <Form.Item name="project" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
        </Form>
      );
    } else if (modalType === 'achievement') {
      return (
        <Form form={form} layout="vertical">
          <Form.Item name="studentName" label="学生姓名" rules={[{ required: true, message: '请输入学生姓名' }]}>
            <Input placeholder="请输入学生姓名，团队可用逗号分隔" />
          </Form.Item>
          <Form.Item name="year" label="获奖年份" rules={[{ required: true, message: '请输入获奖年份' }]}>
            <Input placeholder="请输入获奖年份，如2022" />
          </Form.Item>
          <Form.Item name="achievement" label="成就名称" rules={[{ required: true, message: '请输入成就名称' }]}>
            <Input placeholder="请输入成就名称" />
          </Form.Item>
          <Form.Item name="details" label="详细信息" rules={[{ required: true, message: '请输入详细信息' }]}>
            <TextArea rows={4} placeholder="请输入成就的详细信息" />
          </Form.Item>
        </Form>
      );
    }
    
    return null;
  };
  
  // 获取模态框标题
  const getModalTitle = () => {
    const titles = {
      'club': modalData ? '编辑社团信息' : '添加新社团',
      'club-activity': modalData?.id ? '编辑社团活动' : '添加社团活动',
      'competition': modalData ? '编辑竞赛信息' : '添加新竞赛',
      'competition-award': modalData?.id ? '编辑竞赛奖项' : '添加竞赛奖项',
      'achievement': modalData ? '编辑学生成就' : '添加学生成就'
    };
    
    return titles[modalType] || '编辑信息';
  };
  
  return (
    <div className="student-activity-component">
      {isEditMode && (
        <div className="edit-component-buttons">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(`${activeTab === 'clubs' ? 'club' : activeTab === 'competitions' ? 'competition' : 'achievement'}`)}>
            添加{activeTab === 'clubs' ? '社团' : activeTab === 'competitions' ? '竞赛' : '成就'}
          </Button>
        </div>
      )}
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><TeamOutlined /> 学生社团</span>} key="clubs">
          {renderClubs()}
        </TabPane>
        <TabPane tab={<span><TrophyOutlined /> 学科竞赛</span>} key="competitions">
          {renderCompetitions()}
        </TabPane>
        <TabPane tab={<span><TrophyOutlined /> 学生成就</span>} key="achievements">
          {renderAchievements()}
        </TabPane>
      </Tabs>
      
      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        width={700}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default StudentActivityComponent; 
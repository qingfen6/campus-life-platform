/**
 * 招聘信息组件
 * 
 * 功能：
 * - 展示学院招聘信息
 * - 按公司、职位类型筛选
 * - 展示招聘详情
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { List, Typography, Card, Tag, Button, Tabs, Modal, Form, Input, message, Select, DatePicker, Avatar, Badge, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined, CalendarOutlined, EnvironmentOutlined, DollarOutlined, PlusOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import moment from 'moment';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 模拟招聘数据
const INITIAL_RECRUITMENT = [
  {
    id: 1,
    company: '腾讯',
    logo: 'https://img.alicdn.com/tfs/TB1Ly5oS3HqK1RjSZFPXXcwapXa-238-54.png',
    position: '前端开发工程师',
    location: '深圳',
    salary: '20k-40k',
    details: '工作职责：\n1. 负责公司核心产品的前端开发\n2. 优化前端性能，提升用户体验\n3. 参与产品需求分析和技术方案设计\n\n任职要求：\n1. 计算机相关专业本科及以上学历\n2. 熟练掌握JavaScript、HTML5、CSS3\n3. 熟悉React、Vue等前端框架\n4. 有大型Web应用开发经验优先',
    deadline: '2023-12-30',
    date: '2023-09-15',
    tags: ['前端', '深圳', '互联网']
  },
  {
    id: 2,
    company: '华为',
    logo: 'https://img.alicdn.com/tfs/TB1hdLDSZfpK1RjSZFOXXa6nFXa-180-54.png',
    position: '算法工程师',
    location: '上海',
    salary: '30k-50k',
    details: '工作职责：\n1. 负责公司AI产品的算法研发\n2. 参与深度学习模型的设计和优化\n3. 跟踪和研究前沿算法技术\n\n任职要求：\n1. 计算机、人工智能相关专业硕士及以上学历\n2. 熟悉机器学习、深度学习算法\n3. 熟练掌握Python、TensorFlow或PyTorch\n4. 有相关领域发表过高水平论文者优先',
    deadline: '2023-11-30',
    date: '2023-09-10',
    tags: ['算法', '上海', '人工智能']
  },
  {
    id: 3,
    company: '阿里巴巴',
    logo: 'https://img.alicdn.com/tfs/TB1ShkOSYvpK1RjSZPiXXbmwXXa-142-27.png',
    position: '后端开发工程师',
    location: '杭州',
    salary: '25k-45k',
    details: '工作职责：\n1. 负责公司核心系统的设计和开发\n2. 解决系统高并发、大数据量的技术挑战\n3. 优化系统架构，提升系统稳定性\n\n任职要求：\n1. 计算机相关专业本科及以上学历\n2. 熟练掌握Java、Spring框架\n3. 熟悉分布式系统设计\n4. 熟悉MySQL、Redis等数据库',
    deadline: '2023-12-15',
    date: '2023-08-25',
    tags: ['后端', '杭州', '互联网']
  },
  {
    id: 4,
    company: '字节跳动',
    logo: 'https://img.alicdn.com/tfs/TB13UBpbVzqK1RjSZFvXXcB7VXa-272-62.png',
    position: '全栈开发工程师',
    location: '北京',
    salary: '25k-45k',
    details: '工作职责：\n1. 负责公司产品的前后端开发\n2. 参与产品需求分析和技术方案设计\n3. 优化产品性能，提升用户体验\n\n任职要求：\n1. 计算机相关专业本科及以上学历\n2. 熟练掌握前端技术(JavaScript、React等)和后端技术(Java/Python/Go等)\n3. 具有良好的代码风格和架构设计能力\n4. 有全栈开发经验者优先',
    deadline: '2023-12-10',
    date: '2023-09-20',
    tags: ['全栈', '北京', '互联网']
  },
  {
    id: 5,
    company: '滴滴',
    logo: 'https://img.alicdn.com/tfs/TB1uh7nS4TpK1RjSZR0XXbEwXXa-134-40.png',
    position: '数据分析师',
    location: '北京',
    salary: '20k-35k',
    details: '工作职责：\n1. 负责公司业务数据的分析和挖掘\n2. 构建数据分析模型，支持业务决策\n3. 设计和优化数据指标体系\n\n任职要求：\n1. 计算机、统计学相关专业本科及以上学历\n2. 熟练掌握SQL，熟悉数据分析工具\n3. 有数据分析和数据挖掘经验\n4. 有互联网行业分析经验者优先',
    deadline: '2023-11-25',
    date: '2023-09-01',
    tags: ['数据', '北京', '分析']
  }
];

/**
 * 招聘信息组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 招聘信息组件
 */
const RecruitmentComponent = ({ isEditMode }) => {
  const [recruitment, setRecruitment] = useState(INITIAL_RECRUITMENT);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditRecruitment, setCurrentEditRecruitment] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  
  // 筛选招聘信息
  const getFilteredRecruitment = () => {
    if (activeTab === 'all') {
      return recruitment;
    }
    return recruitment.filter(item => item.tags.includes(activeTab));
  };
  
  // 按日期排序（从新到旧）
  const getSortedRecruitment = () => {
    return getFilteredRecruitment().sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  };
  
  // 检查是否即将截止
  const isDeadlineSoon = (date) => {
    const deadline = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };
  
  // 打开编辑模态框
  const showEditModal = (recruitmentItem) => {
    setCurrentEditRecruitment(recruitmentItem);
    form.resetFields();
    
    if (recruitmentItem) {
      // 编辑现有招聘
      form.setFieldsValue({
        ...recruitmentItem,
        deadline: moment(recruitmentItem.deadline),
        date: moment(recruitmentItem.date),
        tags: recruitmentItem.tags
      });
    } else {
      // 默认值
      form.setFieldsValue({
        date: moment(),
        deadline: moment().add(1, 'months')
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
        let newRecruitment = [...recruitment];
        const formattedValues = {
          ...values,
          deadline: values.deadline.format('YYYY-MM-DD'),
          date: values.date.format('YYYY-MM-DD')
        };
        
        if (currentEditRecruitment) {
          // 更新现有招聘
          const index = newRecruitment.findIndex(r => r.id === currentEditRecruitment.id);
          if (index > -1) {
            newRecruitment[index] = { ...newRecruitment[index], ...formattedValues };
            setRecruitment(newRecruitment);
            message.success('招聘信息已更新');
          }
        } else {
          // 添加新招聘
          const newId = Math.max(0, ...newRecruitment.map(r => r.id)) + 1;
          newRecruitment.push({ ...formattedValues, id: newId });
          setRecruitment(newRecruitment);
          message.success('招聘信息已添加');
        }
        
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  return (
    <div className="recruitment-component">
      {/* 选项卡筛选 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="全部" key="all" />
        <TabPane tab="前端" key="前端" />
        <TabPane tab="后端" key="后端" />
        <TabPane tab="算法" key="算法" />
        <TabPane tab="全栈" key="全栈" />
        <TabPane tab="数据" key="数据" />
      </Tabs>
      
      {/* 添加按钮（仅编辑模式可见） */}
      {isEditMode && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal(null)}
          >
            添加招聘信息
          </Button>
        </div>
      )}
      
      {/* 招聘信息列表 */}
      <List
        itemLayout="vertical"
        dataSource={getSortedRecruitment()}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={isEditMode ? [
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => showEditModal(item)}
              >
                编辑
              </Button>
            ] : []}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} sm={4} className="recruitment-date">
                <div className="date-number">
                  {moment(item.date).format('DD')}
                </div>
                <div className="date-month">
                  {moment(item.date).format('YYYY-MM')}
                </div>
              </Col>
              <Col xs={24} sm={20}>
                <div className="recruitment-company">
                  {item.logo ? (
                    <Avatar src={item.logo} shape="square" size={48} />
                  ) : (
                    <Avatar icon={<TeamOutlined />} shape="square" size={48} />
                  )}
                  <div>
                    <Title level={4}>{item.position}</Title>
                    <Text>{item.company}</Text>
                  </div>
                </div>
                
                <div className="recruitment-content">
                  <p>
                    <EnvironmentOutlined /> {item.location}
                    <span style={{ marginLeft: 16 }}>
                      <DollarOutlined /> {item.salary}
                    </span>
                    <span style={{ marginLeft: 16 }}>
                      <CalendarOutlined /> 截止日期: {item.deadline}
                      {isDeadlineSoon(item.deadline) && (
                        <Badge color="red" text="即将截止" style={{ marginLeft: 8 }} />
                      )}
                    </span>
                  </p>
                  <Paragraph ellipsis={{ rows: 3 }}>{item.details}</Paragraph>
                </div>
                
                <div className="recruitment-tags">
                  {item.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </List.Item>
        )}
      />
      
      {/* 编辑模态框 */}
      <Modal
        title={`${currentEditRecruitment ? '编辑' : '添加'}招聘信息`}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company"
                label="公司名称"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="logo"
                label="公司Logo URL"
              >
                <Input placeholder="请输入公司Logo URL" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="position"
            label="职位名称"
            rules={[{ required: true, message: '请输入职位名称' }]}
          >
            <Input placeholder="请输入职位名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="工作地点"
                rules={[{ required: true, message: '请输入工作地点' }]}
              >
                <Input placeholder="请输入工作地点" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="薪资范围"
                rules={[{ required: true, message: '请输入薪资范围' }]}
              >
                <Input placeholder="请输入薪资范围，如：20k-30k" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="details"
            label="职位详情"
            rules={[{ required: true, message: '请输入职位详情' }]}
          >
            <TextArea rows={6} placeholder="请输入职位详情，包括工作职责、任职要求等" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="发布日期"
                rules={[{ required: true, message: '请选择发布日期' }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
                rules={[{ required: true, message: '请选择截止日期' }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Select mode="tags" placeholder="请输入标签，按Enter键确认">
              <Option value="前端">前端</Option>
              <Option value="后端">后端</Option>
              <Option value="算法">算法</Option>
              <Option value="全栈">全栈</Option>
              <Option value="数据">数据</Option>
              <Option value="北京">北京</Option>
              <Option value="上海">上海</Option>
              <Option value="深圳">深圳</Option>
              <Option value="杭州">杭州</Option>
              <Option value="互联网">互联网</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruitmentComponent; 
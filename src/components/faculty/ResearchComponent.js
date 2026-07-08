/**
 * 科研成果组件
 * 
 * 功能：
 * - 展示学院科研成果
 * - 按类型和年份筛选
 * - 展示项目详情
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { Row, Col, Typography, Card, Tag, Button, Divider, Tabs, Modal, Form, Input, message, Select, DatePicker } from 'antd';
import { EditOutlined, SaveOutlined, TrophyOutlined, BookOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 模拟科研数据
const INITIAL_RESEARCH = [
  {
    id: 1,
    title: '基于深度学习的计算机视觉研究',
    type: '国家自然科学基金',
    year: '2022',
    category: '项目',
    authors: ['张教授', '王副教授', '李博士'],
    abstract: '本项目基于深度学习技术，研究计算机视觉中的目标检测、图像分割和场景理解等问题，提出了一系列新型算法和模型，在实际应用中取得了显著效果。',
    image: 'https://picsum.photos/400/250',
    tags: ['深度学习', '计算机视觉', '目标检测']
  },
  {
    id: 2,
    title: '大规模分布式系统优化研究',
    type: '国家重点研发计划',
    year: '2021',
    category: '项目',
    authors: ['李教授', '刘讲师'],
    abstract: '针对大规模分布式系统中的性能瓶颈和资源利用率问题，本项目提出了自适应负载均衡和资源调度算法，显著提高了系统吞吐量和响应速度。',
    image: 'https://picsum.photos/400/251',
    tags: ['分布式系统', '负载均衡', '资源调度']
  },
  {
    id: 3,
    title: 'Efficient Deep Learning for Computer Vision',
    type: '国际期刊论文',
    year: '2022',
    category: '论文',
    authors: ['张教授', '李博士'],
    abstract: '本文提出了一种轻量级深度学习模型，在保持准确率的同时大幅降低计算复杂度和内存占用，适合在资源受限设备上部署高性能视觉应用。',
    journal: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    impact: '10.8',
    tags: ['深度学习', '计算机视觉', '轻量级模型']
  },
  {
    id: 4,
    title: '基于区块链的数据安全共享机制',
    type: '省部级项目',
    year: '2020',
    category: '项目',
    authors: ['王副教授', '刘讲师'],
    abstract: '本项目结合区块链技术和密码学方法，设计了一套安全高效的数据共享机制，解决了跨机构数据协作中的安全与隐私保护问题。',
    image: 'https://picsum.photos/400/252',
    tags: ['区块链', '数据安全', '隐私保护']
  },
  {
    id: 5,
    title: '智能软件测试方法研究',
    type: '横向项目',
    year: '2021',
    category: '项目',
    authors: ['王副教授'],
    abstract: '针对复杂软件系统测试中的效率和覆盖率问题，本项目开发了基于机器学习的智能测试用例生成方法，大幅提高了测试效率和缺陷发现率。',
    image: 'https://picsum.photos/400/253',
    tags: ['软件测试', '机器学习', '测试用例生成']
  },
  {
    id: 6,
    title: 'A Survey on Federated Learning and Its Applications',
    type: '国际期刊论文',
    year: '2021',
    category: '论文',
    authors: ['李教授', '张博士'],
    abstract: '本文综述了联邦学习的基本原理、关键技术和应用场景，分析了当前研究中的挑战和未来发展方向，为该领域的研究者提供了系统性参考。',
    journal: 'ACM Computing Surveys',
    impact: '10.2',
    tags: ['联邦学习', '分布式机器学习', '隐私计算']
  },
];

/**
 * 科研成果组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 科研成果组件
 */
const ResearchComponent = ({ isEditMode }) => {
  const [research, setResearch] = useState(INITIAL_RESEARCH);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditResearch, setCurrentEditResearch] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  
  // 筛选科研成果
  const getFilteredResearch = () => {
    if (activeTab === 'all') {
      return research;
    }
    return research.filter(item => item.category === activeTab);
  };
  
  // 按年份分组
  const getResearchByYear = () => {
    const groupedByYear = {};
    getFilteredResearch().forEach(item => {
      if (!groupedByYear[item.year]) {
        groupedByYear[item.year] = [];
      }
      groupedByYear[item.year].push(item);
    });
    
    // 按年份排序（降序）
    return Object.keys(groupedByYear)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        items: groupedByYear[year]
      }));
  };
  
  // 打开编辑模态框
  const showEditModal = (researchItem) => {
    setCurrentEditResearch(researchItem);
    form.resetFields();
    
    if (researchItem) {
      // 编辑现有成果
      form.setFieldsValue({
        ...researchItem,
        tags: researchItem.tags
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
        let newResearch = [...research];
        
        if (currentEditResearch) {
          // 更新现有成果
          const index = newResearch.findIndex(r => r.id === currentEditResearch.id);
          if (index > -1) {
            newResearch[index] = { ...newResearch[index], ...values };
            setResearch(newResearch);
            message.success('科研成果已更新');
          }
        } else {
          // 添加新成果
          const newId = Math.max(0, ...newResearch.map(r => r.id)) + 1;
          newResearch.push({ ...values, id: newId });
          setResearch(newResearch);
          message.success('科研成果已添加');
        }
        
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };
  
  // 渲染科研成果卡片
  const renderResearchCard = (item) => (
    <Col xs={24} sm={12} lg={8} key={item.id}>
      <Card 
        className="research-card"
        cover={item.image && <img alt={item.title} src={item.image} />}
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
        <Card.Meta
          title={
            <div>
              <Title level={4}>{item.title}</Title>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{item.type}</Tag>
                <Tag color="green">{item.year}</Tag>
              </div>
            </div>
          }
          description={
            <>
              <Paragraph ellipsis={{ rows: 3 }}>{item.abstract}</Paragraph>
              <div className="research-info">
                <Text type="secondary">
                  <TeamOutlined /> {item.authors.join(', ')}
                </Text>
                {item.journal && (
                  <Text type="secondary">
                    <BookOutlined /> {item.journal}
                  </Text>
                )}
                {item.impact && (
                  <Text type="secondary">
                    影响因子: {item.impact}
                  </Text>
                )}
              </div>
              <div className="research-tags">
                {item.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </div>
            </>
          }
        />
      </Card>
    </Col>
  );

  return (
    <div className="research-component">
      {/* 选项卡筛选 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="全部" key="all" />
        <TabPane tab="科研项目" key="项目" />
        <TabPane tab="学术论文" key="论文" />
      </Tabs>
      
      {/* 添加按钮（仅编辑模式可见） */}
      {isEditMode && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showEditModal(null)}
          >
            添加科研成果
          </Button>
        </div>
      )}
      
      {/* 按年份分组展示 */}
      {getResearchByYear().map(yearGroup => (
        <div key={yearGroup.year}>
          <Divider orientation="left">
            <Title level={4}>{yearGroup.year}年</Title>
          </Divider>
          <Row gutter={[16, 16]}>
            {yearGroup.items.map(item => renderResearchCard(item))}
          </Row>
        </div>
      ))}
      
      {/* 编辑模态框 */}
      <Modal
        title={`${currentEditResearch ? '编辑' : '添加'}科研成果`}
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
            <Col span={16}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="请输入标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="year"
                label="年份"
                rules={[{ required: true, message: '请选择年份' }]}
              >
                <Select placeholder="请选择年份">
                  {['2023', '2022', '2021', '2020', '2019'].map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="类别"
                rules={[{ required: true, message: '请选择类别' }]}
              >
                <Select placeholder="请选择类别">
                  <Option value="项目">科研项目</Option>
                  <Option value="论文">学术论文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请输入类型' }]}
              >
                <Input placeholder="如：国家自然科学基金、国际期刊论文等" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="abstract"
            label="摘要"
            rules={[{ required: true, message: '请输入摘要' }]}
          >
            <TextArea rows={4} placeholder="请输入摘要" />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="图片URL"
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          
          <Form.Item
            name="authors"
            label="作者/参与人员"
            rules={[{ required: true, message: '请输入作者/参与人员' }]}
          >
            <Select mode="tags" placeholder="请输入作者/参与人员，按Enter键确认">
              <Option value="张教授">张教授</Option>
              <Option value="李教授">李教授</Option>
              <Option value="王副教授">王副教授</Option>
              <Option value="刘讲师">刘讲师</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Select mode="tags" placeholder="请输入关键词，按Enter键确认">
              <Option value="深度学习">深度学习</Option>
              <Option value="计算机视觉">计算机视觉</Option>
              <Option value="人工智能">人工智能</Option>
              <Option value="区块链">区块链</Option>
              <Option value="软件工程">软件工程</Option>
            </Select>
          </Form.Item>
          
          {/* 根据类别显示不同的表单项 */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.category !== currentValues.category}
          >
            {({ getFieldValue }) => 
              getFieldValue('category') === '论文' ? (
                <>
                  <Row gutter={16}>
                    <Col span={16}>
                      <Form.Item
                        name="journal"
                        label="期刊/会议名称"
                      >
                        <Input placeholder="请输入期刊或会议名称" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="impact"
                        label="影响因子"
                      >
                        <Input placeholder="请输入影响因子" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResearchComponent; 
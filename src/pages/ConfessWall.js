/**
 * 表白墙页面组件
 * 
 * 功能：
 * - 查看校园表白信息
 * - 发表匿名表白
 * - 点赞和评论表白
 * - 按时间和热度排序
 */
import React, { useState, useEffect } from 'react';
import { 
  Layout, Row, Col, Typography, Card, Button, Input, 
  Tabs, Modal, Form, Avatar, Tag, Tooltip, Badge, 
  Divider, message, Select, Radio, Comment
} from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  CommentOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SendOutlined,
  LockOutlined,
  SmileOutlined,
  HeartTwoTone,
  GiftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FloatingButton from '../components/common/FloatingButton';
import '../assets/styles/ConfessWall.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 模拟表白数据
const confessions = [
  {
    id: 1,
    content: "在心理学课上偶遇的那个女孩，每次上课都穿蓝色衬衫，发现自己竟然开始期待每周二的课了。不知道你有没有注意到我，如果看到了这条消息，希望能加个微信认识一下。",
    date: "2023-07-05",
    likes: 128,
    comments: 13,
    anonymous: true,
    target: "心理学院的蓝衬衫女孩",
    tags: ["心动", "校园邂逅"],
    gifts: ["🌹", "🧸"]
  },
  {
    id: 2,
    content: "经常在图书馆六楼看到你，每次都在学习，很认真的样子。想认识你很久了，但一直没有勇气上前搭讪。我通常坐在你旁边的位置，如果你也注意到了我，希望能有机会一起喝杯咖啡。",
    date: "2023-07-06",
    likes: 86,
    comments: 8,
    anonymous: true,
    target: "图书馆六楼的学霸男生",
    tags: ["暗恋", "图书馆"],
    gifts: ["☕", "📚"]
  },
  {
    id: 3,
    content: "计算机学院的李同学，感谢你一直以来在编程课上对我的帮助。我其实一直都很欣赏你，不仅是因为你的技术好，更因为你总是那么耐心。不知道你有没有意中人了，如果没有，希望能得到一个机会。",
    date: "2023-07-07",
    likes: 156,
    comments: 21,
    anonymous: false,
    user: { name: "小鱼儿", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Fish" },
    target: "计算机学院的李同学",
    tags: ["感谢", "表白"],
    gifts: ["💻", "❤️"]
  },
  {
    id: 4,
    content: "遇见你是今年最美好的事情，虽然我们只是在学生会共事，但每次看到你的笑容我都会不自觉地心跳加速。我知道你最近压力很大，但请相信自己，你一定可以度过这段时期。也希望有一天能有勇气当面告诉你我的心意。",
    date: "2023-07-08",
    likes: 210,
    comments: 32,
    anonymous: true,
    target: "学生会的阳光男孩",
    tags: ["鼓励", "暗恋"],
    gifts: ["🌞", "🎁"]
  },
  {
    id: 5,
    content: "每天早上7点半在操场跑步的女孩，你的坚持和活力感染了我。我也开始了晨跑的习惯，希望有一天能有足够的勇气和你一起跑一圈。期待在某个清晨，我们能相识。",
    date: "2023-07-09",
    likes: 97,
    comments: 14,
    anonymous: true,
    target: "晨跑女孩",
    tags: ["运动", "晨跑"],
    gifts: ["🏃‍♀️", "🌅"]
  }
];

/**
 * 表白墙页面组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 是否为深色模式
 * @param {Function} props.toggleDarkMode - 切换主题的回调函数
 * @returns {JSX.Element} 表白墙页面
 */
const ConfessWall = ({ darkMode, toggleDarkMode }) => {
  const [likedConfessions, setLikedConfessions] = useState({});
  const [activeTab, setActiveTab] = useState('latest');
  const [confessModalVisible, setConfessModalVisible] = useState(false);
  const [displayConfessions, setDisplayConfessions] = useState(confessions);
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  
  // 根据标签页排序表白内容
  useEffect(() => {
    if (activeTab === 'latest') {
      // 按日期排序
      setDisplayConfessions([...confessions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      ));
    } else if (activeTab === 'hot') {
      // 按热度（点赞数+评论数）排序
      setDisplayConfessions([...confessions].sort((a, b) => 
        (b.likes + b.comments) - (a.likes + a.comments)
      ));
    }
  }, [activeTab]);
  
  /**
   * 处理点赞
   * @param {number} id - 表白ID
   */
  const handleLike = (id) => {
    setLikedConfessions({
      ...likedConfessions,
      [id]: !likedConfessions[id]
    });
  };
  
  /**
   * 发布表白
   * @param {Object} values - 表单值
   */
  const handleSubmitConfession = (values) => {
    console.log('表白内容:', values);
    message.success('表白已发布，等待审核后将显示在表白墙');
    setConfessModalVisible(false);
    form.resetFields();
  };

  return (
    <Layout className="app-layout">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        
        <Content className="confess-content">
          <div className="confess-header">
            <div className="confess-title-section">
              <Title level={2} className="with-icon">
                <HeartTwoTone twoToneColor="#ff4d4f" className="title-icon" />
                表白墙
              </Title>
              <Text className="confess-subtitle">
                这里是表达爱意、分享感动和传递温暖的地方
              </Text>
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              icon={<SendOutlined />}
              onClick={() => setConfessModalVisible(true)}
              className="confess-button"
            >
              发表表白
            </Button>
          </div>
          
          <div className="confess-filter">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              centered
              className="confess-tabs"
            >
              <TabPane 
                tab={<span><ClockCircleOutlined /> 最新表白</span>} 
                key="latest" 
              />
              <TabPane 
                tab={<span><FireOutlined /> 热门表白</span>} 
                key="hot" 
              />
            </Tabs>
          </div>
          
          <Row gutter={[24, 24]} className="confess-list">
            {displayConfessions.map(confession => (
              <Col xs={24} md={12} key={confession.id}>
                <Card className="confess-card">
                  <div className="confess-card-header">
                    <div className="confess-user">
                      {confession.anonymous ? (
                        <Badge count={<LockOutlined style={{ fontSize: 10 }} />} color="#eb2f96">
                          <Avatar icon={<UserOutlined />} />
                        </Badge>
                      ) : (
                        <Avatar src={confession.user.avatar} />
                      )}
                      <div className="confess-user-info">
                        <Text strong>{confession.anonymous ? "匿名同学" : confession.user.name}</Text>
                        <Text type="secondary" className="confess-date">{confession.date}</Text>
                      </div>
                    </div>
                    
                    <div className="confess-target">
                      <GiftOutlined /> To: {confession.target}
                    </div>
                  </div>
                  
                  <Divider className="confess-divider" />
                  
                  <div className="confess-content-text">
                    <Paragraph>{confession.content}</Paragraph>
                  </div>
                  
                  <div className="confess-tags">
                    {confession.tags.map((tag, index) => (
                      <Tag key={index} color="pink" className="confess-tag">{tag}</Tag>
                    ))}
                  </div>
                  
                  {confession.gifts && confession.gifts.length > 0 && (
                    <div className="confess-gifts">
                      {confession.gifts.map((gift, index) => (
                        <span key={index} className="confess-gift">{gift}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="confess-actions">
                    <Button 
                      type="text" 
                      icon={likedConfessions[confession.id] ? <HeartFilled className="liked" /> : <HeartOutlined />}
                      onClick={() => handleLike(confession.id)}
                      className="confess-action-btn"
                    >
                      {likedConfessions[confession.id] ? confession.likes + 1 : confession.likes}
                    </Button>
                    
                    <Button 
                      type="text" 
                      icon={<CommentOutlined />}
                      className="confess-action-btn"
                    >
                      {confession.comments}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          <Modal
            title={
              <div className="modal-title">
                <HeartTwoTone twoToneColor="#ff4d4f" className="modal-icon" />
                <span>发表表白</span>
              </div>
            }
            open={confessModalVisible}
            onCancel={() => setConfessModalVisible(false)}
            footer={null}
            width={600}
            className="confess-modal"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitConfession}
              initialValues={{ anonymous: true }}
            >
              <Form.Item
                name="target"
                label="表白对象"
                rules={[{ required: true, message: '请输入表白对象' }]}
              >
                <Input 
                  placeholder="比如：文学院的短发女孩" 
                  prefix={<HeartOutlined className="site-form-item-icon" />} 
                />
              </Form.Item>
              
              <Form.Item
                name="content"
                label="表白内容"
                rules={[{ required: true, message: '请输入表白内容' }]}
              >
                <TextArea 
                  placeholder="在这里写下你想说的话..." 
                  autoSize={{ minRows: 4, maxRows: 8 }} 
                  maxLength={300} 
                  showCount 
                />
              </Form.Item>
              
              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="添加标签，比如：心动、暗恋"
                  style={{ width: '100%' }}
                >
                  <Select.Option key="心动">心动</Select.Option>
                  <Select.Option key="暗恋">暗恋</Select.Option>
                  <Select.Option key="表白">表白</Select.Option>
                  <Select.Option key="感谢">感谢</Select.Option>
                  <Select.Option key="鼓励">鼓励</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="gifts"
                label="赠送礼物"
              >
                <Select
                  mode="multiple"
                  placeholder="选择要赠送的礼物"
                  style={{ width: '100%' }}
                >
                  <Select.Option key="🌹">🌹 玫瑰</Select.Option>
                  <Select.Option key="💝">💝 礼物</Select.Option>
                  <Select.Option key="🧸">🧸 泰迪熊</Select.Option>
                  <Select.Option key="🍫">🍫 巧克力</Select.Option>
                  <Select.Option key="💌">💌 情书</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="anonymous"
                valuePropName="checked"
              >
                <Tooltip title="开启匿名后，您的身份信息将不会显示">
                  <Button 
                    type="dashed" 
                    icon={<LockOutlined />}
                    block
                    className={form.getFieldValue('anonymous') ? 'anonymous-active' : ''}
                    onClick={() => form.setFieldsValue({ anonymous: !form.getFieldValue('anonymous') })}
                  >
                    {form.getFieldValue('anonymous') ? '已开启匿名' : '点击开启匿名'}
                  </Button>
                </Tooltip>
              </Form.Item>
              
              <div className="form-tips">
                <SmileOutlined /> 温馨提示：表白内容会经过审核，请遵守校园社区规范
              </div>
              
              <Form.Item className="form-footer">
                <Button type="default" onClick={() => setConfessModalVisible(false)} className="cancel-btn">
                  取消
                </Button>
                <Button type="primary" htmlType="submit" className="submit-btn">
                  发布表白
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          
          <FloatingButton />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ConfessWall; 
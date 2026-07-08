/**
 * 学校首页组件
 * 
 * 功能：
 * - 展示学校最新通知
 * - 显示各学院发布的招聘信息
 * - 展示社团活动和招新动态
 * - 学校资源链接
 * - 学院资讯与咨询入口
 */
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, List, Tag, Button, Carousel, Tabs, Avatar, Badge, Calendar, Divider, Statistic, Tooltip, Modal, message } from 'antd';
import { 
  NotificationOutlined, 
  BulbOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  ReadOutlined,
  BankOutlined,
  FireOutlined,
  ScheduleOutlined,
  BookOutlined,
  TrophyOutlined,
  FileOutlined,
  UserOutlined,
  LinkOutlined,
  MailOutlined,
  GlobalOutlined,
  HomeOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  SolutionOutlined,
  ClockCircleOutlined,
  RightCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import SchoolSidebar from '../components/common/SchoolSidebar';
import Header from '../components/common/Header';
import '../assets/styles/SchoolHome.css';
import { useNavigate } from 'react-router-dom';
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Meta } = Card;

// 模拟学校通知数据
const schoolNotifications = [
  {
    id: 1,
    title: '关于2023-2024学年第二学期注册选课的通知',
    date: '2023-12-28',
    department: '教务处',
    important: true,
    new: true,
    content: '各位同学：2023-2024学年第二学期选课将于2024年1月5日8:00开始，1月8日20:00结束。请在规定时间内完成选课。选课系统地址：http://jwxt.university.edu.cn'
  },
  {
    id: 2,
    title: '2024年元旦放假安排的通知',
    date: '2023-12-25',
    department: '校办公室',
    important: true,
    new: true,
    content: '根据国家法定节假日安排，结合学校实际情况，现将2024年元旦放假安排通知如下：放假时间为2023年12月30日至2024年1月1日，共3天。1月2日（星期二）正常上课。'
  },
  {
    id: 3,
    title: '校园网络升级维护通知',
    date: '2023-12-22',
    department: '信息中心',
    important: false,
    new: true,
    content: '为提升校园网络服务质量，学校将于2023年12月29日凌晨2:00-6:00进行网络设备升级维护，期间校园网可能出现间歇性中断，请师生提前做好准备。'
  },
  {
    id: 4,
    title: '2023年度学生综合素质评价实施方案',
    date: '2023-12-20',
    department: '学生处',
    important: false,
    new: false,
    content: '为全面推进素质教育，科学评价学生综合素质，促进学生全面发展，特制定本评价方案。评价内容包括道德品质、学习能力、身心健康、审美素养和社会实践五个维度。'
  },
  {
    id: 5,
    title: '图书馆寒假开放时间调整通知',
    date: '2023-12-18',
    department: '图书馆',
    important: false,
    new: false,
    content: '寒假期间（2024年1月22日至2月25日），图书馆开放时间调整为：周一至周五8:30-17:00，周六、日9:00-16:00。自习室照常开放，开放时间：7:00-22:00。'
  }
];

// 模拟学院招聘信息
const recruitmentInfo = [
  {
    id: 1,
    title: '腾讯2024校园招聘宣讲会',
    faculty: '计算机学院',
    date: '2024-01-10',
    location: '逸夫楼102报告厅',
    tags: ['互联网', '全职', '实习'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Tencent'
  },
  {
    id: 2,
    title: '中国建筑集团校园招聘',
    faculty: '工学院',
    date: '2024-01-12',
    location: '工学院报告厅',
    tags: ['建筑', '全职'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Construction'
  },
  {
    id: 3,
    title: '阿里巴巴数据分析师招聘',
    faculty: '理学院',
    date: '2024-01-15',
    location: '理学院一号报告厅',
    tags: ['数据', '实习', '全职'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Alibaba'
  },
  {
    id: 4,
    title: '国泰君安证券校园招聘',
    faculty: '商学院',
    date: '2024-01-18',
    location: '商学院报告厅',
    tags: ['金融', '全职'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Finance'
  }
];

// 模拟社团活动数据
const clubActivities = [
  {
    id: 1,
    title: '摄影协会2024年首次采风活动',
    club: '摄影协会',
    date: '2024-01-06',
    location: '校园及周边',
    description: '新学期首次采风活动，欢迎摄影爱好者参加',
    poster: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    recruitment: true
  },
  {
    id: 2,
    title: '辩论社新学期辩手招募',
    club: '辩论社',
    date: '2024-01-08',
    location: '人文楼203',
    description: '欢迎热爱辩论的同学加入我们的大家庭',
    poster: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    recruitment: true
  },
  {
    id: 3,
    title: '音乐社元旦晚会',
    club: '音乐社',
    date: '2023-12-31',
    location: '大学生活动中心',
    description: '跨年音乐晚会，一起用音乐迎接新年',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    recruitment: false
  },
  {
    id: 4,
    title: '科技创新社团项目展示日',
    club: '科技创新社',
    date: '2024-01-12',
    location: '工学院一楼大厅',
    description: '展示最新科技创新项目，招募新成员',
    poster: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    recruitment: true
  }
];

// 模拟学院资讯数据
const facultyNews = [
  {
    id: 1,
    title: '计算机学院举办人工智能前沿讲座',
    faculty: '计算机学院',
    date: '2023-12-26',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    summary: '本次讲座邀请了清华大学张教授分享人工智能领域最新研究成果，吸引了全校300多名师生参加。'
  },
  {
    id: 2,
    title: '外国语学院成功举办跨文化交流活动',
    faculty: '外国语学院',
    date: '2023-12-25',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    summary: '来自五个国家的留学生与外语学院学生共同举办了跨文化交流活动，展示各国传统文化和语言特色。'
  },
  {
    id: 3,
    title: '工学院学生团队斩获全国大学生机械创新设计大赛特等奖',
    faculty: '工学院',
    date: '2023-12-23',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    summary: '由工学院机械设计专业五名学生组成的"智造先锋"团队，在全国大学生机械创新设计大赛中获得特等奖。'
  },
  {
    id: 4,
    title: '商学院成功举办2023金融科技与数字经济论坛',
    faculty: '商学院',
    date: '2023-12-20',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    summary: '商学院联合多家金融机构举办了金融科技与数字经济论坛，探讨了金融科技与经济发展的未来趋势。'
  }
];

// 模拟学校资源数据
const schoolResources = [
  { 
    title: '图书馆资源', 
    icon: <BookOutlined />, 
    count: 150, 
    unit: '万册',
    description: '电子书、期刊、数据库等',
    color: '#1890ff'
  },
  { 
    title: '在线课程', 
    icon: <ReadOutlined />, 
    count: 2500, 
    unit: '门',
    description: 'MOOC、视频课程、讲座',
    color: '#52c41a'
  },
  { 
    title: '实验室', 
    icon: <BulbOutlined />, 
    count: 45, 
    unit: '个',
    description: '各类专业实验室、创新空间',
    color: '#fa8c16'
  },
  { 
    title: '奖学金项目', 
    icon: <TrophyOutlined />, 
    count: 30, 
    unit: '项',
    description: '校内外各类奖学金、助学金',
    color: '#722ed1'
  }
];

// 模拟教学资源数据
const teachingResources = [
  {
    id: 1,
    title: '2023-2024学年第一学期期末考试安排',
    type: '考试安排',
    date: '2023-12-15',
    department: '教务处',
    link: '#'
  },
  {
    id: 2,
    title: '通识教育选修课程目录（2024年春季学期）',
    type: '课程资源',
    date: '2023-12-18',
    department: '教务处',
    link: '#'
  },
  {
    id: 3,
    title: '大学生创新创业训练计划项目申报指南',
    type: '创新创业',
    date: '2023-12-20',
    department: '创新创业学院',
    link: '#'
  },
  {
    id: 4,
    title: '优质慕课资源推荐（2023年冬季版）',
    type: '网络课程',
    date: '2023-12-22',
    department: '教育技术中心',
    link: '#'
  },
  {
    id: 5,
    title: '学术论文写作与发表指导手册',
    type: '学术指南',
    date: '2023-12-25',
    department: '研究生院',
    link: '#'
  }
];

// 学院咨询联系方式
const facultyContacts = [
  { name: '计算机学院', phone: '010-12345678', email: 'cs@university.edu.cn' },
  { name: '工学院', phone: '010-12345679', email: 'eng@university.edu.cn' },
  { name: '理学院', phone: '010-12345680', email: 'science@university.edu.cn' },
  { name: '商学院', phone: '010-12345681', email: 'business@university.edu.cn' },
  { name: '文学院', phone: '010-12345682', email: 'arts@university.edu.cn' },
  { name: '医学院', phone: '010-12345683', email: 'medicine@university.edu.cn' },
  { name: '法学院', phone: '010-12345684', email: 'law@university.edu.cn' },
  { name: '外国语学院', phone: '010-12345685', email: 'language@university.edu.cn' }
];

// 轮播图数据
const carouselItems = [
  {
    title: "校园风光",
    image: "https://its.pku.edu.cn/img/banner/banner20200717.jpg",
    link: "#"
  },
  {
    title: "学术活动",
    image: "https://tse3-mm.cn.bing.net/th/id/OIP-C.Ht1E9QGwuFbcLisaNV9OZgHaDy?w=334&h=178&c=7&r=0&o=5&dpr=1.5&pid=1.7",
    link: "#"
  },
  {
    title: "重要通知",
    image: "https://its.pku.edu.cn/img/banner/banner20180101.jpg",
    link: "#"
  }
];

/**
 * 学校首页组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 是否为深色模式
 * @param {Function} props.toggleDarkMode - 切换主题的回调函数
 * @returns {JSX.Element} 学校首页
 */
const SchoolHome = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const navigate = useNavigate();

  // 处理通知点击，显示详情
  const handleNotificationClick = (notification) => {
    setCurrentNotification(notification);
    setNotificationModalVisible(true);
  };

  // 处理咨询按钮点击
  const handleConsultationClick = () => {
    setConsultationModalVisible(true);
  };

  // 发送咨询消息
  const handleSendConsultation = () => {
    message.success('您的咨询已发送，学院老师会尽快回复您！');
    setConsultationModalVisible(false);
  };
  
  // 悬浮按钮组
  const FloatingButtons = () => (
    <div className="floating-buttons">
      <Tooltip title="前往全国高校平台">
        <Button 
          type="primary" 
          shape="circle" 
          icon={<GlobalOutlined />} 
          onClick={() => window.location.href = '/allschool'}
          className="float-button global-button"
        />
      </Tooltip>
      <Tooltip title="返回个人主页">
        <Button 
          type="primary" 
          shape="circle" 
          icon={<HomeOutlined />} 
          onClick={() => window.location.href = '/'}
          className="float-button home-button"
        />
      </Tooltip>
    </div>
  );

  return (
    <Layout className="app-layout">
      <SchoolSidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content className="school-content">
          {/* 标题区域 */}
          <div className="school-header">
            <Title level={2}>校园信息门户</Title>
            <Text type="secondary">获取最新校园资讯、学院动态、社团活动</Text>
          </div>

          {/* 轮播图区域 */}
          <div className="carousel-section">
            <Carousel autoplay effect="fade" className="school-carousel">
              {carouselItems.map((item, index) => (
                <div key={index} className="carousel-item">
                  <div 
                    className="carousel-image" 
                    style={{backgroundImage: `url(${item.image})`}}
                  >
                    <div className="carousel-content">
                      <h3>{item.title}</h3>
                      <Button type="primary" href={item.link}>了解更多</Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          <Row gutter={[24, 24]} className="school-main-content">
            {/* 左侧内容 */}
            <Col xs={24} md={16}>
              {/* 通知公告 */}
              <Card 
                title={
                  <div className="card-title">
                    <NotificationOutlined /> 通知公告
                  </div>
                }
                extra={<a href="/school/notifications">查看全部</a>}
                className="school-card"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={schoolNotifications}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div className="notification-title">
                            <a href="#" onClick={(e) => {
                              e.preventDefault();
                              handleNotificationClick(item);
                            }}>
                              {item.important && <Badge color="red" />}
                              {item.new && <Tag color="green">新</Tag>}
                              {item.title}
                            </a>
                          </div>
                        }
                        description={
                          <div className="notification-info">
                            <span>{item.department}</span>
                            <span>{item.date}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 学院资讯 */}
              <Card 
                title={
                  <div className="card-title">
                    <BulbOutlined /> 学院资讯
                  </div>
                }
                extra={<a href="/school/faculty-news">查看全部</a>}
                className="school-card"
              >
                <List
                  grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
                  dataSource={facultyNews}
                  renderItem={item => (
                    <List.Item>
                      <Card 
                        hoverable 
                        cover={<img alt={item.title} src={item.image} />}
                        className="faculty-news-card"
                      >
                        <Meta
                          title={item.title}
                          description={
                            <div className="faculty-news-info">
                              <p><BankOutlined /> {item.faculty}</p>
                              <p><ClockCircleOutlined /> {item.date}</p>
                              <Paragraph ellipsis={{ rows: 2 }}>
                                {item.summary}
                              </Paragraph>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>

              {/* 教学资源 */}
              <Card 
                title={
                  <div className="card-title">
                    <ReadOutlined /> 教学资源
                  </div>
                }
                extra={<a href="/school/teaching-resources">查看全部</a>}
                className="school-card"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={teachingResources}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <a key="download" href={item.link}>下载</a>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.title}
                        description={
                          <div className="resource-info">
                            <Tag color="blue">{item.type}</Tag>
                            <span>{item.department} | {item.date}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 学院招聘信息 */}
              <Card 
                title={
                  <div className="card-title">
                    <BankOutlined /> 学院招聘
                  </div>
                }
                extra={<a href="/school/recruitment">查看全部</a>}
                className="school-card"
              >
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
                  dataSource={recruitmentInfo}
                  renderItem={item => (
                    <List.Item>
                      <Card className="recruitment-card">
                        <Meta
                          avatar={<Avatar src={item.logo} size={64} />}
                          title={item.title}
                          description={
                            <div className="recruitment-info">
                              <p><BankOutlined /> {item.faculty}</p>
                              <p><CalendarOutlined /> {item.date}</p>
                              <p><ScheduleOutlined /> {item.location}</p>
                              <div className="recruitment-tags">
                                {item.tags.map((tag, index) => (
                                  <Tag key={index}>{tag}</Tag>
                                ))}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* 右侧边栏 */}
            <Col xs={24} md={8}>
              {/* 学院咨询 */}
              <Card
                title={
                  <div className="card-title">
                    <PhoneOutlined /> 学院咨询
                  </div>
                }
                extra={
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<QuestionCircleOutlined />}
                    onClick={handleConsultationClick}
                  >
                    在线咨询
                  </Button>
                }
                className="school-card consultation-card"
              >
                <List
                  size="small"
                  dataSource={facultyContacts.slice(0, 5)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BankOutlined />} />}
                        title={item.name}
                        description={
                          <>
                            <div><PhoneOutlined /> {item.phone}</div>
                            <div><MailOutlined /> {item.email}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div className="more-faculties">
                  <Button type="link" onClick={handleConsultationClick}>
                    查看更多学院联系方式 <RightCircleOutlined />
                  </Button>
                </div>
              </Card>

              {/* 校历 */}
              <Card 
                title={
                  <div className="card-title">
                    <CalendarOutlined /> 校历
                  </div>
                }
                className="school-card calendar-card"
              >
                <Calendar fullscreen={false} />
              </Card>

              {/* 学校统计 */}
              <Card 
                title={
                  <div className="card-title">
                    <FileOutlined /> 学校资源
                  </div>
                }
                className="school-card"
              >
                <Row gutter={[16, 16]}>
                  {schoolResources.map((resource, index) => (
                    <Col span={12} key={index}>
                      <Card className="resource-stat-card">
                        <Statistic
                          title={resource.title}
                          value={resource.count}
                          suffix={resource.unit}
                          valueStyle={{ color: resource.color }}
                          prefix={resource.icon}
                        />
                        <Text type="secondary">{resource.description}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* 快速链接 */}
              <Card 
                title={
                  <div className="card-title">
                    <LinkOutlined /> 快速链接
                  </div>
                }
                className="school-card"
              >
                <div className="quick-links">
                  <Button type="link" icon={<UserOutlined />}>学生自助服务</Button>
                  <Button type="link" icon={<BookOutlined />}>图书馆</Button>
                  <Button type="link" icon={<ReadOutlined />}>教务管理系统</Button>
                  <Button type="link" icon={<MailOutlined />}>校园邮箱</Button>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 社团活动 */}
          <Card 
            title={
              <div className="card-title">
                <TeamOutlined /> 社团活动
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigate('/club-activities')}>
                查看更多活动 <RightCircleOutlined />
              </Button>
            }
            className="school-card"
          >
            <Row gutter={[24, 24]}>
              {clubActivities.map(activity => (
                <Col xs={24} sm={12} md={8} lg={6} key={activity.id}>
                  <Card
                    hoverable
                    cover={<img alt={activity.title} src={activity.poster} />}
                    className="club-card"
                  >
                    {activity.recruitment && (
                      <Badge.Ribbon text="招新中" color="green" className="club-badge" />
                    )}
                    <Meta
                      title={<a href={`/club-activities?id=${activity.id}`}>{activity.title}</a>}
                      description={
                        <div className="activity-info">
                          <p><TeamOutlined /> {activity.club}</p>
                          <p><CalendarOutlined /> {activity.date}</p>
                          <p><EnvironmentOutlined /> {activity.location}</p>
                          <Paragraph ellipsis={{ rows: 2 }}>{activity.description}</Paragraph>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 通知详情模态框 */}
          <Modal
            title={
              <div className="modal-title">
                <NotificationOutlined className="modal-icon" />
                <span>通知详情</span>
              </div>
            }
            open={notificationModalVisible}
            onCancel={() => setNotificationModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setNotificationModalVisible(false)}>
                关闭
              </Button>
            ]}
            width={600}
          >
            {currentNotification && (
              <div className="notification-detail">
                <h3>{currentNotification.title}</h3>
                <div className="notification-meta">
                  <span><CalendarOutlined /> {currentNotification.date}</span>
                  <span><BankOutlined /> {currentNotification.department}</span>
                </div>
                <Divider />
                <Paragraph>
                  {currentNotification.content}
                </Paragraph>
              </div>
            )}
          </Modal>

          {/* 学院咨询模态框 */}
          <Modal
            title={
              <div className="modal-title">
                <SolutionOutlined className="modal-icon" />
                <span>学院咨询服务</span>
              </div>
            }
            open={consultationModalVisible}
            onCancel={() => setConsultationModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setConsultationModalVisible(false)}>
                关闭
              </Button>,
              <Button key="submit" type="primary" onClick={handleSendConsultation}>
                发送咨询
              </Button>
            ]}
            width={700}
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="学院联系方式" key="1">
                <List
                  itemLayout="horizontal"
                  dataSource={facultyContacts}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BankOutlined />} />}
                        title={item.name}
                        description={
                          <>
                            <div><PhoneOutlined /> {item.phone}</div>
                            <div><MailOutlined /> {item.email}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab="在线咨询" key="2">
                <div className="consultation-form">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <label>选择学院：</label>
                      <br />
                      <select className="faculty-select">
                        {facultyContacts.map((faculty, index) => (
                          <option key={index} value={faculty.name}>{faculty.name}</option>
                        ))}
                      </select>
                    </Col>
                    <Col span={24}>
                      <label>咨询问题：</label>
                      <br />
                      <textarea
                        className="consultation-textarea"
                        placeholder="请详细描述您的问题，我们会尽快回复"
                        rows={5}
                      ></textarea>
                    </Col>
                    <Col span={24}>
                      <label>联系方式：</label>
                      <br />
                      <input
                        type="text"
                        className="contact-input"
                        placeholder="请留下您的联系方式（邮箱或手机号）"
                      />
                    </Col>
                  </Row>
                </div>
              </TabPane>
              <TabPane tab="常见问题" key="3">
                <div className="faq-list">
                  <div className="faq-item">
                    <h4>如何申请学院奖学金？</h4>
                    <p>学院奖学金通常在每学年开始时申请，详细信息请关注学院官网通知或咨询学院办公室。</p>
                  </div>
                  <div className="faq-item">
                    <h4>如何预约学院导师？</h4>
                    <p>可以通过学院官网导师专区查询导师联系方式，或直接发送邮件预约。</p>
                  </div>
                  <div className="faq-item">
                    <h4>学分替代规则是什么？</h4>
                    <p>学分替代需要填写申请表并获得相关导师和教务部门批准，具体规则请参考教务处网站学分管理章程。</p>
                  </div>
                  <div className="faq-item">
                    <h4>如何参与学院科研项目？</h4>
                    <p>可以关注学院科研通知，或直接联系相关导师表达参与意愿，优秀学生可获得科研项目参与机会。</p>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Modal>

          {/* 悬浮按钮 */}
          <FloatingButtons />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SchoolHome;

/**
 * 全学校首页组件
 * 
 * 功能：
 * - 展示全国各高校的研究成果
 * - 各校招生信息汇总
 * - 高校宣传与活动展示
 * - 高校排行榜
 * - 热门资讯与话题
 */
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, List, Tag, Button, Carousel, Tabs, Avatar, Badge, Tooltip, Divider, Statistic, Table, Space } from 'antd';
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
  GlobalOutlined,
  EnvironmentOutlined,
  StarOutlined,
  ApartmentOutlined,
  ExperimentOutlined,
  RightCircleOutlined,
  HomeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import AllSchoolSidebar from '../components/common/AllSchoolSidebar';
import Header from '../components/common/Header';
import '../assets/styles/AllSchoolHome.css';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Meta } = Card;

// 模拟高校研究成果数据
const researchAchievements = [
  {
    id: 1,
    title: '清华大学团队在量子计算领域取得重大突破',
    university: '清华大学',
    department: '物理学院',
    date: '2023-12-15',
    cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '清华大学物理学院量子信息研究团队成功研发出新型量子处理器，在量子优势领域取得突破性进展。',
    tags: ['量子计算', '物理学', '技术创新']
  },
  {
    id: 2,
    title: '北京大学医学团队开发新型癌症早期筛查技术',
    university: '北京大学',
    department: '医学院',
    date: '2023-12-10',
    cover: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '北京大学医学院研究团队开发出一种基于液体活检的癌症早期筛查技术，大幅提高了检测准确率。',
    tags: ['医学研究', '癌症筛查', '生物技术']
  },
  {
    id: 3,
    title: '复旦大学在人工智能自然语言处理领域获重要进展',
    university: '复旦大学',
    department: '计算机学院',
    date: '2023-12-05',
    cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '复旦大学计算机学院AI团队开发的新型自然语言处理模型在国际评测中取得领先成绩。',
    tags: ['人工智能', '自然语言处理', '计算机科学']
  },
  {
    id: 4,
    title: '浙江大学研发新型可降解材料',
    university: '浙江大学',
    department: '材料科学与工程学院',
    date: '2023-11-28',
    cover: 'https://images.unsplash.com/photo-1616004655123-818cbd4b3143?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '浙江大学材料科学与工程学院成功研发出一种新型环保可降解材料，可替代传统塑料。',
    tags: ['材料科学', '环保科技', '可持续发展']
  }
];

// 模拟高校招生信息
const admissionInfo = [
  {
    id: 1,
    university: '上海交通大学',
    title: '2024年本科生招生简章',
    date: '2023-12-20',
    deadline: '2024-06-30',
    tags: ['本科招生', '2024年', '综合类'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=SJTU',
    link: '#'
  },
  {
    id: 2,
    university: '武汉大学',
    title: '2024年硕士研究生招生公告',
    date: '2023-12-18',
    deadline: '2024-01-10',
    tags: ['研究生', '2024年', '全日制'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=WHU',
    link: '#'
  },
  {
    id: 3,
    university: '南京大学',
    title: '2024年博士研究生招生简章',
    date: '2023-12-15',
    deadline: '2024-03-15',
    tags: ['博士', '2024年', '学术型'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=NJU',
    link: '#'
  },
  {
    id: 4,
    university: '中国人民大学',
    title: '2024年MBA项目招生信息',
    date: '2023-12-12',
    deadline: '2024-05-20',
    tags: ['MBA', '2024年', '专业学位'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=RUC',
    link: '#'
  }
];

// 模拟高校活动数据
const universityActivities = [
  {
    id: 1,
    title: '北京大学120周年校庆系列活动',
    university: '北京大学',
    date: '2024-05-04',
    location: '北京大学校园',
    cover: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '北京大学将举办120周年校庆系列活动，包括学术论坛、校友返校、文艺演出等。',
    isOpen: true
  },
  {
    id: 2,
    title: '2024全国高校人工智能创新大赛',
    university: '多所高校联合',
    date: '2024-04-15',
    location: '线上线下结合',
    cover: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '由教育部支持的全国高校人工智能创新大赛，面向全国高校学生开放报名。',
    isOpen: true
  },
  {
    id: 3,
    title: '2024南京大学国际文化节',
    university: '南京大学',
    date: '2024-03-20',
    location: '南京大学鼓楼校区',
    cover: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '南京大学国际文化节将展示来自世界各地的文化，促进国际交流。',
    isOpen: true
  },
  {
    id: 4,
    title: '2024清华经管学院创业大赛',
    university: '清华大学',
    date: '2024-04-10',
    location: '清华大学经管学院',
    cover: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: '清华大学经管学院举办的年度创业大赛，欢迎全国各高校学生参与。',
    isOpen: true
  }
];

// 模拟高校排行榜数据
const universityRankings = [
  {
    key: '1',
    rank: 1,
    name: '清华大学',
    score: 98.5,
    city: '北京',
    type: '985/211/双一流',
    change: 0
  },
  {
    key: '2',
    rank: 2,
    name: '北京大学',
    score: 97.8,
    city: '北京',
    type: '985/211/双一流',
    change: 0
  },
  {
    key: '3',
    rank: 3,
    name: '上海交通大学',
    score: 93.2,
    city: '上海',
    type: '985/211/双一流',
    change: 1
  },
  {
    key: '4',
    rank: 4,
    name: '浙江大学',
    score: 92.9,
    city: '杭州',
    type: '985/211/双一流',
    change: -1
  },
  {
    key: '5',
    rank: 5,
    name: '复旦大学',
    score: 91.6,
    city: '上海',
    type: '985/211/双一流',
    change: 0
  }
];

// 排行榜表格列定义
const rankingColumns = [
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
    render: (text, record) => (
      <div className="rank-cell">
        <span className={`rank-number rank-${text <= 3 ? text : 'normal'}`}>{text}</span>
        {record.change > 0 && <span className="rank-change up">↑{record.change}</span>}
        {record.change < 0 && <span className="rank-change down">↓{Math.abs(record.change)}</span>}
        {record.change === 0 && <span className="rank-change same">-</span>}
      </div>
    )
  },
  {
    title: '学校名称',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a href="#">{text}</a>
  },
  {
    title: '综合得分',
    dataIndex: 'score',
    key: 'score'
  },
  {
    title: '所在城市',
    dataIndex: 'city',
    key: 'city'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    render: (text) => (
      <span>
        {text.split('/').map((item, index) => (
          <Tag color={index === 0 ? 'purple' : index === 1 ? 'blue' : 'green'} key={index}>
            {item}
          </Tag>
        ))}
      </span>
    )
  }
];

// 轮播图数据
const carouselItems = [
  {
    title: "2024年全国高校招生季即将开始",
    subtitle: "了解最新招生政策和重点高校招生计划",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  },
  {
    title: "中国高校科研实力全球领先",
    subtitle: "多所高校在国际学术期刊发表重要研究成果",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  },
  {
    title: "高等教育改革持续推进",
    subtitle: "新一轮教育评价改革方案公布，注重人才培养质量",
    image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    link: "#"
  }
];

/**
 * 全学校首页组件
 */
const AllSchoolHome = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  // 悬浮按钮组
  const FloatingButtons = () => (
    <div className="floating-buttons">
      <Tooltip title="返回学校主页">
        <Button 
          type="primary" 
          shape="circle" 
          icon={<BankOutlined />} 
          onClick={() => window.location.href = '/school'}
          className="float-button school-button"
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
      <AllSchoolSidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content className="all-school-content">
          {/* 标题区域 */}
          <div className="all-school-header">
            <Title level={2}>全国高校资讯平台</Title>
            <Text type="secondary">汇聚全国高校信息，展示前沿科研成果，提供最新招生资讯</Text>
          </div>

          {/* 轮播图区域 */}
          <div className="carousel-section">
            <Carousel autoplay effect="fade" className="all-school-carousel">
              {carouselItems.map((item, index) => (
                <div key={index} className="carousel-item">
                  <div 
                    className="carousel-image" 
                    style={{backgroundImage: `url(${item.image})`}}
                  >
                    <div className="carousel-content">
                      <h2>{item.title}</h2>
                      <p>{item.subtitle}</p>
                      <Button type="primary" href={item.link}>了解更多</Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          <Row gutter={[24, 24]} className="all-school-main-content">
            {/* 左侧内容 */}
            <Col xs={24} lg={16}>
              {/* 高校研究成果 */}
              <Card 
                title={
                  <div className="card-title">
                    <ExperimentOutlined /> 高校科研成果
                  </div>
                }
                extra={<a href="/allschool/research">查看更多</a>}
                className="all-school-card"
              >
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
                  dataSource={researchAchievements}
                  renderItem={item => (
                    <List.Item>
                      <Card 
                        hoverable
                        cover={<img alt={item.title} src={item.cover} />}
                        className="research-card"
                      >
                        <Meta
                          title={<a href={`/allschool/research/${item.id}`}>{item.title}</a>}
                          description={
                            <div className="research-info">
                              <p><BankOutlined /> {item.university} - {item.department}</p>
                              <p><CalendarOutlined /> {item.date}</p>
                              <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                              <div className="research-tags">
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

              {/* 高校排行榜 */}
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    <Text strong>高校排行榜</Text>
                  </Space>
                }
                extra={
                  <Button type="link" onClick={() => navigate('/school-ranking')}>
                    查看完整排名 <RightCircleOutlined />
                  </Button>
                }
                className="ranking-card"
              >
                <Table
                  dataSource={universityRankings}
                  columns={rankingColumns}
                  pagination={false}
                  size="small"
                />
              </Card>

              {/* 校园活动 */}
              <Card 
                title={
                  <div className="card-title">
                    <ScheduleOutlined /> 高校活动
                  </div>
                }
                extra={<a href="/allschool/activities">查看更多活动</a>}
                className="all-school-card"
              >
                <Row gutter={[16, 16]}>
                  {universityActivities.map(activity => (
                    <Col xs={24} sm={12} md={12} lg={12} key={activity.id}>
                      <Card
                        hoverable
                        className="activity-card"
                        cover={<img alt={activity.title} src={activity.cover} />}
                      >
                        {activity.isOpen && (
                          <Badge.Ribbon text="公开活动" color="green" className="activity-badge" />
                        )}
                        <Meta
                          title={<a href={`/allschool/activity/${activity.id}`}>{activity.title}</a>}
                          description={
                            <div className="activity-info">
                              <p><BankOutlined /> {activity.university}</p>
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

              {/* 最新科研成果 */}
              <Card
                title={
                  <Space>
                    <ExperimentOutlined />
                    <Text strong>最新科研成果</Text>
                  </Space>
                }
                extra={
                  <Button type="link" onClick={() => navigate('/research')}>
                    查看更多 <RightCircleOutlined />
                  </Button>
                }
                className="research-card"
              >
                <List
                  dataSource={researchAchievements.slice(0, 3)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={64}
                            src={item.cover}
                            alt={item.title}
                          />
                        }
                        title={
                          <Space>
                            <a href={`/research?id=${item.id}`}>{item.title}</a>
                            <Tag color="blue">{item.university}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Text type="secondary">{item.department}</Text>
                            <Text type="secondary">{item.description}</Text>
                            <Space size={[0, 4]} wrap>
                              {item.tags.map(tag => (
                                <Tag key={tag} color="green">{tag}</Tag>
                              ))}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* 右侧边栏 */}
            <Col xs={24} lg={8}>
              {/* 招生信息 */}
              <Card 
                title={
                  <div className="card-title">
                    <NotificationOutlined /> 招生信息
                  </div>
                }
                extra={<a href="/allschool/admission">更多招生信息</a>}
                className="all-school-card"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={admissionInfo}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.logo} size={48} />}
                        title={
                          <a href={item.link}>{item.university} - {item.title}</a>
                        }
                        description={
                          <div className="admission-info">
                            <div className="admission-dates">
                              <span><CalendarOutlined /> 发布: {item.date}</span>
                              <span><ClockCircleOutlined /> 截止: {item.deadline}</span>
                            </div>
                            <div className="admission-tags">
                              {item.tags.map((tag, index) => (
                                <Tag key={index} color={index === 0 ? 'blue' : index === 1 ? 'green' : 'purple'}>
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 高校分类导航 */}
              <Card 
                title={
                  <div className="card-title">
                    <ApartmentOutlined /> 高校分类导航
                  </div>
                }
                className="all-school-card"
              >
                <div className="university-categories">
                  <Button type="link" icon={<StarOutlined />} href="/allschool/type/985">985工程大学</Button>
                  <Button type="link" icon={<StarOutlined />} href="/allschool/type/211">211工程大学</Button>
                  <Button type="link" icon={<StarOutlined />} href="/allschool/type/double-first">双一流建设高校</Button>
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="link" icon={<BookOutlined />} href="/allschool/type/normal">师范类院校</Button>
                  <Button type="link" icon={<ExperimentOutlined />} href="/allschool/type/tech">理工类院校</Button>
                  <Button type="link" icon={<BookOutlined />} href="/allschool/type/art">艺术类院校</Button>
                </div>
              </Card>

              {/* 高校区域导航 */}
              <Card 
                title={
                  <div className="card-title">
                    <EnvironmentOutlined /> 地区高校
                  </div>
                }
                className="all-school-card"
              >
                <div className="region-grid">
                  <Button type="default" href="/allschool/region/north">华北地区</Button>
                  <Button type="default" href="/allschool/region/east">华东地区</Button>
                  <Button type="default" href="/allschool/region/south">华南地区</Button>
                  <Button type="default" href="/allschool/region/central">华中地区</Button>
                  <Button type="default" href="/allschool/region/northeast">东北地区</Button>
                  <Button type="default" href="/allschool/region/northwest">西北地区</Button>
                  <Button type="default" href="/allschool/region/southwest">西南地区</Button>
                </div>
              </Card>

              {/* 热门话题 */}
              <Card 
                title={
                  <div className="card-title">
                    <FireOutlined /> 高校热门话题
                  </div>
                }
                className="all-school-card"
              >
                <div className="hot-topics">
                  <Tag color="magenta" className="hot-tag">#2024考研形势分析#</Tag>
                  <Tag color="red" className="hot-tag">#双一流建设成果#</Tag>
                  <Tag color="volcano" className="hot-tag">#高校科技创新#</Tag>
                  <Tag color="orange" className="hot-tag">#大学生就业指导#</Tag>
                  <Tag color="gold" className="hot-tag">#跨学科人才培养#</Tag>
                  <Tag color="lime" className="hot-tag">#高校国际交流#</Tag>
                  <Tag color="green" className="hot-tag">#校园文化建设#</Tag>
                  <Tag color="cyan" className="hot-tag">#产学研合作#</Tag>
                </div>
              </Card>

              {/* 科研成果 */}
              <Card 
                title={
                  <div className="card-title">
                    <BookOutlined /> 科研成果
                  </div>
                }
                extra={<a href="/research">查看更多成果</a>}
                className="all-school-card"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={researchAchievements.slice(0, 3)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.cover} size={48} />}
                        title={
                          <a href={`/research?id=${item.id}`}>{item.title}</a>
                        }
                        description={
                          <div>
                            <div><Text type="secondary">{item.university} - {item.department}</Text></div>
                            <div className="research-tags">
                              {item.tags.map((tag, index) => (
                                <Tag key={index} color={index === 0 ? 'blue' : index === 1 ? 'green' : 'volcano'}>
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 悬浮返回按钮 */}
          <FloatingButtons />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AllSchoolHome; 
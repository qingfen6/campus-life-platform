/**
 * 高校排行榜页面
 * 
 * 功能：
 * - 展示高校综合排名
 * - 展示学科专业排名
 * - 展示就业质量排名
 * - 支持按年份筛选
 * - 支持按地区筛选
 * - 支持搜索学校
 */
import React, { useState } from 'react';
import { Layout, Table, Tabs, Select, Input, Card, Tag, Typography, Button, Space } from 'antd';
import { SearchOutlined, TrophyOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import AllSchoolSidebar from '../components/common/AllSchoolSidebar';
import Header from '../components/common/Header';
import '../assets/styles/SchoolRankingPage.css';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 模拟数据
const rankingData = {
  currentYear: 2024,
  years: [2024, 2023, 2022, 2021, 2020],
  regions: ['全国', '华北', '华东', '华南', '华中', '东北', '西北', '西南'],
  comprehensiveRanking: [
    {
      key: '1',
      rank: 1,
      name: '清华大学',
      score: 98.5,
      location: '北京',
      type: '985/211/双一流',
      change: 0,
      features: ['理工科优势', '国际化程度高', '科研实力强']
    },
    {
      key: '2',
      rank: 2,
      name: '北京大学',
      score: 97.8,
      location: '北京',
      type: '985/211/双一流',
      change: 0,
      features: ['文理综合', '人文底蕴深', '学术氛围浓']
    },
    // ... 更多数据
  ],
  disciplineRanking: [
    {
      key: '1',
      rank: 1,
      name: '清华大学',
      discipline: '计算机科学与技术',
      score: 98.5,
      location: '北京',
      type: '985/211/双一流',
      change: 0,
      features: ['师资力量强', '科研项目多', '就业前景好']
    },
    // ... 更多数据
  ],
  employmentRanking: [
    {
      key: '1',
      rank: 1,
      name: '清华大学',
      employmentRate: 98.5,
      avgSalary: 15000,
      location: '北京',
      type: '985/211/双一流',
      change: 0,
      features: ['就业率高', '薪资水平高', '发展空间大']
    },
    // ... 更多数据
  ]
};

const SchoolRankingPage = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [searchText, setSearchText] = useState('');
  const [selectedYear, setSelectedYear] = useState(rankingData.currentYear);
  const [selectedRegion, setSelectedRegion] = useState('全国');

  // 处理年份变化
  const handleYearChange = (value) => {
    setSelectedYear(value);
    // 这里可以添加获取对应年份数据的逻辑
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
    // 这里可以添加搜索逻辑
  };

  // 渲染排名变化
  const renderRankChange = (change) => {
    if (change > 0) {
      return <span className="rank-change up">↑{change}</span>;
    } else if (change < 0) {
      return <span className="rank-change down">↓{Math.abs(change)}</span>;
    }
    return <span className="rank-change same">-</span>;
  };

  // 渲染特色标签
  const renderFeatures = (features) => (
    <Space size={[0, 4]} wrap>
      {features.map((feature, index) => (
        <Tag key={index} color={index === 0 ? 'blue' : index === 1 ? 'green' : 'purple'}>
          {feature}
        </Tag>
      ))}
    </Space>
  );

  // 综合排名列定义
  const comprehensiveColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record) => (
        <div className="rank-cell">
          <span className={`rank-number rank-${text <= 3 ? text : 'normal'}`}>{text}</span>
          {renderRankChange(record.change)}
        </div>
      )
    },
    {
      title: '学校名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href={`/school/${text}`}>{text}</a>
    },
    {
      title: '综合得分',
      dataIndex: 'score',
      key: 'score'
    },
    {
      title: '所在地区',
      dataIndex: 'location',
      key: 'location'
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
    },
    {
      title: '特色',
      dataIndex: 'features',
      key: 'features',
      render: renderFeatures
    }
  ];

  // 学科排名列定义
  const disciplineColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record) => (
        <div className="rank-cell">
          <span className={`rank-number rank-${text <= 3 ? text : 'normal'}`}>{text}</span>
          {renderRankChange(record.change)}
        </div>
      )
    },
    {
      title: '学校名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href={`/school/${text}`}>{text}</a>
    },
    {
      title: '学科',
      dataIndex: 'discipline',
      key: 'discipline'
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score'
    },
    {
      title: '所在地区',
      dataIndex: 'location',
      key: 'location'
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
    },
    {
      title: '特色',
      dataIndex: 'features',
      key: 'features',
      render: renderFeatures
    }
  ];

  // 就业排名列定义
  const employmentColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record) => (
        <div className="rank-cell">
          <span className={`rank-number rank-${text <= 3 ? text : 'normal'}`}>{text}</span>
          {renderRankChange(record.change)}
        </div>
      )
    },
    {
      title: '学校名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href={`/school/${text}`}>{text}</a>
    },
    {
      title: '就业率',
      dataIndex: 'employmentRate',
      key: 'employmentRate',
      render: (text) => `${text}%`
    },
    {
      title: '平均薪资',
      dataIndex: 'avgSalary',
      key: 'avgSalary',
      render: (text) => `${text}元/月`
    },
    {
      title: '所在地区',
      dataIndex: 'location',
      key: 'location'
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
    },
    {
      title: '特色',
      dataIndex: 'features',
      key: 'features',
      render: renderFeatures
    }
  ];

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
        <Content className="school-ranking-content">
          <div className="school-ranking-header">
            <Title level={2}>高校排行榜</Title>
            <div className="ranking-filters">
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                style={{ width: 120, marginRight: 16 }}
              >
                {rankingData.years.map(year => (
                  <Option key={year} value={year}>{year}年</Option>
                ))}
              </Select>
              <Select
                value={selectedRegion}
                onChange={setSelectedRegion}
                style={{ width: 120, marginRight: 16 }}
              >
                {rankingData.regions.map(region => (
                  <Option key={region} value={region}>{region}</Option>
                ))}
              </Select>
              <Input
                placeholder="搜索学校"
                prefix={<SearchOutlined />}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
          </div>

          <Card className="ranking-card">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={<span><TrophyOutlined /> 综合排名</span>} 
                key="comprehensive"
              >
                <Table 
                  dataSource={rankingData.comprehensiveRanking} 
                  columns={comprehensiveColumns}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
              <TabPane 
                tab={<span><BookOutlined /> 学科排名</span>} 
                key="discipline"
              >
                <Table 
                  dataSource={rankingData.disciplineRanking} 
                  columns={disciplineColumns}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
              <TabPane 
                tab={<span><TeamOutlined /> 就业排名</span>} 
                key="employment"
              >
                <Table 
                  dataSource={rankingData.employmentRanking} 
                  columns={employmentColumns}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SchoolRankingPage; 
/**
 * 科研成果页面
 * 
 * 功能：
 * - 展示论文发表情况
 * - 展示专利申请情况
 * - 展示科研项目情况
 * - 支持按年份筛选
 * - 支持按领域筛选
 * - 支持搜索
 */
import React, { useState } from 'react';
import { Layout, Table, Tabs, Select, Input, Card, Tag, Typography, Button, Space, Statistic } from 'antd';
import { SearchOutlined, FileTextOutlined, ExperimentOutlined, ProjectOutlined } from '@ant-design/icons';
import AllSchoolSidebar from '../components/common/AllSchoolSidebar';
import Header from '../components/common/Header';
import '../assets/styles/ResearchPage.css';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 模拟数据
const researchData = {
  currentYear: 2024,
  years: [2024, 2023, 2022, 2021, 2020],
  fields: ['全部', '计算机科学', '人工智能', '数据科学', '软件工程', '网络安全'],
  papers: [
    {
      key: '1',
      title: '基于深度学习的图像识别研究',
      authors: '张三, 李四, 王五',
      journal: '计算机学报',
      year: 2024,
      citations: 15,
      field: '人工智能',
      impact: '高'
    },
    // ... 更多数据
  ],
  patents: [
    {
      key: '1',
      title: '一种基于区块链的数据存储方法',
      inventors: '张三, 李四',
      type: '发明专利',
      status: '已授权',
      year: 2024,
      field: '计算机科学'
    },
    // ... 更多数据
  ],
  projects: [
    {
      key: '1',
      title: '新一代人工智能基础理论研究',
      leader: '张三',
      type: '国家自然科学基金',
      status: '进行中',
      year: 2024,
      field: '人工智能',
      funding: 500
    },
    // ... 更多数据
  ]
};

const ResearchPage = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('papers');
  const [searchText, setSearchText] = useState('');
  const [selectedYear, setSelectedYear] = useState(researchData.currentYear);
  const [selectedField, setSelectedField] = useState('全部');

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

  // 论文列定义
  const paperColumns = [
    {
      title: '论文标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a href={`/paper/${text}`}>{text}</a>
    },
    {
      title: '作者',
      dataIndex: 'authors',
      key: 'authors'
    },
    {
      title: '期刊',
      dataIndex: 'journal',
      key: 'journal'
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: '引用次数',
      dataIndex: 'citations',
      key: 'citations',
      sorter: (a, b) => a.citations - b.citations
    },
    {
      title: '研究领域',
      dataIndex: 'field',
      key: 'field',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '影响力',
      dataIndex: 'impact',
      key: 'impact',
      render: (text) => (
        <Tag color={text === '高' ? 'red' : text === '中' ? 'orange' : 'green'}>
          {text}
        </Tag>
      )
    }
  ];

  // 专利列定义
  const patentColumns = [
    {
      title: '专利名称',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a href={`/patent/${text}`}>{text}</a>
    },
    {
      title: '发明人',
      dataIndex: 'inventors',
      key: 'inventors'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={text === '已授权' ? 'green' : 'orange'}>
          {text}
        </Tag>
      )
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: '领域',
      dataIndex: 'field',
      key: 'field',
      render: (text) => <Tag color="blue">{text}</Tag>
    }
  ];

  // 项目列定义
  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a href={`/project/${text}`}>{text}</a>
    },
    {
      title: '负责人',
      dataIndex: 'leader',
      key: 'leader'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={text === '进行中' ? 'green' : text === '已完成' ? 'blue' : 'orange'}>
          {text}
        </Tag>
      )
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: '领域',
      dataIndex: 'field',
      key: 'field',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '经费(万)',
      dataIndex: 'funding',
      key: 'funding',
      sorter: (a, b) => a.funding - b.funding
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
        <Content className="research-content">
          <div className="research-header">
            <Title level={2}>科研成果</Title>
            <div className="research-filters">
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                style={{ width: 120, marginRight: 16 }}
              >
                {researchData.years.map(year => (
                  <Option key={year} value={year}>{year}年</Option>
                ))}
              </Select>
              <Select
                value={selectedField}
                onChange={setSelectedField}
                style={{ width: 120, marginRight: 16 }}
              >
                {researchData.fields.map(field => (
                  <Option key={field} value={field}>{field}</Option>
                ))}
              </Select>
              <Input
                placeholder="搜索"
                prefix={<SearchOutlined />}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
          </div>

          <div className="research-statistics">
            <Card className="stat-card">
              <Statistic
                title="论文总数"
                value={156}
                prefix={<FileTextOutlined />}
              />
            </Card>
            <Card className="stat-card">
              <Statistic
                title="专利总数"
                value={45}
                prefix={<ExperimentOutlined />}
              />
            </Card>
            <Card className="stat-card">
              <Statistic
                title="项目总数"
                value={32}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </div>

          <Card className="research-card">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={<span><FileTextOutlined /> 论文发表</span>} 
                key="papers"
              >
                <Table 
                  dataSource={researchData.papers} 
                  columns={paperColumns}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
              <TabPane 
                tab={<span><ExperimentOutlined /> 专利申请</span>} 
                key="patents"
              >
                <Table 
                  dataSource={researchData.patents} 
                  columns={patentColumns}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
              <TabPane 
                tab={<span><ProjectOutlined /> 科研项目</span>} 
                key="projects"
              >
                <Table 
                  dataSource={researchData.projects} 
                  columns={projectColumns}
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

export default ResearchPage; 
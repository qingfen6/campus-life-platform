import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Input, Select, Tabs, Button, Badge, Modal, Form, InputNumber, DatePicker, Radio, Card, Avatar, Tag, Progress, Drawer, message, Pagination } from 'antd';
import { 
  TrophyOutlined, 
  FireOutlined, 
  FilterOutlined, 
  RocketOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  UserOutlined,
  PlusOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  ProfileOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FloatingButton from '../components/common/FloatingButton';
import MissionCard from '../components/mission/MissionCard';
import { missionApi } from '../utils/api';
import moment from 'moment';
import '../assets/styles/MissionPage.css';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { showAddMissionModal } from '../store/slices/uiSlice';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const MissionPage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch();
  const [missions, setMissions] = useState([]);
  const [totalMissions, setTotalMissions] = useState(0);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('created_at-desc');
  const [takeMissionVisible, setTakeMissionVisible] = useState(false);
  const [currentMission, setCurrentMission] = useState(null);
  const [takeForm] = Form.useForm();
  const navigate = useNavigate();
  const user = useSelector(state => state?.auth?.user || null);
  
  // 获取任务分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await missionApi.getCategories();
        
        if (response.success) {
          setCategories(response.data);
        } else {
          message.error('获取任务分类失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取任务分类出错:', error);
        message.error('获取任务分类出错: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 获取任务列表
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        
        // 构建查询参数
        const params = {
          page: currentPage,
          limit: pageSize,
          category: activeTab !== 'all' ? activeTab : undefined,
          difficulty: difficulty !== 'all' ? difficulty : undefined,
          search: searchText,
          sort: sortOption
        };
        
        const response = await missionApi.getMissions(params);
        
        if (response.success) {
          setMissions(response.data.missions);
          setTotalMissions(response.data.pagination.total);
        } else {
          message.error('获取任务列表失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取任务列表出错:', error);
        message.error('获取任务列表出错: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, [currentPage, pageSize, activeTab, difficulty, searchText, sortOption]);
  
  /**
   * 接受任务处理
   * @param {Object} mission - 任务对象
   */
  const handleAcceptMission = (mission) => {
    setCurrentMission(mission);
    setTakeMissionVisible(true);
    takeForm.resetFields();
  };
  
  /**
   * 提交任务申请
   * @param {Object} values - 表单值
   */
  const handleTakeMissionSubmit = async (values) => {
    try {
      setLoading(true);
      
      const response = await missionApi.takeMission(
        currentMission.id, 
        values.message
      );
      
      if (response.success) {
        message.success('任务申请已提交');
        setTakeMissionVisible(false);
        
        // 刷新任务列表
        const params = {
          page: currentPage,
          limit: pageSize,
          category: activeTab !== 'all' ? activeTab : undefined
        };
        
        const refreshResponse = await missionApi.getMissions(params);
        if (refreshResponse.success) {
          setMissions(refreshResponse.data.missions);
        }
      } else {
        message.error('申请任务失败: ' + response.message);
      }
    } catch (error) {
      console.error('申请任务出错:', error);
      message.error('申请任务出错: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 切换任务分类
   * @param {string} tab - 分类值
   */
  const filterMissionsByTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  /**
   * 处理分页切换
   * @param {number} page - 页码
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 回到顶部
    document.querySelector('.app-content').scrollTop = 0;
  };
  
  // 任务分类标签组件
  const missionTabs = categories.length > 0 && (
    <Tabs 
      activeKey={activeTab} 
      onChange={filterMissionsByTab}
      className="mission-tab-bar"
    >
      {categories.map(category => (
        <TabPane 
          tab={
            <span>
              {category.value === 'all' && <FireOutlined />}
              {category.label}
              {category.count > 0 && <span className="category-count">({category.count})</span>}
            </span>
          } 
          key={category.value} 
        />
      ))}
    </Tabs>
  );
  
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
        
        <Content className="mission-content">
          <div className="mission-header">
            <div className="mission-title-section">
              <Title level={2} className="with-icon">
                <TrophyOutlined className="title-icon" /> 校园悬赏令
              </Title>
              <p className="mission-subtitle">校园互助，赏金任务，一起创造更美好的校园生活！</p>
            </div>
            
            <div className="mission-actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => dispatch(showAddMissionModal())}
                className="publish-mission-btn"
              >
                发布任务
              </Button>
            </div>
          </div>
          
          <div className="mission-search">
            <Search
              placeholder="搜索任务..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => setCurrentPage(1)}
              className="search-input"
            />
          </div>
          
          <div className="mission-filter-container">
            <div className="mission-tabs">
              {missionTabs}
            </div>
            
            <div className="mission-filter">
              <span className="filter-label"><FilterOutlined /> 难度:</span>
              <Select 
                defaultValue="all" 
                style={{ width: 120 }}
                className="filter-select"
                value={difficulty}
                onChange={(value) => {
                  setDifficulty(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="all">全部</Option>
                <Option value="easy">简单</Option>
                <Option value="medium">中等</Option>
                <Option value="hard">困难</Option>
                <Option value="expert">专家</Option>
              </Select>
              
              <span className="filter-label ml-2"><FilterOutlined /> 排序:</span>
              <Select 
                defaultValue="created_at-desc" 
                style={{ width: 150 }}
                className="filter-select"
                value={sortOption}
                onChange={(value) => {
                  setSortOption(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="created_at-desc">最新发布</Option>
                <Option value="reward-desc">赏金从高到低</Option>
                <Option value="reward-asc">赏金从低到高</Option>
                <Option value="deadline">即将截止</Option>
              </Select>
            </div>
          </div>
          
          <div className="mission-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>加载任务中...</p>
              </div>
            ) : missions.length === 0 ? (
              <div className="empty-missions">
                <div className="empty-image">
                  <img src="/images/empty-mission.svg" alt="暂无任务" />
                </div>
                <p>暂无符合条件的任务</p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => dispatch(showAddMissionModal())}
                >
                  发布一个任务
                </Button>
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {missions.map(mission => (
                    <Col xs={24} sm={12} md={8} lg={6} key={mission.id}>
                      <MissionCard 
                        mission={mission} 
                        onAccept={() => handleAcceptMission(mission)} 
                      />
                      {user && mission.taker_id === user.id && mission.status !== 'pending' && (
                        <Button 
                          type="primary" 
                          onClick={() => navigate(`/mission/work/${mission.mission_id}`)}
                        >
                          进入工作页面
                        </Button>
                      )}
                    </Col>
                  ))}
                </Row>
                
                {totalMissions > pageSize && (
                  <div className="pagination-container">
                    <Pagination 
                      current={currentPage}
                      pageSize={pageSize}
                      total={totalMissions}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 接受任务模态框 */}
          <Modal
            title={
              <div className="modal-title">
                <TrophyOutlined className="modal-icon" />
                <span>申请接受任务</span>
              </div>
            }
            open={takeMissionVisible}
            onCancel={() => setTakeMissionVisible(false)}
            footer={null}
            className="take-mission-modal"
            destroyOnClose
          >
            {currentMission && (
              <div className="take-mission-container">
                <div className="mission-info">
                  <div className="mission-title">{currentMission.title}</div>
                  <div className="mission-reward">赏金: ¥{currentMission.reward}</div>
                </div>
                
                <Form
                  form={takeForm}
                  layout="vertical"
                  onFinish={handleTakeMissionSubmit}
                >
                  <Form.Item
                    name="message"
                    label="申请留言"
                  >
                    <TextArea
                      placeholder="告诉发布者为什么你适合完成这个任务..."
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                  
                  <Form.Item className="form-footer">
                    <Button type="default" onClick={() => setTakeMissionVisible(false)} className="cancel-btn">
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} className="submit-btn">
                      提交申请
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Modal>
          
          <FloatingButton />
          
          <Button 
            type="primary" 
            onClick={() => navigate('/mission/manage')}
            icon={<ProfileOutlined />}
          >
            我的发布
          </Button>
          
          <Button 
            type="primary" 
            onClick={() => navigate('/mission/my')}
            icon={<UserOutlined />}
            style={{ marginLeft: '12px' }}
          >
            我接的任务
          </Button>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MissionPage; 
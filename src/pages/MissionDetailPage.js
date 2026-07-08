import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Breadcrumb,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Descriptions,
  Divider,
  Avatar,
  Progress,
  Skeleton,
  message,
  Modal,
  Form,
  Input,
  Alert
} from 'antd';
import {
  TrophyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  HourglassOutlined,
  TeamOutlined,
  EyeOutlined,
  CalendarOutlined,
  FireOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
  TagOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { missionApi } from '../utils/api';
import moment from 'moment';
import '../assets/styles/MissionDetailPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const MissionDetailPage = ({ darkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [takeMissionVisible, setTakeMissionVisible] = useState(false);
  const [takeForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 获取任务详情
  useEffect(() => {
    const fetchMissionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await missionApi.getMissionDetail(id);
        
        if (response.success) {
          setMission(response.data);
        } else {
          setError(response.message || '获取任务详情失败');
          message.error('获取任务详情失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取任务详情出错:', error);
        setError('获取任务详情出错: ' + (error.message || '未知错误'));
        message.error('获取任务详情出错: ' + (error.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissionDetail();
  }, [id]);

  // 申请接受任务
  const handleTakeMission = () => {
    setTakeMissionVisible(true);
    takeForm.resetFields();
  };

  // 提交任务申请
  const handleTakeMissionSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const response = await missionApi.takeMission(
        mission.id, 
        values.message
      );
      
      if (response.success) {
        message.success('任务申请已提交');
        setTakeMissionVisible(false);
      } else {
        message.error('申请任务失败: ' + response.message);
      }
    } catch (error) {
      console.error('申请任务出错:', error);
      message.error('申请任务出错: ' + (error.message || '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  // 返回任务列表
  const handleBack = () => {
    navigate('/mission');
  };

  // 计算剩余时间
  const getRemainingTime = (deadline) => {
    if (!deadline) return { text: '无截止日期', isUrgent: false };
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = Math.max(0, deadlineDate - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const isUrgent = diffDays === 0 && diffHours < 12;
    const timeText = diffDays > 0 
      ? `${diffDays}天${diffHours}小时` 
      : `${diffHours}小时`;
    
    return { text: timeText, isUrgent };
  };

  // 根据难度级别设置颜色
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'error',
      expert: 'magenta'
    };
    return colors[difficulty] || 'default';
  };

  // 获取难度文本
  const getDifficultyText = (difficulty) => {
    const texts = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家'
    };
    return texts[difficulty] || '未知';
  };

  // 获取分类文本和颜色
  const getCategoryInfo = (category) => {
    const categories = {
      express: { text: '快递', color: 'blue' },
      study: { text: '学习', color: 'green' },
      activity: { text: '活动', color: 'purple' },
      other: { text: '其他', color: 'orange' }
    };
    return categories[category] || { text: category, color: 'default' };
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
        
        <Content className="mission-detail-content">
          <div className="mission-detail-header">
            <Breadcrumb className="mission-breadcrumb">
              <Breadcrumb.Item>
                <a onClick={handleBack}>任务列表</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>任务详情</Breadcrumb.Item>
            </Breadcrumb>
            
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              className="back-button"
            >
              返回列表
            </Button>
          </div>
          
          {loading ? (
            <div className="mission-detail-skeleton">
              <Skeleton active avatar paragraph={{ rows: 6 }} />
            </div>
          ) : error ? (
            <Alert
              message="获取任务详情失败"
              description={error}
              type="error"
              showIcon
              action={
                <Button size="small" type="primary" onClick={handleBack}>
                  返回任务列表
                </Button>
              }
            />
          ) : mission && (
            <div className="mission-detail-container">
              <Row gutter={[24, 24]}>
                {/* 任务信息卡片 */}
                <Col xs={24} md={16}>
                  <Card className="mission-info-card">
                    <div className="mission-title-section">
                      <div className="mission-title-wrapper">
                        <Title level={2} className="mission-title">
                          {mission.title}
                        </Title>
                        
                        <div className="mission-tags">
                          {mission.category && (
                            <Tag color={getCategoryInfo(mission.category).color} className="mission-category-tag">
                              {getCategoryInfo(mission.category).text}
                            </Tag>
                          )}
                          <Tag color={getDifficultyColor(mission.difficulty)} className="mission-difficulty-tag">
                            难度: {getDifficultyText(mission.difficulty)}
                          </Tag>
                        </div>
                      </div>
                      
                      <div className="mission-reward-banner">
                        <TrophyOutlined className="reward-icon" />
                        <span className="reward-amount">¥{mission.reward}</span>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="mission-image">
                      <img src={mission.imageUrl} alt={mission.title} />
                    </div>
                    
                    <div className="mission-description">
                      <Title level={4}>任务描述</Title>
                      <Paragraph>{mission.description}</Paragraph>
                    </div>
                    
                    <Divider />
                    
                    <Descriptions title="任务详情" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                      <Descriptions.Item label={<><ClockCircleOutlined /> 截止时间</>}>
                        {mission.deadline ? (
                          <span className={getRemainingTime(mission.deadline).isUrgent ? 'urgent-time' : ''}>
                            {moment(mission.deadline).format('YYYY-MM-DD HH:mm')}
                            <br />
                            (剩余: {getRemainingTime(mission.deadline).text})
                          </span>
                        ) : (
                          '无截止时间'
                        )}
                      </Descriptions.Item>
                      
                      <Descriptions.Item label={<><EnvironmentOutlined /> 任务地点</>}>
                        {mission.location || '未指定'}
                      </Descriptions.Item>
                      
                      <Descriptions.Item label={<><HourglassOutlined /> 预计耗时</>}>
                        {mission.estimatedHours ? `${mission.estimatedHours}小时` : '未指定'}
                      </Descriptions.Item>
                      
                      <Descriptions.Item label={<><TeamOutlined /> 申请人数</>}>
                        {mission.acceptedCount || 0}人
                      </Descriptions.Item>
                      
                      <Descriptions.Item label={<><EyeOutlined /> 浏览次数</>}>
                        {mission.viewCount || 0}次
                      </Descriptions.Item>
                      
                      <Descriptions.Item label={<><CalendarOutlined /> 发布时间</>}>
                        {moment(mission.createdAt).format('YYYY-MM-DD HH:mm')}
                      </Descriptions.Item>
                    </Descriptions>
                    
                    <Divider />
                    
                    <div className="mission-action">
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<RocketOutlined />}
                        onClick={handleTakeMission}
                        className="take-mission-button"
                      >
                        申请接受任务
                      </Button>
                    </div>
                  </Card>
                </Col>
                
                {/* 发布者信息卡片 */}
                <Col xs={24} md={8}>
                  <Card 
                    title={
                      <div className="card-title-with-icon">
                        <UserOutlined />
                        <span>发布者信息</span>
                      </div>
                    } 
                    className="requestor-card"
                  >
                    <div className="requestor-info">
                      <Avatar 
                        size={64} 
                        src={mission.requestor?.avatar} 
                        icon={<UserOutlined />}
                      />
                      <div className="requestor-details">
                        <h3>{mission.requestor?.name || '匿名用户'}</h3>
                        <Button type="link">查看个人资料</Button>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="requestor-stats">
                      <p><FireOutlined /> 发布任务: {10}个</p>
                      <p><TrophyOutlined /> 好评率: {95}%</p>
                    </div>
                    
                    <div className="contact-action">
                      <Button type="default" block>
                        联系发布者
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {/* 相关任务推荐 */}
              <div className="related-missions">
                <Title level={4} className="section-title">
                  <TagOutlined className="section-icon" />
                  <span>可能感兴趣的任务</span>
                </Title>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="related-mission-card">
                      <Skeleton active avatar paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="related-mission-card">
                      <Skeleton active avatar paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="related-mission-card">
                      <Skeleton active avatar paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="related-mission-card">
                      <Skeleton active avatar paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>
          )}
          
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
            {mission && (
              <div className="take-mission-container">
                <div className="mission-info">
                  <div className="mission-title">{mission.title}</div>
                  <div className="mission-reward">赏金: ¥{mission.reward}</div>
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
                    <Button type="primary" htmlType="submit" loading={submitting} className="submit-btn">
                      提交申请
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MissionDetailPage; 
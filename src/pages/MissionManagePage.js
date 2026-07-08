import React, { useState, useEffect } from 'react';
import {
  Table, Card, Tabs, Button, Space, Tag, Typography, Modal, Input, 
  Form, Rate, message, Tooltip, Divider, List, Avatar, Badge, Timeline, 
  Descriptions, Empty, Spin, Row, Col
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, MessageOutlined, EditOutlined, DeleteOutlined,
  SendOutlined, StarOutlined, EyeOutlined, ClockCircleOutlined,
  FormOutlined
} from '@ant-design/icons';
import { missionApi } from '../utils/api';
import { formatDate } from '../utils/helpers';
import '../assets/styles/MissionManagePage.css';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

const MissionManagePage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMission, setCurrentMission] = useState(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reviewTags, setReviewTags] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [communications, setCommunications] = useState([]);
  const [communicationLoading, setCommunicationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const navigate = useNavigate();
  
  // 加载发布的任务列表
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await missionApi.getPublishedMissions();
        if (response.success) {
          setMissions(response.data);
        }
      } catch (error) {
        console.error('加载任务列表失败:', error);
        message.error('加载任务列表失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, []);
  
  // 打开任务详情
  const handleViewMission = async (mission) => {
    setCurrentMission(mission);
    // 加载任务提交记录
    await loadSubmissions(mission.mission_id);
    // 加载沟通记录
    await loadCommunications(mission.mission_id);
  };
  
  // 加载任务提交记录
  const loadSubmissions = async (missionId) => {
    try {
      setSubmissionLoading(true);
      const response = await missionApi.getMissionStatus(missionId);
      if (response.success) {
        setSubmissions(response.data.submissions || []);
        // 如果任务有接单者，设置为接收消息的用户
        if (response.data.mission.taker_id) {
          setReceiverId(response.data.mission.taker_id);
        }
      }
    } catch (error) {
      console.error('加载提交记录失败:', error);
    } finally {
      setSubmissionLoading(false);
    }
  };
  
  // 加载沟通记录
  const loadCommunications = async (missionId) => {
    try {
      setCommunicationLoading(true);
      const response = await missionApi.getMissionCommunications(missionId);
      if (response.success) {
        setCommunications(response.data || []);
      }
    } catch (error) {
      console.error('加载沟通记录失败:', error);
    } finally {
      setCommunicationLoading(false);
    }
  };
  
  // 审核任务
  const handleReviewSubmission = (submission) => {
    setSelectedSubmissionId(submission.submission_id);
    setFeedback('');
    setReviewVisible(true);
  };
  
  // 提交审核结果
  const submitReview = async (status) => {
    if (status === 'rejected' && !feedback.trim()) {
      return message.warning('请填写拒绝原因');
    }
    
    try {
      const response = await missionApi.reviewMission(
        currentMission.mission_id,
        selectedSubmissionId,
        status,
        feedback
      );
      
      if (response.success) {
        message.success('审核已完成');
        setReviewVisible(false);
        
        // 刷新任务和提交记录
        await loadSubmissions(currentMission.mission_id);
        const missionResponse = await missionApi.getMissionDetail(currentMission.mission_id);
        if (missionResponse.success) {
          setCurrentMission({...currentMission, ...missionResponse.data});
          
          // 更新任务列表中的状态
          setMissions(prev => 
            prev.map(m => 
              m.mission_id === currentMission.mission_id 
                ? {...m, status: missionResponse.data.status}
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error('提交审核结果失败:', error);
      message.error('提交审核结果失败');
    }
  };
  
  // 评价任务
  const openRatingModal = () => {
    setRating(5);
    setReview('');
    setReviewTags('');
    setRateVisible(true);
  };
  
  // 提交评价
  const submitRating = async () => {
    try {
      const response = await missionApi.rateMission(
        currentMission.mission_id,
        currentMission.taker_id,
        rating,
        review,
        reviewTags
      );
      
      if (response.success) {
        message.success('评价已提交');
        setRateVisible(false);
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      message.error('提交评价失败');
    }
  };
  
  // 取消任务
  const confirmCancelMission = (missionId) => {
    confirm({
      title: '确认取消任务',
      icon: <ExclamationCircleOutlined />,
      content: '确定要取消此任务吗？任务一旦取消将无法恢复',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const reason = await new Promise((resolve) => {
            Modal.confirm({
              title: '请输入取消原因',
              content: (
                <TextArea 
                  rows={4} 
                  onChange={(e) => resolve(e.target.value)}
                  placeholder="请输入取消任务的原因"
                />
              ),
              onOk: () => {},
            });
          });
          
          const response = await missionApi.cancelMission(missionId, reason);
          if (response.success) {
            message.success('任务已取消');
            
            // 更新任务列表和当前任务状态
            setMissions(prev => 
              prev.map(m => 
                m.mission_id === missionId 
                  ? {...m, status: 'cancelled'}
                  : m
              )
            );
            
            if (currentMission && currentMission.mission_id === missionId) {
              setCurrentMission({...currentMission, status: 'cancelled'});
            }
          }
        } catch (error) {
          console.error('取消任务失败:', error);
          message.error('取消任务失败');
        }
      },
    });
  };
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim() || !receiverId) {
      return;
    }
    
    try {
      setSendingMessage(true);
      const response = await missionApi.sendMissionMessage(
        currentMission.mission_id,
        receiverId,
        message
      );
      
      if (response.success) {
        setMessage('');
        // 刷新沟通记录
        await loadCommunications(currentMission.mission_id);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    } finally {
      setSendingMessage(false);
    }
  };
  
  // 获取状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'default', text: '待接单' },
      in_progress: { color: 'processing', text: '进行中' },
      submitted: { color: 'warning', text: '已提交' },
      reviewing: { color: 'warning', text: '审核中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' }
    };
    
    const statusConfig = statusMap[status] || statusMap.pending;
    
    return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => handleViewMission(record)}>{text}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: '待接单', value: 'pending' },
        { text: '进行中', value: 'in_progress' },
        { text: '已提交', value: 'submitted' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '赏金',
      dataIndex: 'reward',
      key: 'reward',
      sorter: (a, b) => a.reward - b.reward,
      render: (reward) => `${reward} 积分`,
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewMission(record)}
            />
          </Tooltip>
          
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Tooltip title="取消任务">
              <Button 
                type="link" 
                danger
                icon={<DeleteOutlined />} 
                onClick={() => confirmCancelMission(record.mission_id)}
              />
            </Tooltip>
          )}
          
          {record.status === 'completed' && (
            <Tooltip title="评价接单者">
              <Button 
                type="link" 
                icon={<StarOutlined />} 
                onClick={() => {
                  setCurrentMission(record);
                  openRatingModal();
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  
  // 渲染任务详情
  const renderMissionDetail = () => {
    if (!currentMission) {
      return (
        <Empty 
          description="请选择要查看的任务" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    return (
      <div className="mission-detail-container">
        <Card className="mission-detail-card">
          <div className="mission-detail-header">
            <div className="mission-detail-title">
              <Title level={4}>{currentMission.title}</Title>
              {getStatusTag(currentMission.status)}
            </div>
            <div className="mission-detail-actions">
              {currentMission.status !== 'completed' && currentMission.status !== 'cancelled' && (
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => confirmCancelMission(currentMission.mission_id)}
                >
                  取消任务
                </Button>
              )}
              
              {currentMission.status === 'completed' && (
                <Button 
                  type="primary" 
                  icon={<StarOutlined />}
                  onClick={openRatingModal}
                >
                  评价接单者
                </Button>
              )}
            </div>
          </div>
          
          <Divider />
          
          <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label="状态">{getStatusTag(currentMission.status)}</Descriptions.Item>
            <Descriptions.Item label="赏金">{currentMission.reward} 积分</Descriptions.Item>
            <Descriptions.Item label="难度">
              {currentMission.difficulty === 'easy' ? '简单' : 
              currentMission.difficulty === 'medium' ? '中等' : 
              currentMission.difficulty === 'hard' ? '困难' : '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="发布时间">{formatDate(currentMission.created_at)}</Descriptions.Item>
            <Descriptions.Item label="截止日期">
              {currentMission.due_date ? formatDate(currentMission.due_date) : '无截止日期'}
            </Descriptions.Item>
            <Descriptions.Item label="地点">{currentMission.location || '不限'}</Descriptions.Item>
            <Descriptions.Item label="接单者">
              {currentMission.taker_id ? (currentMission.taker_username || '用户#'+currentMission.taker_id) : '暂无接单者'}
            </Descriptions.Item>
            <Descriptions.Item label="接单时间">
              {currentMission.take_time ? formatDate(currentMission.take_time) : '-'}
            </Descriptions.Item>
          </Descriptions>
          
          <div className="mission-description">
            <Title level={5}>任务描述</Title>
            <Paragraph>{currentMission.description || '无任务描述'}</Paragraph>
          </div>
        </Card>
        
        <Tabs defaultActiveKey="1" className="mission-detail-tabs">
          <TabPane tab="提交记录" key="1">
            {submissionLoading ? (
              <div className="loading-container">
                <Spin />
              </div>
            ) : submissions.length > 0 ? (
              <Timeline className="submission-timeline">
                {submissions.map(submission => (
                  <Timeline.Item 
                    key={submission.submission_id}
                    color={
                      submission.status === 'accepted' ? 'green' :
                      submission.status === 'rejected' ? 'red' :
                      submission.status === 'revision_required' ? 'orange' : 'blue'
                    }
                  >
                    <Card className="submission-card">
                      <div className="submission-header">
                        <span className="submission-date">{formatDate(submission.submitted_at)}</span>
                        <Tag color={
                          submission.status === 'accepted' ? 'success' :
                          submission.status === 'rejected' ? 'error' :
                          submission.status === 'revision_required' ? 'warning' : 'processing'
                        }>
                          {
                            submission.status === 'accepted' ? '已通过' :
                            submission.status === 'rejected' ? '未通过' :
                            submission.status === 'revision_required' ? '需修改' : '审核中'
                          }
                        </Tag>
                      </div>
                      
                      <Paragraph className="submission-content">
                        {submission.description}
                      </Paragraph>
                      
                      {submission.feedback && (
                        <div className="submission-feedback">
                          <Text type="secondary">您的反馈:</Text>
                          <Paragraph>{submission.feedback}</Paragraph>
                        </div>
                      )}
                      
                      {submission.status === 'pending' && currentMission.status === 'submitted' && (
                        <div className="submission-actions">
                          <Space>
                            <Button 
                              type="primary" 
                              icon={<CheckCircleOutlined />}
                              onClick={() => {
                                setSelectedSubmissionId(submission.submission_id);
                                setFeedback('非常好，任务已完成！');
                                submitReview('accepted');
                              }}
                            >
                              通过验收
                            </Button>
                            <Button 
                              type="primary" 
                              danger 
                              ghost
                              icon={<EditOutlined />}
                              onClick={() => handleReviewSubmission(submission)}
                            >
                              需要修改
                            </Button>
                            <Button 
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleReviewSubmission(submission)}
                            >
                              拒绝验收
                            </Button>
                          </Space>
                        </div>
                      )}
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="暂无提交记录" />
            )}
          </TabPane>
          
          <TabPane tab="任务沟通" key="2">
            {currentMission.taker_id ? (
              <div className="mission-communication">
                <div className="communication-container">
                  {communicationLoading ? (
                    <div className="loading-container">
                      <Spin />
                    </div>
                  ) : communications.length > 0 ? (
                    <List
                      className="communication-list"
                      itemLayout="horizontal"
                      dataSource={communications}
                      renderItem={item => (
                        <List.Item
                          key={item.id}
                          className="communication-item"
                        >
                          <List.Item.Meta
                            avatar={<Avatar src={item.avatar} alt={item.username} />}
                            title={item.username}
                            description={item.message}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无沟通记录" />
                  )}
                </div>
                
                {currentMission.status !== 'cancelled' && (
                  <div className="send-message-form">
                    <TextArea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="输入消息与接单者沟通"
                    />
                    <div className="send-button-container">
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        loading={sendingMessage}
                        style={{ marginTop: 16 }}
                      >
                        发送消息
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="任务尚未被接单，无法使用沟通功能" />
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="mission-manage-page">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="mission-list-card" title="我发布的任务">
            <Table
              dataSource={missions}
              columns={columns}
              rowKey="mission_id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        
        <Col span={24}>
          {renderMissionDetail()}
        </Col>
      </Row>
      
      {/* 审核提交内容模态框 */}
      <Modal
        title="审核任务提交"
        visible={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setReviewVisible(false)}>
            取消
          </Button>,
          <Button
            key="revision"
            type="primary"
            ghost
            danger
            onClick={() => submitReview('revision_required')}
          >
            需要修改
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => submitReview('rejected')}
          >
            拒绝验收
          </Button>,
          <Button
            key="accept"
            type="primary"
            onClick={() => submitReview('accepted')}
          >
            通过验收
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label="反馈意见"
            help="请提供详细的反馈，帮助接单者理解您的决定"
          >
            <TextArea
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请输入您的反馈意见"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 评价模态框 */}
      <Modal
        title="评价接单者"
        visible={rateVisible}
        onCancel={() => setRateVisible(false)}
        onOk={submitRating}
      >
        <Form layout="vertical">
          <Form.Item label="评分">
            <Rate value={rating} onChange={setRating} />
          </Form.Item>
          <Form.Item label="评价内容">
            <TextArea
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="请输入您的评价内容"
            />
          </Form.Item>
          <Form.Item label="标签" help="多个标签请用逗号分隔，如：高效,认真,专业">
            <Input
              value={reviewTags}
              onChange={(e) => setReviewTags(e.target.value)}
              placeholder="如：高效,认真,专业"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MissionManagePage;

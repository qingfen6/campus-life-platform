import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Steps, Typography, Descriptions, Button, 
  Upload, Input, Progress, Divider, Space, message, Modal, Form, 
  List, Avatar, Tag, Timeline, Spin, Empty, Result, Tabs
} from 'antd';
import { 
  UploadOutlined, SendOutlined, FileOutlined, CheckCircleOutlined,
  MessageOutlined, FieldTimeOutlined, ExclamationCircleOutlined, 
  StarOutlined, FileTextOutlined, PaperClipOutlined, CheckOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { missionApi } from '../utils/api';
import { formatDate } from '../utils/helpers';
import '../assets/styles/MissionWorkPage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const MissionWorkPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressRemarks, setProgressRemarks] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState(null);
  const [activeKey, setActiveKey] = useState('1');
  const [currentProgress, setCurrentProgress] = useState(null);
  
  // 加载任务数据
  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        setLoading(true);
        const response = await missionApi.getMissionStatus(id);
        if (response.success) {
          setMission(response.data.mission);
          setCurrentProgress(response.data.progress);
          setSubmissions(response.data.submissions);
          
          // 设置接收者ID为发布者
          setReceiverId(response.data.mission.user_id);
          
          // 如果有进度，更新进度显示
          if (response.data.progress) {
            setProgressPercent(response.data.progress.progress_percent);
          }
          
          // 加载沟通记录
          loadCommunications();
        }
      } catch (error) {
        message.error('加载任务信息失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissionData();
  }, [id]);
  
  // 加载沟通记录
  const loadCommunications = async () => {
    try {
      const response = await missionApi.getMissionCommunications(id);
      if (response.success) {
        setCommunications(response.data);
      }
    } catch (error) {
      console.error('加载沟通记录失败', error);
    }
  };
  
  // 更新进度
  const handleUpdateProgress = async () => {
    try {
      setSubmitting(true);
      const response = await missionApi.updateMissionProgress(id, progressPercent, progressRemarks);
      if (response.success) {
        message.success('进度更新成功');
        setProgressRemarks('');
        // 刷新当前进度数据
        const statusResponse = await missionApi.getMissionStatus(id);
        if (statusResponse.success) {
          setCurrentProgress(statusResponse.data.progress);
        }
      }
    } catch (error) {
      message.error('更新进度失败');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 提交任务
  const handleSubmitMission = async () => {
    try {
      if (!submissionDescription.trim()) {
        return message.warning('请填写提交说明');
      }
      
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('description', submissionDescription);
      
      // 添加文件
      fileList.forEach(file => {
        formData.append('attachments', file.originFileObj);
      });
      
      const response = await missionApi.submitMissionResult(id, formData);
      
      if (response.success) {
        message.success('任务提交成功');
        setSubmissionDescription('');
        setFileList([]);
        
        // 刷新任务状态
        const statusResponse = await missionApi.getMissionStatus(id);
        if (statusResponse.success) {
          setMission(statusResponse.data.mission);
          setSubmissions(statusResponse.data.submissions);
        }
        
        // 切换到信息标签页
        setActiveKey('1');
      }
    } catch (error) {
      message.error('提交任务失败');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    
    try {
      const response = await missionApi.sendMissionMessage(id, receiverId, message);
      if (response.success) {
        setMessage('');
        // 刷新沟通记录
        loadCommunications();
      }
    } catch (error) {
      message.error('发送消息失败');
      console.error(error);
    }
  };
  
  // 文件上传前检查
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件必须小于10MB!');
    }
    return false;
  };
  
  // 文件列表变化
  const handleFileChange = ({ fileList }) => setFileList(fileList);
  
  // 获取当前任务的步骤
  const getCurrentStep = () => {
    if (!mission) return 0;
    
    switch(mission.status) {
      case 'in_progress': return 1;
      case 'submitted': return 2;
      case 'reviewing': return 2;
      case 'completed': return 3;
      case 'cancelled': return 99; // 取消状态
      default: return 0;
    }
  };
  
  if (loading) {
    return (
      <div className="mission-work-loading">
        <Spin size="large" />
        <div className="loading-text">正在加载任务信息...</div>
      </div>
    );
  }
  
  if (!mission) {
    return (
      <div className="mission-work-error">
        <Empty 
          description="未找到任务信息" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
        <Button type="primary" onClick={() => navigate('/missions')}>
          返回任务列表
        </Button>
      </div>
    );
  }
  
  // 渲染状态标签
  const renderStatusTag = () => {
    const statusMap = {
      pending: { color: 'default', text: '待接单' },
      in_progress: { color: 'processing', text: '进行中' },
      submitted: { color: 'warning', text: '已提交' },
      reviewing: { color: 'warning', text: '审核中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' }
    };
    
    const status = statusMap[mission.status] || statusMap.pending;
    
    return <Tag color={status.color}>{status.text}</Tag>;
  };
  
  // 渲染提交历史
  const renderSubmissionHistory = () => {
    if (submissions.length === 0) {
      return <Empty description="暂无提交记录" />;
    }
    
    return (
      <Timeline>
        {submissions.map(submission => (
          <Timeline.Item 
            key={submission.submission_id}
            color={
              submission.status === 'accepted' ? 'green' :
              submission.status === 'rejected' ? 'red' :
              submission.status === 'revision_required' ? 'orange' : 'blue'
            }
          >
            <div className="submission-item">
              <div className="submission-time">
                {formatDate(submission.submitted_at)}
              </div>
              <div className="submission-content">
                <div className="submission-description">
                  {submission.description}
                </div>
                <div className="submission-status">
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
                {submission.feedback && (
                  <div className="submission-feedback">
                    {submission.feedback}
                  </div>
                )}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className="mission-work-page">
      <Card className="mission-info-card">
        <div className="mission-header">
          <div className="mission-title-section">
            <Title level={3}>{mission.title}</Title>
            <div className="mission-status">{renderStatusTag()}</div>
          </div>
          <Button type="primary" onClick={() => navigate(`/missions/${id}`)}>
            查看任务详情
          </Button>
        </div>
        
        <Divider />
        
        {/* 任务进度步骤条 */}
        <Steps current={getCurrentStep()} className="mission-steps">
          <Step title="接单" description="任务已接受" />
          <Step title="进行中" description="正在处理任务" />
          <Step title="已提交" description="等待验收" />
          <Step title="已完成" description="任务完成" />
        </Steps>
        
        <Divider />
        
        {/* 任务基本信息 */}
        <Descriptions title="任务信息" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="发布者">{mission.username || '未知用户'}</Descriptions.Item>
          <Descriptions.Item label="任务赏金">{mission.reward || 0} 积分</Descriptions.Item>
          <Descriptions.Item label="任务难度">
            {mission.difficulty === 'easy' ? '简单' : 
             mission.difficulty === 'medium' ? '中等' : 
             mission.difficulty === 'hard' ? '困难' : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {mission.due_date ? formatDate(mission.due_date) : '无截止日期'}
          </Descriptions.Item>
          <Descriptions.Item label="接单时间">
            {mission.take_time ? formatDate(mission.take_time) : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="执行地点">{mission.location || '不限'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card className="mission-work-content">
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          {/* 任务详情选项卡 */}
          <TabPane tab="任务详情" key="1">
            <div className="mission-detail-content">
              <Title level={4}>任务描述</Title>
              <Paragraph>{mission.description || '暂无任务描述'}</Paragraph>
              
              {mission.status === 'completed' ? (
                <div className="mission-completed-section">
                  <Result
                    status="success"
                    title="任务已完成"
                    subTitle={`完成时间: ${mission.completion_time ? formatDate(mission.completion_time) : '未知'}`}
                  />
                </div>
              ) : mission.status === 'cancelled' ? (
                <div className="mission-cancelled-section">
                  <Result
                    status="error"
                    title="任务已取消"
                    subTitle="任务已被取消，无法继续进行"
                  />
                </div>
              ) : (
                <div className="mission-progress-section">
                  <Title level={4}>当前进度</Title>
                  <Progress 
                    percent={progressPercent} 
                    status={progressPercent === 100 ? "success" : "active"}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  
                  {currentProgress && (
                    <div className="current-progress-info">
                      <Text type="secondary">最近更新：{formatDate(currentProgress.created_at)}</Text>
                      {currentProgress.remarks && (
                        <Paragraph>备注：{currentProgress.remarks}</Paragraph>
                      )}
                    </div>
                  )}
                  
                  <Divider />
                  
                  <div className="update-progress-form">
                    <Title level={4}>更新进度</Title>
                    <Form layout="vertical">
                      <Form.Item label="进度百分比">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressPercent}
                          onChange={(e) => setProgressPercent(parseInt(e.target.value, 10) || 0)}
                          addonAfter="%"
                          style={{ width: '150px' }}
                        />
                      </Form.Item>
                      <Form.Item label="进度说明">
                        <TextArea
                          rows={4}
                          value={progressRemarks}
                          onChange={(e) => setProgressRemarks(e.target.value)}
                          placeholder="请输入进度说明或备注"
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button 
                          type="primary" 
                          onClick={handleUpdateProgress}
                          loading={submitting}
                          icon={<CheckCircleOutlined />}
                        >
                          更新进度
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          </TabPane>
          
          {/* 任务沟通选项卡 */}
          <TabPane tab="任务沟通" key="2">
            <div className="mission-communication">
              <div className="communication-list">
                {communications.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={communications}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} alt={item.username} />}
                          title={item.username}
                          description={<p>{item.message}</p>}
                        />
                        <div>{formatDate(item.created_at)}</div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="暂无沟通记录" />
                )}
              </div>
              
              <Divider />
              
              <div className="send-message-form">
                <TextArea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入消息与发布者沟通"
                />
                <div className="send-button-container">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    style={{ marginTop: 16 }}
                  >
                    发送消息
                  </Button>
                </div>
              </div>
            </div>
          </TabPane>
          
          {/* 任务提交选项卡 */}
          <TabPane tab="任务提交" key="3" disabled={mission.status === 'completed' || mission.status === 'cancelled'}>
            <div className="mission-submission">
              <Title level={4}>提交任务成果</Title>
              
              <Form layout="vertical">
                <Form.Item label="完成说明" required>
                  <TextArea
                    rows={6}
                    value={submissionDescription}
                    onChange={(e) => setSubmissionDescription(e.target.value)}
                    placeholder="请详细描述您的完成情况，包括完成的内容、质量和任何需要注意的事项"
                  />
                </Form.Item>
                
                <Form.Item 
                  label="附件上传" 
                  extra="支持上传最多5个文件，每个文件大小不超过10MB"
                >
                  <Upload
                    listType="picture"
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={beforeUpload}
                    multiple
                    maxCount={5}
                  >
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleSubmitMission}
                    loading={submitting}
                    disabled={mission.status === 'submitted'}
                  >
                    提交任务
                  </Button>
                </Form.Item>
              </Form>
              
              <Divider />
              
              <div className="submission-history">
                <Title level={4}>提交历史</Title>
                {renderSubmissionHistory()}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MissionWorkPage;

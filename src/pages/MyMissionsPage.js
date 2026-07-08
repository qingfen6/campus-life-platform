import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, message } from 'antd';
import { EyeOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { missionApi } from '../utils/api';
import { formatDate } from '../utils/helpers';
import '../assets/styles/MyMissionsPage.css';

const MyMissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await missionApi.getAcceptedMissions();
        if (response.success) {
          setMissions(response.data);
        }
      } catch (error) {
        console.error('加载任务失败:', error);
        message.error('加载任务失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, []);
  
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/missions/${record.mission_id}`)}>{text}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          in_progress: { color: 'processing', text: '进行中' },
          submitted: { color: 'warning', text: '已提交' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' },
        };
        
        const statusConfig = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
      },
      filters: [
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
      render: (reward) => `${reward} 积分`,
      sorter: (a, b) => a.reward - b.reward,
    },
    {
      title: '接单时间',
      dataIndex: 'take_time',
      key: 'take_time',
      render: (time) => formatDate(time),
      sorter: (a, b) => new Date(a.take_time) - new Date(b.take_time),
    },
    {
      title: '发布者',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/missions/${record.mission_id}`)}
          >
            详情
          </Button>
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Button 
              type="primary" 
              icon={<FormOutlined />} 
              onClick={() => navigate(`/mission/work/${record.mission_id}`)}
            >
              工作页面
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <div className="my-missions-page">
      <Card title="我接受的任务" className="missions-card">
        <Table
          dataSource={missions}
          columns={columns}
          rowKey="mission_id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default MyMissionsPage;

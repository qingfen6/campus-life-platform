// 控制面板页面
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Alert, Spin, Typography, Table, Space, Tag, Divider, Button } from 'antd';
import { 
  DatabaseOutlined, 
  TableOutlined, 
  UserOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { dbAPI } from '../../services/api';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('checking');
  const [dbInfo, setDbInfo] = useState(null);
  const [recentTables, setRecentTables] = useState([]);
  const [stats, setStats] = useState({
    tables: 0,
    users: 0,
    posts: 0,
    activities: 0
  });

  // 加载统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取统计数据...');
      
      // 获取表列表
      const tablesResponse = await dbAPI.getTables();
      console.log('表列表响应:', tablesResponse);
      
      if (tablesResponse.success) {
        setDbStatus('connected');
        const tables = tablesResponse.data.tables;
        
        // 设置最近的5个表
        setRecentTables(tables.slice(0, 5).map((table, index) => ({
          key: index,
          name: table
        })));
        
        // 计算表的数量
        setStats(prev => ({ ...prev, tables: tables.length }));
        console.log(`数据库共有 ${tables.length} 个表`);
        
        // 用SQL查询方式获取用户数量
        try {
          const usersCountQuery = "SELECT COUNT(*) as count FROM users";
          const usersCountResponse = await dbAPI.executeQuery(usersCountQuery);
          console.log('用户数量查询结果:', usersCountResponse);
          
          if (usersCountResponse.success && usersCountResponse.data.result.length > 0) {
            const usersCount = usersCountResponse.data.result[0].count;
            setStats(prev => ({ ...prev, users: usersCount }));
            console.log(`用户总数: ${usersCount}`);
          }
        } catch (usersError) {
          console.error('获取用户数量失败:', usersError);
        }
        
        // 用SQL查询方式获取动态数量
        try {
          const postsCountQuery = "SELECT COUNT(*) as count FROM posts";
          const postsCountResponse = await dbAPI.executeQuery(postsCountQuery);
          console.log('动态数量查询结果:', postsCountResponse);
          
          if (postsCountResponse.success && postsCountResponse.data.result.length > 0) {
            const postsCount = postsCountResponse.data.result[0].count;
            setStats(prev => ({ ...prev, posts: postsCount }));
            console.log(`动态总数: ${postsCount}`);
          }
        } catch (postsError) {
          console.error('获取动态数量失败:', postsError);
        }
        
        // 用SQL查询方式获取活动数量
        try {
          const activitiesCountQuery = "SELECT COUNT(*) as count FROM activities";
          const activitiesCountResponse = await dbAPI.executeQuery(activitiesCountQuery);
          console.log('活动数量查询结果:', activitiesCountResponse);
          
          if (activitiesCountResponse.success && activitiesCountResponse.data.result.length > 0) {
            const activitiesCount = activitiesCountResponse.data.result[0].count;
            setStats(prev => ({ ...prev, activities: activitiesCount }));
            console.log(`活动总数: ${activitiesCount}`);
          }
        } catch (activitiesError) {
          console.error('获取活动数量失败:', activitiesError);
        }
        
        // 查询数据库信息
        try {
          const dbInfoQuery = "SELECT VERSION() as version, DATABASE() as db_name, USER() as user, @@character_set_database as charset";
          const dbInfoResponse = await dbAPI.executeQuery(dbInfoQuery);
          if (dbInfoResponse.success && dbInfoResponse.data.result.length > 0) {
            setDbInfo(dbInfoResponse.data.result[0]);
          }
        } catch (error) {
          console.error('获取数据库信息失败:', error);
        }
      } else {
        setError('获取表列表失败: ' + tablesResponse.message);
        setDbStatus('error');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setError('获取统计数据失败，请确保后端服务已启动');
      setDbStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取统计数据
  useEffect(() => {
    fetchStats();
  }, []);

  // 刷新统计数据
  const handleRefresh = () => {
    fetchStats();
  };

  // 表格列定义
  const recentTablesColumns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Tag color="green">
          <CheckCircleOutlined /> 可访问
        </Tag>
      ),
    }
  ];

  return (
    <>
      <Title level={2}>系统概览</Title>
      
      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新数据
        </Button>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="数据表数量"
                value={stats.tables}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="用户数量"
                value={stats.users}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="动态数量"
                value={stats.posts}
                prefix={<TableOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="活动数量"
                value={stats.activities}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider orientation="left">数据库状态</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="数据库连接状态" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Space>
                    状态:
                    {dbStatus === 'connected' && (
                      <Tag color="green">
                        <CheckCircleOutlined /> 已连接
                      </Tag>
                    )}
                    {dbStatus === 'checking' && (
                      <Tag color="blue">
                        <ClockCircleOutlined /> 检查中
                      </Tag>
                    )}
                    {dbStatus === 'error' && (
                      <Tag color="red">
                        <InfoCircleOutlined /> 连接错误
                      </Tag>
                    )}
                  </Space>
                </div>
                
                {dbInfo && (
                  <>
                    <div>
                      <Text strong>数据库版本:</Text> {dbInfo.version}
                    </div>
                    <div>
                      <Text strong>数据库名称:</Text> {dbInfo.db_name}
                    </div>
                    <div>
                      <Text strong>数据库用户:</Text> {dbInfo.user}
                    </div>
                    <div>
                      <Text strong>字符集:</Text> {dbInfo.charset}
                    </div>
                  </>
                )}
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="最近表" bordered={false}>
              <Table 
                columns={recentTablesColumns} 
                dataSource={recentTables}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24 }}>
          <Alert
            message="系统提示"
            description="欢迎使用CampusLife管理系统。本系统用于管理CampusLife平台的数据，提供数据表查询和SQL执行功能。"
            type="info"
            showIcon
          />
        </div>
      </Spin>
    </>
  );
};

export default DashboardPage; 
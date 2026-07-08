// SQL查询页面
import React, { useState } from 'react';
import { 
  Typography, Card, Input, Button, Table, message, 
  Space, Divider, Alert, Spin 
} from 'antd';
import { 
  CodeOutlined, 
  PlayCircleOutlined, 
  ClearOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { dbAPI } from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SqlQueryPage = () => {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 执行SQL查询
  const handleExecuteQuery = async () => {
    if (!sql.trim()) {
      message.warning('请输入SQL语句');
      return;
    }
    
    // 简单验证是否为SELECT语句
    if (!sql.trim().toLowerCase().startsWith('select')) {
      message.error('仅支持执行SELECT语句');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await dbAPI.executeQuery(sql);
      
      if (response.success) {
        setResult(response.data);
        message.success('查询执行成功');
      } else {
        setError(response.message || '查询执行失败');
      }
    } catch (error) {
      console.error('执行SQL查询失败:', error);
      setError(error.message || '执行SQL查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 清空查询
  const handleClear = () => {
    setSql('');
    setResult(null);
    setError(null);
  };

  // 示例查询
  const handleExample = () => {
    setSql('SELECT * FROM users LIMIT 10');
  };

  // 生成结果表格列
  const generateColumns = () => {
    if (!result || !result.result || result.result.length === 0) {
      return [];
    }
    
    const firstRecord = result.result[0];
    return Object.keys(firstRecord).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      render: (text) => {
        if (text === null) return <Text type="secondary">NULL</Text>;
        if (typeof text === 'object') return <Text code>{JSON.stringify(text)}</Text>;
        return String(text);
      }
    }));
  };

  return (
    <>
      <Title level={2}>SQL查询</Title>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Text>在下方输入SQL查询语句，目前仅支持SELECT语句：</Text>
          <TextArea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="输入SQL查询语句，例如: SELECT * FROM users LIMIT 10"
            autoSize={{ minRows: 5, maxRows: 10 }}
            style={{ fontFamily: 'monospace', marginTop: 8 }}
          />
        </div>
        
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={handleExecuteQuery}
            loading={loading}
          >
            执行查询
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
          >
            清空
          </Button>
          <Button 
            type="link" 
            icon={<CodeOutlined />} 
            onClick={handleExample}
          >
            示例查询
          </Button>
        </Space>
        
        <div style={{ marginTop: 8 }}>
          <Alert
            message="安全提示"
            description="为确保数据安全，本系统仅支持执行SELECT查询语句，不支持执行修改数据的SQL语句。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </div>
      </Card>
      
      <Divider orientation="left">查询结果</Divider>
      
      {error && (
        <Alert 
          message="SQL执行错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Spin spinning={loading}>
        {result && (
          <div>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">查询返回 {result.rowCount} 条记录</Text>
                </div>
                
                <Table
                  dataSource={result.result}
                  columns={generateColumns()}
                  rowKey={(record, index) => index}
                  scroll={{ x: 'max-content' }}
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              </Space>
            </Card>
          </div>
        )}
      </Spin>
    </>
  );
};

export default SqlQueryPage; 
// 数据库连接状态组件
import React, { useState, useEffect } from 'react';
import { Badge, Tooltip } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { healthApi } from '../../utils/api';

/**
 * 数据库状态指示器组件
 * 显示数据库连接状态
 */
const DbStatus = () => {
  const [status, setStatus] = useState('unknown');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 检查数据库连接状态
  const checkDbConnection = async () => {
    try {
      console.log('正在检查数据库连接状态...');
      const response = await healthApi.checkStatus();
      console.log('数据库连接状态响应:', response);
      
      if (response && response.success) {
        setStatus('connected');
        setErrorMessage('');
      } else {
        setStatus('error');
        setErrorMessage(response?.message || '数据库连接异常');
      }
    } catch (error) {
      console.error('数据库连接检查失败:', error);
      setStatus('error');
      setErrorMessage(`连接失败: ${error.message}`);
    }
  };
  
  // 首次加载和之后每60秒检查一次
  useEffect(() => {
    checkDbConnection();
    const interval = setInterval(checkDbConnection, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return { color: '#52c41a', text: '数据库已连接' };
      case 'error': return { color: '#f5222d', text: `数据库连接错误: ${errorMessage}` };
      default: return { color: '#faad14', text: '正在检查数据库状态...' };
    }
  };
  
  const statusInfo = getStatusColor();
  
  return (
    <Tooltip title={statusInfo.text} placement="left">
      <Badge 
        count={<DatabaseOutlined style={{ color: 'white' }} />}
        style={{ 
          backgroundColor: statusInfo.color,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      />
    </Tooltip>
  );
};

export default DbStatus; 
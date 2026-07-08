/**
 * 资源卡片组件
 * 
 * 功能：
 * - 展示资源信息
 * - 支持资源预览和下载
 * - 显示资源统计信息
 * - 支持资源分类和标签
 * - 响应式设计
 * - 暗色模式支持
 */

import React from 'react';
import { Card, Space, Tag, Button, Tooltip, Progress } from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  FileOutlined,
  LinkOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';

const ResourceCard = ({ 
  resource, 
  onDownload,
  onPreview,
  onShare
}) => {
  // 计算下载进度
  const downloadProgress = (resource.downloads / resource.totalDownloads) * 100;

  return (
    <Card
      className="resource-card"
      cover={
        <div className="resource-cover">
          <div className="resource-icon">
            <FileTextOutlined />
          </div>
          <div className="resource-progress">
            <Progress 
              percent={downloadProgress} 
              status="active"
              showInfo={false}
            />
          </div>
        </div>
      }
      actions={[
        <Space>
          <Tooltip title="预览">
            <Button 
              icon={<EyeOutlined />}
              onClick={() => onPreview(resource)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => onDownload(resource)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button 
              icon={<LinkOutlined />}
              onClick={() => onShare(resource)}
            />
          </Tooltip>
        </Space>
      ]}
    >
      <Card.Meta
        title={
          <Space>
            <FileTextOutlined />
            {resource.title}
          </Space>
        }
        description={
          <Space direction="vertical" size="small" className="resource-description">
            <Space>
              <TeamOutlined />
              {resource.uploader}
            </Space>
            <Space>
              <ClockCircleOutlined />
              {resource.uploadTime}
            </Space>
            
            <div className="resource-summary">{resource.description}</div>

            <Space className="resource-stats">
              <Tooltip title="下载次数">
                <Space>
                  <DownloadOutlined />
                  {resource.downloads}
                </Space>
              </Tooltip>
              <Tooltip title="文件大小">
                <Space>
                  <FileOutlined />
                  {resource.size}
                </Space>
              </Tooltip>
            </Space>

            <Space wrap>
              {resource.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>

            {resource.previewUrl && (
              <div className="resource-preview">
                <img 
                  src={resource.previewUrl} 
                  alt="资源预览" 
                  className="preview-image"
                />
              </div>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default ResourceCard; 
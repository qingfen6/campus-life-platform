import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  message,
  Spin,
  Card,
  Row,
  Col,
  Select,
  Typography,
  Avatar,
  Image,
  Tag,
  Modal,
  Divider
} from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { schoolAdminAPI } from '../../services/api';
import { getUser } from '../../utils/auth';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const PostManagementPage = () => {
  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const schoolAdmin = getUser();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [sensitiveKeywords, setSensitiveKeywords] = useState('');
  const [highlightedPostIds, setHighlightedPostIds] = useState(new Set());

  const fetchPosts = async (page = 1, pageSize = 10, search = '', currentFilters = {}) => {
    setLoading(true);
    setHighlightedPostIds(new Set());
    try {
      const schoolId = schoolAdmin?.schoolId;
      if (!schoolId) {
        message.error('无法获取学校信息，请重新登录');
        setLoading(false);
        return;
      }

      const params = {
        page,
        pageSize,
        search,
        ...currentFilters // status, visibility
      };
      console.log('Fetching posts with params:', params);
      const response = await schoolAdminAPI.getSchoolPosts(params);

      if (response.success) {
        setOriginalPosts(response.data.posts);
        setPosts(response.data.posts);
        setPagination(prev => ({
          ...prev,
          current: response.data.currentPage || page,
          pageSize: pageSize,
          total: response.data.total,
        }));
      } else {
        message.error(response.message || '获取动态列表失败');
        setOriginalPosts([]);
        setPosts([]);
      }
    } catch (error) {
      console.error('获取动态列表出错:', error);
      message.error(error.response?.data?.message || error.message || '获取动态列表出错，请稍后重试');
      setOriginalPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolAdmin?.schoolId) {
      fetchPosts(pagination.current, pagination.pageSize, searchText, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchText, filters, schoolAdmin?.schoolId]);

  const handleTableChange = (pagination, tableFilters, sorter) => {
    setPagination(prev => ({ ...prev, current: pagination.current, pageSize: pagination.pageSize }));
    // We use custom filters, so tableFilters might not be directly used unless configured for backend.
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === '' || value === null) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTogglePostStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    const actionText = newStatus === 'hidden' ? '隐藏' : '设为活跃';
    message.loading({ content: `正在${actionText}动态 ${postId}...`, key: `postStatus-${postId}` });
    try {
      const response = await schoolAdminAPI.updatePostStatus(postId, newStatus);
      if (response.success) {
        message.success({ content: `动态 ${postId} 已${actionText}`, key: `postStatus-${postId}`, duration: 2 });
        // Refresh the list to show the updated status
        fetchPosts(pagination.current, pagination.pageSize, searchText, filters);
      } else {
        message.error({ content: response.message || `${actionText}失败`, key: `postStatus-${postId}`, duration: 2 });
      }
    } catch (error) {
      console.error(`${actionText}动态失败:`, error);
      message.error({ content: error.response?.data?.message || error.message || `${actionText}失败`, key: `postStatus-${postId}`, duration: 2 });
    }
  };

  const handleViewDetails = (post) => {
    setSelectedPostDetail(post);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedPostDetail(null);
  };

  const getPostStatusTagColor = (status) => {
    if (status === 'active') return 'green';
    if (status === 'hidden') return 'orange';
    if (status === 'deleted') return 'red';
    return 'default';
  };

  const handleSensitiveWordInputChange = (e) => {
    const keywords = e.target.value;
    setSensitiveKeywords(keywords);
    if (!keywords.trim()) {
      setHighlightedPostIds(new Set());
      setPosts(originalPosts);
    }
  };

  const performSensitiveWordCheck = () => {
    if (!sensitiveKeywords.trim()) {
      setHighlightedPostIds(new Set());
      setPosts(originalPosts);
      message.info('请输入要检测的敏感词');
      return;
    }
    const keywordsArray = sensitiveKeywords.toLowerCase().split(/[,\s]+/).filter(Boolean);
    if (keywordsArray.length === 0) {
      setHighlightedPostIds(new Set());
      setPosts(originalPosts);
      return;
    }

    const newHighlightedIds = new Set();
    const filteredPosts = originalPosts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      let found = false;
      for (const keyword of keywordsArray) {
        if (content.includes(keyword)) {
          newHighlightedIds.add(post.post_id);
          found = true;
          break;
        }
      }
      return found;
    });

    setHighlightedPostIds(newHighlightedIds);
    setPosts(filteredPosts);

    if (filteredPosts.length > 0) {
      message.success(`检测完成，已筛选出 ${filteredPosts.length} 条动态。`);
    } else {
      message.info('未检测到包含敏感词的动态。');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'post_id',
      key: 'post_id',
      width: 80,
    },
    {
      title: '发布者',
      key: 'user',
      width: 180,
      render: (text, record) => (
        <Space>
          <Avatar src={record.user?.avatar_url} >{record.user?.username?.charAt(0)}</Avatar>
          <Text>{record.user?.real_name || record.user?.username}</Text>
        </Space>
      ),
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}>{text || '无文本内容'}</Paragraph>
    },
    {
      title: '媒体文件',
      key: 'media',
      width: 150,
      render: (text, record) => {
        if (!record.media || record.media.length === 0) return <Text type="secondary">无</Text>;
        return (
          <Image.PreviewGroup>
            {record.media.slice(0, 2).map(m => (
              <Image key={m.media_id} width={50} height={50} src={m.thumbnail_url || m.media_url} alt={m.media_type} style={{marginRight: '4px'}}/>
            ))}
            {record.media.length > 2 && <Text> ...+{record.media.length - 2}</Text>}
          </Image.PreviewGroup>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'post_type',
      key: 'post_type',
      width: 100,
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (visibility) => {
        let text = visibility;
        if (visibility === 'public') text = '公开';
        if (visibility === 'school') text = '校内可见';
        if (visibility === 'private') text = '私密';
        return <Tag>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={getPostStatusTagColor(status)}>{status}</Tag>
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (text, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>详情</Button>
          {record.status !== 'deleted' && ( // Do not show toggle for 'deleted' posts, they need a different recovery/permanent delete logic
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleTogglePostStatus(record.post_id, record.status)}
              danger={record.status === 'active'} // 'danger' for hide action
            >
              {record.status === 'active' ? '隐藏' : '设为活跃'}
            </Button>
          )}
          {/* <Button icon={<DeleteOutlined />} onClick={() => message.info(\`删除 ${record.post_id} (待实现)\`)} danger>删除</Button> */}
        </Space>
      ),
    }
  ];

  const highlightStyles = `
    .highlighted-sensitive-row td {\n      background-color: #fffbe6 !important;\n    }\n    .highlighted-sensitive-row:hover td {\n      background-color: #fff1b8 !important;\n    }\n    .highlighted-sensitive-row td:first-child::before {\n      content: \"⚠️\";\n      margin-right: 8px;\n    }\n  `;

  return (
    <Spin spinning={loading}>
      <style dangerouslySetInnerHTML={{ __html: highlightStyles }} />
      <Card>
        <Title level={4}>动态管理 (学校ID: {schoolAdmin?.schoolId || '未知'})</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索内容、用户名、姓名..."
              onSearch={handleSearch}
              enterButton
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="筛选状态"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="active">活跃 (active)</Option>
              <Option value="hidden">隐藏 (hidden)</Option>
              <Option value="deleted">已删除 (deleted)</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="筛选可见性"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('visibility', value)}
              allowClear
            >
              <Option value="public">公开</Option>
              <Option value="school">校内</Option>
              <Option value="private">私密</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={16} md={12} lg={10}>
            <Input 
              placeholder="输入敏感词，用空格或逗号分隔" 
              value={sensitiveKeywords} 
              onChange={handleSensitiveWordInputChange} 
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={4}>
            <Button type="primary" onClick={performSensitiveWordCheck} icon={<WarningOutlined />}>检测敏感词</Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="post_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => {
            return highlightedPostIds.has(record.post_id) ? 'highlighted-sensitive-row' : '';
          }}
        />
      </Card>

      {selectedPostDetail && (
        <Modal
          title={`动态详情 - ID: ${selectedPostDetail.post_id}`}
          visible={isDetailModalVisible}
          onCancel={handleCloseDetailModal}
          footer={null} // No OK/Cancel buttons needed for detail view
          width={800}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={5}>发布者信息</Title>
              <Space align="center">
                <Avatar size={40} src={selectedPostDetail.user?.avatar_url}>{selectedPostDetail.user?.username?.charAt(0)}</Avatar>
                <Text strong>{selectedPostDetail.user?.real_name || selectedPostDetail.user?.username}</Text>
                <Text type="secondary">(ID: {selectedPostDetail.user?.user_id})</Text>
              </Space>
            </Col>
            <Divider />
            <Col span={24}>
              <Title level={5}>动态内容</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedPostDetail.content || '无文本内容'}</Paragraph>
            </Col>
            <Divider />
            <Col span={24}>
              <Title level={5}>媒体文件 ({selectedPostDetail.media?.length || 0})</Title>
              {selectedPostDetail.media && selectedPostDetail.media.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedPostDetail.media.map(m => (
                      <Image key={m.media_id} width={100} height={100} src={m.thumbnail_url || m.media_url} alt={m.media_type} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <Text type="secondary">无媒体文件</Text>
              )}
            </Col>
            <Divider />
            <Col span={12}>
              <Text strong>类型:</Text> <Tag>{selectedPostDetail.post_type}</Tag><br />
              <Text strong>可见性:</Text> <Tag>{selectedPostDetail.visibility === 'public' ? '公开' : selectedPostDetail.visibility === 'school' ? '校内可见' : '私密'}</Tag><br />
              <Text strong>状态:</Text> <Tag color={getPostStatusTagColor(selectedPostDetail.status)}>{selectedPostDetail.status}</Tag>
            </Col>
            <Col span={12}>
              <Text strong>点赞:</Text> {selectedPostDetail.like_count} <br />
              <Text strong>评论:</Text> {selectedPostDetail.comment_count} <br />
              <Text strong>分享:</Text> {selectedPostDetail.share_count}
            </Col>
            <Divider />
            <Col span={12}>
              <Text strong>发布时间:</Text> {new Date(selectedPostDetail.created_at).toLocaleString()}
            </Col>
            <Col span={12}>
              <Text strong>最后更新:</Text> {new Date(selectedPostDetail.updated_at).toLocaleString()}
            </Col>
            {selectedPostDetail.location && (
              <Col span={24}>
                <Divider />
                <Text strong>位置:</Text> {selectedPostDetail.location}
              </Col>
            )}
          </Row>
        </Modal>
      )}
    </Spin>
  );
};

export default PostManagementPage; 
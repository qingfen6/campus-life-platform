import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, message, Card, Space, Spin, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, PushpinOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { schoolAdminAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;

const AnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: undefined,
    status: undefined,
    isPinned: undefined,
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const result = await schoolAdminAPI.getSchoolAnnouncements(searchParams);
      if (result && result.data) {
        setAnnouncements(result.data);
        // 确保从后端获取到的分页信息有效，避免 undefined
        setPagination(prev => ({
          ...prev,
          current: result.currentPage !== undefined ? result.currentPage : 1,
          pageSize: result.pageSize !== undefined ? result.pageSize : prev.pageSize,
          total: result.total !== undefined ? result.total : 0,
        }));
      } else {
        setAnnouncements([]);
        setPagination({
          current: 1,
          pageSize: 10,
          total: 0,
        });
        message.warning('获取公告列表数据结构异常或无数据');
      }
    } catch (error) {
      console.error('获取公告列表失败:', error);
      message.error('获取公告列表失败: ' + (error.message || '未知错误'));
      setAnnouncements([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // 依赖 searchParams

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]); // 依赖 fetchAnnouncements 回调函数

  const handleTableChange = (pagination, filters, sorter) => {
    // 当分页、筛选、排序变化时，更新 searchParams 并重置当前页到第一页（如果不是手动切换分页）
    const newSearchParams = {
      ...searchParams,
      page: pagination.current,
      limit: pagination.pageSize,
      // TODO: Add sorter handling if backend supports sorting by columns other than default publish_time
      // sortBy: sorter.field || 'publish_time',
      // sortOrder: sorter.order === 'ascend' ? 'ASC' : 'DESC',
      // TODO: Add filters handling if backend supports filtering by filters object
      // ...filters,
    };
     // 如果是切换分页，保持当前页；如果是其他操作（搜索、筛选等），回到第一页
     if (searchParams.page !== pagination.current) {
         newSearchParams.page = pagination.current;
     } else { // 否则（如搜索、筛选变化），回到第一页
         newSearchParams.page = 1;
     }

    setSearchParams(newSearchParams);
  };

  const showModal = (announcement = null) => {
    if (announcement) {
      setIsEditing(true);
      setEditingAnnouncement(announcement);
      form.setFieldsValue({
        ...announcement,
        publish_time: announcement.publish_time ? moment(announcement.publish_time) : null,
        // Note: faculty_id, attachment_url, is_pinned, status might need default values or specific handling
        faculty_id: announcement.faculty_id || undefined, // Use undefined for empty Select
        announcement_type: announcement.announcement_type || 'general',
        visibility: announcement.visibility || 'school_only',
        is_pinned: announcement.is_pinned || false,
        status: announcement.status || 'published',
      });
    } else {
      setIsEditing(false);
      setEditingAnnouncement(null);
      form.resetFields();
      form.setFieldsValue({ // Set default values for creation
        announcement_type: 'general',
        visibility: 'school_only',
        is_pinned: false,
        status: 'published',
        publish_time: moment(), // Default publish time to now
        faculty_id: undefined, // Default faculty_id to undefined for new creation
      });
    }
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const dataToSend = {
        ...values,
        // 转换 moment 对象为 ISO 字符串
        publish_time: values.publish_time ? values.publish_time.toISOString() : new Date().toISOString(),
        // 确保 faculty_id 为 null 或数字
        faculty_id: values.faculty_id === undefined ? null : values.faculty_id,
      };

      setLoading(true); // Set loading for the form submission
      if (isEditing && editingAnnouncement) {
        // 更新公告
        await schoolAdminAPI.updateSchoolAnnouncement(editingAnnouncement.announcement_id, dataToSend);
        message.success('公告更新成功');
      } else {
        // 创建公告
        await schoolAdminAPI.createSchoolAnnouncement(dataToSend);
        message.success('公告创建成功');
      }
      setModalVisible(false);
      fetchAnnouncements(); // 刷新列表
    } catch (error) {
      console.error('保存公告失败:', error);
      message.error('保存公告失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingAnnouncement(null);
  };

  const handleDelete = async (announcementId) => {
    try {
      setLoading(true);
      await schoolAdminAPI.deleteSchoolAnnouncement(announcementId);
      message.success('公告删除成功');
      // 删除成功后，判断当前页是否还有数据，如果没有且不是第一页，则退回到上一页
      if (announcements.length === 1 && pagination.current > 1) {
          setSearchParams(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
          fetchAnnouncements(); // 刷新当前页数据
      }
    } catch (error) {
      console.error('删除公告失败:', error);
      message.error('删除公告失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'announcement_type',
      key: 'announcement_type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (visibility) => <Tag color="green">{visibility}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'published' ? 'success' : status === 'draft' ? 'default' : 'warning'}>{status}</Tag>
    },
    {
      title: '发布时间',
      dataIndex: 'publish_time',
      key: 'publish_time',
      render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-',
       sorter: (a, b) => moment(a.publish_time).valueOf() - moment(b.publish_time).valueOf(), // Frontend sorting for demo
       // sorter: true, // Enable backend sorting if implemented
    },
    {
      title: '发布者',
      dataIndex: ['publisher', 'real_name'],
      key: 'publisher',
      render: (_, record) => record.publisher?.full_name || record.publisher?.username || '未知',
    },
     {
      title: '置顶',
      dataIndex: 'is_pinned',
      key: 'is_pinned',
      render: (isPinned) => isPinned ? <PushpinOutlined style={{ color: '#1890ff' }} /> : '-',
     },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button icon={<EyeOutlined />} title="查看详情" /> */}
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} title="编辑公告" />
          <Popconfirm
            title="确定删除该公告吗?"
            onConfirm={() => handleDelete(record.announcement_id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger title="删除公告" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // TODO: Add Search/Filter Inputs above the table

  return (
    <Card title="学校公告管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>发布新公告</Button>}>
      {/* TODO: Add Search/Filter area here */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={announcements}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey="announcement_id"
          scroll={{ x: 'max-content' }} // Enable horizontal scrolling for many columns
        />
      </Spin>

      <Modal
        title={isEditing ? '编辑公告' : '发布新公告'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="announcement_form"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入公告内容' }]} >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            name="announcement_type"
            label="类型"
            rules={[{ required: true, message: '请选择公告类型' }]}>
            <Select>
              <Option value="general">普通通知</Option>
              <Option value="academic">教务教学</Option>
              <Option value="event">活动讲座</Option>
              <Option value="safety">安全提示</Option>
              <Option value="recruitment">招聘信息</Option>
              <Option value="policy">政策规定</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="visibility"
            label="可见性"
            rules={[{ required: true, message: '请选择可见性' }]}>
            <Select>
              <Option value="public">对外公开</Option>
              <Option value="school_only">仅校内可见</Option>
              {/* TODO: Add faculty_only option and corresponding faculty select if needed */}
              {/* <Option value="faculty_only">仅指定学院可见</Option> */}
            </Select>
          </Form.Item>
          <Form.Item name="attachment_url" label="附件链接">
            <Input />
          </Form.Item>
          <Form.Item name="is_pinned" label="是否置顶" valuePropName="checked">
             {/* 使用 Switch 或 Checkbox 组件更符合Ant Design风格 */}
             <Input type="checkbox" /> {/* 暂时保留Input type=checkbox */}
          </Form.Item>
           <Form.Item name="publish_time" label="发布时间">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
           <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AnnouncementManagementPage;
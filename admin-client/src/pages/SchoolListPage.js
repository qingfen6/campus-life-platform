import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getSchools, createSchool, updateSchool, deleteSchool } from '../services/api';

const SchoolListPage = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [form] = Form.useForm();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await getSchools({
        page: currentPage,
        limit: pageSize,
        search: searchText
      });
      if (response.success) {
        setSchools(response.data);
        setTotal(response.pagination.totalItems);
      } else {
        message.error(response.message || '获取学校列表失败');
      }
    } catch (error) {
      message.error(error.message || '获取学校列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [currentPage, pageSize, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingSchool(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSchool(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteSchool(id);
      if (response.success) {
        message.success('删除成功');
        fetchSchools();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let response;
      if (editingSchool) {
        response = await updateSchool(editingSchool.school_id, values);
        if (response.success) {
          message.success('更新成功');
        } else {
          message.error(response.message || '更新失败');
          return;
        }
      } else {
        response = await createSchool(values);
        if (response.success) {
          message.success('创建成功');
        } else {
          message.error(response.message || '创建失败');
          return;
        }
      }
      setModalVisible(false);
      fetchSchools();
    } catch (error) {
      message.error(error.message || (editingSchool ? '更新失败' : '创建失败'));
    }
  };

  const columns = [
    {
      title: '学校名称',
      dataIndex: 'school_name',
      key: 'school_name',
    },
    {
      title: '学校代码',
      dataIndex: 'school_code',
      key: 'school_code',
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '类型',
      dataIndex: 'school_type',
      key: 'school_type',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除这个学校吗？"
            onConfirm={() => handleDelete(record.school_id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="搜索学校名称或代码"
          onSearch={handleSearch}
          style={{ width: '300px' }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增学校
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={schools}
        rowKey="school_id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />
      <Modal
        title={editingSchool ? '编辑学校' : '新增学校'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="school_name" label="学校名称" rules={[{ required: true, message: '请输入学校名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="school_code" label="学校代码" rules={[{ required: true, message: '请输入学校代码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="province" label="省份">
            <Input />
          </Form.Item>
          <Form.Item name="city" label="城市">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="school_type" label="类型">
            <Input />
          </Form.Item>
          <Form.Item name="logo_url" label="校徽URL">
            <Input />
          </Form.Item>
          <Form.Item name="website" label="官网链接">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchoolListPage; 
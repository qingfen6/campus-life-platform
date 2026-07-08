import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Pagination,
  Space,
  Spin,
  Modal,
  Form,
  message,
  Tag,
  Tooltip
} from 'antd';
import { EyeOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUsers, getUserDetails, updateUser } from '../../../services/api'; // 确保路径正确
import './UserListPage.css'; // 我们将创建这个CSS文件

const { Option } = Select;

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: '',
    school_id: '',
    user_status: '', // 'active', 'inactive', 'banned'
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async (page = pagination.currentPage, itemsPerPage = pagination.itemsPerPage) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: filters.search,
        school_id: filters.school_id,
        user_status: filters.user_status,
      };
      console.log('UserListPage: Calling getUsers with params:', params);
      const response = await getUsers(params);
      console.log('UserListPage: getUsers response:', response);

      if (response && response.data) {
        setUsers(response.data);
        setPagination(response.pagination);
      } else {
        // 即便API返回的结构不是预期的 {data: ..., pagination: ...}，也尝试从顶层取message
        message.error(response.message || '获取用户数据失败 (原始响应可能不含data或pagination)');
      }
    } catch (error) {
      console.error('UserListPage: 获取用户列表失败:', error);
      message.error(`获取用户列表失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    console.log('UserListPage: First useEffect - calling fetchUsers.');
    fetchUsers();
  }, [fetchUsers]);

  // 新增的 useEffect 用于检测组件是否挂载
  useEffect(() => {
    console.log('UserListPage MOUNTED AND RENDERED!');
    // alert('UserListPage MOUNTED!'); // 您也可以取消注释这个alert进行更强的中断测试
    return () => {
      console.log('UserListPage UNMOUNTING!');
    };
  }, []); // 空依赖数组，只在挂载和卸载时运行

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 })); // 重置到第一页
    fetchUsers(1); // 立即获取数据
  };

  const handleResetFilters = () => {
    setFilters({ search: '', school_id: '', user_status: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // fetchUsers(1); // useEffect会因filters改变而触发，或手动调用
  };

  const handleTableChange = (newPage, newPageSize) => {
    fetchUsers(newPage, newPageSize);
  };

  const showEditModal = async (userId) => {
    try {
      setLoading(true);
      // 替换为真实 API 调用
      // const response = await getUserDetails(userId);
      const response = await getUserDetails(userId);

      if (response && response.data) {
        setEditingUser(response.data);
        form.setFieldsValue({
          ...response.data,
          birth_date: response.data.birth_date ? response.data.birth_date.split('T')[0] : null, // 简化日期处理
        });
        setIsModalVisible(true);
      } else {
        message.error('获取用户详情失败');
      }
    } catch (error) {
      message.error(`获取用户详情失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // 替换为真实 API 调用
      // const response = await updateUser(editingUser.user_id, values);
      const response = await updateUser(editingUser.user_id, values);

      if (response && response.data) {
        message.success(response.message || '用户信息更新成功');
        setIsModalVisible(false);
        setEditingUser(null);
        fetchUsers(); // 重新加载列表
      } else {
        message.error(response.message || '更新用户信息失败');
      }
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
      message.error('表单验证失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const columns = [
    { title: 'ID', dataIndex: 'user_id', key: 'user_id', sorter: (a, b) => a.user_id - b.user_id, width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
    { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '学校', dataIndex: 'school_name', key: 'school_name', render: (school_name, record) => school_name || '未指定' },
    {
      title: '状态',
      dataIndex: 'user_status',
      key: 'user_status',
      render: status => {
        let color = 'geekblue';
        if (status === 'banned') color = 'volcano';
        if (status === 'inactive') color = 'gold';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Banned', value: 'banned' },
      ],
      onFilter: (value, record) => record.user_status.indexOf(value) === 0,
    },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleDateString(), sorter: (a,b) => new Date(a.created_at) - new Date(b.created_at) },
    { title: '最后登录', dataIndex: 'last_login', key: 'last_login', render: (text) => text ? new Date(text).toLocaleDateString() : '-', sorter: (a,b) => (a.last_login && b.last_login) ? new Date(a.last_login) - new Date(b.last_login) : 0 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑用户">
            <Button icon={<EditOutlined />} onClick={() => showEditModal(record.user_id)} />
          </Tooltip>
          {/* <Tooltip title="查看详情">
            <Button icon={<EyeOutlined />} onClick={() => alert('查看详情: ' + record.user_id)} /> 
          </Tooltip>*/}
        </Space>
      ),
    },
  ];

  // 模拟学校列表，实际应从API获取
  const mockSchools = [
    { school_id: 1, school_name: '清华大学' },
    { school_id: 2, school_name: '北京大学' },
    { school_id: 3, school_name: '复旦大学' },
  ];

  return (
    <div className="user-list-page">
      <h2>用户管理</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索用户名/姓名/邮箱"
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          style={{ width: 240 }}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="按学校筛选"
          value={filters.school_id}
          onChange={value => handleFilterChange('school_id', value)}
          style={{ width: 180 }}
          allowClear
        >
          {mockSchools.map(school => (
            <Option key={school.school_id} value={school.school_id}>{school.school_name}</Option>
          ))}
        </Select>
        <Select
          placeholder="按状态筛选"
          value={filters.user_status}
          onChange={value => handleFilterChange('user_status', value)}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="banned">Banned</Option>
        </Select>
        <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>搜索</Button>
        <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>重置</Button>
      </Space>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="user_id"
          pagination={false} // 使用自定义分页
          scroll={{ x: 'max-content' }} // 确保在小屏幕上可滚动
        />
      </Spin>
      {pagination.totalItems > 0 && (
        <Pagination
          current={pagination.currentPage}
          total={pagination.totalItems}
          pageSize={pagination.itemsPerPage}
          onChange={handleTableChange}
          showSizeChanger
          onShowSizeChange={handleTableChange} // antd pagination pageSize改变也会触发onChange
          style={{ marginTop: 16, textAlign: 'right' }}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      )}

      {editingUser && (
        <Modal
          title={`编辑用户 - ${editingUser.username}`}
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          confirmLoading={loading}
          width={600}
          destroyOnClose // 关闭时销毁内部组件状态
        >
          <Form form={form} layout="vertical" name="editUserForm">
            <Form.Item name="user_id" label="用户ID" hidden><Input readOnly /></Form.Item>
            <Form.Item name="username" label="用户名"><Input readOnly disabled /></Form.Item>
            <Form.Item name="real_name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}><Input /></Form.Item>
            <Form.Item name="nickname" label="昵称"><Input /></Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}><Input readOnly disabled/></Form.Item>
            <Form.Item name="phone" label="电话"><Input /></Form.Item>
            <Form.Item name="bio" label="简介"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="school_id" label="学校">
              <Select allowClear placeholder="选择学校">
                {mockSchools.map(school => (
                  <Option key={school.school_id} value={school.school_id}>{school.school_name}</Option>
                ))}
              </Select>
            </Form.Item>
            {/* 更多字段如 faculty_id, student_id, enrollment_year 可以类似添加 */}
            <Form.Item name="gender" label="性别">
                <Select allowClear placeholder="选择性别">
                    <Option value="male">男</Option>
                    <Option value="female">女</Option>
                    <Option value="other">其他</Option>
                    <Option value="undisclosed">未透露</Option>
                </Select>
            </Form.Item>
            <Form.Item name="birth_date" label="出生日期">
                <Input type="date" />
            </Form.Item>
            <Form.Item name="user_status" label="用户状态" rules={[{ required: true, message: '请选择用户状态' }]}>
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="banned">Banned</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default UserListPage; 
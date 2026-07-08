import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message, Spin, Card, Row, Col, Select, Typography, Modal, Avatar, Tag, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { schoolAdminAPI } from '../../services/api'; // 取消注释
import { getUser } from '../../utils/auth';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const schoolAdmin = getUser();
  const [faculties, setFaculties] = useState([]);
  const [isUserDetailModalVisible, setIsUserDetailModalVisible] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const fetchUsers = async (page = 1, pageSize = 10, search = '', currentFilters = {}) => {
    setLoading(true);
    try {
      const schoolId = schoolAdmin?.schoolId; // 从管理员信息获取 schoolId
      if (!schoolId) {
        message.error('无法获取学校信息，请重新登录');
        setLoading(false);
        return;
      }
      
      const params = {
        page,
        pageSize,
        schoolId,
        search,
        ...currentFilters
      };
      console.log('Fetching users with params:', params);
      const response = await schoolAdminAPI.getSchoolUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(prev => ({
          ...prev,
          current: response.data.currentPage || page, // 使用后端返回的currentPage
          pageSize: pageSize,
          total: response.data.total,
        }));
      } else {
        message.error(response.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表出错:', error);
      message.error(error.message || '获取用户列表出错，请稍后重试'); // 显示更具体的错误信息
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolAdmin?.schoolId) { // 仅在schoolId存在时获取数据
        fetchUsers(pagination.current, pagination.pageSize, searchText, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchText, filters, schoolAdmin?.schoolId]);

  const handleTableChange = (pagination, filters, sorter) => {
    // 后端处理排序，如果需要的话，可以在这里添加sorter参数到fetchUsers
    console.log('Table change:', pagination, filters, sorter);
    setPagination(prev => ({...prev, current: pagination.current, pageSize: pagination.pageSize }));
    // setFilters(filters); // AntD table的filters可以直接用，但我们是自定义筛选
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === '') { // 如果值为空或未定义，则删除该筛选条件
        delete newFilters[key];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleViewUserDetails = (user) => {
    setSelectedUserDetail(user);
    setIsUserDetailModalVisible(true);
  };

  const handleCloseUserDetailModal = () => {
    setIsUserDetailModalVisible(false);
    setSelectedUserDetail(null);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'inactive' ? '禁用' : '启用';
    const loadingMessageKey = `userStatus-${userId}`;

    message.loading({ content: `正在${actionText}用户 ${userId}...`, key: loadingMessageKey });

    try {
      const response = await schoolAdminAPI.updateUserStatus(userId, newStatus);

      if (response.success) {
        message.success({ content: `用户 ${userId} 已成功${actionText}`, key: loadingMessageKey, duration: 2 });
        // Optimistically update the local state
        setUsers(currentUsers => 
          currentUsers.map(user => 
            user.user_id === userId ? { ...user, user_status: newStatus } : user
          )
        );
        // Optionally, if you also maintain originalPosts or similar for filtering, update that too
        // setOriginalUsers(currentOriginalUsers => 
        //   currentOriginalUsers.map(user => 
        //     user.user_id === userId ? { ...user, user_status: newStatus } : user
        //   )
        // );
      } else {
        message.error({ content: response.message || `${actionText}用户失败`, key: loadingMessageKey, duration: 3 });
      }
    } catch (error) {
      console.error(`${actionText}用户状态失败:`, error);
      message.error({ content: error.message || `${actionText}用户失败，请检查控制台`, key: loadingMessageKey, duration: 3 });
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'user_id', key: 'user_id', sorter: (a, b) => a.user_id - b.user_id },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '学号', dataIndex: 'student_id', key: 'student_id' },
    {
      title: '学院',
      dataIndex: ['faculty', 'faculty_name'],
      key: 'faculty_name',
      render: (facultyName, record) => facultyName || (record.faculty_id ? `学院ID: ${record.faculty_id}` : 'N/A')
    },
    { title: '入学年份', dataIndex: 'enrollment_year', key: 'enrollment_year', sorter: (a, b) => a.enrollment_year - b.enrollment_year },
    { 
      title: '状态', 
      dataIndex: 'user_status', 
      key: 'user_status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : (status === 'inactive' ? '禁用' : status)}
        </Tag>
      ),
    },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (text, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleViewUserDetails(record)}>详情</Button>
          <Button 
            icon={record.user_status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleUserStatus(record.user_id, record.user_status)}
            danger={record.user_status === 'active'}
          >
            {record.user_status === 'active' ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const fetchSchoolFaculties = async () => {
      if (schoolAdmin?.schoolId) {
        try {
          const response = await schoolAdminAPI.getFacultiesBySchool();
          if (response.success) {
            setFaculties(response.data);
          } else {
            message.error(response.message || '获取学院列表失败');
          }
        } catch (error) {
          console.error('获取学院列表出错:', error);
          message.error(error.message || '获取学院列表出错');
        }
      }
    };
    fetchSchoolFaculties();
  }, [schoolAdmin?.schoolId]);

  return (
    <Spin spinning={loading}>
      <Card>
        <Title level={4}>用户管理 (学校ID: {schoolAdmin?.schoolId || '未知'})</Title>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索用户名、姓名、学号、邮箱..."
              onSearch={handleSearch}
              enterButton={<Button icon={<SearchOutlined />}>搜索</Button>}
              allowClear
            />
          </Col>
          <Col span={4}>
             <Select 
                placeholder="筛选学院"
                style={{ width: '100%' }} 
                onChange={(value) => handleFilterChange('facultyId', value)} 
                allowClear
                loading={faculties.length === 0 && schoolAdmin?.schoolId}
                disabled={!schoolAdmin?.schoolId}
             >
                {faculties.map(faculty => (
                  <Option key={faculty.faculty_id} value={faculty.faculty_id}>{faculty.faculty_name}</Option>
                ))}
             </Select>
          </Col>
          <Col span={4}>
             <Select placeholder="筛选状态" style={{ width: '100%' }} onChange={(value) => handleFilterChange('status', value)} allowClear>
               <Option value="active">活跃</Option>
               <Option value="inactive">禁用</Option>
             </Select>
          </Col>
           <Col span={8} style={{ textAlign: 'right' }}>
             <Button type="primary" disabled> {/* 暂时禁用批量添加 */}
               批量添加用户 (待实现)
             </Button>
           </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="user_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {selectedUserDetail && (
        <Modal
          title={`用户详情 - ${selectedUserDetail.real_name || selectedUserDetail.username} (ID: ${selectedUserDetail.user_id})`}
          visible={isUserDetailModalVisible}
          onCancel={handleCloseUserDetailModal}
          footer={null}
          width={700}
        >
          <Row gutter={[16, 24]}>
            <Col span={8}>
                <Avatar size={100} src={selectedUserDetail.avatar_url}>{selectedUserDetail.username?.charAt(0)}</Avatar>
            </Col>
            <Col span={16}>
                <Title level={4} style={{marginTop:0}}>{selectedUserDetail.real_name || '未设置姓名'}</Title>
                <Text type="secondary">用户名: {selectedUserDetail.username}</Text><br/>
                <Text type="secondary">学号: {selectedUserDetail.student_id || '未设置'}</Text>
            </Col>
            <Divider />
            <Col span={12}><Text strong>邮箱:</Text> {selectedUserDetail.email}</Col>
            <Col span={12}><Text strong>手机号:</Text> {selectedUserDetail.phone || '未提供'}</Col>
            <Col span={12}><Text strong>性别:</Text> {selectedUserDetail.gender}</Col>
            <Col span={12}><Text strong>生日:</Text> {selectedUserDetail.birth_date ? new Date(selectedUserDetail.birth_date).toLocaleDateString() : '未设置'}</Col>
            <Col span={12}><Text strong>学院:</Text> {selectedUserDetail.faculty?.faculty_name || (selectedUserDetail.faculty_id ? `ID: ${selectedUserDetail.faculty_id}` : '未分配')}</Col>
            <Col span={12}><Text strong>入学年份:</Text> {selectedUserDetail.enrollment_year || '未设置'}</Col>
            <Col span={24}><Text strong>个人简介:</Text> <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '更多' }}>{selectedUserDetail.bio || '暂无简介'}</Paragraph></Col>
            <Divider />
            <Col span={12}><Text strong>状态:</Text> <Tag color={selectedUserDetail.user_status === 'active' ? 'green' : 'red'}>{selectedUserDetail.user_status}</Tag></Col>
            <Col span={12}><Text strong>上次登录:</Text> {selectedUserDetail.last_login ? new Date(selectedUserDetail.last_login).toLocaleString() : '从未登录'}</Col>
            <Col span={12}><Text strong>注册时间:</Text> {new Date(selectedUserDetail.created_at).toLocaleString()}</Col>
          </Row>
        </Modal>
      )}
    </Spin>
  );
};

export default UserManagementPage; 
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Button, Space, Tag, Modal, Form, Select, message, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { schoolAdminAPI } from '../../services/api'; // 修正导入路径

const { Option } = Select;

const MissionManagementPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({});
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentMission, setCurrentMission] = useState(null);
  const [statusForm] = Form.useForm();

  // 使用 useCallback 包裹 fetchMissions
  const fetchMissions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
        ...params,
      };
      console.log('Fetching missions with params:', queryParams);
      const response = await schoolAdminAPI.getSchoolMissions(queryParams);
      if (response.success) {
        // 检查后端返回的分页数据，确认 total, currentPage, pageSize 不是 undefined 或 null
        console.log('Backend pagination data:', {
          total: response.data.total,
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
        });

        // 确保从后端获取的 pageSize, total, currentPage 是有效值
        const validPageSize = typeof response.data.pageSize === 'number' ? response.data.pageSize : pagination.pageSize;
        const validTotal = typeof response.data.total === 'number' ? response.data.total : 0;
        const validCurrentPage = typeof response.data.currentPage === 'number' ? response.data.currentPage : 1;

        setMissions(response.data.missions);
        // 使用函数式更新，并确保值有效
        setPagination(prevPagination => ({
          ...prevPagination,
          total: validTotal,
          current: validCurrentPage,
          pageSize: validPageSize,
        }));
      } else {
        message.error(response.message || '获取悬赏列表失败');
        // 如果获取失败，重置分页 Total 和当前页，避免 Ant Design 分页组件因 total 为 undefined 报错
        setPagination(prevPagination => ({
             ...prevPagination,
             total: 0,
             current: 1,
             pageSize: prevPagination.pageSize // 失败时保留 pageSize
        }));
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
      message.error('获取悬赏列表异常');
       // 如果获取异常，重置分页 Total 和当前页
       setPagination(prevPagination => ({
           ...prevPagination,
           total: 0,
           current: 1,
           pageSize: prevPagination.pageSize // 异常时保留 pageSize
       }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams]); // 将 fetchMissions 的内部依赖列在此处

  useEffect(() => {
    fetchMissions(); // useEffect 依赖于 fetchMissions 本身 (useCallback 保证其引用稳定)
  }, [fetchMissions]); // 依赖项现在是 fetchMissions 函数

  // 处理 Ant Design Pagination 的页码或 pageSize 变化
  const handlePaginationChange = (page, pageSize) => {
    console.log('Pagination changed to:', page, pageSize);
    // 更新分页状态
     setPagination(prevPagination => ({
         ...prevPagination,
         current: page,
         pageSize: pageSize,
     }));
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchParams(prevParams => ({ ...prevParams, [dataIndex]: selectedKeys[0] }));
     // 搜索后重置到第一页
     setPagination(prevPagination => ({ ...prevPagination, current: 1 }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchParams(prevParams => {
        const newParams = { ...prevParams };
        delete newParams[dataIndex];
        return newParams;
    });
    // 重置搜索条件后重置到第一页
     setPagination(prevPagination => ({ ...prevPagination, current: 1 }));
  };

  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`搜索 ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
          {/* 这里的过滤按钮在 AntD Table 过滤功能下通常不需要单独处理，
             因为它会自动触发 onFilter 和可能的 fetch */}
          {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchParams(prevParams => ({ ...prevParams, [dataIndex]: selectedKeys[0] }));
            }}
          >
            过滤
          </Button> */}
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            关闭
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    // onFilter 在前端进行本地过滤，如果需要后端过滤，需要修改
    // onFilter: (value, record) =>
    //   record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.select(), 100);
      }
    },
    // render: (text) =>
    //   searchedColumn === dataIndex ? (
    //     <Highlighter
    //       highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //       searchWords={[searchText]}
    //       autoEscape
    //       textToHighlight={text ? text.toString() : ''}
    //     />
    //   ) : (
    //     text
    //   ),
  });

  const handleStatusUpdate = (mission) => {
    setCurrentMission(mission);
    statusForm.setFieldsValue({ status: mission.status });
    setIsStatusModalVisible(true);
  };

  const handleStatusModalOk = async () => {
    try {
      const values = await statusForm.validateFields();
      setLoading(true);
      const response = await schoolAdminAPI.updateMissionStatus(currentMission.mission_id, values.status);
      if (response.success) {
        message.success('悬赏状态更新成功');
        setIsStatusModalVisible(false);
        fetchMissions(); // 刷新列表
      } else {
        message.error(response.message || '更新悬赏状态失败');
      }
    } catch (error) {
      console.error('Error updating mission status:', error);
      message.error('更新悬赏状态异常');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setCurrentMission(null);
    statusForm.resetFields();
  };

  // 定义悬赏状态的颜色映射
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'green';
      case 'in_progress': return 'blue';
      case 'submitted_for_review': return 'orange';
      case 'completed': return 'cyan';
      case 'closed': return 'default';
      case 'canceled': return 'red';
      case 'expired': return 'volcano';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'mission_id',
      key: 'mission_id',
      sorter: (a, b) => a.mission_id - b.mission_id,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      // 使用自定义函数进行搜索/过滤，实际过滤逻辑应在 handleSearch/handleReset 中更新 searchParams
      // 移除 onFilter，因为我们要后端过滤
      ...getColumnSearchProps('title', '标题'),
    },
    {
      title: '发布者',
      dataIndex: ['publisher', 'real_name'],
      key: 'publisher_name',
      render: (text, record) => record.publisher?.real_name || record.publisher?.username || '未知',
      // 搜索关联表字段需要在后端实现，前端暂时不加搜索props
      // ...getColumnSearchProps('publisher_name', '发布者姓名'),
    },
    {
        title: '发布者学号',
        dataIndex: ['publisher', 'student_id'],
        key: 'publisher_student_id',
        render: (text, record) => record.publisher?.student_id || '无',
         // 搜索关联表字段需要在后端实现，前端暂时不加搜索props
        // ...getColumnSearchProps('publisher_student_id', '发布者学号'),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      // onFilter 在前端进行本地过滤，如果需要后端过滤，需要修改
      // filters: [
      //     { text: '学习', value: '学习' },
      //     { text: '生活', value: '生活' },
      // ],
      // onFilter: (value, record) => record.category === value,
      // 如果需要后端过滤，这里使用 filterDropdown 或自定义筛选组件，并更新 searchParams
       filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Select
              placeholder="选择类别"
              value={selectedKeys[0]}
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              style={{ width: 120 }}
            >
               {/* TODO: 从后端获取类别列表 */}
              <Option value="学习">学习</Option>
              <Option value="生活">生活</Option>
               {/* 添加更多选项 */}
            </Select>
            <Space style={{marginTop: 8}}>
              <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, 'category')} size="small" style={{ width: 60 }}>
                筛选
              </Button>
              <Button onClick={() => clearFilters && handleReset(clearFilters, 'category')} size="small" style={{ width: 60 }}>
                重置
              </Button>
            </Space>
          </div>
        ),
         // onFilter 依然可以用于前端的筛选图标状态，但实际过滤靠 searchParams 和后端
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        // onFilter 移除，过滤逻辑由后端完成
    },
    {
      title: '报酬',
      dataIndex: 'reward',
      key: 'reward',
      sorter: (a, b) => a.reward - b.reward,
    },
     {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
       // 移除 onFilter，如果需要后端过滤，使用 filterDropdown 或自定义筛选组件
      filters: [
          { text: '简单', value: 'easy' }, // 使用数据库存储的枚举值
          { text: '中等', value: 'medium' },
          { text: '困难', value: 'hard' },
           { text: '专家', value: 'expert' },
      ],
       // onFilter 依然可以用于前端的筛选图标状态，但实际过滤靠 searchParams 和后端
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
       // onFilter 移除
        onFilter: (value, record) => record.difficulty === value,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      // 移除 onFilter，如果需要后端过滤，使用 filterDropdown 或自定义筛选组件
      ...getColumnSearchProps('location', '地点'),
    },
     {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
       render: (text) => text ? new Date(text).toLocaleString() : '-',
       sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline), // 添加排序
     },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
       // 移除 onFilter，如果需要后端过滤，使用 filterDropdown 或自定义筛选组件
      filters: [
        { text: '开放中', value: 'open' },
        { text: '进行中', value: 'in_progress' },
        { text: '待审核', value: 'submitted_for_review' },
        { text: '已完成', value: 'completed' },
        { text: '已关闭', value: 'closed' },
        { text: '已取消', value: 'canceled' },
        { text: '已过期', value: 'expired' },
      ],
      // onFilter 依然可以用于前端的筛选图标状态，但实际过滤靠 searchParams 和后端
       filterIcon: (filtered) => (
         <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
       ),
       // onFilter 移除
       onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} key={status}>
          {status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleStatusUpdate(record)}>更新状态</Button>
          {/* TODO: 添加查看详情、编辑等操作 */}
        </Space>
      ),
    },
  ];

  return (
    <Card title="悬赏管理">
      {/* 搜索和筛选区域，如果需要更复杂的搜索，可以在这里添加表单 */}
      <div style={{ marginBottom: 16 }}>
         {/* 当前只实现了表格列内的过滤和搜索，更顶部的搜索区域可以根据需求添加 */}
      </div>
      <Table
        columns={columns}
        dataSource={missions}
        rowKey="mission_id"
        loading={loading}
        pagination={false} // 关闭 Ant Design 自带分页，使用自定义 Pagination
        // onChange={handleTableChange} // 监听表格变化 (已移除，由自定义 Pagination 处理)
        // 添加 onSort 和 onFilter 来触发 fetchMissions
        onChange={(pagination, filters, sorter) => {
            // 在这里处理排序和筛选的变化，并更新 searchParams 或单独的状态
            // Ant Design Table 的 filters 对象会包含列的筛选值
            console.log('Table onChange - filters:', filters);
            console.log('Table onChange - sorter:', sorter);

            const newSearchParams = { ...searchParams };
            // 处理列搜索 (来自 getColumnSearchProps)
            if (filters.title && filters.title.length > 0) newSearchParams.search = filters.title[0]; else delete newSearchParams.search;
            // 处理类别筛选 (来自 filterDropdown)
             if (filters.category && filters.category.length > 0) newSearchParams.category = filters.category[0]; else delete newSearchParams.category;
            // 处理难度筛选 (来自 filters)
             if (filters.difficulty && filters.difficulty.length > 0) newSearchParams.difficulty = filters.difficulty[0]; else delete newSearchParams.difficulty;
            // 处理地点搜索
             if (filters.location && filters.location.length > 0) newSearchParams.location = filters.location[0]; else delete newSearchParams.location;
             // 处理状态筛选
             if (filters.status && filters.status.length > 0) newSearchParams.status = filters.status[0]; else delete newSearchParams.status;

            // 处理排序
            if (sorter.field && sorter.order) {
                newSearchParams.sortBy = sorter.field;
                newSearchParams.order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
            } else {
                 delete newSearchParams.sortBy;
                 delete newSearchParams.order;
            }
            
            setSearchParams(newSearchParams);
            // Table 的 onChange 也会触发分页变化，但我们关闭了 Table 的分页，由自定义 Pagination 处理
            // 因此这里只需处理筛选和排序，然后重置到第一页
             setPagination(prevPagination => ({ ...prevPagination, current: 1 }));
        }}
      />
       {/* 使用自定义 Pagination 组件 */}
       <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger
        showTotal={(total) => `总共 ${total} 条`}
        // onChange 包含了页码和 pageSize 的变化
        onChange={handlePaginationChange} // 使用自定义的处理函数
        // onShowSizeChange={handlePaginationChange} // onChange 已经处理了 pageSize 变化，这里可以省略或仅用于特殊逻辑
      />

      {/* 状态更新模态框 */}
      <Modal
        title="更新悬赏状态"
        visible={isStatusModalVisible}
        onOk={handleStatusModalOk}
        onCancel={handleStatusModalCancel}
        confirmLoading={loading}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择新的状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value="open">开放中</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="submitted_for_review">待审核</Option>
              <Option value="completed">已完成</Option>
              <Option value="closed">已关闭</Option>
              <Option value="canceled">已取消</Option>
              <Option value="expired">已过期</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MissionManagementPage; 
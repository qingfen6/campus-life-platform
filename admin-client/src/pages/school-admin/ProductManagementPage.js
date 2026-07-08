import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Button, Space, Tag, Modal, Form, Select, message, Pagination, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { schoolAdminAPI } from '../../services/api'; // 使用学校管理员API

const { Option } = Select;

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({});
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [statusForm] = Form.useForm();

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
        ...params,
      };
      console.log('Fetching products with params:', queryParams);
      const response = await schoolAdminAPI.getSchoolProducts(queryParams);
      if (response.success) {
        console.log('Backend pagination data:', {
          total: response.data.total,
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
        });

        const validPageSize = typeof response.data.pageSize === 'number' ? response.data.pageSize : pagination.pageSize;
        const validTotal = typeof response.data.total === 'number' ? response.data.total : 0;
        const validCurrentPage = typeof response.data.currentPage === 'number' ? response.data.currentPage : 1;

        setProducts(response.data.products);
        setPagination(prevPagination => ({
          ...prevPagination,
          total: validTotal,
          current: validCurrentPage,
          pageSize: validPageSize,
        }));
      } else {
        message.error(response.message || '获取商品列表失败');
        setPagination(prevPagination => ({
             ...prevPagination,
             total: 0,
             current: 1,
             pageSize: prevPagination.pageSize
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('获取商品列表异常');
       setPagination(prevPagination => ({
           ...prevPagination,
           total: 0,
           current: 1,
           pageSize: prevPagination.pageSize
       }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePaginationChange = (page, pageSize) => {
    console.log('Pagination changed to:', page, pageSize);
     setPagination(prevPagination => ({
         ...prevPagination,
         current: page,
         pageSize: pageSize,
     }));
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchParams(prevParams => ({ ...prevParams, [dataIndex]: selectedKeys[0] }));
     setPagination(prevPagination => ({ ...prevPagination, current: 1 }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchParams(prevParams => {
        const newParams = { ...prevParams };
        delete newParams[dataIndex];
        return newParams;
    });
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
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.select(), 100);
      }
    },
  });

   // 获取商品状态的颜色映射
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'reserved': return 'blue';
      case 'sold': return 'orange';
      case 'expired': return 'red';
      case 'deleted': return 'volcano';
      default: return 'default';
    }
  };

  const handleStatusUpdate = (product) => {
    setCurrentProduct(product);
    statusForm.setFieldsValue({ status: product.status });
    setIsStatusModalVisible(true);
  };

  const handleStatusModalOk = async () => {
    try {
      const values = await statusForm.validateFields();
      setLoading(true);
      const response = await schoolAdminAPI.updateProductStatus(currentProduct.product_id, values.status);
      if (response.success) {
        message.success('商品状态更新成功');
        setIsStatusModalVisible(false);
        fetchProducts(); // 刷新列表
      } else {
        message.error(response.message || '更新商品状态失败');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      message.error('更新商品状态异常');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setCurrentProduct(null);
    statusForm.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'product_id',
      key: 'product_id',
      sorter: (a, b) => a.product_id - b.product_id,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title', '标题'),
    },
     {
      title: '卖家',
      dataIndex: ['seller', 'real_name'], // 假设卖家信息嵌套在 seller 对象中
      key: 'seller_name',
      render: (text, record) => record.seller?.real_name || record.seller?.username || '未知',
      // 搜索关联表字段需要在后端实现
      // ...getColumnSearchProps('seller_name', '卖家姓名'),
    },
     {
        title: '卖家学号',
        dataIndex: ['seller', 'student_id'],
        key: 'seller_student_id',
        render: (text, record) => record.seller?.student_id || '无',
         // 搜索关联表字段需要在后端实现
        // ...getColumnSearchProps('seller_student_id', '卖家学号'),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
       render: (text) => `¥${text}`,
      sorter: (a, b) => a.price - b.price,
    },
     {
      title: '原价',
      dataIndex: 'original_price',
      key: 'original_price',
       render: (text) => text ? `¥${text}` : '-',
       sorter: (a, b) => a.original_price - b.original_price,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
       filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="搜索类别"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm, 'category')}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, 'category')} size="small" style={{ width: 60 }}>
                筛选
              </Button>
              <Button onClick={() => clearFilters && handleReset(clearFilters, 'category')} size="small" style={{ width: 60 }}>
                重置
              </Button>
            </Space>
          </div>
        ),
         filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
    },
     {
      title: '商品新旧',
      dataIndex: 'condition_type',
      key: 'condition_type',
      filters: [
          { text: '全新', value: 'new' },
          { text: '几乎全新', value: 'like_new' },
          { text: '良好', value: 'good' },
          { text: '一般', value: 'fair' },
          { text: '破旧', value: 'poor' },
      ],
      onFilter: (value, record) => record.condition_type === value,
       filterIcon: (filtered) => (
         <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
       ),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      ...getColumnSearchProps('location', '地点'),
    },
     {
      title: '已售',
      dataIndex: 'is_sold',
      key: 'is_sold',
       render: (text) => text ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
        filters: [
           { text: '是', value: true }, // 注意：布尔值可能需要后端特殊处理
           { text: '否', value: false },
       ],
       onFilter: (value, record) => record.is_sold === value,
       filterIcon: (filtered) => (
         <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
       ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '活跃', value: 'active' },
        { text: '预定', value: 'reserved' },
        { text: '已售', value: 'sold' },
        { text: '过期', value: 'expired' },
        { text: '已删除', value: 'deleted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} key={status}>
          {status}
        </Tag>
      ),
       filterIcon: (filtered) => (
         <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
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
          {/* TODO: 添加查看详情、编辑、删除等操作 */}
        </Space>
      ),
    },
  ];

  return (
    <Card title="商品管理">
      {/* 搜索和筛选区域，如果需要更复杂的搜索，可以在这里添加表单 */}
      <div style={{ marginBottom: 16 }}>
         {/* 当前只实现了表格列内的过滤和搜索，更顶部的搜索区域可以根据需求添加 */}
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="product_id"
        loading={loading}
        pagination={false} // 关闭 Ant Design 自带分页，使用自定义 Pagination
        // 添加 onSort 和 onFilter 来触发 fetchProducts
        onChange={(pagination, filters, sorter) => {
            console.log('Table onChange - filters:', filters);
            console.log('Table onChange - sorter:', sorter);

            const newSearchParams = { ...searchParams };
            // 处理列搜索 (来自 getColumnSearchProps)
            if (filters.title && filters.title.length > 0) newSearchParams.search = filters.title[0]; else delete newSearchParams.search;
            // 处理类别筛选 (来自 filterDropdown)
             if (filters.category && filters.category.length > 0) newSearchParams.category = filters.category[0]; else delete newSearchParams.category;
            // 处理商品新旧筛选
             if (filters.condition_type && filters.condition_type.length > 0) newSearchParams.condition_type = filters.condition_type[0]; else delete newSearchParams.condition_type;
            // 处理地点搜索
             if (filters.location && filters.location.length > 0) newSearchParams.location = filters.location[0]; else delete newSearchParams.location;
             // 处理已售筛选
             if (filters.is_sold !== undefined && filters.is_sold.length > 0) newSearchParams.is_sold = filters.is_sold[0]; else delete newSearchParams.is_sold;
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
        onChange={handlePaginationChange}
      />

      {/* 状态更新模态框 */}
      <Modal
        title="更新商品状态"
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
              <Option value="active">活跃</Option>
              <Option value="reserved">预定</Option>
              <Option value="sold">已售</Option>
              <Option value="expired">过期</Option>
              <Option value="deleted">已删除</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagementPage; 
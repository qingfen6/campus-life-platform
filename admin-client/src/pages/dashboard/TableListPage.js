// 数据表列表页面
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Typography, Card, Input, Button, Space, Tag, 
  message, Spin, Alert, Modal, Tabs, Form, Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DatabaseOutlined, 
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { dbAPI } from '../../services/api';

const { Title, Text } = Typography;

const TableListPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableStructure, setTableStructure] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [addingRow, setAddingRow] = useState(false);
  const [form] = Form.useForm();
  const [primaryKey, setPrimaryKey] = useState(null);

  // 过滤后的表格数据
  const filteredTables = useMemo(() => {
    const filtered = tables.filter(table => {
      // 添加空值检查
      if (!table || !table.name) return false;
      return table.name.toLowerCase().includes((searchText || '').toLowerCase());
    });
    console.log('原始表格数据:', tables);
    console.log('过滤后表格数据:', filtered);
    return filtered;
  }, [tables, searchText]);

  // 加载表列表
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在获取数据库表列表...');
      
      const response = await dbAPI.getTables();
      console.log('获取表列表响应:', response);
      
      if (response.success) {
        // 调试打印
        console.log('获取表列表原始数据:', response.data.tables);
        
        // 将表数据转换为表格需要的格式
        const tablesList = response.data.tables.map((item, index) => {
          // 检查item是否为字符串或对象
          const tableName = typeof item === 'string' ? item : 
                           (item && item.table_name ? item.table_name : 
                            (item && item.TABLE_NAME ? item.TABLE_NAME : null));
          
          return {
            key: index,
            name: tableName
          };
        }).filter(item => item.name); // 过滤掉无效项
        
        console.log('处理后的表格数据:', tablesList);
        setTables(tablesList);
        console.log(`成功获取到 ${tablesList.length} 个有效表`);
        
        if (tablesList.length === 0) {
          setError('数据库中没有找到任何表。请确保数据库已正确初始化。');
        }
      } else {
        console.error('获取表列表失败:', response.message);
        setError(response.message || '获取表列表失败');
      }
    } catch (error) {
      console.error('获取表列表失败:', error);
      setError('获取表列表失败，请确保后端服务已启动');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取表列表
  useEffect(() => {
    fetchTables();
  }, []);

  // 查看表详情
  const handleViewTable = async (tableName) => {
    if (!tableName) {
      message.error('表名不能为空');
      return;
    }
    
    try {
      setSelectedTable(tableName);
      setDetailsLoading(true);
      setDetailsVisible(true);
      
      console.log(`正在获取表 ${tableName} 的结构...`);
      // 获取表结构
      const structureResponse = await dbAPI.getTableStructure(tableName);
      console.log('表结构响应:', structureResponse);
      
      if (structureResponse.success) {
        console.log('表结构数据:', structureResponse.data);
        
        // 确保表结构数据格式正确
        let formattedStructure = structureResponse.data;
        
        // 检查并格式化columns字段
        if (!formattedStructure || !formattedStructure.columns) {
          // 首先尝试直接获取列数据
          if (Array.isArray(structureResponse.data)) {
            // 后端直接返回了列数组
            formattedStructure = {
              columns: structureResponse.data,
              primaryKeys: []
            };
          } else if (typeof structureResponse.data === 'object') {
            // 尝试不同的属性名
            const possibleColumnsProps = ['columns', 'fields', 'COLUMNS', 'Fields', 'table_columns'];
            
            for (const prop of possibleColumnsProps) {
              if (structureResponse.data[prop] && Array.isArray(structureResponse.data[prop])) {
                formattedStructure = {
                  columns: structureResponse.data[prop],
                  primaryKeys: structureResponse.data.primaryKeys || []
                };
                console.log(`找到列数据在属性 ${prop}`);
                break;
              }
            }
            
            // 如果还没找到，检查可能的嵌套结构
            if (!formattedStructure.columns && structureResponse.data.data) {
              if (Array.isArray(structureResponse.data.data)) {
                formattedStructure = {
                  columns: structureResponse.data.data,
                  primaryKeys: []
                };
              } else {
                // 检查data对象中的可能属性
                for (const prop of possibleColumnsProps) {
                  if (structureResponse.data.data[prop] && Array.isArray(structureResponse.data.data[prop])) {
                    formattedStructure = {
                      columns: structureResponse.data.data[prop],
                      primaryKeys: structureResponse.data.data.primaryKeys || []
                    };
                    break;
                  }
                }
              }
            }
            
            // 如果还是没找到，尝试其他方法
            if (!formattedStructure.columns) {
              // 把对象中的所有数组属性作为可能的列数据
              const allArrayProps = Object.entries(structureResponse.data)
                .filter(([_, value]) => Array.isArray(value) && value.length > 0)
                .map(([key, value]) => ({ key, value }));
              
              if (allArrayProps.length > 0) {
                // 选择最可能是列数据的数组（第一个元素有column_name或name属性）
                const columnsArrayProp = allArrayProps.find(prop => 
                  prop.value[0] && (
                    prop.value[0].column_name || 
                    prop.value[0].name ||
                    prop.value[0].COLUMN_NAME ||
                    prop.value[0].Field
                  )
                ) || allArrayProps[0];
                
                formattedStructure = {
                  columns: columnsArrayProp.value,
                  primaryKeys: []
                };
                console.log(`使用属性 ${columnsArrayProp.key} 作为列数据`);
              } else {
                // 如果没有找到任何数组，创建一个基于对象键的列数组
                formattedStructure = {
                  columns: Object.keys(structureResponse.data).map(key => ({
                    column_name: key,
                    data_type: typeof structureResponse.data[key]
                  })),
                  primaryKeys: []
                };
              }
            }
          }
        }
        
        // 标准化列数据格式
        if (formattedStructure.columns && formattedStructure.columns.length > 0) {
          formattedStructure.columns = formattedStructure.columns.map(col => {
            // 处理不同的字段命名格式
            const normalizedCol = { ...col };
            
            // 字段名标准化
            if (!normalizedCol.column_name) {
              normalizedCol.column_name = 
                col.name || col.Field || col.COLUMN_NAME || col.field || '';
            }
            
            // 数据类型标准化
            if (!normalizedCol.column_type) {
              normalizedCol.column_type = 
                col.type || col.Type || col.DATA_TYPE || col.data_type || '';
            }
            
            // 可空标准化
            if (!normalizedCol.is_nullable) {
              normalizedCol.is_nullable = 
                col.nullable || col.Null || col.IS_NULLABLE || 
                (col.null === 'YES' ? 'YES' : 'NO');
            }
            
            // 键类型标准化
            if (!normalizedCol.column_key) {
              normalizedCol.column_key = 
                col.key || col.Key || col.COLUMN_KEY || '';
            }
            
            // 默认值标准化
            if (!normalizedCol.column_default && normalizedCol.column_default !== null) {
              normalizedCol.column_default = 
                col.default || col.Default || col.COLUMN_DEFAULT || null;
            }
            
            // 额外属性标准化
            if (!normalizedCol.extra) {
              normalizedCol.extra = 
                col.extra || col.Extra || col.EXTRA || '';
            }
            
            return normalizedCol;
          });
        }
        
        setTableStructure(formattedStructure);
        
        // 查找主键
        console.log('格式化后表结构数据:', formattedStructure);
        
        // 增强主键识别
        let primaryKeyField = null;
        
        // 1. 先尝试从primaryKeys数组中获取
        if (formattedStructure.primaryKeys && formattedStructure.primaryKeys.length > 0) {
          primaryKeyField = formattedStructure.primaryKeys[0];
          console.log(`从primaryKeys找到主键: ${primaryKeyField}`);
        } 
        // 2. 如果没有primaryKeys，尝试从columns中查找
        else if (formattedStructure.columns && formattedStructure.columns.length > 0) {
          // 查找column_key为PRI的列
          const primaryKeyColumn = formattedStructure.columns.find(col => 
            col.column_key === 'PRI' || 
            col.key === 'PRI' || 
            col.Column_key === 'PRI' || 
            col.COLUMN_KEY === 'PRI'
          );
          
          if (primaryKeyColumn) {
            // 获取主键字段名，考虑不同的字段名命名规范
            primaryKeyField = primaryKeyColumn.column_name || 
                             primaryKeyColumn.name || 
                             primaryKeyColumn.COLUMN_NAME || 
                             primaryKeyColumn.Column_name || 
                             primaryKeyColumn.field;
            console.log(`从column_key找到主键: ${primaryKeyField}`);
          }
        }
        
        // 3. 如果上述方法均未找到主键，尝试通过命名规则猜测
        if (!primaryKeyField && formattedStructure.columns && formattedStructure.columns.length > 0) {
          // 常见的主键命名模式：表名_id, id
          const tableSingular = tableName.replace(/s$/, ''); // 去掉复数形式
          const possiblePrimaryKeys = [
            `${tableName}_id`,
            `${tableSingular}_id`,
            'id'
          ];
          
          // 查找匹配的字段
          for (const keyName of possiblePrimaryKeys) {
            const keyColumn = formattedStructure.columns.find(col => {
              const colName = col.column_name || col.name || col.COLUMN_NAME || col.Column_name || col.field;
              return colName && colName.toLowerCase() === keyName.toLowerCase();
            });
            
            if (keyColumn) {
              const colName = keyColumn.column_name || keyColumn.name || keyColumn.COLUMN_NAME || keyColumn.Column_name || keyColumn.field;
              primaryKeyField = colName;
              console.log(`通过命名规则找到主键: ${primaryKeyField}`);
              break;
            }
          }
        }
        
        // 4. 最后尝试直接从用户提供的表名推断
        if (!primaryKeyField) {
          const tableSingular = tableName.replace(/s$/, ''); // 去掉复数形式
          primaryKeyField = `${tableSingular}_id`;
          console.log(`未找到主键，推断主键可能为: ${primaryKeyField}`);
        }
        
        setPrimaryKey(primaryKeyField);
        console.log(`表 ${tableName} 的主键已设置为: ${primaryKeyField}`);
      } else {
        console.error(`获取表 ${tableName} 结构失败:`, structureResponse);
        message.error(`获取表 ${tableName} 结构失败: ${structureResponse.message}`);
      }
      
      console.log(`正在获取表 ${tableName} 的数据...`);
      // 获取表数据
      const dataResponse = await dbAPI.getTableData(tableName, {
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      console.log('表数据响应:', dataResponse);
      
      if (dataResponse.success) {
        // 确保行数据是有效的数组
        let rows = Array.isArray(dataResponse.data.rows) ? dataResponse.data.rows : [];
        
        // 如果rows为空或不是数组，但有data.data属性，尝试使用它
        if ((!rows || rows.length === 0) && dataResponse.data.data && Array.isArray(dataResponse.data.data)) {
          rows = dataResponse.data.data;
        }
        
        // 处理行数据，确保每行有唯一标识
        const processedRows = rows.map((row, index) => {
          // 如果主键存在且该行有主键值，使用它作为key
          const rowWithKey = {...row};
          if (!rowWithKey.key && primaryKey && rowWithKey[primaryKey]) {
            rowWithKey.key = rowWithKey[primaryKey];
          } else if (!rowWithKey.key) {
            // 否则使用索引作为key
            rowWithKey.key = `row-${index}`;
          }
          return rowWithKey;
        });
        
        console.log('处理后的表格数据:', processedRows);
        setTableData(processedRows);
        
        // 获取总记录数
        const total = 
          (dataResponse.data.pagination && dataResponse.data.pagination.total) || 
          (dataResponse.data.total) || 
          processedRows.length;
        
        setPagination({
          ...pagination,
          total: total
        });
      } else {
        console.error(`获取表 ${tableName} 数据失败:`, dataResponse);
        message.error(`获取表 ${tableName} 数据失败: ${dataResponse.message}`);
      }
    } catch (error) {
      console.error('查看表详情失败:', error);
      message.error('查看表详情失败，请稍后重试');
    } finally {
      setDetailsLoading(false);
    }
  };

  // 表格页面变化
  const handleTableChange = async (newPagination) => {
    try {
      setDetailsLoading(true);
      setEditingRow(null); // 切换页面时取消编辑
      
      const dataResponse = await dbAPI.getTableData(selectedTable, {
        limit: newPagination.pageSize,
        offset: (newPagination.current - 1) * newPagination.pageSize
      });
      
      if (dataResponse.success) {
        setTableData(dataResponse.data.rows);
        setPagination({
          ...newPagination,
          total: dataResponse.data.pagination.total
        });
      } else {
        message.error(`获取表数据失败: ${dataResponse.message}`);
      }
    } catch (error) {
      console.error('获取表数据失败:', error);
      message.error('获取表数据失败，请稍后重试');
    } finally {
      setDetailsLoading(false);
    }
  };

  // 关闭详情弹窗
  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedTable(null);
    setTableData([]);
    setTableStructure(null);
    setPrimaryKey(null);
    setEditingRow(null);
    setAddingRow(false);
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0
    });
  };

  // 刷新表列表
  const handleRefresh = () => {
    fetchTables();
  };

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchText('');
  };

  // 开始编辑行
  const handleEditRow = (record) => {
    setEditingRow(record);
    form.setFieldsValue(record);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      if (!primaryKey) {
        message.error('未找到主键，无法更新数据');
        return;
      }
      
      const values = await form.validateFields();
      const primaryValue = editingRow[primaryKey];
      
      console.log(`保存行编辑, 表: ${selectedTable}, 主键: ${primaryKey}, 值: ${primaryValue}`);
      console.log('新数据:', values);
      
      const response = await dbAPI.updateRow(selectedTable, primaryKey, primaryValue, values);
      
      if (response.success) {
        message.success('数据更新成功');
        setEditingRow(null);
        
        // 重新加载数据
        handleTableChange(pagination);
      } else {
        message.error(`更新失败: ${response.message}`);
      }
    } catch (error) {
      console.error('保存编辑失败:', error);
      message.error('表单验证失败或保存过程中出错');
    }
  };

  // 开始添加新行
  const handleAddRow = () => {
    setAddingRow(true);
    form.resetFields();
  };

  // 取消添加
  const handleCancelAdd = () => {
    setAddingRow(false);
  };

  // 保存新行
  const handleSaveAdd = async () => {
    try {
      const values = await form.validateFields();
      
      console.log(`添加新行, 表: ${selectedTable}`);
      console.log('新数据:', values);
      
      // 针对活动表特殊处理
      if (selectedTable === 'activities') {
        if (!values.start_time || !values.end_time) {
          message.error('开始时间和结束时间是必填项!');
          return;
        }
        
        // 确保日期格式是MySQL可接受的格式 (YYYY-MM-DD HH:MM:SS)
        try {
          // 处理开始时间
          if (values.start_time) {
            const startDate = new Date(values.start_time);
            values.start_time = startDate.toISOString().slice(0, 19).replace('T', ' ');
          }
          
          // 处理结束时间
          if (values.end_time) {
            const endDate = new Date(values.end_time);
            values.end_time = endDate.toISOString().slice(0, 19).replace('T', ' ');
          }
          
          // 处理注册截止时间
          if (values.registration_deadline) {
            const regDate = new Date(values.registration_deadline);
            values.registration_deadline = regDate.toISOString().slice(0, 19).replace('T', ' ');
          }
        } catch (error) {
          console.error('日期格式转换错误:', error);
          message.error('日期格式错误，请使用YYYY-MM-DD HH:MM:SS格式');
          return;
        }
      }
      
      // 预处理数据
      const processedData = {};
      for (const key in values) {
        // 过滤掉空字符串
        if (values[key] !== '') {
          processedData[key] = values[key];
        }
      }
      
      console.log('处理后准备提交的数据:', processedData);
      const response = await dbAPI.insertRow(selectedTable, processedData);
      
      if (response.success) {
        message.success('数据添加成功');
        setAddingRow(false);
        
        // 重新加载数据
        handleTableChange(pagination);
      } else {
        message.error(`添加失败: ${response.message}`);
      }
    } catch (error) {
      console.error('保存新行失败:', error);
      message.error('表单验证失败或保存过程中出错');
    }
  };

  // 删除行
  const handleDeleteRow = async (record) => {
    try {
      if (!primaryKey) {
        message.error('未找到主键，无法删除数据');
        return;
      }
      
      const primaryValue = record[primaryKey];
      
      console.log(`删除行, 表: ${selectedTable}, 主键: ${primaryKey}, 值: ${primaryValue}`);
      
      const response = await dbAPI.deleteRow(selectedTable, primaryKey, primaryValue);
      
      if (response.success) {
        message.success('数据删除成功');
        
        // 重新加载数据
        handleTableChange(pagination);
      } else {
        message.error(`删除失败: ${response.message}`);
      }
    } catch (error) {
      console.error('删除行失败:', error);
      message.error('删除过程中出错');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => handleViewTable(record.name)}
        >
          查看
        </Button>
      ),
    },
  ];

  // 生成表结构列
  const generateStructureColumns = () => {
    if (!tableStructure) return [];
    
    return [
      {
        title: '字段名',
        dataIndex: 'column_name',
        key: 'column_name',
        width: 150,
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: '数据类型',
        dataIndex: 'column_type',
        key: 'column_type',
        width: 150,
      },
      {
        title: '可为空',
        dataIndex: 'is_nullable',
        key: 'is_nullable',
        width: 100,
        render: (text) => (
          text === 'YES' ? 
            <Tag color="green">是</Tag> : 
            <Tag color="red">否</Tag>
        )
      },
      {
        title: '键类型',
        dataIndex: 'column_key',
        key: 'column_key',
        width: 100,
        render: (text) => {
          if (text === 'PRI') return <Tag color="red">主键</Tag>;
          if (text === 'UNI') return <Tag color="orange">唯一键</Tag>;
          if (text === 'MUL') return <Tag color="blue">索引</Tag>;
          return <Tag color="default">-</Tag>;
        }
      },
      {
        title: '默认值',
        dataIndex: 'column_default',
        key: 'column_default',
        width: 150,
        render: (text) => text || <Text type="secondary">NULL</Text>
      },
      {
        title: '额外属性',
        dataIndex: 'extra',
        key: 'extra',
        width: 150,
      },
    ];
  };

  // 生成表数据列
  const generateDataColumns = () => {
    if (!tableData || tableData.length === 0) return [];
    
    // 从第一条数据获取所有字段
    const firstRecord = tableData[0];
    const dataColumns = Object.keys(firstRecord).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      editable: true,
      render: (text, record) => {
        const isEditing = editingRow && record === editingRow;
        // 如果当前行在编辑中，显示输入框
        if (isEditing) {
          return (
            <Form.Item
              name={key}
              style={{ margin: 0 }}
              rules={[
                {
                  required: key === primaryKey,
                  message: `${key}不能为空!`,
                },
              ]}
            >
              <Input />
            </Form.Item>
          );
        }
        
        // 处理不同类型的数据
        if (text === null) return <Text type="secondary">NULL</Text>;
        if (typeof text === 'object') return <Text code>{JSON.stringify(text)}</Text>;
        return String(text);
      }
    }));
    
    // 添加操作列
    dataColumns.push({
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const isEditing = editingRow && record === editingRow;
        return isEditing ? (
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              size="small"
              onClick={handleSaveEdit}
            >
              保存
            </Button>
            <Button 
              size="small"
              onClick={handleCancelEdit}
            >
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditRow(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除这条数据吗?"
              onConfirm={() => handleDeleteRow(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="primary" 
                danger
                icon={<DeleteOutlined />} 
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    });
    
    return dataColumns;
  };

  // 渲染表详情弹窗中的表单项
  const renderFormItems = () => {
    if (!tableStructure || !tableStructure.columns || tableStructure.columns.length === 0) {
      return null;
    }
    
    // 根据表类型生成不同的表单项
    return tableStructure.columns.map(column => {
      // 主键自增字段可以不填
      if (column.column_name === primaryKey && column.extra && column.extra.includes('auto_increment')) {
        return null;
      }
      
      // 字段特殊处理
      let formItem = null;
      const columnName = column.column_name;
      const colType = (column.column_type || '').toLowerCase();
      
      // 检查字段是否必填
      const isRequired = column.is_nullable === 'NO' && 
                         column.column_key !== 'PRI' && 
                         !column.column_default;
      
      // 对日期时间类型的特殊处理
      if (colType.includes('datetime') || colType.includes('timestamp')) {
        formItem = (
          <Form.Item
            key={columnName || `column-${Math.random()}`}
            name={columnName}
            label={columnName}
            rules={[{ required: isRequired, message: `${columnName}不能为空!` }]}
          >
            <Input type="datetime-local" placeholder={`输入${columnName}`} />
          </Form.Item>
        );
      }
      // 对日期类型的特殊处理
      else if (colType.includes('date')) {
        formItem = (
          <Form.Item
            key={columnName || `column-${Math.random()}`}
            name={columnName}
            label={columnName}
            rules={[{ required: isRequired, message: `${columnName}不能为空!` }]}
          >
            <Input type="date" placeholder={`输入${columnName}`} />
          </Form.Item>
        );
      }
      // 对枚举类型的特殊处理
      else if (colType.includes('enum')) {
        // 提取枚举值选项
        const enumOptions = colType.match(/'([^']+)'/g).map(option => 
          option.replace(/'/g, '')
        );
        
        formItem = (
          <Form.Item
            key={columnName || `column-${Math.random()}`}
            name={columnName}
            label={columnName}
            rules={[{ required: isRequired, message: `${columnName}不能为空!` }]}
          >
            <select style={{ width: '100%', padding: '8px', borderRadius: '2px' }}>
              <option value="">请选择{columnName}</option>
              {enumOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Form.Item>
        );
      }
      // 对文本域的特殊处理
      else if (colType.includes('text')) {
        formItem = (
          <Form.Item
            key={columnName || `column-${Math.random()}`}
            name={columnName}
            label={columnName}
            rules={[{ required: isRequired, message: `${columnName}不能为空!` }]}
          >
            <Input.TextArea rows={4} placeholder={`输入${columnName}`} />
          </Form.Item>
        );
      }
      // 默认输入框
      else {
        formItem = (
          <Form.Item
            key={columnName || `column-${Math.random()}`}
            name={columnName}
            label={columnName}
            rules={[{ required: isRequired, message: `${columnName}不能为空!` }]}
          >
            <Input placeholder={`输入${columnName}`} />
          </Form.Item>
        );
      }
      
      return formItem;
    }).filter(Boolean); // 过滤掉null项
  };

  // 生成新行表单
  const renderAddRowForm = () => {
    if (!tableStructure || !tableStructure.columns || tableStructure.columns.length === 0) {
      return null;
    }
    
    // activities表特殊处理 - 预先设置默认值
    if (selectedTable === 'activities') {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const defaultValues = {
        title: '',
        description: '',
        organizer_type: 'school',
        organizer_id: 1,
        location: '校内',
        start_time: now.toISOString().slice(0, 16).replace('T', ' '),
        end_time: tomorrow.toISOString().slice(0, 16).replace('T', ' '),
        max_participants: 100,
        current_participants: 0,
        status: 'upcoming',
        visibility: 'public'
      };
      
      // 设置表单默认值
      form.setFieldsValue(defaultValues);
    }
    
    return (
      <Card title="添加新数据" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          {renderFormItems()}
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSaveAdd}>
                保存
              </Button>
              <Button onClick={handleCancelAdd}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  return (
    <>
      <Title level={2}>数据表查询</Title>
      
      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索表名"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 200 }}
            allowClear
            onPressEnter={handleClearSearch}
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Space>
        
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredTables}
            pagination={{ pageSize: 10 }}
            rowKey="key"
            size="middle"
            locale={{ emptyText: '没有找到数据表' }}
          />
        </Spin>
      </Card>
      
      {/* 表详情弹窗 */}
      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            <span>表 {selectedTable} 详情</span>
          </Space>
        }
        open={detailsVisible}
        onCancel={handleCloseDetails}
        width={1000}
        footer={[
          <Button key="close" onClick={handleCloseDetails}>
            关闭
          </Button>
        ]}
      >
        <Spin spinning={detailsLoading}>
          <Tabs 
            defaultActiveKey="data"
            items={[
              {
                key: 'data',
                label: '数据',
                children: (
                  <>
                    {!addingRow && (
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                        onClick={handleAddRow}
                      >
                        添加数据
                      </Button>
                    )}
                    
                    {addingRow && renderAddRowForm()}
                    
                    <Form form={form} component={false}>
                      <Table
                        columns={generateDataColumns()}
                        dataSource={tableData.map((item, index) => ({...item, tableRowKey: index}))}
                        rowKey="tableRowKey"
                        pagination={pagination}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                        size="small"
                        locale={{ emptyText: '表中没有数据' }}
                      />
                    </Form>
                  </>
                )
              },
              {
                key: 'structure',
                label: '结构',
                children: (
                  <Table
                    columns={generateStructureColumns()}
                    dataSource={tableStructure?.columns?.map((col, index) => ({...col, structureKey: index})) || []}
                    rowKey="structureKey"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: '无法获取表结构' }}
                  />
                )
              }
            ]}
          />
        </Spin>
      </Modal>
    </>
  );
};

export default TableListPage; 
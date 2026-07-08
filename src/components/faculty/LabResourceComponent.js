/**
 * 实验室资源组件
 * 
 * 功能：
 * - 展示学院实验室资源
 * - 展示实验室设备和用途
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { Row, Col, Typography, Card, Tag, Button, List, Modal, Form, Input, message, Select, Divider } from 'antd';
import { EditOutlined, SaveOutlined, ExperimentOutlined, ToolOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 模拟实验室数据
const INITIAL_LABS = [
  {
    id: 1,
    name: '人工智能与机器学习实验室',
    image: 'https://picsum.photos/400/270',
    description: '本实验室专注于人工智能算法研究和应用开发，配备高性能GPU服务器集群，支持深度学习、计算机视觉、自然语言处理等研究方向。为本科生和研究生提供实践平台，承担国家和企业合作项目。',
    director: '张教授',
    location: '计算机学院A栋3楼',
    area: '300平方米',
    establishment: '2015年',
    equipment: [
      { name: 'NVIDIA DGX A100服务器', count: 2, usage: '深度学习模型训练' },
      { name: 'GPU工作站', count: 10, usage: '算法开发和测试' },
      { name: '高性能计算集群', count: 1, usage: '大规模数据处理' },
      { name: '智能机器人平台', count: 5, usage: '机器人控制算法研究' }
    ],
    tags: ['人工智能', '深度学习', '高性能计算']
  },
  {
    id: 2,
    name: '软件工程实验室',
    image: 'https://picsum.photos/400/271',
    description: '本实验室面向软件开发过程和方法研究，提供完整的软件开发环境和测试平台。支持敏捷开发、DevOps实践，为软件工程专业学生提供项目实践场所，同时承担企业合作项目和软件质量评估工作。',
    director: '王副教授',
    location: '计算机学院B栋2楼',
    area: '250平方米',
    establishment: '2010年',
    equipment: [
      { name: '软件开发工作站', count: 30, usage: '软件开发实践' },
      { name: '自动化测试平台', count: 2, usage: '软件测试' },
      { name: '持续集成服务器', count: 3, usage: 'CI/CD环境' },
      { name: '移动设备测试架', count: 1, usage: '移动应用测试' }
    ],
    tags: ['软件工程', '敏捷开发', '测试']
  },
  {
    id: 3,
    name: '网络与信息安全实验室',
    image: 'https://picsum.photos/400/272',
    description: '本实验室专注于网络安全、密码学和信息安全研究，配备网络攻防环境和安全测试设备。开展安全协议研究、漏洞分析、密码算法设计等工作，为网络安全专业学生提供专业实践场所。',
    director: '刘讲师',
    location: '计算机学院A栋4楼',
    area: '200平方米',
    establishment: '2018年',
    equipment: [
      { name: '网络安全测试平台', count: 2, usage: '网络攻防演练' },
      { name: '安全服务器', count: 5, usage: '安全算法研究' },
      { name: '漏洞扫描系统', count: 3, usage: '系统安全测试' },
      { name: '硬件安全分析设备', count: 2, usage: '硬件安全研究' }
    ],
    tags: ['网络安全', '密码学', '信息安全']
  },
  {
    id: 4,
    name: '大数据与云计算实验室',
    image: 'https://picsum.photos/400/273',
    description: '本实验室致力于大数据处理技术和云计算架构研究，配备分布式计算集群和数据分析平台。支持海量数据处理、分布式计算框架开发、云服务架构设计等研究方向，为相关专业学生提供实践环境。',
    director: '李教授',
    location: '计算机学院C栋1楼',
    area: '280平方米',
    establishment: '2017年',
    equipment: [
      { name: 'Hadoop集群', count: 1, usage: '大数据处理' },
      { name: '高性能服务器', count: 15, usage: '分布式计算' },
      { name: '数据存储阵列', count: 2, usage: '大容量数据存储' },
      { name: '数据可视化系统', count: 3, usage: '数据分析与展示' }
    ],
    tags: ['大数据', '云计算', '分布式系统']
  }
];

/**
 * 实验室资源组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 实验室资源组件
 */
const LabResourceComponent = ({ isEditMode }) => {
  const [labs, setLabs] = useState(INITIAL_LABS);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditLab, setCurrentEditLab] = useState(null);
  const [form] = Form.useForm();
  
  // 打开编辑模态框
  const showEditModal = (lab) => {
    setCurrentEditLab(lab);
    form.resetFields();
    
    if (lab) {
      // 编辑现有实验室
      form.setFieldsValue({
        ...lab,
        tags: lab.tags,
        equipment: lab.equipment
      });
    }
    
    setEditModalVisible(true);
  };
  
  // 关闭编辑模态框
  const handleCancel = () => {
    setEditModalVisible(false);
  };
  
  // 保存编辑内容
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        let newLabs = [...labs];
        
        if (currentEditLab) {
          // 更新现有实验室
          const index = newLabs.findIndex(l => l.id === currentEditLab.id);
          if (index > -1) {
            newLabs[index] = { ...newLabs[index], ...values };
            setLabs(newLabs);
            message.success('实验室信息已更新');
          }
        } else {
          // 添加新实验室
          const newId = Math.max(0, ...newLabs.map(l => l.id)) + 1;
          newLabs.push({ ...values, id: newId });
          setLabs(newLabs);
          message.success('实验室信息已添加');
        }
        
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  return (
    <div className="lab-resource-component">
      {/* 添加按钮（仅编辑模式可见） */}
      {isEditMode && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal(null)}
          >
            添加实验室
          </Button>
        </div>
      )}
      
      {/* 实验室列表 */}
      <Row gutter={[16, 16]}>
        {labs.map(lab => (
          <Col xs={24} md={12} key={lab.id}>
            <Card 
              className="lab-card"
              cover={
                <div className="lab-image">
                  <img alt={lab.name} src={lab.image} />
                </div>
              }
              actions={isEditMode ? [
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(lab)}
                >
                  编辑
                </Button>
              ] : []}
            >
              <Card.Meta
                title={<Title level={4}>{lab.name}</Title>}
                description={
                  <div className="lab-info">
                    <Paragraph ellipsis={{ rows: 3 }}>{lab.description}</Paragraph>
                    <p><strong>负责人：</strong>{lab.director}</p>
                    <p><strong>位置：</strong>{lab.location}</p>
                    <p><strong>面积：</strong>{lab.area}</p>
                    <p><strong>成立时间：</strong>{lab.establishment}</p>
                    
                    <Divider orientation="left">主要设备</Divider>
                    <List
                      size="small"
                      className="equipment-list"
                      dataSource={lab.equipment}
                      renderItem={item => (
                        <List.Item>
                          <div className="equipment-item">
                            <ToolOutlined className="equipment-icon" />
                            <span>{item.name} × {item.count}</span>
                            <span style={{ marginLeft: 8, color: 'rgba(0, 0, 0, 0.45)' }}>{item.usage}</span>
                          </div>
                        </List.Item>
                      )}
                    />
                    
                    <div style={{ marginTop: 16 }}>
                      {lab.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* 编辑模态框 */}
      <Modal
        title={`${currentEditLab ? '编辑' : '添加'}实验室信息`}
        open={editModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="实验室名称"
            rules={[{ required: true, message: '请输入实验室名称' }]}
          >
            <Input placeholder="请输入实验室名称" />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="实验室图片URL"
          >
            <Input placeholder="请输入实验室图片URL" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="实验室简介"
            rules={[{ required: true, message: '请输入实验室简介' }]}
          >
            <TextArea rows={4} placeholder="请输入实验室简介" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="director"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入位置" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area"
                label="面积"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <Input placeholder="请输入面积，如：200平方米" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="establishment"
                label="成立时间"
                rules={[{ required: true, message: '请输入成立时间' }]}
              >
                <Input placeholder="请输入成立时间，如：2015年" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Select mode="tags" placeholder="请输入标签，按Enter键确认">
              <Option value="人工智能">人工智能</Option>
              <Option value="深度学习">深度学习</Option>
              <Option value="软件工程">软件工程</Option>
              <Option value="网络安全">网络安全</Option>
              <Option value="大数据">大数据</Option>
              <Option value="云计算">云计算</Option>
            </Select>
          </Form.Item>
          
          {/* 简化版的设备编辑，实际项目中可能需要更复杂的表单 */}
          <Divider orientation="left">主要设备</Divider>
          <Form.List name="equipment">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Row key={field.key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        fieldKey={[field.fieldKey, 'name']}
                        rules={[{ required: true, message: '请输入设备名称' }]}
                        noStyle
                      >
                        <Input placeholder="设备名称" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'count']}
                        fieldKey={[field.fieldKey, 'count']}
                        rules={[{ required: true, message: '请输入数量' }]}
                        noStyle
                      >
                        <Input placeholder="数量" type="number" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'usage']}
                        fieldKey={[field.fieldKey, 'usage']}
                        rules={[{ required: true, message: '请输入用途' }]}
                        noStyle
                      >
                        <Input placeholder="用途" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    添加设备
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default LabResourceComponent; 
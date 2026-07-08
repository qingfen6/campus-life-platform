/**
 * 发布商品模态框组件
 * 
 * 功能：
 * - 展示商品发布表单
 * - 支持商品图片上传
 * - 提供表单验证
 * - 支持商品详细信息填写
 */
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, InputNumber, Select, 
  Button, Upload, Row, Col, Switch, message, Tag
} from 'antd';
import { 
  PlusOutlined, TagOutlined, ShoppingOutlined, CloseOutlined
} from '@ant-design/icons';
import '../../assets/styles/AddProductModal.css';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 发布商品模态框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 是否可见
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSubmit - 提交回调
 * @param {Array} props.categories - 商品分类列表
 * @param {boolean} props.loading - 加载状态
 * @returns {JSX.Element} 发布商品模态框
 */
const AddProductModal = ({ visible, onClose, onSubmit, categories = [], loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef(null);

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setTags([]);
    }
  }, [visible, form]);

  // 当标签输入框可见时，自动聚焦
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // 处理图片上传变化
  const handleUploadChange = ({ fileList }) => setFileList(fileList);
  
  // 上传前检查
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片必须小于5MB!');
    }
    
    return isImage && isLt5M;
  };

  // 处理图片预览
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // 转换文件为base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // 上传按钮
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 检查是否有图片上传
      if (fileList.length === 0) {
        message.error('请上传至少一张商品图片');
        return;
      }
      
      // 创建FormData对象
      const formData = new FormData();
      
      // 添加表单字段 - 确保字段名与后端匹配
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('category', values.category);
      formData.append('condition', values.condition);
      
      if (values.original_price) {
        formData.append('originalPrice', values.original_price);
      }
      
      if (values.location) {
        formData.append('location', values.location);
      }
      
      // 将is_negotiable转换为negotiable字段
      formData.append('negotiable', values.is_negotiable ? 'true' : 'false');
      
      // 添加图片到表单
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append(`files`, file.originFileObj);  // 统一使用files字段
        }
      });
      
      // 添加标签到表单（转换为JSON字符串）
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      // 调用提交回调
      onSubmit(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理关闭标签
  const handleClose = (removedTag) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  // 显示标签输入框
  const showInput = () => {
    setInputVisible(true);
  };

  // 处理标签输入变化
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理标签输入确认
  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <TagOutlined className="modal-icon" />
          <span>发布新商品</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="product-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          condition: 'good',
          category: categories[0]?.value || 'electronics',
          is_negotiable: true
        }}
      >
        <Form.Item
          name="title"
          label="商品标题"
          rules={[{ required: true, message: '请输入商品标题' }]}
        >
          <Input placeholder="简短描述您的商品" maxLength={100} showCount />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="商品描述"
          rules={[{ required: true, message: '请详细描述您的商品' }]}
        >
          <TextArea 
            placeholder="详细描述商品的品牌、使用情况、购买日期等信息" 
            autoSize={{ minRows: 3, maxRows: 6 }} 
            maxLength={500} 
            showCount 
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="商品分类"
            >
              <Select placeholder="选择商品分类">
                <Option value="">无</Option>
                {categories && categories.filter(cat => cat.value !== '全部商品').map(cat => (
                  <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                ))}
                {(!categories || categories.length <= 1) && (
                  <>
                    <Option value="电子产品">电子产品</Option>
                    <Option value="图书教材">图书教材</Option>
                    <Option value="服饰鞋包">服饰鞋包</Option>
                    <Option value="运动户外">运动户外</Option>
                    <Option value="美妆护肤">美妆护肤</Option>
                    <Option value="生活用品">日常用品</Option>
                    <Option value="其他">其他</Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="condition"
              label="商品成色"
              rules={[{ required: true, message: '请选择商品成色' }]}
            >
              <Select placeholder="选择商品成色">
                <Option value="new">全新</Option>
                <Option value="like_new">几乎全新</Option>
                <Option value="good">良好</Option>
                <Option value="fair">较旧</Option>
                <Option value="poor">旧</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="价格(元)"
              rules={[{ required: true, message: '请设置商品价格' }]}
            >
              <InputNumber 
                min={1} 
                max={9999} 
                style={{ width: '100%' }} 
                placeholder="设置合理的价格"
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="original_price"
              label="原价(元)"
            >
              <InputNumber 
                min={1} 
                max={9999} 
                style={{ width: '100%' }} 
                placeholder="商品原价(选填)"
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="location"
          label="交易地点"
          rules={[{ required: true, message: '请输入交易地点' }]}
        >
          <Input 
            placeholder="如：图书馆旁、9号宿舍楼下等" 
          />
        </Form.Item>
        
        <Form.Item
          label="商品标签"
          extra="添加标签帮助买家更快找到您的商品"
        >
          <div className="product-tags">
            {tags.map((tag, index) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleClose(tag)}
                style={{ marginBottom: 8 }}
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                ref={inputRef}
                type="text"
                size="small"
                style={{ width: 78, marginRight: 8, marginBottom: 8 }}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
              />
            ) : (
              <Tag 
                onClick={showInput} 
                style={{ borderStyle: 'dashed', marginBottom: 8, cursor: 'pointer' }}
              >
                <PlusOutlined /> 添加标签
              </Tag>
            )}
          </div>
        </Form.Item>

        <Form.Item
          name="is_negotiable"
          label="是否可议价"
          valuePropName="checked"
        >
          <Switch checkedChildren="可议价" unCheckedChildren="不可议价" defaultChecked />
        </Form.Item>
        
        <Form.Item
          name="images"
          label="商品图片"
          rules={[{ required: true, message: '请上传至少一张商品图片' }]}
          extra="最多上传5张图片，第一张将作为封面"
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            multiple
            maxCount={5}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
        </Form.Item>
        
        <Modal 
          open={previewVisible} 
          footer={null} 
          onCancel={() => setPreviewVisible(false)}
          className="preview-modal"
        >
          <img alt="预览图片" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        
        <Form.Item className="form-footer">
          <Button type="default" onClick={onClose} className="cancel-btn">
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading} className="submit-btn">
            发布商品
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductModal; 
/**
 * 发布动态模态框组件
 * 
 * 功能：
 * - 展示动态发布表单
 * - 支持文本内容编辑
 * - 支持媒体（图片/视频）上传
 * - 设置动态可见性
 * - 添加位置信息
 * - 添加标签
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, Form, Input, Select, Button, Upload, 
  Tag, Space, message, Tooltip, Radio 
} from 'antd';
import { 
  PlusOutlined, 
  SendOutlined, 
  PictureOutlined, 
  VideoCameraOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  TagOutlined
} from '@ant-design/icons';
import '../../assets/styles/AddPostModal.css';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 发布动态模态框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 是否可见
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSubmit - 提交回调
 * @param {boolean} props.loading - 加载状态
 * @returns {JSX.Element} 发布动态模态框
 */
const AddPostModal = ({ visible, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const [contentLength, setContentLength] = useState(0);
  const maxContentLength = 1000;

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setTags([]);
      setContentLength(0);
    }
  }, [visible, form]);

  // 标签输入框自动聚焦
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // 处理内容变化
  const handleContentChange = (e) => {
    setContentLength(e.target.value.length);
  };

  // 处理媒体上传变化
  const handleUploadChange = ({ fileList }) => setFileList(fileList);
  
  // 上传前检查文件类型和大小
  const beforeUpload = (file) => {
    const isMediaFile = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isMediaFile) {
      message.error('只能上传图片或视频文件!');
      return false;
    }
    
    // 图片限制5MB，视频限制20MB
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    
    if (file.size > maxSize) {
      message.error(`${isImage ? '图片' : '视频'}大小不能超过${isImage ? '5MB' : '20MB'}!`);
      return false;
    }
    
    return true;
  };

  // 处理文件预览
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
      <div style={{ marginTop: 8 }}>上传图片/视频</div>
    </div>
  );

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.content && fileList.length === 0) {
        message.error('请输入内容或上传媒体文件');
        return;
      }
      
      // 创建FormData对象
      const formData = new FormData();
      
      // 添加表单字段
      formData.append('content', values.content);
      formData.append('post_type', values.post_type || 'general');
      formData.append('visibility', values.visibility || 'public');
      
      if (values.location) {
        formData.append('location', values.location);
      }
      
      // 添加标签
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      // 添加媒体文件
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });
      
      // 提交表单
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
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <SendOutlined className="modal-icon" />
          <span>发布动态</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="post-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          post_type: 'general',
          visibility: 'public'
        }}
      >
        <Form.Item
          name="content"
          rules={[
            { max: maxContentLength, message: `内容不能超过${maxContentLength}字` }
          ]}
        >
          <TextArea 
            placeholder="分享你的想法..." 
            autoSize={{ minRows: 4, maxRows: 8 }} 
            maxLength={maxContentLength}
            onChange={handleContentChange}
            className="post-textarea"
          />
        </Form.Item>
        
        <div className="content-length-indicator">
          <span className={contentLength > maxContentLength * 0.8 ? "content-length-warning" : ""}>
            {contentLength}/{maxContentLength}
          </span>
        </div>
        
        <Form.Item
          name="media"
          label="媒体文件"
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            multiple
            accept="image/*,video/*"
            maxCount={9}
          >
            {fileList.length >= 9 ? null : uploadButton}
          </Upload>
        </Form.Item>
        
        <Modal 
          open={previewVisible} 
          footer={null} 
          onCancel={() => setPreviewVisible(false)}
          className="preview-modal"
        >
          <img alt="预览" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        
        <div className="post-options">
          <Space wrap>
            <Form.Item name="post_type" className="inline-form-item" noStyle>
              <Select style={{ width: 120 }}>
                <Option value="general">普通动态</Option>
                <Option value="question">提问</Option>
                <Option value="activity">活动</Option>
                <Option value="resource">资源</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="visibility" className="inline-form-item" noStyle>
              <Radio.Group buttonStyle="solid">
                <Tooltip title="所有人可见">
                  <Radio.Button value="public"><EyeOutlined /> 公开</Radio.Button>
                </Tooltip>
                <Tooltip title="仅本校用户可见">
                  <Radio.Button value="school"><EyeOutlined /> 校内</Radio.Button>
                </Tooltip>
                <Tooltip title="仅关注者可见">
                  <Radio.Button value="followers"><EyeOutlined /> 关注者</Radio.Button>
                </Tooltip>
              </Radio.Group>
            </Form.Item>
          </Space>
        </div>
        
        <div className="post-additional">
          <Space className="post-tags-container">
            <TagOutlined />
            <div className="post-tags">
              {tags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleClose(tag)}
                >
                  {tag}
                </Tag>
              ))}
              {inputVisible ? (
                <Input
                  ref={inputRef}
                  type="text"
                  size="small"
                  style={{ width: 78 }}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  maxLength={20}
                />
              ) : (
                <Tag onClick={showInput} className="tag-plus">
                  <PlusOutlined /> 添加标签
                </Tag>
              )}
            </div>
          </Space>
          
          <Form.Item name="location" noStyle>
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="添加位置" 
              className="location-input"
              maxLength={50}
            />
          </Form.Item>
        </div>
        
        <Form.Item className="form-footer">
          <Button type="default" onClick={onClose} className="cancel-btn">
            取消
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={loading} 
            className="submit-btn"
            icon={<SendOutlined />}
          >
            发布
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPostModal; 
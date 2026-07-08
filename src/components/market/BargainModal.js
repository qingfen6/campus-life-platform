import React from 'react';
import { Modal, Form, InputNumber, Input, Button, Slider, Divider } from 'antd';
import { ScissorOutlined, TagOutlined } from '@ant-design/icons';

/**
 * 砍价模态框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 是否显示模态框
 * @param {Function} props.onClose - 关闭模态框的回调函数
 * @param {Function} props.onSubmit - 提交砍价的回调函数
 * @param {Object} props.product - 商品信息
 * @param {boolean} props.loading - 加载状态
 */
const BargainModal = ({ visible, onClose, onSubmit, product, loading }) => {
  const [form] = Form.useForm();
  
  // 当商品信息改变时，重新初始化表单
  React.useEffect(() => {
    if (product && visible) {
      // 默认砍价为商品价格的85%
      const suggestedPrice = Math.floor(product.price * 0.85);
      form.setFieldsValue({
        price: suggestedPrice,
        message: ''
      });
    }
  }, [product, visible, form]);
  
  // 处理取消操作
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
  
  // 处理提交操作
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.price, values.message);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 价格变化处理函数
  const handlePriceChange = (value) => {
    form.setFieldsValue({ price: value });
  };
  
  // 价格提示格式化函数
  const priceFormatter = (value) => {
    return `¥ ${value}`;
  };
  
  if (!product) return null;
  
  // 计算价格区间
  const minPrice = Math.floor(product.price * 0.5); // 最低砍到5折
  const maxPrice = Math.floor(product.price * 0.95); // 最高砍到95折
  
  return (
    <Modal
      title={
        <div className="bargain-modal-title">
          <ScissorOutlined className="bargain-icon" />
          <span>商品砍价</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={420}
      className="bargain-modal"
      destroyOnClose
    >
      <div className="bargain-product-info">
        <div className="bargain-product-image">
          <img 
            src={product.image_url || 'https://via.placeholder.com/100x100?text=No+Image'} 
            alt={product.title}
          />
        </div>
        <div className="bargain-product-details">
          <h3 className="bargain-product-title">{product.title}</h3>
          <div className="bargain-product-price">
            <span className="current-price">¥ {product.price}</span>
            {product.original_price && (
              <span className="original-price">¥ {product.original_price}</span>
            )}
          </div>
          <div className="bargain-product-location">
            <TagOutlined /> {product.location || '未知地点'}
          </div>
        </div>
      </div>
      
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          price: Math.floor(product?.price * 0.85) || 0,
          message: ''
        }}
      >
        <Form.Item
          name="price"
          label="您的砍价"
          rules={[
            { required: true, message: '请输入您的砍价金额' },
            { 
              validator: (_, value) => {
                if (value && value >= product.price) {
                  return Promise.reject(new Error('砍价必须低于原价'));
                }
                if (value && value < minPrice) {
                  return Promise.reject(new Error(`砍价不能低于¥${minPrice}`));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber
            min={minPrice}
            max={maxPrice}
            formatter={value => `¥ ${value}`}
            parser={value => value.replace(/¥\s?/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <div className="price-slider">
          <Slider
            min={minPrice}
            max={maxPrice}
            onChange={handlePriceChange}
            value={form.getFieldValue('price')}
            tipFormatter={priceFormatter}
          />
          <div className="price-range">
            <span>最低 ¥{minPrice}</span>
            <span>原价 ¥{product.price}</span>
          </div>
        </div>
        
        <Form.Item
          name="message"
          label="砍价留言 (选填)"
        >
          <Input.TextArea
            placeholder="说明您的砍价理由，增加成功几率..."
            rows={3}
            maxLength={100}
            showCount
          />
        </Form.Item>
        
        <div className="bargain-form-footer">
          <Button onClick={handleCancel}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            提交砍价
          </Button>
        </div>
      </Form>
      
      <div className="bargain-tips">
        <h4>砍价小贴士</h4>
        <ul>
          <li>诚意出价，提高成功率</li>
          <li>尽量说明理由，容易获得卖家同意</li>
          <li>议价成功后请及时联系卖家，尽快交易</li>
        </ul>
      </div>
    </Modal>
  );
};

export default BargainModal; 
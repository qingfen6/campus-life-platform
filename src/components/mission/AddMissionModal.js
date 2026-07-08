import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Radio, Row, Col, Button, message } from 'antd';
import { RocketOutlined, EnvironmentOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const AddMissionModal = ({ visible, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();

  // 在模态框关闭时重置表单
  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = async (values) => {
    try {
      // 处理日期格式
      const formattedValues = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD HH:mm:ss') : null
      };
      onSubmit(formattedValues); // 调用外部传入的 onSubmit 函数
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
      message.error('请检查表单输入项!');
    }
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <RocketOutlined className="modal-icon" />
          <span>发布新任务</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="mission-modal" // 可以保留或自定义样式名
      destroyOnClose // 关闭时销毁内部组件状态
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          category: 'express', // 默认值可以保留或移除
          difficulty: 'medium'
        }}
      >
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="简短描述你的需求" maxLength={20} showCount />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="任务描述"
          rules={[{ required: true, message: '请详细描述你的任务' }]}
        >
          <TextArea 
            placeholder="详细描述任务内容、要求等信息" 
            autoSize={{ minRows: 3, maxRows: 6 }} 
            maxLength={200} 
            showCount 
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="任务类型"
              rules={[{ required: true, message: '请选择任务类型' }]}
            >
              <Radio.Group buttonStyle="solid" className="category-radio">
                <Radio.Button value="express">快递</Radio.Button>
                <Radio.Button value="study">学习</Radio.Button>
                <Radio.Button value="activity">活动</Radio.Button>
                {/* 可能需要添加 'other' 或从API获取 */}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="difficulty"
              label="难度级别"
              rules={[{ required: true, message: '请选择难度级别' }]}
            >
              <Radio.Group buttonStyle="solid" className="difficulty-radio">
                <Radio.Button value="easy">简单</Radio.Button>
                <Radio.Button value="medium">中等</Radio.Button>
                <Radio.Button value="hard">困难</Radio.Button>
                 {/* 可能需要添加 'expert' */}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reward"
              label="悬赏金额(元)"
              rules={[{ required: true, message: '请设置悬赏金额' }]}
            >
              <InputNumber 
                min={1} 
                max={500} // 根据实际需求调整
                style={{ width: '100%' }} 
                placeholder="设置合理的悬赏金额"
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deadline"
              label="截止时间"
              rules={[{ required: true, message: '请选择截止时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD HH:mm"
                placeholder="选择任务截止时间" 
                disabledDate={current => current && current < moment().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="location"
              label="任务地点"
              rules={[{ required: true, message: '请输入任务地点' }]}
            >
              <Input 
                placeholder="任务执行地点，如宿舍楼、教学楼等" 
                prefix={<EnvironmentOutlined />} 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="estimatedHours"
              label="预计耗时(小时)"
            >
              <InputNumber 
                min={0.5} 
                max={100} 
                step={0.5}
                style={{ width: '100%' }} 
                placeholder="预计完成任务需要的时间" 
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item className="form-footer">
          <Button type="default" onClick={onClose} className="cancel-btn">
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="submit-btn">
            发布任务
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMissionModal; 
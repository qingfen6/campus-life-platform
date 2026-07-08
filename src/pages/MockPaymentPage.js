// src/pages/MockPaymentPage.js
// 模拟支付页面，引导用户完成（假的）支付流程

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Card, Spin, Result, Descriptions, Image, Space, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ScanOutlined } from '@ant-design/icons';
// 假设您的 Header 和 Sidebar 组件路径正确
// import Header from '../components/common/Header'; 
// import Sidebar from '../components/common/Sidebar';   
import '../assets/styles/MockPaymentPage.css'; // 确保这个CSS文件存在且有内容
import { orderApi } from '../utils/api'; 

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const MockPaymentPage = ({ darkMode, toggleDarkMode }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const productTitle = searchParams.get('productTitle');
    const productIdFromPreviousPage = searchParams.get('productIdFromPreviousPage'); // 用于返回按钮

    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'processing', 'success', 'failed'
    const [paymentResultDetails, setPaymentResultDetails] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wechat'); // 'wechat' or 'alipay'

    // 模拟的二维码图片路径 - 您需要提供这些图片或替换为有效的URL
    // 例如: 放在 public/images/ 目录下
    const qrCodePaths = {
        wechat: '/images/mock-wechat-qr.png', 
        alipay: '/images/mock-alipay-qr.png', 
    };
    const paymentIcons = {
        wechat: '/images/wechat-pay-icon.svg', // 示例路径
        alipay: '/images/alipay-icon.svg',   // 示例路径
    };
    const qrFallback = '/images/qr-placeholder.png'; // 通用占位符

    useEffect(() => {
        if (!orderId || !amount || !productTitle) {
            message.error('无效的支付链接，缺少订单信息。', 3);
            navigate('/market'); 
        }
    }, [orderId, amount, productTitle, navigate]);

    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setPaymentStatus('processing');
        message.loading({ content: '正在确认支付结果...', key: 'confirmPayment', duration: 0 });
        try {
            const response = await orderApi.confirmMockOrderPayment(orderId);
            message.destroy('confirmPayment'); 
            if (response.success && response.paymentDetails?.success) {
                setPaymentStatus('success');
                message.success({ content: '支付成功！感谢您的购买。正在跳转到订单详情...', duration: 3 });
                navigate(`/orders/${orderId}`);
            } else {
                setPaymentStatus('failed');
                message.error({ content: `支付失败: ${response.paymentDetails?.message || response.message || '未知错误'}`, duration: 5 });
            }
            setPaymentResultDetails(response); 
        } catch (error) {
            message.destroy('confirmPayment');
            setPaymentStatus('failed');
            message.error({ content: `确认支付时发生错误: ${error.message}`, duration: 5 });
            setPaymentResultDetails({ message: error.message, success: false, paymentDetails: { message: error.message } });
        }
        setIsLoading(false);
    };

    const handleCancelPayment = () => {
        message.info('支付已取消。', 2);
        if (productIdFromPreviousPage) {
            navigate(`/market/product/${productIdFromPreviousPage}`);
        } else {
            navigate('/market');
        }
    };
    
    if (!orderId || !amount || !productTitle) {
        return (
            <Layout className="app-layout" style={{ minHeight: '100vh' }}>
                {/* <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */} 
                <Layout>
                    {/* <Sidebar /> */} 
                    <Content style={{ padding: '50px', display: 'flex', justifyContent:'center', alignItems:'center'}}>
                        <Spin size="large" tip="加载订单信息中..."/>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (paymentStatus === 'success') {
        return (
            <Layout className="app-layout">
                {/* <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */} 
                <Layout>
                    {/* <Sidebar /> */} 
                    <Content className="main-content mock-payment-container">
                        <Result
                            status="success"
                            title="支付成功！"
                            subTitle={`订单号: ${orderId}。感谢您的购买，商品 "${decodeURIComponent(productTitle)}" 将尽快为您准备。`}
                            extra={[
                                <Button type="primary" key="my-orders" onClick={() => navigate('/my-orders')}>
                                    查看我的订单
                                </Button>,
                                <Button key="continue-shopping" onClick={() => navigate('/market')}>
                                    继续购物
                                </Button>,
                            ]}
                        />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <Layout className="app-layout">
                 {/* <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */}
                <Layout>
                    {/* <Sidebar /> */}
                    <Content className="main-content mock-payment-container">
                        <Result
                            status="error"
                            title="支付失败"
                            subTitle={paymentResultDetails?.paymentDetails?.message || paymentResultDetails?.message || '支付处理过程中发生错误，请稍后再试或联系客服。'}
                            extra={[
                                <Button type="primary" key="retry" onClick={() => { setPaymentStatus(null); setIsLoading(false);}} ghost>
                                    尝试重新支付
                                </Button>,
                                <Button key="my-orders" onClick={() => navigate('/my-orders')}>
                                    查看我的订单
                                </Button>,
                                <Button key="back-to-product" onClick={handleCancelPayment}>
                                    返回商品
                                </Button>,
                            ]}
                        />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout className="app-layout">
            {/* <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */} {/* 考虑是否需要完整的应用布局 */}
            {/* <Layout> */}
                {/* <Sidebar /> */} 
                <Content className="main-content mock-payment-container">
                    <div className="payment-card-container">
                        <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined />} 
                            onClick={handleCancelPayment} 
                            className="back-button"
                            style={{ marginBottom: '16px'}}
                        >
                            返回商品详情或取消
                        </Button>
                        <Card title={<Title level={3} style={{textAlign: 'center', marginBottom:0}}>模拟安全支付</Title>} className="payment-card">
                            <Descriptions bordered column={1} size="middle" style={{marginBottom: '20px'}}>
                                <Descriptions.Item label="订单号">{orderId}</Descriptions.Item>
                                <Descriptions.Item label="商品">{decodeURIComponent(productTitle)}</Descriptions.Item>
                                <Descriptions.Item label="支付金额">
                                    <Text strong style={{color: '#FF4D4F', fontSize: '1.5em'}}>¥ {parseFloat(amount).toFixed(2)}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Paragraph style={{textAlign: 'center'}}>
                                请选择支付方式并扫描下方二维码完成支付（模拟环境）：
                            </Paragraph>

                            <Space direction="vertical" align="center" style={{width: '100%'}} size="large">
                                <Space className="payment-method-selector">
                                    <Button 
                                        type={selectedPaymentMethod === 'wechat' ? 'primary' : 'default'}
                                        onClick={() => setSelectedPaymentMethod('wechat')} 
                                        icon={paymentIcons.wechat ? <Image src={paymentIcons.wechat} alt="" preview={false} width={24} style={{ marginRight: 8}} /> : null}
                                        size="large"
                                    >
                                        微信支付
                                    </Button>
                                    <Button 
                                        type={selectedPaymentMethod === 'alipay' ? 'primary' : 'default'}
                                        onClick={() => setSelectedPaymentMethod('alipay')} 
                                        icon={paymentIcons.alipay ? <Image src={paymentIcons.alipay} alt="" preview={false} width={24} style={{ marginRight: 8}} /> : null}
                                        size="large"
                                    >
                                        支付宝
                                    </Button>
                                </Space>

                                <div className="qr-code-container">
                                    <Image 
                                        width={220} 
                                        height={220}
                                        src={qrCodePaths[selectedPaymentMethod]} 
                                        alt={`${selectedPaymentMethod === 'wechat' ? '微信' : '支付宝'}支付二维码`} 
                                        fallback={qrFallback} 
                                        preview={false}
                                    />
                                     <Paragraph type="secondary" style={{textAlign: 'center', marginTop: '10px'}}><ScanOutlined /> 模拟扫码，无需真实操作</Paragraph>
                                </div>

                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<CheckCircleOutlined />} 
                                    onClick={handleConfirmPayment}
                                    loading={isLoading}
                                    block
                                >
                                    我已完成支付 (模拟)
                                </Button>
                                <Button 
                                    type="default" 
                                    size="large" 
                                    icon={<CloseCircleOutlined />} 
                                    onClick={handleCancelPayment}
                                    block
                                    style={{marginTop: '0px'}} 
                                >
                                    取消支付
                                </Button>
                            </Space>
                        </Card>
                    </div>
                </Content>
            {/* </Layout> */} 
        </Layout>
    );
};

export default MockPaymentPage; 
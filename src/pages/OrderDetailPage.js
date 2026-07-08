// src/pages/OrderDetailPage.js
// 订单详情页面

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, Descriptions, Card, Typography, Button, Tag, Divider, Row, Col, Image } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { orderApi } from '../utils/api';
import { API_CONFIG } from '../utils/constants'; // 用于拼接图片URL
// 确保CSS文件路径正确
// import '../assets/styles/OrderDetailPage.css'; 

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// 辅助函数：格式化日期时间
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        return new Date(dateTimeString).toLocaleString();
    } catch (e) {
        return dateTimeString; // 如果转换失败，返回原始字符串
    }
};

// 辅助函数：根据订单状态返回Tag颜色
const getOrderStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'orange';
        case 'paid': return 'green';
        case 'payment_failed': return 'red';
        case 'shipped': return 'blue';
        case 'completed': return 'purple';
        case 'canceled': return 'grey';
        case 'refunded': return 'volcano';
        default: return 'default';
    }
};


const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError('无效的订单ID');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await orderApi.getOrderById(orderId);
                if (response.success) {
                    setOrder(response.data);
                    setError(null);
                } else {
                    setError(response.message || '获取订单详情失败');
                    setOrder(null);
                }
            } catch (err) {
                setError(err.message || '获取订单详情时发生网络错误');
                setOrder(null);
            }
            setLoading(false);
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="加载订单详情中..." />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout style={{ padding: '20px' }}>
                <Content>
                    <Alert message="错误" description={error} type="error" showIcon />
                    <Button onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>返回</Button>
                </Content>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout style={{ padding: '20px' }}>
                <Content>
                    <Alert message="未找到订单" description="无法加载此订单的详细信息。" type="warning" showIcon />
                    <Button onClick={() => navigate('/my-orders')} style={{ marginTop: '16px' }}>查看我的订单</Button>
                </Content>
            </Layout>
        );
    }
    
    // 假设后端返回的 order.product 包含商品信息，order.product.images 是图片数组
    const product = order.product_details; // 根据后端返回的实际结构调整
    const seller = order.seller_details; // 根据后端返回的实际结构调整
    const buyer = order.buyer_details; // 根据后端返回的实际结构调整


    return (
        <Layout className="app-layout"> {/* 如果您有统一的Header/Sidebar布局，请取消注释 */}
            {/* <Header /> */}
            {/* <Layout> */}
                {/* <Sidebar /> */}
                <Content style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }} className="order-detail-page-content">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate(-1)} 
                        style={{ marginBottom: '20px' }}
                    >
                        返回
                    </Button>
                    <Title level={2} style={{ marginBottom: '20px' }}>订单详情</Title>
                    
                    <Card>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="订单号">{order.order_id}</Descriptions.Item>
                            <Descriptions.Item label="订单状态">
                                <Tag color={getOrderStatusColor(order.status)}>{order.status?.toUpperCase() || '未知'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="订单金额">
                                <Text strong style={{ color: '#FF4D4F', fontSize: '1.2em' }}>
                                    ¥ {parseFloat(order.amount).toFixed(2)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="创建时间">{formatDateTime(order.created_at)}</Descriptions.Item>
                            <Descriptions.Item label="支付时间">{formatDateTime(order.payment_time) || '尚未支付'}</Descriptions.Item>
                            <Descriptions.Item label="支付方式">{order.payment_method || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        
                        <Divider />
                        <Title level={4}>商品信息</Title>
                        {product ? (
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} sm={8} md={6}>
                                    <Image 
                                        width="100%" 
                                        src={product.images && product.images.length > 0 ? `${API_CONFIG.CLIENT_API.BASE_URL}${product.images[0].image_url}` : '/images/product-placeholder.png'} 
                                        alt={product.title}
                                        fallback="/images/product-placeholder.png"
                                    />
                                </Col>
                                <Col xs={24} sm={16} md={18}>
                                    <Title level={5}>{product.title}</Title>
                                    <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}>
                                        {product.description}
                                    </Paragraph>
                                    <Text>类别: {product.category}</Text><br/>
                                    <Text>单价: ¥ {parseFloat(product.price).toFixed(2)}</Text>
                                </Col>
                            </Row>
                        ) : (
                            <Text>商品信息不可用。</Text>
                        )}

                        <Divider />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Title level={4}>买家信息</Title>
                                {buyer ? (
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="用户名">{buyer.username}</Descriptions.Item>
                                        <Descriptions.Item label="邮箱">{buyer.email}</Descriptions.Item>
                                        {/* 可以添加更多买家信息 */}
                                    </Descriptions>
                                ) : <Text>买家信息不可用</Text>}
                            </Col>
                            <Col span={12}>
                                <Title level={4}>卖家信息</Title>
                                {seller ? (
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="用户名">{seller.username}</Descriptions.Item>
                                        <Descriptions.Item label="邮箱">{seller.email}</Descriptions.Item>
                                         {/* 可以添加更多卖家信息 */}
                                    </Descriptions>
                                ) : <Text>卖家信息不可用</Text>}
                            </Col>
                        </Row>
                        
                        {/* 可以根据订单状态添加特定操作，例如 '待发货' 状态下卖家可以有 '标记为已发货' 按钮等 */}
                        {order.status === 'paid' && (
                            <>
                                <Divider />
                                <Paragraph>
                                    卖家将会尽快处理您的订单。如有疑问，请联系卖家。
                                </Paragraph>
                            </>
                        )}
                    </Card>
                </Content>
            {/* </Layout> */}
        </Layout>
    );
};

export default OrderDetailPage; 
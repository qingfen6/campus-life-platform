// src/pages/MyOrdersPage.js
// "我的订单"列表页面

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, List, Card, Typography, Button, Tag, Row, Col, Image, Empty, Divider, Descriptions, Tabs } from 'antd';
import { EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { orderApi } from '../utils/api';
import { API_CONFIG } from '../utils/constants';
// import '../assets/styles/MyOrdersPage.css'; // 稍后创建CSS文件

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 从 OrderDetailPage.js 复制辅助函数，或者考虑将它们放到 utils 中共享
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try { return new Date(dateTimeString).toLocaleString(); } catch (e) { return dateTimeString; }
};

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

// 定义订单状态选项
const orderStatusOptions = [
    { key: 'all', tab: '全部订单' },
    { key: 'pending', tab: '待支付' },
    { key: 'paid', tab: '待处理' }, 
    { key: 'shipped', tab: '已发货' },
    { key: 'completed', tab: '已完成' },
    { key: 'payment_failed', tab: '支付失败' },
    { key: 'canceled', tab: '已取消' },
];

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'paid', 'completed', etc.

    useEffect(() => {
        const fetchMyOrders = async () => {
            setLoading(true);
            try {
                const response = await orderApi.getMyOrders();
                if (response.success) {
                    setOrders(response.orders || []);
                    setError(null);
                } else {
                    setError(response.message || '获取我的订单失败');
                    setOrders([]);
                }
            } catch (err) {
                setError(err.message || '获取我的订单时发生网络错误');
                setOrders([]);
            }
            setLoading(false);
        };

        fetchMyOrders();
    }, []);

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="加载我的订单中..." />
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

    // 订单过滤逻辑
    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    return (
        <Layout className="app-layout"> {/* 适配您的全局 Header/Sidebar */}
            {/* <Header /> */}
            {/* <Layout> */}
                {/* <Sidebar /> */}
                <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }} className="my-orders-page-content">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/profile')} // 或 navigate(-1) 返回上一页
                        style={{ marginBottom: '20px' }}
                    >
                        返回个人中心
                    </Button>
                    <Title level={2} style={{ marginBottom: '20px' }}>我的订单</Title>

                    {/* Tabs 筛选器 */}
                    <Tabs activeKey={filterStatus} onChange={setFilterStatus} style={{ marginBottom: '20px' }}>
                        {orderStatusOptions.map(status => (
                            <TabPane tab={status.tab} key={status.key} />
                        ))}
                    </Tabs>

                    {filteredOrders.length === 0 ? (
                        <Empty description={filterStatus === 'all' ? "您还没有订单哦，快去市场看看吧！" : `没有找到状态为 "${orderStatusOptions.find(s => s.key === filterStatus)?.tab || filterStatus}" 的订单。`}>
                            {filterStatus === 'all' && <Button type="primary" onClick={() => navigate('/market')}>去逛逛</Button>}
                        </Empty>
                    ) : (
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                            dataSource={filteredOrders}
                            renderItem={order => {
                                const product = order.product_details; // 假设订单数据中嵌套了商品详情
                                return (
                                    <List.Item>
                                        <Card 
                                            hoverable
                                            title={`订单号: ${order.order_id}`}
                                            extra={<Tag color={getOrderStatusColor(order.status)}>{order.status?.toUpperCase() || '未知'}</Tag>}
                                            actions={[
                                                <Button 
                                                    type="link" 
                                                    icon={<EyeOutlined />} 
                                                    onClick={() => navigate(`/orders/${order.order_id}`)}
                                                >
                                                    查看详情
                                                </Button>
                                            ]}
                                        >
                                            {product ? (
                                                <Row gutter={16} align="top">
                                                    <Col xs={8} sm={6}>
                                                        <Image 
                                                            width="100%"
                                                            src={product.images && product.images.length > 0 ? `${API_CONFIG.CLIENT_API.BASE_URL}${product.images[0].image_url}` : '/images/product-placeholder.png'} 
                                                            alt={product.title} 
                                                            preview={false}
                                                            fallback="/images/product-placeholder.png"
                                                            style={{ maxHeight: '120px', objectFit: 'cover'}}
                                                        />
                                                    </Col>
                                                    <Col xs={16} sm={18}>
                                                        <Text strong ellipsis={{tooltip: product.title}}>{product.title}</Text>
                                                        <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                                            {product.description}
                                                        </Paragraph>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <Text type="secondary">商品信息加载中或不可用...</Text>
                                            )}
                                            <Divider style={{margin: '12px 0'}}/>
                                            <Descriptions size="small" column={1}>
                                                <Descriptions.Item label="总金额">
                                                    <Text strong style={{color: '#FF4D4F'}}>¥ {parseFloat(order.amount).toFixed(2)}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="下单时间">{formatDateTime(order.created_at)}</Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </Content>
            {/* </Layout> */}
        </Layout>
    );
};

export default MyOrdersPage; 
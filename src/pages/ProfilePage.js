import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Typography, Tabs, Row, Col, Card, Button, Spin, Empty, message } from 'antd';
import { UserOutlined, EditOutlined, ShoppingOutlined, ReadOutlined, TransactionOutlined, BuildOutlined, SolutionOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { homeApi, missionApi, marketApi, orderApi } from '../utils/api';
import PublishedProductCard from '../components/market/PublishedProductCard';
import PostCardProfile from '../components/post/PostCardProfile';
import MissionCardProfile from '../components/mission/MissionCardProfile';
import PublishedMissionCard from '../components/mission/PublishedMissionCard';
import '../assets/styles/ProfilePage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const currentUser = useSelector(state => state.auth.user);

    const [tabData, setTabData] = useState({
        posts: null,
        acceptedMissions: null, // 原来的 missions 改名为 acceptedMissions
        publishedMissions: null, // 新增我发布的悬赏
        products: null,
        orders: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to refetch data for the current tab, can be passed to cards
    const refreshTabData = async (tabKeyToRefresh) => {
        if (!currentUser?.id || !tabKeyToRefresh) return;
        setLoading(true);
        setError(null);
        let apiCall;
        let isProductTab = false;
        switch (tabKeyToRefresh) {
            case 'posts': apiCall = homeApi.getMyPosts; break;
            case 'acceptedMissions': apiCall = missionApi.getAcceptedMissions; break;
            case 'publishedMissions': apiCall = missionApi.getPublishedMissions; break;
            case 'products': 
                apiCall = marketApi.getMyProducts; 
                isProductTab = true;
                break;
            case 'orders': apiCall = orderApi.getMyOrders; break;
            default: setLoading(false); return;
        }
        try {
            const response = await apiCall();
            if (response.success) {
                // 如果是 "products" tab，数据在 response.data.products 中
                // 其他tab的数据直接在 response.data (或者也可能是 response.posts, response.missions等，需根据API统一)
                // 假设其他非product的API调用后，数据在 response.data (如果API返回 {success: true, data: [...]})
                // 或者 response.posts, response.missions 等 (如果API返回 {success: true, posts: [...]})
                // 为统一处理，我们先检查 response.data 是否是数组，如果不是，再看 response.data.products
                let dataToSet = [];
                if (isProductTab && response.data && response.data.products) {
                    dataToSet = response.data.products;
                } else if (Array.isArray(response.data)) {
                    dataToSet = response.data;
                } else if (tabKeyToRefresh === 'posts' && response.posts) { // 特殊处理旧的 getMyPosts 结构
                    dataToSet = response.posts;
                } else if (tabKeyToRefresh === 'acceptedMissions' && response.missions) { // 示例：如果 getAcceptedMissions 返回 { success: true, missions: [...] }
                    dataToSet = response.missions;
                } else if (tabKeyToRefresh === 'publishedMissions' && response.missions) { // 示例：如果 getPublishedMissions 返回 { success: true, missions: [...] }
                    dataToSet = response.missions;
                }
                // 确保 setTabData 接收的是数组
                setTabData(prev => ({ ...prev, [tabKeyToRefresh]: dataToSet || [] }));
            } else {
                throw new Error(response.message || `获取 ${tabKeyToRefresh} 失败`);
            }
        } catch (err) {
            message.error(`刷新 ${tabKeyToRefresh} 数据失败: ${err.message}`);
            // setError(err.message); // Optionally set error for the specific tab
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) {
            if (activeTab !== 'orders') {
            refreshTabData(activeTab);
            }
        }
    }, [activeTab, currentUser?.id]);

    const handleMissionUpdated = (missionId, updatedData) => {
        // Callback for when a mission is updated (e.g., confirmed by publisher)
        // We can either refetch the whole list or update the specific item
        console.log(`Mission ${missionId} updated, new data:`, updatedData);
        // For simplicity, refetch the current tab's data
        if (activeTab === 'publishedMissions') {
            refreshTabData('publishedMissions');
        }
        // Potentially also update acceptedMissions if the status change is relevant there
    };

    const handleProductUpdated = (productId, updatedProductData) => {
        console.log(`Product ${productId} updated, new data:`, updatedProductData);
        // 选项1: 更新列表中的特定项 (更优，但复杂)
        // setTabData(prev => ({
        //     ...prev,
        //     products: prev.products.map(p => p.id === productId ? { ...p, ...updatedProductData } : p)
        // }));
        // 选项2: 简单刷新整个列表
        if (activeTab === 'products') {
            refreshTabData('products');
        }
    };

    const renderContent = () => {
        if (activeTab === 'orders') {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Empty description="订单管理已移至专属页面。" />
                    <Button 
                        type="primary" 
                        style={{ marginTop: '16px' }} 
                        onClick={() => navigate('/my-orders')}
                    >
                        查看我的所有订单
                    </Button>
                </div>
            );
        }

        if (loading && !tabData[activeTab]) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
        if (error && (!tabData[activeTab] || tabData[activeTab].length === 0)) return <Empty description={`加载失败: ${error}`} />;
        const currentData = tabData[activeTab];
        if (currentData === null && !loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="加载中..." /></div>;
        
        if (currentData && currentData.length === 0) {
             const emptyTextMap = {
                posts: "暂无动态",
                acceptedMissions: "暂无接取的悬赏",
                publishedMissions: "暂无发布的悬赏",
                products: "暂无发布的商品",
                orders: "暂无订单"
            };
             return <Empty description={emptyTextMap[activeTab] || "暂无内容"} />;
        }
        if (currentData) {
            switch (activeTab) {
                case 'posts':    return <Row gutter={[16, 16]}>{currentData.map(post => <Col xs={24} sm={12} md={8} key={post.post_id || post.id}><PostCardProfile post={post} /></Col>)}</Row>;
                case 'acceptedMissions': return <Row gutter={[16, 16]}>{currentData.map(mission => <Col xs={24} sm={12} md={8} key={`accepted-${mission.mission_id}-${mission.take_id || 'take'}`}><MissionCardProfile mission={mission} /></Col>)}</Row>;
                case 'publishedMissions': return <Row gutter={[16, 16]}>{currentData.map(mission => <Col xs={24} sm={12} md={8} key={`published-${mission.mission_id}`}><PublishedMissionCard mission={mission} onMissionUpdated={handleMissionUpdated} /></Col>)}</Row>;
                case 'products': return <Row gutter={[16, 16]}>{currentData.map(product => <Col xs={24} sm={12} md={8} lg={6} key={product.id}><PublishedProductCard product={product} onProductUpdated={handleProductUpdated} /></Col>)}</Row>;
                default:         return null;
            }
        }
        return null;
    };

    return (
        <Layout className="app-layout">
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Layout>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
                    <Content className="profile-page-content">
                        <Card className="profile-header-card">
                            <Row align="middle" gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                                <Col>
                                    {currentUser ? (
                                        <Avatar size={80} src={currentUser.avatar} icon={<UserOutlined />} />
                                    ) : (
                                        <Avatar size={80} icon={<UserOutlined />} />
                                    )}
                                </Col>
                                <Col flex="auto">
                                    <Title level={3} style={{ marginBottom: 4 }}>{currentUser?.username || '...'}</Title>
                                    <Text type="secondary">{currentUser?.bio || '暂无简介'}</Text>
                                </Col>
                                <Col>
                                    <Button icon={<EditOutlined />}>编辑资料</Button>
                                </Col>
                            </Row>
                        </Card>

                        <Card className="profile-content-card">
                             <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                <TabPane tab={<><ReadOutlined /> 我的动态</>} key="posts">{renderContent()}</TabPane>
                                <TabPane tab={<><BuildOutlined /> 接取的悬赏</>} key="acceptedMissions">{renderContent()}</TabPane>
                                <TabPane tab={<><SolutionOutlined /> 发布的悬赏</>} key="publishedMissions">{renderContent()}</TabPane>
                                <TabPane tab={<><ShoppingOutlined /> 发布的商品</>} key="products">{renderContent()}</TabPane>
                                <TabPane tab={<><TransactionOutlined /> 我的订单</>} key="orders">{renderContent()}</TabPane>
                            </Tabs>
                        </Card>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default ProfilePage; 
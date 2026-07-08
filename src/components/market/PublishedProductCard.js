// src/components/market/PublishedProductCard.js
// 该组件用于在卖家个人中心展示其发布的商品，并提供发货等操作。

import React, { useState } from 'react';
import { Card, Typography, Tag, Button, message, Tooltip, Popconfirm, Image } from 'antd';
import { ShoppingCartOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined, CheckCircleOutlined, HourglassOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { orderApi } from '../../utils/api'; // 引入 orderApi
import '../../assets/styles/ProductCard.css'; // 可以复用或创建新的样式文件

const { Title, Text, Paragraph } = Typography;

const PublishedProductCard = ({ product, onProductUpdated }) => {
    const navigate = useNavigate();
    const [loadingShip, setLoadingShip] = useState(false);
    // const [loadingDelete, setLoadingDelete] = useState(false); // 预留删除功能

    if (!product) {
        return null;
    }

    const getDisplayStatusTag = (displayStatus) => {
        switch (displayStatus) {
            case 'active':
                return <Tag color="green" icon={<ShoppingCartOutlined />}>在售</Tag>;
            case 'sold': // 商品本身标记为 sold，但无具体订单状态
                 return <Tag color="gold" icon={<CheckCircleOutlined />}>已售出</Tag>;
            case 'sold_pending_shipment':
                return <Tag color="orange" icon={<HourglassOutlined />}>待发货</Tag>;
            case 'sold_shipped':
                return <Tag color="blue" icon={<SendOutlined />}>已发货</Tag>;
            case 'sold_delivered':
                return <Tag color="purple" icon={<CheckCircleOutlined />}>已送达</Tag>;
            case 'inactive':
                 return <Tag color="default">已下架</Tag>;
            default:
                return <Tag>{displayStatus || product.status || '未知状态'}</Tag>;
        }
    };

    const handleViewProduct = () => {
        navigate(`/market/product/${product.id}`);
    };
    
    // 预留编辑商品功能
    // const handleEditProduct = () => {
    //     navigate(`/market/edit-product/${product.id}`); // 假设的编辑路由
    //     message.info('编辑商品功能待实现');
    // };

    // 预留删除商品功能
    // const handleDeleteProduct = async () => {
    //     setLoadingDelete(true);
    //     try {
    //         // const response = await marketApi.deleteProduct(product.id);
    //         // if (response.success) {
    //         //     message.success('商品已删除');
    //         //     if (onProductUpdated) onProductUpdated(product.id, 'deleted');
    //         // } else {
    //         //     message.error(response.message || '删除失败');
    //         // }
    //         message.info('删除商品功能待实现');
    //     } catch (err) {
    //         message.error(err.message || '删除商品时出错');
    //     } finally {
    //         setLoadingDelete(false);
    //     }
    // };

    const handleMarkAsShipped = async () => {
        if (!product.relatedOrderInfo || !product.relatedOrderInfo.order_id) {
            message.error('订单信息不完整，无法标记为已发货。');
            return;
        }
        setLoadingShip(true);
        try {
            const response = await orderApi.markAsShipped(product.relatedOrderInfo.order_id);
            if (response.success) {
                message.success('商品已成功标记为已发货！');
                if (onProductUpdated) {
                    // 回调父组件，传递商品ID和新的状态/订单信息，以便更新列表
                    onProductUpdated(product.id, { 
                        ...product, 
                        displayStatus: 'sold_shipped', 
                        relatedOrderInfo: { ...product.relatedOrderInfo, order_status: 'shipped' } 
                    });
                }
            } else {
                message.error(response.message || '标记发货失败，请重试。');
            }
        } catch (error) {
            message.error(error.message || '标记发货时发生错误。');
        } finally {
            setLoadingShip(false);
        }
    };

    const cardActions = [];

    cardActions.push(
        <Tooltip title="查看商品详情" key="view">
            <Button type="text" icon={<EyeOutlined />} onClick={handleViewProduct}>
                详情
            </Button>
        </Tooltip>
    );
    
    // 编辑和删除按钮（占位）
    // cardActions.push(
    //     <Tooltip title="编辑商品" key="edit">
    //         <Button type="text" icon={<EditOutlined />} onClick={handleEditProduct}>
    //             编辑
    //         </Button>
    //     </Tooltip>
    // );
    // cardActions.push(
    //     <Popconfirm
    //         key="delete-popconfirm"
    //         title="确定要删除这个商品吗？"
    //         onConfirm={handleDeleteProduct}
    //         okText="确定删除"
    //         cancelText="取消"
    //         okButtonProps={{ loading: loadingDelete, danger: true }}
    //     >
    //         <Tooltip title="删除商品" key="delete">
    //             <Button type="text" icon={<DeleteOutlined />} danger loading={loadingDelete}>
    //                 删除
    //             </Button>
    //         </Tooltip>
    //     </Popconfirm>
    // );

    // 根据商品状态添加特定操作
    if (product.displayStatus === 'sold_pending_shipment' && product.relatedOrderInfo?.order_id) {
        cardActions.push(
            <Popconfirm
                key="ship-popconfirm"
                title="确定要将此订单标记为已发货吗？"
                onConfirm={handleMarkAsShipped}
                okText="已发货"
                cancelText="取消"
                okButtonProps={{ loading: loadingShip }}
            >
                <Tooltip title="标记为已发货" key="ship">
                    <Button type="primary" icon={<SendOutlined />} loading={loadingShip}>
                        发货
                    </Button>
                </Tooltip>
            </Popconfirm>
        );
    }


    return (
        <Card
            className="product-card published-product-card" // 可添加自定义类名
            hoverable
            cover={
                product.imageUrl ? (
                    <Image
                        alt={product.title}
                        src={product.imageUrl}
                        style={{ height: 180, objectFit: 'cover', padding: '1px' }} // 设置图片高度和裁剪
                        preview={false} // 简单展示，不开启预览大图
                        onClick={handleViewProduct} // 点击图片也跳转详情
                    />
                ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }} onClick={handleViewProduct}>
                        <ShoppingCartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    </div>
                )
            }
            actions={cardActions.length > 0 ? cardActions : undefined}
        >
            <Card.Meta
                title={
                    <Tooltip title={product.title}>
                        <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: '4px', cursor: 'pointer' }} onClick={handleViewProduct}>
                            {product.title || '商品标题缺失'}
                        </Title>
                    </Tooltip>
                }
                description={
                    <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: '8px', fontSize: '12px' }}>
                        {product.description || '暂无描述'}
                    </Paragraph>
                }
            />
            <div style={{ marginBottom: '10px' }}>
                <Text strong style={{ fontSize: '16px', color: 'var(--price-color, #FF4D4F)' }}>
                    ¥{product.price?.toFixed(2) || '价格未知'}
                </Text>
                {product.originalPrice && (
                    <Text delete type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                        ¥{product.originalPrice.toFixed(2)}
                    </Text>
                )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                {getDisplayStatusTag(product.displayStatus)}
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {product.createdAt ? dayjs(product.createdAt).format('YYYY-MM-DD') : '日期未知'}
                </Text>
            </div>
             {product.relatedOrderInfo && (
                <div style={{ marginTop: '8px', fontSize: '12px', backgroundColor: '#f9f9f9', padding: '5px', borderRadius: '4px'}}>
                    <Text type="secondary">关联订单: #{product.relatedOrderInfo.order_id}</Text><br/>
                    <Text type="secondary">订单状态: <Tag>{product.relatedOrderInfo.order_status}</Tag></Text><br/>
                    <Text type="secondary">买家ID: {product.relatedOrderInfo.buyer_id}</Text>
                </div>
            )}
        </Card>
    );
};

export default PublishedProductCard; 
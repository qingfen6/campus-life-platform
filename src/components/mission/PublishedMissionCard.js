import React, { useState } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, Rate, message, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, CheckCircleOutlined, HourglassOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { missionApi } from '../../utils/api';
import '../../assets/styles/MissionCard.css'; // Can reuse or create a specific one

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PublishedMissionCard = ({ mission, onMissionUpdated }) => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false); // Loading state for cancel button

    console.log('[PublishedMissionCard] Received mission prop:', JSON.parse(JSON.stringify(mission))); // 添加日志，确保能看到完整对象

    if (!mission) return null;

    const getStatusTag = (status) => {
        switch (status) {
            case 'open': return <Tag color="green">开放中</Tag>;
            case 'in_progress': return <Tag color="blue">进行中</Tag>;
            case 'submitted_for_review': return <Tag color="orange" icon={<HourglassOutlined />}>待审核</Tag>;
            case 'completed': return <Tag color="purple" icon={<CheckCircleOutlined />}>已完成</Tag>;
            case 'canceled': return <Tag color="red">已取消</Tag>;
            case 'expired': return <Tag>已过期</Tag>;
            default: return <Tag>{status || '未知状态'}</Tag>;
        }
    };

    const handleViewMission = () => {
        navigate(`/missions/${mission.mission_id}`);
    };

    const showConfirmModal = () => {
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleConfirmCompletion = async (values) => {
        setConfirmLoading(true);
        try {
            const response = await missionApi.confirmMissionCompletion(mission.mission_id, values.rating, values.review);
            if (response.success) {
                message.success('任务已确认完成！');
                setIsModalVisible(false);
                form.resetFields();
                if (onMissionUpdated) {
                    onMissionUpdated(mission.mission_id, response.data); // Pass updated data back if needed
                }
            } else {
                message.error(response.message || '确认失败，请重试。');
            }
        } catch (error) {
            message.error(error.message || '确认过程中发生错误。');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCancelMission = async () => {
        setCancelLoading(true);
        try {
            const response = await missionApi.cancelPublishedMission(mission.mission_id);
            if (response.success) {
                message.success('悬赏已取消！');
                if (onMissionUpdated) {
                    onMissionUpdated(mission.mission_id, response.data); // newStatus should be 'canceled'
                }
            } else {
                message.error(response.message || '取消悬赏失败，请重试。');
            }
        } catch (error) {
            message.error(error.message || '取消悬赏过程中发生错误。');
        } finally {
            setCancelLoading(false);
        }
    };
    
    // Information about the taker, if available from getPublishedMissions
    // The backend `getMissionsByPublisher` returns taker_id, taker_username, take_time
    const takerInfo = mission.taker_username ? (
        <Text type="secondary" style={{ fontSize: '12px' }}>
            接取者: {mission.taker_username} (ID: {mission.taker_id})
            {mission.take_time ? ` | 接取于: ${dayjs(mission.take_time).format('YYYY-MM-DD')}` : ''}
        </Text>
    ) : (
        <Text type="secondary" style={{ fontSize: '12px' }}>无人接取</Text>
    );


    const cardActions = [
        <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} onClick={handleViewMission} key="view">查看</Button>
        </Tooltip>
    ];

    if (mission.status === 'submitted_for_review') {
        cardActions.push(
            <Tooltip title="确认任务完成" key="confirm-tooltip">
                <Button type="text" icon={<CheckCircleOutlined />} onClick={showConfirmModal} key="confirm">
                    确认完成
                </Button>
            </Tooltip>
        );
    }
    
    if (mission.status === 'open') {
        cardActions.push(
            <Popconfirm
                key="cancel-popconfirm"
                title="确定要取消这个悬赏吗？"
                onConfirm={handleCancelMission}
                okText="确定取消"
                cancelText="再想想"
                okButtonProps={{ loading: cancelLoading }}
            >
                <Tooltip title="取消悬赏" key="cancel-tooltip">
                    <Button type="text" icon={<CloseCircleOutlined />} key="cancel" danger loading={cancelLoading}>
                        取消悬赏
                    </Button>
                </Tooltip>
            </Popconfirm>
        );
    }
    
    if (mission.taker_username) {
         cardActions.push(
            <Tooltip title={`接取者: ${mission.taker_username}`} key="taker-tooltip">
                 <Button type="text" icon={<UserOutlined />} key="taker" style={{cursor: 'default'}}>
                    {mission.taker_username.substring(0,5)}{mission.taker_username.length > 5 ? '...' : ''}
                </Button>
            </Tooltip>
        );
    }


    return (
        <>
            <Card
                className="mission-card published-mission-card"
                hoverable
                title={
                    <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
                        {mission.title || '任务标题未提供'}
                    </Title>
                }
                actions={cardActions.filter(Boolean)}
            >
                <Paragraph ellipsis={{ rows: 2 }}>
                    {mission.description || '任务描述未提供'}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                    <div>
                        <Text strong>奖励: ¥{mission.reward || 'N/A'}</Text><br />
                        {getStatusTag(mission.status)}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        发布于: {mission.created_at ? dayjs(mission.created_at).format('YYYY-MM-DD') : '未知'}
                    </Text>
                </div>
                {/* {takerInfo} */}

            </Card>
            <Modal
                title="确认任务完成并评价"
                open={isModalVisible}
                onCancel={handleCancelModal}
                confirmLoading={confirmLoading}
                onOk={() => {
                    form.validateFields()
                        .then(values => handleConfirmCompletion(values))
                        .catch(info => console.log('Validate Failed:', info));
                }}
                okText="提交评价并确认"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" name="confirm_mission_form">
                    <Form.Item
                        name="rating"
                        label="评分 (可选)"
                        rules={[{ required: false }]}
                    >
                        <Rate allowHalf />
                    </Form.Item>
                    <Form.Item
                        name="review"
                        label="评价 (可选)"
                        rules={[{ required: false }]}
                    >
                        <TextArea rows={4} placeholder="请输入您对任务完成情况的评价..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default PublishedMissionCard; 
import React, { useState } from 'react';
import { Card, Typography, Tag, Button, Tooltip, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import '../../assets/styles/MissionCard.css'; // 复用现有的 MissionCard.css
import { missionApi } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

const MissionCardProfile = ({ mission }) => {
    const navigate = useNavigate();

    // 必须在所有 Hooks 调用之后才能进行条件返回
    const [submitting, setSubmitting] = useState(false);

    console.log('Mission object in MissionCardProfile:', mission); // 临时调试

    if (!mission) return null;
    
    // 假设 getAcceptedMissions 返回的数据中，mission 对象直接包含 take_id 和 take_status
    // 或者 mission.status 代表的是 take 的状态（因为我们是在 '接取的悬赏' 列表中）
    // 我们需要确认数据结构。从后端看，应该是 mission.take_id 和 mission.take_status

    // 后端 getAcceptedMissions 返回的 t.status as take_status
    // 发布的悬赏任务状态是 m.status
    // 在这里，我们关注的是接取任务的状态
    const getStatusTag = (status) => {
        switch (status) {
            case 'accepted': return <Tag color="processing" icon={<ClockCircleOutlined />}>进行中 (已接受)</Tag>;
            case 'submitted_for_review': return <Tag color="warning">审核中</Tag>;
            case 'completed': return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>;
            case 'rejected': return <Tag color="error">已拒绝</Tag>;
            case 'abandoned': return <Tag color="default">已放弃</Tag>;
            default: return <Tag>{status || '未知状态'}</Tag>;
        }
    };

    const handleViewMission = () => {
        navigate(`/missions/${mission.mission_id || mission.id}`); // 确保 mission 对象有 id 或 mission_id
    };

    const handleSubmitMission = async () => {
        console.log('handleSubmitMission called. mission.take_id:', mission.take_id, 'Type:', typeof mission.take_id); // 新增调试
        if (!mission.take_id) {
            message.error('无法提交：缺少接取任务的ID (take_id)');
            return;
        }
        setSubmitting(true);
        try {
            const response = await missionApi.submitMissionCompletion(mission.take_id);
            if (response.success) {
                message.success('任务已提交审核！');
                // 这里可以添加一个回调函数来刷新列表，或者依赖ProfilePage的重新获取逻辑
                // 例如：if (onSubmitted) onSubmitted(mission.mission_id);
            } else {
                message.error(response.message || '提交失败，请重试。');
            }
        } catch (error) {
            message.error(error.message || '提交过程中发生错误。');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card 
            className="mission-card profile-mission-card" // 添加特定类名
            hoverable 
            title={
                <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
                    {mission.title || '任务标题未提供'}
                </Title>
            }
            actions={[
                <Tooltip title="查看详情">
                    <Button type="text" icon={<EyeOutlined />} onClick={handleViewMission} key="view">查看</Button>
                </Tooltip>,
                // mission.take_status 由后端 getAcceptedMissions 提供
                // 或者如果接口直接返回的是 mission.status 并且为 'accepted' (代表进行中)
                (mission.take_status === 'accepted' || mission.status === 'accepted') && (
                    <Tooltip title="提交完成">
                        <Button 
                            type="text" 
                            icon={<UploadOutlined />} 
                            onClick={handleSubmitMission} 
                            key="submit"
                            loading={submitting}
                            disabled={submitting}
                        >
                            提交
                        </Button>
                    </Tooltip>
                )
            ].filter(Boolean)} // 过滤掉 undefined (当提交按钮不渲染时)
        >
            <Paragraph ellipsis={{ rows: 2 }}>
                {mission.description || '任务描述未提供'}
            </Paragraph>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div>
                    <Text strong>奖励: ¥{mission.reward || 'N/A'}</Text><br/>
                    {/* 使用 take_status (如果有) 来显示接取任务的状态，否则用 mission.status */} 
                    {(mission.take_status || mission.status) && getStatusTag(mission.take_status || mission.status)}
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {/* 使用 take_time (如果有) */} 
                    接受于: {mission.take_time ? dayjs(mission.take_time).format('YYYY-MM-DD') : (mission.accepted_at ? dayjs(mission.accepted_at).format('YYYY-MM-DD') : '未知')}
                </Text>
            </div>
        </Card>
    );
};

export default MissionCardProfile;

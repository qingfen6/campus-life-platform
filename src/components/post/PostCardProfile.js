import React from 'react';
import { Card, Avatar, Typography, Image, Space, Button, Tooltip } from 'antd';
import { LikeOutlined, MessageOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/PostCard.css'; // 复用现有的 PostCard.css

const { Text, Paragraph } = Typography;

const PostCardProfile = ({ post }) => {
    const navigate = useNavigate();

    if (!post) return null;

    const handlePostClick = () => {
        navigate(`/post/${post.post_id}`); // 跳转到帖子详情页
    };

    return (
        <Card
            className="post-card profile-post-card" // 添加特定类名以便样式区分
            hoverable
            onClick={handlePostClick}
        >
            {post.image_url && ( // 假设 getMyPosts 返回的帖子里有 image_url
                <div className="post-card-image-container">
                    <Image
                        alt="帖子图片"
                        src={post.image_url}
                        className="post-card-image"
                        preview={false} // 在卡片中通常不直接预览
                    />
                </div>
            )}
            <Card.Meta
                title={
                    <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: 0 }}>
                        {post.content || '无内容'}
                    </Paragraph>
                }
                description={
                    <div className="post-card-footer">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(post.created_at).fromNow()}
                        </Text>
                        <Space size="middle" style={{ fontSize: '14px' }}>
                            <Tooltip title="点赞">
                                <span><LikeOutlined /> {post.like_count || 0}</span>
                            </Tooltip>
                            <Tooltip title="评论">
                                <span><MessageOutlined /> {post.comment_count || 0}</span>
                            </Tooltip>
                            {/* <Tooltip title="分享">
                                <Button type="text" icon={<ShareAltOutlined />} size="small" />
                            </Tooltip> */}
                        </Space>
                    </div>
                }
            />
        </Card>
    );
};

export default PostCardProfile;

const db = require('../config/db');
const pool = db.pool;

// ... 其他控制器函数 (getPosts, getPostDetail, createPost, likePost, etc.) ...

// 新增：获取当前用户的帖子
const getMyPosts = async (req, res) => {
    const userId = req.user.id; // 从 protect 中间件获取用户 ID
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query; // 处理分页和排序参数

    const offset = (page - 1) * limit;
    // 基本的 SQL 注入防护：验证 sort 和 order 参数
    const allowedSortColumns = ['created_at', 'like_count', 'comment_count']; // 允许排序的列
    const allowedOrderValues = ['asc', 'desc'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = allowedOrderValues.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    try {
        const connection = await pool.getConnection();
        try {
            // 查询总数
            const countSql = 'SELECT COUNT(*) as total FROM posts WHERE user_id = ?';
            const [countRows] = await connection.query(countSql, [userId]);
            const totalPosts = countRows[0].total;
            const totalPages = Math.ceil(totalPosts / limit);

            // 查询当前页的帖子数据 - 移除 p.media_urls
            const postsSql = `
                SELECT 
                    p.post_id, p.content, p.created_at, p.like_count, p.comment_count, p.post_type, p.location, p.visibility,
                    u.user_id as author_id, u.username as author_username, u.avatar_url as author_avatar
                FROM posts p
                JOIN users u ON p.user_id = u.user_id
                WHERE p.user_id = ?
                ORDER BY ${connection.escapeId('p.' + sortColumn)} ${sortOrder}
                LIMIT ? OFFSET ?
            `;
            const [rawPosts] = await connection.query(postsSql, [userId, parseInt(limit), parseInt(offset)]);

            // 为每个帖子获取媒体信息
            const postsWithMedia = await Promise.all(rawPosts.map(async (post) => {
                const [mediaRows] = await connection.query(
                    'SELECT media_url, media_type, thumbnail_url FROM post_media WHERE post_id = ? ORDER BY display_order LIMIT 1',
                    [post.post_id]
                );
                return {
                    ...post,
                    media_urls: mediaRows.length > 0 ? [mediaRows[0].media_url] : [], // 以数组形式返回，或直接返回 mediaRows[0] 
                    image_url: mediaRows.length > 0 ? mediaRows[0].media_url : null, // 兼容 PostCard 显示
                    // 可以根据需要添加 media_type, thumbnail_url 等
                };
            }));

            res.status(200).json({
                success: true,
                data: postsWithMedia, // 返回处理后的帖子数组
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPosts
                }
            });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('[Post Controller] 获取我的帖子失败:', error);
        res.status(500).json({ success: false, message: '获取帖子列表时发生服务器错误' });
    }
};

// --- 确保在文件末尾导出所有需要的函数 ---
module.exports = {
    getMyPosts 
    // getPosts,
    // getPostDetail,
    // createPost,
    // likePost,
    // unlikePost,
    // getComments,
    // addComment,
    // ... 其他导出的函数 ...
}; 
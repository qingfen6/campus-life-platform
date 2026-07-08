const db = require('../config/db');
const pool = db.pool; // 使用连接池
const { createNotification } = require('./notification/notificationController');

// Placeholder functions - we will implement these

// 获取好友列表
const getFriendList = async (req, res) => {
    const userId = req.user.id;
    console.log(`[Chat Backend] getFriendList called for userId: ${userId}`); // Backend log

    try {
        const connection = await pool.getConnection();
        try {
            // 查询与当前用户是好友关系的用户ID
            // 注意: user_relations 中 friend 关系应该是双向的，但为了简化查询，
            // 我们假设添加好友时已确保双向关系存在，只查询一侧即可。
            // 或者更严谨地查询双方关系都为 friend 的情况。
            // 这里我们采用简化的方式，查询关系表中涉及当前用户且类型为 friend 的另一方。
            const friendIdsSql = `
                SELECT
                    CASE
                        WHEN user_id = ? THEN related_user_id
                        ELSE user_id
                    END AS friend_id
                FROM user_relations
                WHERE (user_id = ? OR related_user_id = ?) AND relation_type = 'friend'
            `;
            const [friendIdRows] = await connection.query(friendIdsSql, [userId, userId, userId]);
            const friendIds = friendIdRows.map(row => row.friend_id);
            console.log(`[Chat Backend] Found friend IDs for user ${userId}:`, friendIds); // Backend log

            if (friendIds.length === 0) {
                console.log(`[Chat Backend] No friends found for user ${userId}, returning empty array.`); // Backend log
                return res.json([]); // 没有好友则返回空数组
            }

            // 查询好友的详细信息
            const friendsSql = `
                SELECT
                    user_id as id,
                    username as name,
                    avatar_url as avatar,
                    -- 可以考虑获取最后活跃时间或共同好友数等
                    NULL as lastMessage, -- 占位符
                    NULL as timestamp    -- 占位符
                FROM users
                WHERE user_id IN (?)
            `;
            const [friends] = await connection.query(friendsSql, [friendIds]);
            console.log(`[Chat Backend] Fetched friend details for user ${userId}:`, friends); // Backend log

            res.json(friends);

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('[Chat Backend] 获取好友列表失败:', error); // Backend log
        res.status(500).json({ message: '获取好友列表时发生服务器错误' });
    }
};

// 获取私信会话列表
const getConversationList = async (req, res) => {
    const userId = req.user.id;
    console.log(`[Chat Backend] getConversationList called for userId: ${userId}`); // Backend log

    try {
        const connection = await pool.getConnection();
        try {
            // 查询当前用户参与的私聊会话，并获取对方信息和最后一条消息
            const conversationsSql = `
                SELECT
                    c.conversation_id,
                    other_p.user_id AS other_user_id,
                    u.username AS other_user_name,
                    u.avatar_url AS other_user_avatar,
                    last_msg.content AS last_message_content,
                    last_msg.created_at AS last_message_timestamp
                FROM chat_conversations c
                JOIN chat_participants current_p ON c.conversation_id = current_p.conversation_id AND current_p.user_id = ?
                JOIN chat_participants other_p ON c.conversation_id = other_p.conversation_id AND other_p.user_id != ?
                JOIN users u ON other_p.user_id = u.user_id
                LEFT JOIN LATERAL (
                    SELECT content, created_at
                    FROM chat_messages cm
                    WHERE cm.conversation_id = c.conversation_id
                    ORDER BY cm.created_at DESC
                    LIMIT 1
                ) last_msg ON TRUE
                WHERE c.conversation_type = 'private'
                ORDER BY last_msg.created_at IS NULL ASC, last_msg.created_at DESC, c.updated_at DESC; -- 按最后消息时间排序 (NULLS LAST), 无消息的按会话更新时间排
            `;
            const [conversationRows] = await connection.query(conversationsSql, [userId, userId]);
            console.log(`[Chat Backend] Found raw conversation rows for user ${userId}:`, conversationRows); // Backend log

            // 格式化数据
            const conversations = conversationRows.map(row => ({
                id: row.conversation_id,
                user: {
                    id: row.other_user_id,
                    name: row.other_user_name,
                    avatar: row.other_user_avatar
                },
                lastMessage: row.last_message_content || '',
                timestamp: row.last_message_timestamp ? new Date(row.last_message_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
            }));
            console.log(`[Chat Backend] Formatted conversations for user ${userId}:`, conversations); // Backend log

            res.json(conversations);

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('[Chat Backend] 获取会话列表失败:', error); // Backend log
        res.status(500).json({ message: '获取会话列表时发生服务器错误' });
    }
};

// 获取特定会话的消息 (私聊或频道)
const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;
    const userId = req.user.id; // 从认证中间件获取当前用户ID

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ message: '无效的页码' });
    }
     if (isNaN(limit) || limit < 1 || limit > 100) { // 添加limit范围限制
        return res.status(400).json({ message: '无效的每页数量' });
    }

    try {
        const connection = await pool.getConnection();
        try {
            // 查询总消息数
            const countSql = 'SELECT COUNT(*) as total FROM chat_messages WHERE conversation_id = ?';
            const [countRows] = await connection.query(countSql, [conversationId]);
            const totalMessages = countRows[0].total;
            const totalPages = Math.ceil(totalMessages / limit);

            if (page > totalPages && totalMessages > 0) {
                 return res.status(404).json({ message: '请求的页码超出范围' });
            }

            // 查询分页后的消息，并连接发送者信息
            // 注意：按 ID 降序获取最新消息，但在前端可能需要反转数组或滚动到特定位置
            const messagesSql = `
                SELECT
                    m.message_id, m.conversation_id, m.sender_id, m.message_type, m.content, m.status, m.created_at,
                    u.username as sender, u.avatar_url as avatar, u.faculty_id, u.school_id, -- 假设users表有这些字段
                    (SELECT f.faculty_name FROM faculties f WHERE f.faculty_id = u.faculty_id) as faculty_name, -- 获取学院名称
                    (SELECT s.school_name FROM schools s WHERE s.school_id = u.school_id) as school_name -- 获取学校名称
                FROM chat_messages m
                JOIN users u ON m.sender_id = u.user_id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC -- 按创建时间升序排列，旧消息在前
                LIMIT ? OFFSET ?
            `;
            const [messagesRows] = await connection.query(messagesSql, [conversationId, limit, offset]);

             // 格式化消息数据
            const messages = messagesRows.map(msg => ({
                id: msg.message_id,
                conversationId: msg.conversation_id,
                senderId: msg.sender_id,
                sender: msg.sender,
                avatar: msg.avatar,
                content: msg.content,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                // 添加其他可能需要的字段
                major: msg.faculty_name, // 假设是学院名称
                school: msg.school_name, // 学校名称
                isSelf: msg.sender_id === userId, // 判断是否是自己发送的消息
                likes: 0, // TODO: 实现点赞数获取
                isSystem: msg.message_type === 'system', // 假设有系统消息类型
            }));


            res.json({
                messages,
                currentPage: page,
                totalPages
            });

        } finally {
            connection.release(); // 释放连接回连接池
        }
    } catch (error) {
        console.error('获取消息失败:', error);
        res.status(500).json({ message: '获取消息时发生服务器错误' });
    }
};

// 发送消息 (私聊或频道)
const sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body; // 默认为文本消息
    const senderId = req.user.id; // 从认证中间件获取

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '消息内容不能为空' });
    }

    // 验证 messageType (如果需要)
    const validTypes = ['text', 'image', 'file', 'system'];
    if (!validTypes.includes(messageType)) {
        return res.status(400).json({ message: '无效的消息类型' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // 开始事务

        // 1. 插入新消息
        const insertSql = `
            INSERT INTO chat_messages (conversation_id, sender_id, message_type, content, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const insertParams = [conversationId, senderId, messageType, content, 'sent']; // 初始状态为 sent
        const [insertResult] = await connection.query(insertSql, insertParams);
        const newMessageId = insertResult.insertId;

        // 2. 更新会话的 updated_at 时间 (可选，但推荐)
        const updateConvSql = 'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = ?';
        await connection.query(updateConvSql, [conversationId]);

        // 3. 查询刚插入的完整消息信息以返回给前端
        const selectNewMessageSql = `
            SELECT
                m.message_id, m.conversation_id, m.sender_id, m.message_type, m.content, m.status, m.created_at,
                u.username as sender, u.avatar_url as avatar, u.faculty_id, u.school_id,
                (SELECT f.faculty_name FROM faculties f WHERE f.faculty_id = u.faculty_id) as faculty_name,
                (SELECT s.school_name FROM schools s WHERE s.school_id = u.school_id) as school_name
            FROM chat_messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.message_id = ?
        `;
        const [rows] = await connection.query(selectNewMessageSql, [newMessageId]);

        if (rows.length === 0) {
            throw new Error('无法检索到新发送的消息');
        }
        const newMessage = rows[0];

        // 4. 提交事务
        await connection.commit();

        // 5. 格式化并发送响应
        const formattedMessage = {
             id: newMessage.message_id,
             conversationId: newMessage.conversation_id,
             senderId: newMessage.sender_id,
             sender: newMessage.sender,
             avatar: newMessage.avatar,
             content: newMessage.content,
             time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             major: newMessage.faculty_name,
             school: newMessage.school_name,
             // isSelf 会在前端处理，这里不需要
             likes: 0, // 新消息点赞为0
             isSystem: newMessage.message_type === 'system'
         };

        res.status(201).json(formattedMessage); // 返回新创建的消息

    } catch (error) {
        console.error('发送消息失败:', error);
        if (connection) {
             await connection.rollback(); // 错误时回滚事务
        }
        res.status(500).json({ message: '发送消息时发生服务器错误' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// 获取或创建私聊会话
const getOrCreatePrivateConversation = async (req, res) => {
    const userId1 = req.user.id; // 当前用户
    const { userId2 } = req.body; // 对方用户

    if (!userId2) {
        return res.status(400).json({ message: '缺少对方用户ID' });
    }

    const userId2Num = parseInt(userId2, 10);
    if (isNaN(userId2Num)) {
        return res.status(400).json({ message: '无效的对方用户ID' });
    }

    if (userId1 === userId2Num) {
        return res.status(400).json({ message: '不能和自己发起私聊' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 检查对方用户是否存在
        const [userExists] = await connection.query('SELECT 1 FROM users WHERE user_id = ?', [userId2Num]);
        if (userExists.length === 0) {
            return res.status(404).json({ message: '对方用户不存在' });
        }

        // 查询是否已存在这两个用户的私聊会话 (通过 chat_participants)
        // 查找包含 user1 和 user2 的所有 private conversation_id
        const findConvSql = `
            SELECT cp1.conversation_id
            FROM chat_participants cp1
            JOIN chat_participants cp2 ON cp1.conversation_id = cp2.conversation_id
            JOIN chat_conversations c ON cp1.conversation_id = c.conversation_id
            WHERE cp1.user_id = ? AND cp2.user_id = ? AND c.conversation_type = 'private'
        `;
        const [existingConvs] = await connection.query(findConvSql, [userId1, userId2Num]);

        if (existingConvs.length > 0) {
            // 如果已存在，直接返回第一个找到的会话ID
            console.log(`[Chat Backend] Found existing private conversation (${existingConvs[0].conversation_id}) between ${userId1} and ${userId2Num}`);
            return res.json({ conversationId: existingConvs[0].conversation_id });
        }

        // 如果不存在，创建新的私聊会话
        console.log(`[Chat Backend] No existing private conversation found between ${userId1} and ${userId2Num}. Creating new one...`);
        await connection.beginTransaction(); // 开始事务

        try {
            // 1. 创建会话记录 (chat_conversations)
            const createConvSql = 'INSERT INTO chat_conversations (conversation_type) VALUES (?)';
            const [convResult] = await connection.query(createConvSql, ['private']);
            const newConversationId = convResult.insertId;
            console.log(`[Chat Backend] Created new conversation record with ID: ${newConversationId}`);

            // 2. 添加参与者 (chat_participants)
            const addParticipantSql = 'INSERT INTO chat_participants (conversation_id, user_id) VALUES (?, ?)';
            await connection.query(addParticipantSql, [newConversationId, userId1]);
            await connection.query(addParticipantSql, [newConversationId, userId2Num]);
            console.log(`[Chat Backend] Added participants ${userId1} and ${userId2Num} to conversation ${newConversationId}`);

            // 3. (可选) 插入 private_chat_index (如果使用该表)
            // const user1_id_smaller = Math.min(userId1, userId2Num);
            // const user2_id_larger = Math.max(userId1, userId2Num);
            // const insertIndexSql = 'INSERT INTO private_chat_index (user1_id, user2_id, conversation_id) VALUES (?, ?, ?)';
            // await connection.query(insertIndexSql, [user1_id_smaller, user2_id_larger, newConversationId]);
            // console.log(`[Chat Backend] Added entry to private_chat_index for conversation ${newConversationId}`);

            await connection.commit(); // 提交事务
            console.log(`[Chat Backend] Successfully created private conversation ${newConversationId} between ${userId1} and ${userId2Num}`);

            res.status(201).json({ conversationId: newConversationId });

        } catch (innerError) {
            await connection.rollback(); // 内部错误时回滚事务
            console.error('[Chat Backend] 创建私聊会话事务失败:', innerError);
            throw innerError; // 重新抛出错误，由外层捕获
        }

    } catch (error) {
        console.error('[Chat Backend] 获取或创建私聊会话失败:', error);
        res.status(500).json({ message: '获取或创建私聊会话时发生服务器错误' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// 发送好友请求
const sendFriendRequest = async (req, res) => {
    const senderId = req.user.id; // 从认证中间件获取发送者ID
    const { receiverId, message } = req.body;

    if (!receiverId) {
        return res.status(400).json({ message: '缺少接收者ID' });
    }

    const receiverIdNum = parseInt(receiverId, 10);
    if (isNaN(receiverIdNum)) {
        return res.status(400).json({ message: '无效的接收者ID' });
    }

    if (senderId === receiverIdNum) {
        return res.status(400).json({ message: '不能向自己发送好友请求' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 检查接收者是否存在
        const [receiverExists] = await connection.query('SELECT 1 FROM users WHERE user_id = ?', [receiverIdNum]);
        if (receiverExists.length === 0) {
            return res.status(404).json({ message: '接收用户不存在' });
        }

        // 检查是否已经是好友 (user_relations)
        const checkFriendSql = `
            SELECT 1 FROM user_relations
            WHERE ((user_id = ? AND related_user_id = ?) OR (user_id = ? AND related_user_id = ?))
            AND relation_type = 'friend'
        `;
        const [areFriends] = await connection.query(checkFriendSql, [senderId, receiverIdNum, receiverIdNum, senderId]);
        if (areFriends.length > 0) {
            return res.status(400).json({ message: '你们已经是好友了' });
        }

        // 检查是否存在待处理或已接受的请求
        const checkRequestSql = 'SELECT request_id, status FROM friend_requests WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status IN (?, ?)';
        const [existingRequests] = await connection.query(checkRequestSql, [senderId, receiverIdNum, receiverIdNum, senderId, 'pending', 'accepted']);

        if (existingRequests.length > 0) {
            const existingRequest = existingRequests[0];
            if (existingRequest.status === 'accepted') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: '你们已经是好友了 (请求已接受)' });
            }
            // 如果存在对方发来的待处理请求，直接接受它，而不是创建新请求
            if (existingRequest.sender_id === receiverIdNum && existingRequest.receiver_id === senderId && existingRequest.status === 'pending') {
                 // 调用接受逻辑（或提示用户去接受）
                 // 为简化，这里先返回提示，让用户手动接受
                 // TODO: 未来可以实现自动接受对方的待处理请求
                 await connection.rollback();
                 connection.release();
                return res.status(400).json({ message: '对方已向您发送好友请求，请前往通知处理。' });
            }
             // 如果是自己之前发送的待处理请求，则提示
            if (existingRequest.sender_id === senderId && existingRequest.receiver_id === receiverIdNum && existingRequest.status === 'pending') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: '您已发送过好友请求，请等待对方处理。' });
            }
        }

        // 检查是否有被拒绝的请求，如果有，更新它为 pending，而不是创建新的
        const checkRejectedSql = 'SELECT request_id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = ?';
        const [rejectedRequests] = await connection.query(checkRejectedSql, [senderId, receiverIdNum, 'rejected']);

        let newRequestId;
        if (rejectedRequests.length > 0) {
            // 更新被拒绝的请求
            const updateSql = 'UPDATE friend_requests SET status = ?, request_message = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?';
            const [updateResult] = await connection.query(updateSql, ['pending', message || null, rejectedRequests[0].request_id]);
            if (updateResult.affectedRows === 0) {
                 throw new Error('更新被拒绝的好友请求失败');
            }
            newRequestId = rejectedRequests[0].request_id;
            console.log(`[Chat Backend] Re-sending friend request ${newRequestId}`);
        } else {
            // 插入新的好友请求
            const insertRequestSql = 'INSERT INTO friend_requests (sender_id, receiver_id, request_message, status) VALUES (?, ?, ?, ?)';
            const [insertResult] = await connection.query(insertRequestSql, [senderId, receiverIdNum, message || null, 'pending']);
            if (insertResult.affectedRows === 0) {
                throw new Error('创建好友请求失败');
            }
            newRequestId = insertResult.insertId;
            console.log(`[Chat Backend] New friend request ${newRequestId} created`);
        }

        // --- 添加通知逻辑 --- 
        if (newRequestId) { 
            try {
                 await createNotification(
                    receiverIdNum,          // userId (通知接收者)
                    senderId,               // senderId (操作者，即发送请求的人)
                    'friend',               // notification_type
                    'request_received',     // action (新动作类型)
                    `${req.user.name || '有人'} 向您发送了好友请求。`, // content
                    'user',                 // content_type (关联到发送者的用户)
                    senderId,               // content_id (发送者的用户ID)
                     // data 包含请求ID和发送者ID，方便前端处理
                    JSON.stringify({ requestId: newRequestId, senderId: senderId })
                );
                console.log(`[Chat Backend] Notification created for user ${receiverIdNum} about received friend request ${newRequestId} from ${senderId}`);
            } catch (notificationError) {
                // 通知失败不应阻塞主流程，只记录错误
                console.error('[Chat Backend] 创建好友请求接收通知失败:', notificationError);
            }
        }
        // --- 通知逻辑结束 ---

        await connection.commit();
        connection.release();

        res.status(201).json({ message: '好友请求已发送', requestId: newRequestId });

    } catch (error) {
        console.error('[Chat Backend] 发送好友请求失败:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: '发送好友请求失败', error: error.message });
    }
};

// 获取当前用户收到的待处理好友请求
const getFriendRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        // 查询收到的待处理请求，并联接 users 表获取发送者信息
        const sql = `
            SELECT 
                fr.request_id, 
                fr.sender_id, 
                fr.request_message, 
                fr.created_at, 
                u.username AS sender_username, 
                u.nickname AS sender_nickname, 
                u.avatar_url AS sender_avatar
            FROM friend_requests fr
            JOIN users u ON fr.sender_id = u.user_id
            WHERE fr.receiver_id = ? AND fr.status = ?
            ORDER BY fr.created_at DESC
        `;
        const [requests] = await pool.query(sql, [userId, 'pending']);

        res.status(200).json(requests);

    } catch (error) {
        console.error('[Chat Backend] 获取好友请求失败:', error);
        res.status(500).json({ message: '获取好友请求失败', error: error.message });
    }
};

// 接受好友请求
const acceptFriendRequest = async (req, res) => {
    const receiverId = req.user.id; // 当前登录用户，即请求的接收者
    const requestId = parseInt(req.params.requestId, 10);

    if (isNaN(requestId)) {
        return res.status(400).json({ message: '无效的请求ID' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. 验证请求是否存在且属于当前用户，并且状态为 pending
        const getRequestSql = 'SELECT sender_id, receiver_id, status FROM friend_requests WHERE request_id = ?';
        const [requests] = await connection.query(getRequestSql, [requestId]);

        if (requests.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: '好友请求不存在' });
        }

        const request = requests[0];
        if (request.receiver_id !== receiverId) {
            await connection.rollback();
            connection.release();
            return res.status(403).json({ message: '无权操作此好友请求' });
        }
        if (request.status !== 'pending') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: `此好友请求已处理 (${request.status})` });
        }

        const senderId = request.sender_id;

        // 2. 更新好友请求状态为 accepted
        const updateRequestSql = 'UPDATE friend_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?';
        const [updateResult] = await connection.query(updateRequestSql, ['accepted', requestId]);
        if (updateResult.affectedRows === 0) {
            throw new Error('更新好友请求状态失败');
        }
        console.log(`[Chat Backend] Friend request ${requestId} accepted`);

        // 3. 在 user_relations 表中创建好友关系 (双向, type='friend')
        // 使用 INSERT IGNORE 避免因重复插入导致错误 (虽然理论上前面已检查)
        const insertRelationSql = 'INSERT IGNORE INTO user_relations (user_id, related_user_id, relation_type) VALUES (?, ?, ?), (?, ?, ?)';
        const [relationResult] = await connection.query(insertRelationSql, [
            senderId, receiverId, 'friend',
            receiverId, senderId, 'friend'
        ]);
        // 注意：INSERT IGNORE 不会报错，但 affectedRows 可能为 0 或 1 或 2
        console.log(`[Chat Backend] User relations created/updated for ${senderId} and ${receiverId}. Affected rows: ${relationResult.affectedRows}`);

        // 4. 创建私聊会话 (如果尚不存在)
        // 为了保证 user1_id < user2_id
        const user1 = Math.min(senderId, receiverId);
        const user2 = Math.max(senderId, receiverId);
        let conversationId;

        // 4.1 检查 private_chat_index 是否已存在会话
        const checkIndexSql = 'SELECT conversation_id FROM private_chat_index WHERE user1_id = ? AND user2_id = ?';
        const [existingIndex] = await connection.query(checkIndexSql, [user1, user2]);

        if (existingIndex.length > 0) {
            conversationId = existingIndex[0].conversation_id;
            console.log(`[Chat Backend] Private conversation ${conversationId} already exists for users ${user1} and ${user2}`);
        } else {
            // 4.2 创建新的 conversation
            const insertConvSql = 'INSERT INTO chat_conversations (conversation_type, title) VALUES (?, ?)';
            // 可以设置一个默认标题，或者留空
            const convTitle = `与 ${req.user.name || '用户'} 的私聊`; // 示例标题
            const [convResult] = await connection.query(insertConvSql, ['private', convTitle]);
            if (convResult.affectedRows === 0 || !convResult.insertId) {
                 throw new Error('创建聊天会话失败');
            }
            conversationId = convResult.insertId;
            console.log(`[Chat Backend] New private conversation ${conversationId} created for users ${user1} and ${user2}`);

            // 4.3 将用户添加到 participants
            const insertPartSql = 'INSERT INTO chat_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)';
            const [partResult] = await connection.query(insertPartSql, [
                conversationId, senderId,
                conversationId, receiverId
            ]);
            if (partResult.affectedRows < 2) {
                // 如果只插入了1行或0行，可能存在问题
                 console.warn(`[Chat Backend] Failed to insert both participants for conversation ${conversationId}. Affected rows: ${partResult.affectedRows}`);
                 // 理论上不应发生，但以防万一
                 // throw new Error('添加会话成员失败'); 
            }
             console.log(`[Chat Backend] Participants ${senderId} and ${receiverId} added to conversation ${conversationId}`);

            // 4.4 创建 private_chat_index 记录
            const insertIndexSql = 'INSERT INTO private_chat_index (user1_id, user2_id, conversation_id) VALUES (?, ?, ?)';
            const [indexResult] = await connection.query(insertIndexSql, [user1, user2, conversationId]);
             if (indexResult.affectedRows === 0) {
                 throw new Error('创建私聊索引失败');
            }
             console.log(`[Chat Backend] Private chat index created for users ${user1} and ${user2}, conversation ${conversationId}`);
        }

        // 5. 发送通知给 senderId
        try {
            await createNotification(
                senderId,               // userId (通知接收者，即请求发送方)
                receiverId,             // senderId (操作者，即接受请求的人)
                'friend',               // notification_type
                'request_accepted',     // action
                `${req.user.name || '用户'} 同意了您的好友请求。`, // content
                'user',                 // content_type (关联到接受者的用户)
                receiverId,             // content_id (接受者的用户ID)
                 // data 包含接受者ID和会话ID，方便前端跳转
                JSON.stringify({ acceptedBy: receiverId, conversationId: conversationId })
            );
            console.log(`[Chat Backend] Notification created for user ${senderId} about accepted friend request ${requestId} by ${receiverId}`);
        } catch (notificationError) {
            console.error('[Chat Backend] 创建好友请求接受通知失败:', notificationError);
            // 通知失败不回滚事务
        }

        // 6. （可选）在会话中发送一条系统消息
        try {
            const systemMessageContent = '你们现在可以开始聊天了！';
            const insertSystemMsgSql = 'INSERT INTO chat_messages (conversation_id, sender_id, message_type, content) VALUES (?, ?, ?, ?)';
            // 通常系统消息没有明确的 sender_id，可以用 0 或 NULL，或特定系统用户ID
            // 使用 NULL 而不是 0 来表示系统消息发送者
            await connection.query(insertSystemMsgSql, [conversationId, null, 'system', systemMessageContent]); 
             console.log(`[Chat Backend] System message sent to conversation ${conversationId}`);
        } catch (systemMsgError) {
            console.error('[Chat Backend] 发送系统消息失败:', systemMsgError);
            // 同样，不回滚事务
        }


        await connection.commit();
        connection.release();

        res.status(200).json({ message: '好友请求已接受', conversationId: conversationId });

    } catch (error) {
        console.error('[Chat Backend] 接受好友请求失败:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: '接受好友请求失败', error: error.message });
    }
};

// 拒绝好友请求
const rejectFriendRequest = async (req, res) => {
    const receiverId = req.user.id; // 当前登录用户
    const requestId = parseInt(req.params.requestId, 10);

    if (isNaN(requestId)) {
        return res.status(400).json({ message: '无效的请求ID' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. 验证请求是否存在且属于当前用户，并且状态为 pending
        const getRequestSql = 'SELECT sender_id, receiver_id, status FROM friend_requests WHERE request_id = ?';
        const [requests] = await connection.query(getRequestSql, [requestId]);

        if (requests.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: '好友请求不存在' });
        }

        const request = requests[0];
        if (request.receiver_id !== receiverId) {
            await connection.rollback();
            connection.release();
            return res.status(403).json({ message: '无权操作此好友请求' });
        }
        if (request.status !== 'pending') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: `此好友请求已处理 (${request.status})` });
        }

        const senderId = request.sender_id;

        // 2. 更新好友请求状态为 rejected
        const updateRequestSql = 'UPDATE friend_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?';
        const [updateResult] = await connection.query(updateRequestSql, ['rejected', requestId]);
        if (updateResult.affectedRows === 0) {
            throw new Error('更新好友请求状态失败');
        }
         console.log(`[Chat Backend] Friend request ${requestId} rejected`);

        // 3. 发送通知给 senderId
        try {
            await createNotification(
                senderId,               // userId (通知接收者，即请求发送方)
                receiverId,             // senderId (操作者，即拒绝请求的人)
                'friend',               // notification_type
                'request_rejected',     // action
                `${req.user.name || '用户'} 拒绝了您的好友请求。`, // content
                'user',                 // content_type (关联到拒绝者的用户)
                receiverId,             // content_id (拒绝者的用户ID)
                 // data 可以包含拒绝者的ID
                JSON.stringify({ rejectedBy: receiverId })
            );
             console.log(`[Chat Backend] Notification created for user ${senderId} about rejected friend request ${requestId} by ${receiverId}`);
        } catch (notificationError) {
            console.error('[Chat Backend] 创建好友请求拒绝通知失败:', notificationError);
            // 通知失败不回滚事务
        }

        await connection.commit();
        connection.release();

        res.status(200).json({ message: '好友请求已拒绝' });

    } catch (error) {
        console.error('[Chat Backend] 拒绝好友请求失败:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: '拒绝好友请求失败', error: error.message });
    }
};

// TODO: 添加其他需要的函数，如处理好友请求 (接受/拒绝), 获取频道消息 (如果逻辑与 getMessages 不同)

// --- 在文件末尾添加显式导出 ---
module.exports = {
    getFriendList,
    getConversationList,
    getMessages,
    sendMessage,
    getOrCreatePrivateConversation,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest
    // 如果还有其他函数，也需要在这里添加
}; 
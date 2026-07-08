import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../utils/api';
import { message } from 'antd';

// 异步 Thunk：获取或创建私聊会话并加载初始消息
export const initializeChatPopup = createAsyncThunk(
    'chatPopup/initialize',
    async (targetUser, { dispatch, rejectWithValue }) => {
        console.log('[ChatPopup Thunk] Initializing for:', targetUser);
        if (!targetUser || !targetUser.id) {
            console.error('[ChatPopup Thunk] Invalid target user.');
            return rejectWithValue('无效的目标用户');
        }
        try {
            dispatch(setChatPopupLoading(true));
            console.log('[ChatPopup Thunk] Calling getOrCreatePrivateConversation...');
            // 1. 获取或创建会话
            const convData = await chatApi.getOrCreatePrivateConversation(targetUser.id);
            console.log('[ChatPopup Thunk] Received conversation data:', convData);
            const conversationId = convData?.conversationId;
            if (!conversationId) {
                 console.error('[ChatPopup Thunk] Failed to get conversation ID.');
                 throw new Error('未能获取会话ID');
            }
            dispatch(setChatPopupConversationId(conversationId));
            console.log(`[ChatPopup Thunk] Conversation ID set: ${conversationId}`);

            console.log('[ChatPopup Thunk] Calling getMessages...');
            // 2. 获取第一页消息
            const messagesData = await chatApi.getMessages(conversationId, 1);
            console.log('[ChatPopup Thunk] Received messages data:', messagesData);

             dispatch(setChatPopupMessages({
                messages: messagesData?.messages || [],
                currentPage: messagesData?.currentPage || 1,
                totalPages: messagesData?.totalPages || 1
             }));
             console.log('[ChatPopup Thunk] Messages state dispatched.');

            // 注意：isLoading 状态将在 finally 块中设置为 false
            return { conversationId, targetUser }; // 返回必要信息
        } catch (error) {
            console.error("[ChatPopup Thunk] Initialization failed:", error);
            message.error(`无法开始与 ${targetUser.name || '用户'} 的对话: ${error.message}`);
            dispatch(closeChatPopup()); // 出错时关闭弹窗
            return rejectWithValue(error.message);
        } finally {
             console.log('[ChatPopup Thunk] Setting loading to false.');
             dispatch(setChatPopupLoading(false));
        }
    }
);

// 异步 Thunk: 发送消息
export const sendChatMessageViaPopup = createAsyncThunk(
    'chatPopup/sendMessage',
    async ({ conversationId, content }, { getState, dispatch, rejectWithValue }) => {
        if (!conversationId || !content.trim()) {
            return rejectWithValue('无效的会话ID或消息内容');
        }
        const { auth } = getState(); // 获取当前用户信息
        const currentUser = auth.user;

         // 优化：立即将消息添加到本地状态
        const optimisticMessage = {
            id: `temp_${Date.now()}`,
            senderId: currentUser.id,
            sender: currentUser.username,
            avatar: currentUser.avatar_url,
            content: content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: true,
            status: 'sending'
        };
         dispatch(appendOptimisticMessage(optimisticMessage));


        try {
            const sentMessage = await chatApi.sendMessage(conversationId, content);
            // 成功后用服务器返回的真实消息替换临时消息
            dispatch(replaceOptimisticMessage({ tempId: optimisticMessage.id, realMessage: { ...sentMessage, isSelf: true } }));
            return sentMessage;
        } catch (error) {
             console.error("弹窗发送消息失败:", error);
             message.error('发送失败');
             // 标记发送失败
             dispatch(markMessageAsFailed(optimisticMessage.id));
            return rejectWithValue(error.message);
        }
    }
);


const initialState = {
    isVisible: false,
    targetUser: null, // { id, name, avatar }
    conversationId: null,
    messages: [],
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    error: null,
};

const chatPopupSlice = createSlice({
    name: 'chatPopup',
    initialState,
    reducers: {
        openChatPopup: (state, action) => {
            state.isVisible = true;
            state.targetUser = action.payload; // 传入 { id, name, avatar }
            // 重置其他状态
            state.conversationId = null;
            state.messages = [];
            state.currentPage = 1;
            state.totalPages = 1;
            state.isLoading = true; // 开始时设置为 loading
            state.error = null;
        },
        closeChatPopup: (state) => {
            state.isVisible = false;
            state.targetUser = null;
            state.conversationId = null;
            state.messages = [];
            state.isLoading = false;
            state.error = null;
        },
        setChatPopupConversationId: (state, action) => {
            state.conversationId = action.payload;
        },
        setChatPopupMessages: (state, action) => {
            state.messages = action.payload.messages;
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
        },
        appendOptimisticMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        replaceOptimisticMessage: (state, action) => {
            const index = state.messages.findIndex(msg => msg.id === action.payload.tempId);
            if (index !== -1) {
                state.messages[index] = action.payload.realMessage;
            }
        },
         markMessageAsFailed: (state, action) => {
             const index = state.messages.findIndex(msg => msg.id === action.payload);
             if (index !== -1) {
                 state.messages[index].status = 'failed';
             }
         },
        setChatPopupLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setChatPopupError: (state, action) => {
            state.error = action.payload;
        },
        // 未来可能需要添加加载更多消息的 reducer 和 thunk
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeChatPopup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(initializeChatPopup.fulfilled, (state, action) => {
                // conversationId 和 messages 已在 thunk 内部通过 dispatch 设置
                state.isLoading = false; // 加载完成
            })
            .addCase(initializeChatPopup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || '初始化聊天失败';
                // state 会在 thunk 内部被重置 (closeChatPopup)
            })
            .addCase(sendChatMessageViaPopup.rejected, (state, action) => {
                // 可以在这里处理发送失败的全局状态，如果需要的话
                // 消息状态已在 reducer 中标记为 failed
            });
    }
});

export const {
    openChatPopup,
    closeChatPopup,
    setChatPopupConversationId,
    setChatPopupMessages,
    appendOptimisticMessage,
    replaceOptimisticMessage,
    markMessageAsFailed,
    setChatPopupLoading,
    setChatPopupError
} = chatPopupSlice.actions;

export default chatPopupSlice.reducer;

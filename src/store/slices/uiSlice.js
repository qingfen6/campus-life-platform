import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAddPostModalVisible: false,       // 发布动态模态框
  isAddProductModalVisible: false,    // 发布商品模态框
  isAddMissionModalVisible: false,    // 发布悬赏模态框
  // 可以添加其他全局UI状态，例如侧边栏聊天窗口可见性等
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 发布动态
    showAddPostModal: (state) => {
      state.isAddPostModalVisible = true;
    },
    hideAddPostModal: (state) => {
      state.isAddPostModalVisible = false;
    },
    // 发布商品
    showAddProductModal: (state) => {
      state.isAddProductModalVisible = true;
    },
    hideAddProductModal: (state) => {
      state.isAddProductModalVisible = false;
    },
    // 发布悬赏
    showAddMissionModal: (state) => {
      state.isAddMissionModalVisible = true;
    },
    hideAddMissionModal: (state) => {
      state.isAddMissionModalVisible = false;
    },
    // 可以添加其他 reducers...
  },
});

export const {
  showAddPostModal,
  hideAddPostModal,
  showAddProductModal,
  hideAddProductModal,
  showAddMissionModal,
  hideAddMissionModal,
} = uiSlice.actions;

export default uiSlice.reducer;

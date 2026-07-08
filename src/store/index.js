import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
// import productReducer from './slices/productSlice';
import chatPopupReducer from './slices/chatPopupSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chatPopup: chatPopupReducer,
    // 其他reducer可以在这里添加
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;
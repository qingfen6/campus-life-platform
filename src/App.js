import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, theme, message, App as AntApp, Spin } from 'antd';
import Home from './pages/Home';
import MarketPage from './pages/MarketPage';
import MissionPage from './pages/MissionPage';
import MissionDetailPage from './pages/MissionDetailPage';
import ConfessWall from './pages/ConfessWall';
import SchoolHome from './pages/SchoolHome';
import AllSchoolHome from './pages/AllSchoolHome';
import ComputerSciencePage from './pages/ComputerSciencePage';
import SchoolRankingPage from './pages/SchoolRankingPage';
import ResearchPage from './pages/ResearchPage';
import ClubPage from './pages/ClubPage';
import LoginPage from './pages/LoginPage';
import PostDetailPage from './pages/PostDetailPage';
import DbStatus from './components/common/DbStatus';
import { userApi, marketApi, missionApi, homeApi } from './utils/api';
import websocketService from './utils/websocket';
import './assets/styles/global.css';
import MissionWorkPage from './pages/MissionWorkPage';
import MissionManagePage from './pages/MissionManagePage';
import MyMissionsPage from './pages/MyMissionsPage';
import ProfilePage from './pages/ProfilePage';
import { 
  hideAddProductModal, 
  hideAddMissionModal, 
  hideAddPostModal 
} from './store/slices/uiSlice';
import { loginSuccess, logout } from './store/slices/authSlice';
import AddProductModal from './components/market/AddProductModal';
import AddMissionModal from './components/mission/AddMissionModal';
import AddPostModal from './components/post/AddPostModal';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatPopupWindow from './components/chat/ChatPopupWindow';
import MockPaymentPage from './pages/MockPaymentPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyOrdersPage from './pages/MyOrdersPage';

/**
 * 应用主组件
 * 
 * 功能：
 * - 路由配置
 * - 深色模式状态管理
 * - 全局样式设置
 * - 用户认证状态管理
 */
function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const dispatch = useDispatch();
  const { isAuthenticated /*, user*/ } = useSelector(state => state.auth);
  const { 
    isAddProductModalVisible, 
    isAddMissionModalVisible, 
    isAddPostModalVisible 
  } = useSelector(state => state.ui);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isValid = await userApi.checkAuth();
        console.log('App.js - 认证检查结果:', isValid);
        if (isValid) {
          if (!isAuthenticated) {
            try {
              const profileResponse = await userApi.getProfile();
              if (profileResponse.success && profileResponse.data) {
                const token = localStorage.getItem('token');
                dispatch(loginSuccess({ user: profileResponse.data, token: token }));
              } else {
                dispatch(logout());
              }
            } catch (profileError) {
              console.error('认证检查后获取用户信息失败:', profileError);
              dispatch(logout());
            }
          }
        } else {
          if (isAuthenticated) {
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        if (isAuthenticated) {
            dispatch(logout());
        }
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyAuth();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !checkingAuth) {
      websocketService.connect();
    } else if (!isAuthenticated && !checkingAuth) {
      websocketService.close();
    }
  }, [isAuthenticated, checkingAuth]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await marketApi.getCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          console.error('获取商品分类失败 (App.js):', response.message);
        }
      } catch (error) {
        console.error('获取商品分类出错 (App.js):', error);
      }
    };
    if (isAddProductModalVisible) {
       fetchCategories();
    }
  }, [isAddProductModalVisible]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    console.log('深色模式已切换为:', newDarkMode ? '开启' : '关闭');
  };

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    if (checkingAuth) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" tip="加载认证信息..." /></div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
  };

  const handleCloseAddProductModal = () => {
    dispatch(hideAddProductModal());
  };

  const handleAddProductSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await marketApi.addProduct(formData);
      if (response.success) {
        message.success('商品发布成功');
        dispatch(hideAddProductModal());
      } else {
        message.error('发布商品失败: ' + response.message);
      }
    } catch (error) {
      console.error('发布商品出错 (App.js):', error);
      message.error('发布商品出错: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAddMissionModal = () => {
    dispatch(hideAddMissionModal());
  };

  const handleAddMissionSubmit = async (values) => {
    try {
      setSubmitting(true);
      const response = await missionApi.addMission(values);
      if (response.success) {
        message.success('任务发布成功');
        dispatch(hideAddMissionModal());
      } else {
        message.error('发布任务失败: ' + response.message);
      }
    } catch (error) {
      console.error('发布任务出错 (App.js):', error);
      message.error('发布任务出错: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAddPostModal = () => {
    dispatch(hideAddPostModal());
  };

  const handleAddPostSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await homeApi.addPost(formData);
      if (response.success) {
        message.success('动态发布成功');
        dispatch(hideAddPostModal());
      } else {
        message.error('发布动态失败: ' + response.message);
      }
    } catch (error) {
      console.error('发布动态出错 (App.js):', error);
      message.error('发布动态出错: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider 
      theme={{ 
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntApp>
        <Router>
          <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <Routes>
              <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
              <Route 
                path="/" 
                element={ <ProtectedRoute><Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/market" 
                element={ <ProtectedRoute><MarketPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/missions" 
                element={ <ProtectedRoute><MissionPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/market/product/:productId"
                element={ <ProtectedRoute><ProductDetailPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/missions/:id" 
                element={ <ProtectedRoute><MissionDetailPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/confess" 
                element={ <ProtectedRoute><ConfessWall darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/school" 
                element={ <ProtectedRoute><SchoolHome darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/allschool" 
                element={ <ProtectedRoute><AllSchoolHome darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/school/faculty/cs" 
                element={ <ProtectedRoute><ComputerSciencePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/school-ranking" 
                element={ <ProtectedRoute><SchoolRankingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/research" 
                element={ <ProtectedRoute><ResearchPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/club"
                element={ <ProtectedRoute><ClubPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/post/:postId" 
                element={ <ProtectedRoute><PostDetailPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/mission/work/:id" 
                element={ <ProtectedRoute><MissionWorkPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/mission/manage" 
                element={ <ProtectedRoute><MissionManagePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/mission/my" 
                element={ <ProtectedRoute><MyMissionsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/profile" 
                element={ <ProtectedRoute><ProfilePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/mock-payment" 
                element={ <ProtectedRoute><MockPaymentPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/orders/:orderId" 
                element={ <ProtectedRoute><OrderDetailPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route 
                path="/my-orders" 
                element={ <ProtectedRoute><MyOrdersPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute> }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
              <DbStatus />
            </div>
            <AddProductModal
              visible={isAddProductModalVisible}
              onClose={handleCloseAddProductModal}
              onSubmit={handleAddProductSubmit}
              categories={categories}
              loading={submitting}
            />
            <AddMissionModal
              visible={isAddMissionModalVisible}
              onClose={handleCloseAddMissionModal}
              onSubmit={handleAddMissionSubmit}
              loading={submitting}
            />
            <AddPostModal
              visible={isAddPostModalVisible}
              onClose={handleCloseAddPostModal}
              onSubmit={handleAddPostSubmit}
              loading={submitting}
            />
            {isAuthenticated && <ChatPopupWindow />}
          </div>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
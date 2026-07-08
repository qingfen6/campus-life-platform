import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// 导入页面组件
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TableListPage from './pages/dashboard/TableListPage';
import SqlQueryPage from './pages/dashboard/SqlQueryPage';
import UserListPage from './components/pages/users/UserListPage';
import SchoolListPage from './pages/SchoolListPage';
import NewAnalyticsPage from './pages/dashboard/NewAnalyticsPage';
// import AnalyticsPage from './pages/Dashboard/AnalyticsPage'; // 注释掉导入


// 导入路由保护组件和主布局组件
import PrivateRoute from './utils/privateRoute';
import MainLayout from './components/layout/MainLayout';
import SchoolAdminLayout from './components/layout/SchoolAdminLayout'; // 新增导入
import SchoolAdminDashboardPage from './pages/school-admin/SchoolAdminDashboardPage'; // 新增导入
import UserManagementPage from './pages/school-admin/UserManagementPage'; // 新增导入
import PostManagementPage from './pages/school-admin/PostManagementPage'; // 导入动态管理页面
import MissionManagementPage from './pages/school-admin/MissionManagementPage'; // 新增导入
import ProductManagementPage from './pages/school-admin/ProductManagementPage'; // 新增导入
import AnnouncementManagementPage from './pages/school-admin/AnnouncementManagementPage'; // 新增导入

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Switch>
          {/* 登录页 */}
          <Route path="/login" component={LoginPage} />
          
          {/* 管理面板页面 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard" exact allowedRoles={['admin']}>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* 数据表列表页 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard/tables" allowedRoles={['admin']}>
            <MainLayout>
              <TableListPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* SQL查询页 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard/sql" allowedRoles={['admin']}>
            <MainLayout>
              <SqlQueryPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* 用户列表页 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard/users" allowedRoles={['admin']}>
            <MainLayout>
              <UserListPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* 学校列表页 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard/schools" allowedRoles={['admin']}>
            <MainLayout>
              <SchoolListPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* 数据分析页 - 需要认证 (超级管理员) */}
          <PrivateRoute path="/dashboard/analytics" allowedRoles={['admin']}>
            <MainLayout>
              <NewAnalyticsPage />
            </MainLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 需要认证 */}
          {/* 注意：这里需要修改 PrivateRoute 以支持角色 */}
          <PrivateRoute path="/school-admin/dashboard">
             <SchoolAdminLayout>
                <SchoolAdminDashboardPage />
             </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 用户管理页 */}
          <PrivateRoute path="/school-admin/user-management" allowedRoles={['school_admin']}>
            <SchoolAdminLayout>
              <UserManagementPage />
            </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 动态管理页 */}
          <PrivateRoute path="/school-admin/post-management" allowedRoles={['school_admin']}>
            <SchoolAdminLayout>
              <PostManagementPage />
            </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 悬赏管理页 */}
          <PrivateRoute path="/school-admin/mission-management" allowedRoles={['school_admin']}>
             <SchoolAdminLayout>
                <MissionManagementPage />
             </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 商品管理页 */}
          <PrivateRoute path="/school-admin/product-management" allowedRoles={['school_admin']}>
             <SchoolAdminLayout>
                <ProductManagementPage />
             </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 学校管理后台 - 公告管理页 */}
          <PrivateRoute path="/school-admin/announcement-management" allowedRoles={['school_admin']}>
             <SchoolAdminLayout>
                <AnnouncementManagementPage />
             </SchoolAdminLayout>
          </PrivateRoute>
          
          {/* 根路径重定向到仪表板 */}
          <Redirect exact from="/" to="/dashboard" />
          
          {/* 未匹配的路径重定向到仪表板 */}
          {/* 对于v5, 通常将最通用的匹配（如 /dashboard 或 404）放在 Switch 的最后 */}
          {/* 如果上面的 PrivateRoute /dashboard 已经是默认，则这个通配符可能不需要或者需要调整 */}
          {/* 暂时注释掉通配符重定向，看根路径重定向和 PrivateRoute 的效果 */}
          {/* <Redirect to="/dashboard" /> */}
        </Switch>
      </Router>
    </ConfigProvider>
  );
}

export default App;

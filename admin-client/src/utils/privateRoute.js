// 私有路由组件
// 用于保护需要登录才能访问的路由
import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { isLoggedIn, getUser } from './auth';

// 私有路由组件，支持基于角色的访问控制
const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState({ checked: false, isAuthenticated: false, userRole: null });
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isLoggedIn();
      let role = null;
      if (authenticated) {
        const user = getUser();
        role = user ? user.role : null;
      }
      setAuthStatus({ checked: true, isAuthenticated: authenticated, userRole: role });
    };
    checkAuth();
  }, []);
  
  // 等待身份验证检查完成
  if (!authStatus.checked) {
    return <div>正在验证身份...</div>;
  }
  
  // 如果未登录，重定向到登录页
  if (!authStatus.isAuthenticated) {
    return <Redirect to={{ pathname: "/login", state: { from: location } }} />;
  }
  
  // 如果指定了允许的角色，并且用户的角色不在允许列表中，重定向或显示未授权页面
  if (allowedRoles && !allowedRoles.includes(authStatus.userRole)) {
    console.warn(`用户角色 '${authStatus.userRole}' 无权访问路径 '${location.pathname}'. 需要角色: ${allowedRoles.join(', ')}`);
    return <Redirect to={{ pathname: "/login", state: { message: '无权访问该页面' } }} />;
  }
  
  // 已登录，渲染子组件
  return children;
};

export default PrivateRoute; 
// 认证工具函数
// 用于处理用户登录状态、令牌管理等

// 存储令牌到本地存储
export const setToken = (token) => {
  if (!token) {
    console.error('设置令牌失败：令牌为空');
    return;
  }
  
  try {
    console.log('设置令牌:', token.substring(0, 15) + '...');
    localStorage.setItem('adminToken', token);
    
    // 验证是否成功保存
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken !== token) {
      console.error('令牌保存验证失败，期望:', token.substring(0, 15) + '...', '实际:', savedToken ? (savedToken.substring(0, 15) + '...') : '无');
    } else {
      console.log('令牌保存成功！');
    }
  } catch (error) {
    console.error('保存令牌到localStorage时出错:', error);
  }
};

// 从本地存储获取令牌
export const getToken = () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (token) {
      console.log('获取令牌成功:', token.substring(0, 15) + '...');
    } else {
      console.log('获取令牌失败: localStorage中不存在令牌');
    }
    return token;
  } catch (error) {
    console.error('从localStorage获取令牌时出错:', error);
    return null;
  }
};

// 从本地存储移除令牌
export const removeToken = () => {
  try {
    console.log('移除令牌');
    localStorage.removeItem('adminToken');
    
    // 验证是否成功移除
    if (localStorage.getItem('adminToken')) {
      console.error('令牌移除失败');
    } else {
      console.log('令牌移除成功！');
    }
  } catch (error) {
    console.error('从localStorage移除令牌时出错:', error);
  }
};

// 存储用户信息到本地存储
export const setUser = (user) => {
  console.log('设置用户:', user);
  localStorage.setItem('adminUser', JSON.stringify(user));
};

// 从本地存储获取用户信息
export const getUser = () => {
  const userStr = localStorage.getItem('adminUser');
  const user = userStr ? JSON.parse(userStr) : null;
  console.log('获取用户:', user);
  return user;
};

// 从本地存储移除用户信息
export const removeUser = () => {
  console.log('移除用户');
  localStorage.removeItem('adminUser');
};

// 检查用户是否已登录
export const isLoggedIn = () => {
  const token = getToken();
  const loggedIn = !!token;
  console.log('检查登录状态:', loggedIn);
  return loggedIn;
};

// 注销用户
export const logout = () => {
  console.log('用户注销');
  removeToken();
  removeUser();
}; 
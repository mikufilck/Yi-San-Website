import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[]; // 定义哪些角色允许进入
}

const RoleProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('auth_token');
  
  if (!token || !userStr) {
    // 未登录，滚回登录页，并记录当前想去的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(userStr);

  if (!allowedRoles.includes(user.role)) {
    // 权限不足，通常跳转到管理端首页（项目列表）
    return <Navigate to="/admin/projects" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // 如果正在加载状态，可以显示一个加载指示器
  if (loading) {
    return <div className="text-center mt-5">加载中...</div>;
  }

  // 如果用户未登录，则重定向到登录页面
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
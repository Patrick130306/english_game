import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// 创建认证上下文
export const AuthContext = createContext();

// 设置API基础URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 认证上下文提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 加载用户信息
  useEffect(() => {
    loadUser();
  }, []);

  // 加载用户信息
  const loadUser = async () => {
    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // 设置axios默认请求头
      axios.defaults.headers.common['x-auth-token'] = token;

      // 获取用户信息
      const res = await axios.get('/users/me');
      setUser(res.data);
    } catch (error) {
      // 清除无效的token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (email, password) => {
    try {
      const res = await axios.post('/users/login', { email, password });
      const { token } = res.data;

      // 保存token到localStorage
      localStorage.setItem('token', token);
      // 设置axios默认请求头
      axios.defaults.headers.common['x-auth-token'] = token;

      // 获取用户信息
      const userRes = await axios.get('/users/me');
      setUser(userRes.data);

      toast.success('登录成功！');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '登录失败，请检查邮箱和密码';
      toast.error(errorMessage);
      return false;
    }
  };

  // 注册
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/users/register', { username, email, password });
      const { token } = res.data;

      // 保存token到localStorage
      localStorage.setItem('token', token);
      // 设置axios默认请求头
      axios.defaults.headers.common['x-auth-token'] = token;

      // 获取用户信息
      const userRes = await axios.get('/users/me');
      setUser(userRes.data);

      toast.success('注册成功！');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '注册失败，请稍后再试';
      toast.error(errorMessage);
      return false;
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 清除localStorage中的token
      localStorage.removeItem('token');
      // 移除axios默认请求头
      delete axios.defaults.headers.common['x-auth-token'];
      // 设置用户为null
      setUser(null);

      toast.success('已成功登出');
    } catch (error) {
      console.error('登出时出错:', error);
    }
  };

  // 上下文值
  const authContext = {
    user,
    loading,
    login,
    register,
    logout,
    loadUser
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
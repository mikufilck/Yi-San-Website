import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 务实：进入管理登录页先清空管理员 Token，防止污染
  useEffect(() => {
    localStorage.removeItem('auth_token');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. 严格遵循 FastAPI OAuth2 规范 (Form Data)
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      // 2. 发起请求
      // 注意：由于 main.py 挂载前缀为 /api/auth，此处路径为 /auth/login
      const response: any = await apiClient.post('/auth/login', params, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      });

      // 3. 处理响应（同步存储 Token 和 User 对象）
      const token = response.access_token;
      const userData = response.user; // 获取后端返回的完整用户数据

      if (token) {
        // 存储鉴权令牌
        localStorage.setItem('auth_token', token);
        
        // --- 核心修复：存入用户信息，确保 AdminLayout 角色校验生效 ---
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // 务实：使用 window.location 确保拦截器配置刷新，并跳转到首个业务页
        window.location.href = '/admin/projects'; 
      } else {
        setError('服务器响应异常：未获取到访问令牌');
      }
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      const detail = err.response?.data?.detail;
      
      if (err.response?.status === 404) {
        setError('404: 认证服务路径未找到，请确认后端挂载路径');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('登录失败：账号或密码验证未通过');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-4 selection:bg-[#8C7355] selection:text-white">
      <div className="max-w-md w-full space-y-10 p-12 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100">
        <div className="text-center">
          <h2 className="text-3xl font-light text-zinc-900 tracking-[0.2em] uppercase">
            一三设计
          </h2>
          <div className="h-[1px] w-12 bg-[#8C7355] mx-auto mt-4 mb-2"></div>
          <p className="text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.3em]">
            Management System
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Administrator / 账号</label>
              <input
                type="text"
                autoComplete="username"
                required
                className="block w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-1 focus:ring-[#8C7355] transition-all outline-none text-sm"
                placeholder="Enter your account"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Password / 密码</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-1 focus:ring-[#8C7355] transition-all outline-none text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-[11px] font-bold py-3 px-4 rounded-xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-[#8C7355] transition-all active:scale-[0.98] shadow-lg shadow-zinc-200 disabled:bg-zinc-300"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-[9px] text-zinc-400 uppercase tracking-widest">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
};
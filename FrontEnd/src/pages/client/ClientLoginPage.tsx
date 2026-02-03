import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHash, FiLock, FiArrowRight, FiInfo } from 'react-icons/fi';
// 务实：改用我们统一定义的 apiClient 
import { apiClient } from '../../utils/apiClient';

const ClientLoginPage: React.FC = () => {
  const [projectId, setProjectId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 务实：进入业主登录页先清空旧的业主 Token，防止身份污染
  useEffect(() => {
    localStorage.removeItem('client_token');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
        // 1. 调用 apiClient。根据 main.py 挂载逻辑，路径为 /auth/client/login
        // 注意：apiClient 已经配置了 baseURL: /api，所以这里写相对路径
        const res: any = await apiClient.post("/auth/client/login", {
          project_no: projectId,
          access_code: accessCode
        });

        // 2. 存储业主端专属 Token (Key 必须与 apiClient 拦截器中的 client_token 一致)
        if (res.access_token) {
            localStorage.setItem('client_token', res.access_token);
            
            // 3. 登录成功，跳转到业主看板
            // 使用 window.location 强制刷新以确保 axios 拦截器立即应用新 Token
            window.location.href = `/client/dashboard/${res.project_id}`;
        } else {
            alert("服务器未返回访问凭证，请联系管理员");
        }
    } catch (error: any) {
        // 报错信息由 apiClient 拦截器统一 toast 提示，此处仅做逻辑处理
        console.error("Client Login Error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* 头部引导 */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-zinc-900 text-[#8C7355] mb-8">
            <FiHash size={32} />
          </div>
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 mb-4">项目进度查询</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-[0.2em]">Project Tracking System</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white p-10 shadow-sm border border-zinc-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">项目编号 / Project ID</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="如: YS-2026-001"
                  className="w-full bg-zinc-50 border-none px-5 py-4 text-sm focus:ring-1 focus:ring-[#8C7355] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">访问码 / Access Code</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="请输入您的私密访问码"
                  className="w-full bg-zinc-50 border-none px-5 py-4 text-sm focus:ring-1 focus:ring-[#8C7355] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white py-5 flex items-center justify-center gap-3 hover:bg-[#8C7355] transition-all duration-500 group disabled:opacity-50"
            >
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                {isLoading ? '正在验证身份...' : '立即进入系统'}
              </span>
              {!isLoading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-8 flex gap-3 p-4 bg-amber-50 text-amber-700">
            <FiInfo className="shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed italic">
              项目编号及访问码通常位于您的《施工合同》首页。如无法找回，请联系您的专属设计师或拨打 400 服务热线。
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/support')}
          className="w-full mt-8 text-center text-zinc-400 hover:text-zinc-900 text-[10px] uppercase font-black tracking-widest transition-colors"
        >
          返回服务支持中心
        </button>
      </motion.div>
    </div>
  );
};

export default ClientLoginPage;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient'; // 务实：统一使用封装的客户端
import { 
  FiUser, FiMail, FiShield, FiSmartphone, 
  FiCheckCircle, FiInfo, FiLogOut, FiLoader, FiCamera, FiLock, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'Administrator',
    lastLogin: '',
    avatar: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 1. 获取真实用户资料 (修正路径为 /auth/me)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await apiClient.get('/auth/me');
        setUserData({
          name: res.username || 'Admin',
          email: res.email || 'N/A',
          role: res.role === 'super_admin' ? 'Super Administrator' : 'Project Manager',
          lastLogin: new Date().toLocaleString(),
          avatar: (res.username?.[0] || 'A').toUpperCase()
        });
      } catch (err: any) {
        console.error("无法获取个人资料", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. 退出登录 (务实：调用后端登出接口)
  const handleLogout = async () => {
    if (window.confirm('确定要退出系统吗？')) {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        console.warn("后端登出通知失败，正在强制清理本地缓存");
      } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  // 3. 保存个人信息修改 (修正路径为 /auth/profile)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put('/auth/profile', { 
        username: userData.name, 
        email: userData.email 
      });
      setIsEditing(false);
      toast.success('个人信息更新成功');
    } catch (err: any) {
      // 错误由拦截器自动 toast
    } finally {
      setIsSaving(false);
    }
  };

  // 4. 修改密码逻辑
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('两次输入的新密码不一致');
    }
    setIsSaving(true);
    try {
      // 假设后端对应的接口路径，需根据后端实际增加的接口调整
      await apiClient.put('/auth/change-password', {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      toast.success('密码修改成功，请重新登录');
      handleLogout();
    } catch (err) {
      // 报错已由拦截器处理
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <FiLoader className="animate-spin text-zinc-300" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 selection:bg-[#8C7355] selection:text-white">
      {/* 顶部资料卡片 */}
      <section className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10 p-10 bg-white border border-zinc-100 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
              <FiLogOut /> Logout / 退出
            </button>
        </div>
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center text-4xl text-[#8C7355] font-light shadow-2xl transition-transform group-hover:scale-[1.02]">
            {userData.avatar}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <FiCamera className="text-white text-xl" />
          </div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tighter">{userData.name}</h1>
          <p className="text-[#8C7355] text-[10px] font-black uppercase tracking-[0.3em] mb-4">{userData.role}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 text-xs text-zinc-400 font-medium">
             <span className="flex items-center"><FiMail className="mr-2"/> {userData.email}</span>
             <span className="flex items-center"><FiCheckCircle className="mr-2 text-green-500"/> 系统已授权访问</span>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 border ${isEditing ? 'bg-zinc-100 border-transparent text-zinc-900' : 'border-zinc-200 text-zinc-500'} text-[10px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all rounded-full`}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* 账号设置 */}
          <div className="bg-white p-10 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 pb-4">账号设置 / Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">管理员姓名</label>
                <input 
                  disabled={!isEditing}
                  type="text" 
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7355] transition-all disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">电子邮箱</label>
                <input 
                  disabled={!isEditing}
                  type="email" 
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7355] transition-all disabled:opacity-50"
                />
              </div>
            </div>
            {isEditing && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8C7355] transition-all rounded-xl flex justify-center items-center gap-2">
                {isSaving ? <FiLoader className="animate-spin" /> : 'Confirm Save / 保存修改'}
              </motion.button>
            )}
          </div>

          {/* 安全中心 */}
          <div className="bg-white p-10 rounded-3xl border border-zinc-100 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 pb-4 mb-6">安全中心 / Security</h3>
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400"><FiShield /></div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">修改登录密码</p>
                    <p className="text-xs text-zinc-400">建议定期更换密码以保障项目数据安全</p>
                  </div>
                </div>
                <button onClick={() => setIsPassModalOpen(true)} className="text-[10px] font-black text-[#8C7355] uppercase tracking-widest hover:underline">Modify</button>
             </div>
          </div>
        </div>

        {/* 系统信息 */}
        <aside className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl border border-white/5">
             <div className="flex items-center space-x-3 mb-6">
                <FiInfo className="text-[#8C7355] text-xl" />
                <h3 className="text-sm font-black tracking-widest uppercase">System Status</h3>
             </div>
             <div className="space-y-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                <div className="flex justify-between border-b border-white/5 pb-2"><span>Version</span><span className="text-white font-mono">1.2.6-Beta</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span>Last Sync</span><span className="text-white font-mono uppercase text-[9px]">{userData.lastLogin}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span>Node</span><span className="text-green-500 font-mono">CN-XM-01</span></div>
             </div>
             <p className="mt-12 text-[9px] text-zinc-500 font-medium italic leading-relaxed uppercase tracking-tighter">
               &copy; 2026 YISAN DESIGN CMS. <br/>All project assets are encrypted with AES-256.
             </p>
          </div>
        </aside>
      </div>

      {/* 修改密码模态框 */}
      <AnimatePresence>
        {isPassModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPassModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2rem] p-10 shadow-2xl relative z-10">
              <button onClick={() => setIsPassModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black"><FiX size={20}/></button>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#8C7355]"><FiLock size={24}/></div>
                <h2 className="text-xl font-bold text-zinc-900">修改登录密码</h2>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Change Security Password</p>
              </div>
              <div className="space-y-4">
                <input type="password" placeholder="当前旧密码" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7355]" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}/>
                <input type="password" placeholder="设置新密码" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7355]" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}/>
                <input type="password" placeholder="再次确认新密码" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7355]" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}/>
                <button onClick={handleChangePassword} disabled={isSaving} className="w-full py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8C7355] transition-all rounded-xl mt-4">
                  {isSaving ? <FiLoader className="animate-spin mx-auto"/> : 'Update Password / 立即更新'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { UserPage };
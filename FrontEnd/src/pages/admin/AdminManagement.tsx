import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import { 
  FiUserPlus, FiShield, FiTrash2, FiKey, FiActivity, FiX, FiCheck, FiMail 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 从本地获取当前登录用户信息，用于权限比对
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [formData, setFormData] = useState({
    username: '', email: '', full_name: '', password: '', role: 'admin'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.get('/users/');
      setUsers(data);
    } catch (err) {
      // 拦截器自动处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users/', formData);
      toast.success('新管理账号已激活');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {}
  };

  const handleResetPassword = async (userId: number) => {
    const newPass = window.prompt('请输入该账号的新密码（至少8位）:');
    if (!newPass || newPass.length < 8) return toast.error('密码长度不足');
    
    try {
      // 对齐后端要求的 new_password 字段
      await apiClient.put(`/users/${userId}/reset-password`, { new_password: newPass });
      toast.success('密码重置成功，该用户下次登录将生效');
    } catch (err) {}
  };

  const handleDelete = async (user: any) => {
    if (user.id === currentUser.id) return toast.error('务实提示：你不能删除你自己');
    if (user.role === 'super_admin' && !isSuperAdmin) return toast.error('权限不足：禁止删除其他超级管理员');
    
    if (!window.confirm(`确定要注销管理员 ${user.username} 的权限吗？`)) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      toast.success('账号已注销');
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {}
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic uppercase">Security Council</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">系统核心权限与账号管控</p>
        </div>
        
        {/* 仅超级管理员可见创建按钮 */}
        {isSuperAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-[#8C7355] transition-all shadow-xl flex items-center text-[10px] tracking-widest uppercase"
          >
            <FiUserPlus className="mr-2 text-lg" /> Provision Account
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Identity / Status</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contact</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Access Level</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right pr-12">Security Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center animate-pulse text-zinc-300 uppercase text-[10px] font-black tracking-widest">Verifying Permissions...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="group hover:bg-zinc-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-200 shadow-inner">
                        <FiShield size={20} className={u.role === 'super_admin' ? 'text-[#8C7355]' : ''} />
                      </div>
                      {/* 在线状态 Badge */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 border-white rounded-full ${u.is_online ? 'bg-green-500' : 'bg-zinc-300'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-zinc-900 uppercase tracking-tight">{u.username}</div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">{u.full_name || 'Anonymous User'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-2"><FiMail className="text-zinc-300" /> {u.email}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-[0.15em] border ${
                    u.role === 'super_admin' ? 'border-[#8C7355] text-[#8C7355] bg-[#8C7355]/5' : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right pr-12">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {/* 普通管理员只能改自己，超管可以改所有人 */}
                    {(isSuperAdmin || u.id === currentUser.id) && (
                      <button 
                        onClick={() => handleResetPassword(u.id)}
                        className="p-3 bg-white text-zinc-400 hover:text-black hover:shadow-md rounded-xl border border-zinc-100 transition-all"
                        title="Reset Password"
                      >
                        <FiKey />
                      </button>
                    )}
                    {/* 删除按钮仅超管可见，且不能删自己 */}
                    {isSuperAdmin && u.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDelete(u)}
                        className="p-3 bg-white text-zinc-400 hover:text-red-500 hover:shadow-md rounded-xl border border-zinc-100 transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 创建管理员 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-md p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase">New Administrator</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-300 hover:text-black"><FiX size={24}/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Username</label>
                <input required className="w-full bg-zinc-50 border-none rounded-xl px-5 py-3 text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input className="w-full bg-zinc-50 border-none rounded-xl px-5 py-3 text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Role</label>
                  <select className="w-full bg-zinc-50 border-none rounded-xl px-5 py-3 text-sm outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Email Address</label>
                <input type="email" required className="w-full bg-zinc-50 border-none rounded-xl px-5 py-3 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Initial Password</label>
                <input type="password" required className="w-full bg-zinc-50 border-none rounded-xl px-5 py-3 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-zinc-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8C7355] transition-all shadow-xl mt-4">
                Confirm Provisioning
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
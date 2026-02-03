import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiMapPin, FiUsers, FiActivity, FiX, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// 1. 定义随机码生成函数 (6位大写字母+数字)
const generateAccessCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const ProjectManagerPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const initialForm = {
    project_no: '',
    client_name: '',
    client_email: '',
    address: '',
    access_code: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // 务实：路径不带末尾斜杠以防 307 重定向导致 Token 丢失
      const data: any = await apiClient.get('/admin/projects'); 
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      // 拦截器自动处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // 提交新建项目
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/admin/projects', formData);
      toast.success('新项目初始化成功');
      setIsModalOpen(false);
      fetchProjects();
      setFormData(initialForm);
    } catch (err) {
      // 错误已由 apiClient 捕获
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('警告：删除项目将永久抹除所有施工节点、照片记录及业主访问权限。')) return;
    try {
      await apiClient.delete(`/admin/projects/${id}`);
      toast.success('项目已永久注销');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {}
  };

  return (
    <div className="space-y-8">
      {/* 头部区域：全汉化 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic uppercase">Operations Control</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">在建工程动态监控中心</p>
        </div>
        <button 
          onClick={() => {
            // 自动生成 2026 年度编号前缀和随机验证码
            const currentYear = new Date().getFullYear();
            setFormData({
              ...initialForm,
              project_no: `YS-${currentYear}-`, 
              access_code: generateAccessCode()
            });
            setIsModalOpen(true);
          }}
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-[#8C7355] transition-all shadow-xl flex items-center text-[10px] tracking-widest uppercase"
        >
          <FiPlus className="mr-2 text-lg" /> 新增项目部署
        </button>
      </div>

      {/* 项目列表卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-32 text-center animate-pulse text-zinc-300 text-[10px] tracking-[0.3em] uppercase font-black">正在扫描在建工程...</div>
        ) : projects.map((p) => (
          <div key={p.id} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <span className="text-[8px] font-black px-2 py-0.5 bg-[#8C7355] text-white rounded-sm uppercase tracking-widest">{p.status}</span>
                <h3 className="text-lg font-black text-zinc-900 italic leading-tight">{p.client_name} · 邸</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{p.project_no}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-light text-[#8C7355] tracking-tighter">{p.current_progress}%</div>
                <div className="text-[8px] text-zinc-300 font-black uppercase tracking-tighter">当前进度</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-xs text-zinc-500 gap-2"><FiMapPin size={12}/> {p.address || '地址待录入'}</div>
              <div className="flex items-center text-xs text-zinc-500 gap-2"><FiUsers size={12}/> {p.client_email || '暂无联络邮箱'}</div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/admin/projects/${p.id}`)}
                className="flex-1 bg-zinc-50 text-zinc-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <FiActivity /> 进度管理面板
              </button>
              <button 
                onClick={() => handleDelete(p.id)}
                className="p-3 text-zinc-200 hover:text-red-500 transition-colors"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 项目初始化模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase">Project Deployment / 项目初始化</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-300 hover:text-black"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">项目编号</label>
                  <input required placeholder="例如：YS-2026-001" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none" value={formData.project_no} onChange={e => setFormData({...formData, project_no: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">业主访问码 (已自动生成)</label>
                  <input required placeholder="6位随机验证码" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none" value={formData.access_code} onChange={e => setFormData({...formData, access_code: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">业主姓名</label>
                <input required placeholder="例如：张先生 / Mr. Zhang" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">业主邮箱 (用于接收同步通知)</label>
                <input type="email" required placeholder="例如：zhang@example.com" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none" value={formData.client_email} onChange={e => setFormData({...formData, client_email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">工程详细地址</label>
                <input placeholder="例如：厦门市湖里区红星美凯龙 6F 001号" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-zinc-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">取消</button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-zinc-900 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#8C7355] transition-all shadow-xl disabled:opacity-50 flex items-center"
                >
                  {submitting && <FiLoader className="animate-spin mr-2" />}
                  确认初始化并发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
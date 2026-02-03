import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../utils/apiClient';
import toast from 'react-hot-toast';

const AppointmentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    user_name: '',
    contact_info: '',
    project_type: '住宅人居',
    budget: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.user_name || !form.contact_info) {
      toast.error("请填写姓名和联络方式 / Name and Contact are required");
      return;
    }
    
    setLoading(true);
    try {
      // source_url 记录完整路径，budget 提供默认回显
      await apiClient.post('/bookings/', { 
        ...form, 
        budget: form.budget || "待商议",
        source_url: window.location.href 
      });
      setDone(true);
      toast.success("预约成功！我们将尽快联络您");
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "提交失败，请稍后再试";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <main className="pt-40 pb-20 px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 左侧：品牌文案 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#8C7355] font-bold mb-6 block">Reserved Service</span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-10 leading-[1.1]">
              开启您的<br />品质空间之旅
            </h1>
            <p className="text-zinc-500 font-light leading-relaxed max-w-md text-justify text-lg">
              一三设计提供从建筑规划到软装陈设的一体化解决方案。请留下您的联络方式，我们的资深顾问将在 24 小时内与您联系。
            </p>
          </motion.div>

          {/* 右侧：表单容器 */}
          <motion.div 
            className="bg-zinc-50 p-8 md:p-12 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {done ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-20">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-6 text-xl">✓</div>
                <h2 className="text-2xl font-bold mb-4">预约已收到</h2>
                <p className="text-zinc-400 font-light text-sm">感谢您的信任，我们会尽快给您回电。</p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="mt-8 text-[10px] underline tracking-widest uppercase font-bold hover:text-[#8C7355] transition-colors"
                >
                  Back Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 基础信息 */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 block">Name / 姓名</label>
                  <input 
                    required 
                    className="border-b border-zinc-200 bg-transparent w-full py-2 outline-none focus:border-black transition-colors"
                    onChange={e => setForm({...form, user_name: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 block">Contact / 联络</label>
                    <input 
                      required 
                      placeholder="电话或微信" 
                      className="border-b border-zinc-200 bg-transparent w-full py-2 outline-none focus:border-black transition-colors" 
                      onChange={e => setForm({...form, contact_info: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 block">Project / 类型</label>
                    <select 
                      className="border-b border-zinc-200 bg-transparent w-full py-2 outline-none focus:border-black transition-colors" 
                      onChange={e => setForm({...form, project_type: e.target.value})}
                    >
                      <option>住宅人居</option>
                      <option>办公公共</option>
                      <option>商业零售</option>
                      <option>酒店度假</option>
                      <option>展会展厅</option>
                      <option>旧建筑改造</option>
                      <option>其他</option>
                    </select>
                  </div>
                </div>

                {/* 补全预算字段 */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 block">Budget / 预算范围</label>
                  <select 
                    className="border-b border-zinc-200 bg-transparent w-full py-2 outline-none focus:border-black transition-colors" 
                    onChange={e => setForm({...form, budget: e.target.value})}
                  >
                    <option value="">请选择预算范围</option>
                    <option value="10-30万">10-30万</option>
                    <option value="30-50万">30-50万</option>
                    <option value="50-100万">50-100万</option>
                    <option value="100万以上">100万以上</option>
                    <option value="面议">面议</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 block">Note / 备注</label>
                  <textarea 
                    rows={2} 
                    placeholder="请简述您的设计需求"
                    className="border-b border-zinc-200 bg-transparent w-full py-2 outline-none focus:border-black transition-colors resize-none" 
                    onChange={e => setForm({...form, message: e.target.value})} 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:bg-zinc-300 shadow-lg shadow-black/10"
                >
                  {loading ? 'Sending...' : 'Confirm Appointment / 确认预约'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentPage;
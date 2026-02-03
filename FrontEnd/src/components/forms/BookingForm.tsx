import React, { useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast'; // 引入专业提示工具

/**
 * 快速预约表单组件
 */
const BookingForm: React.FC<{ context?: string }> = ({ context }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    contact_info: '',
    project_type: '住宅人居',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基础校验
    if (!formData.user_name.trim() || !formData.contact_info.trim()) {
      toast.error("请提供姓名和联络方式");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/bookings/', {
        ...formData,
        source_url: `${window.location.pathname}${context ? ` [来源: ${context}]` : ''}`
      });
      
      setSubmitted(true);
      toast.success("预约已收到，我们将尽快联络您");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "提交失败，请检查网络后重试";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 提交成功后的视图
  if (submitted) return (
    <div className="p-10 text-center border border-zinc-100 rounded-2xl bg-zinc-50/50 backdrop-blur-sm">
      <div className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">✓</div>
      <p className="text-zinc-900 font-bold text-sm">预约请求已发送</p>
      <p className="text-[11px] text-zinc-400 mt-2 italic leading-relaxed">
        我们的顾问会尽快联系您 <br /> We will contact you shortly.
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-zinc-50">
      <div className="mb-2">
        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-900">Quick Booking</h3>
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">快速预约服务</p>
      </div>

      <div className="space-y-4">
        <input 
          required
          placeholder="您的姓名 / Name"
          className="w-full border-b border-zinc-100 py-3 outline-none focus:border-[#8C7355] transition-colors text-sm bg-transparent"
          value={formData.user_name}
          onChange={e => setFormData({...formData, user_name: e.target.value})}
        />
        
        <input 
          required
          placeholder="电话或微信 / Contact"
          className="w-full border-b border-zinc-100 py-3 outline-none focus:border-[#8C7355] transition-colors text-sm bg-transparent"
          value={formData.contact_info}
          onChange={e => setFormData({...formData, contact_info: e.target.value})}
        />

        <select 
          className="w-full border-b border-zinc-100 py-3 outline-none text-sm bg-transparent cursor-pointer focus:border-[#8C7355]"
          value={formData.project_type}
          onChange={e => setFormData({...formData, project_type: e.target.value})}
        >
          <option>住宅人居</option>
          <option>办公公共</option>
          <option>商业零售</option>
          <option>酒店度假</option>
          <option>展会展厅</option>
          <option>旧建筑改造</option>
          <option value="其他">其他类型</option>
        </select>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-zinc-900 text-white py-4 mt-2 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#8C7355] transition-all duration-500 disabled:bg-zinc-200 shadow-xl shadow-zinc-100 active:scale-[0.98]"
      >
        {loading ? 'Sending...' : 'Confirm / 提交预约'}
      </button>
      
      <p className="text-[9px] text-zinc-300 text-center italic">
        * 您的个人信息将受到严格保密 / Privacy Guaranteed.
      </p>
    </form>
  );
};

export default BookingForm;

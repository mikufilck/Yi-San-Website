import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiAward, FiArrowRight, FiClock, FiCheckCircle, FiLoader, FiX, FiPhone, FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiClient } from '../../utils/apiClient';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [casesCount, setCasesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 获取后台数据
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingData, caseData]: any = await Promise.all([
        apiClient.get('/bookings/'),
        apiClient.get('/cases/')
      ]);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setCasesCount(Array.isArray(caseData) ? caseData.length : 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // 务实处理：生成真实的 7 天趋势数据
  const chartData = useMemo(() => {
    // 获取最近 7 天的日期序列 (YYYY-MM-DD)
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // 统计每天真实的预约数量
    return dates.map(date => {
      const count = bookings.filter(b => {
        if (!b.created_at) return false;
        return b.created_at.startsWith(date);
      }).length;

      return {
        // 格式化显示为 01/22 这种简短日期
        name: date.split('-').slice(1).join('/'),
        "咨询量": count
      };
    });
  }, [bookings]);

  // 状态流转处理
  const handleUpdateStatus = async (id: number, status: string) => {
    let next = status === 'pending' ? 'processing' : 'completed';
    try {
      setActionLoading(id);
      await apiClient.put(`/bookings/${id}`, { status: next });
      const statusMap: any = { 'processing': '处理中', 'completed': '已完成' };
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: next } : b));
      if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status: next });
      toast.success(`状态已更新为: ${statusMap[next]}`);
    } catch (e) {
    } finally {
      setActionLoading(null);
    }
  };

  // 删除预约记录
  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('确定要删除这条客户预约吗？此操作不可撤销。')) return;
    try {
      setActionLoading(id);
      await apiClient.delete(`/bookings/${id}`);
      toast.success('预约记录已移除');
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedBooking(null);
    } catch (e) {
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10 relative">
      {/* 顶部简报卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="待处理咨询" 
          value={bookings.filter(b => b.status === 'pending').length} 
          icon={<FiClock className="text-[#8C7355]" />} 
        />
        <StatCard 
          title="总预约量" 
          value={bookings.length} 
          icon={<FiUsers className="text-zinc-400" />} 
        />
        <StatCard 
          title="作品案例数" 
          value={casesCount} 
          icon={<FiAward className="text-zinc-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* 趋势图表 - 真实数据驱动 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">Inquiry Trend / 7日咨询趋势</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C7355" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8C7355" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="咨询量" stroke="#8C7355" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 预约看板 */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
              <h3 className="font-black text-zinc-900 tracking-widest uppercase text-[10px]">Inquiry Pipeline / 预约列表</h3>
              <button onClick={fetchDashboardData} className="text-[10px] text-[#8C7355] font-black uppercase tracking-widest hover:underline">刷新数据</button>
            </div>
            <div className="divide-y divide-zinc-50">
              {bookings.length > 0 ? bookings.map(b => (
                <div key={b.id} onClick={() => setSelectedBooking(b)} className="p-6 hover:bg-zinc-50/50 cursor-pointer flex items-center justify-between transition-colors group">
                  <div className="flex items-center space-x-4">
                    <StatusDot status={b.status} />
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{b.user_name}</div>
                      <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">
                        {b.project_type} · {b.contact_info}
                      </div>
                    </div>
                  </div>
                  <FiArrowRight className="text-zinc-200 group-hover:text-black transition-colors" />
                </div>
              )) : (
                <div className="p-20 text-center text-zinc-400 text-xs tracking-widest uppercase">暂无预约咨询数据</div>
              )}
            </div>
          </div>
        </div>

        {/* 快捷操作侧栏 */}
        <div className="space-y-10">
          <div className="bg-zinc-950 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-[#8C7355] text-[10px] font-black tracking-[0.3em] uppercase mb-8">Quick Actions / 快捷操作</h3>
            <button 
              onClick={() => navigate('/admin/cases/new')} 
              className="w-full py-4 bg-white/5 hover:bg-[#8C7355] transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-left px-6 flex items-center justify-between group"
            >
              <span>发布新案例</span>
              <FiPlus className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 预约详情抽屉 */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setSelectedBooking(null)} 
              className="fixed inset-0 bg-zinc-950/20 backdrop-blur-md z-[60]" 
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-lg h-full bg-white z-[70] shadow-2xl p-12 flex flex-col"
            >
              <button onClick={() => setSelectedBooking(null)} className="absolute top-10 right-10 text-zinc-300 hover:text-black transition-colors">
                <FiX size={24} />
              </button>
              
              <div className="mt-10 mb-12">
                <StatusBadge status={selectedBooking.status} />
                <h2 className="text-4xl font-light tracking-tighter text-zinc-900 mt-6">{selectedBooking.user_name}</h2>
                <p className="text-zinc-400 text-xs mt-2 uppercase tracking-widest font-bold">Inquiry Detail / 客户意向详情</p>
              </div>

              <div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <DetailItem label="联系方式" icon={<FiPhone />}>
                  {selectedBooking.contact_info}
                </DetailItem>
                <DetailItem label="项目类型" icon={<FiAward />}>
                  {selectedBooking.project_type}
                </DetailItem>
                <DetailItem label="具体需求描述" icon={<FiMessageSquare />}>
                  <div className="bg-zinc-50 p-6 rounded-3xl text-zinc-600 leading-relaxed italic text-sm border border-zinc-100">
                    "{selectedBooking.message || '该客户未填写具体的留言需求'}"
                  </div>
                </DetailItem>
                <DetailItem label="提交时间" icon={<FiClock />}>
                  {new Date(selectedBooking.created_at).toLocaleString('zh-CN')}
                </DetailItem>
              </div>

              <div className="pt-10 border-t border-zinc-100 space-y-4">
                {selectedBooking.status !== 'completed' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, selectedBooking.status)} 
                    disabled={actionLoading === selectedBooking.id}
                    className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8C7355] transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {actionLoading === selectedBooking.id ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
                    {selectedBooking.status === 'pending' ? '推进至：沟通处理中' : '推进至：已结案存档'}
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  disabled={actionLoading === selectedBooking.id}
                  className="w-full bg-red-50 text-red-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <FiTrash2 className="mr-2" /> 删除此预约记录
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 子组件保持一致 ---
const StatCard = ({ title, value, icon }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-[#8C7355] transition-all duration-500">
    <div>
      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-4xl font-light tracking-tighter text-zinc-900">{value.toString().padStart(2, '0')}</p>
    </div>
    <div className="text-3xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">{icon}</div>
  </div>
);

const DetailItem = ({ label, icon, children }: any) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2 text-zinc-400">
      <span className="text-xs">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-sm font-bold text-zinc-900 px-6">{children}</div>
  </div>
);

const StatusDot = ({ status }: { status: string }) => {
  const colors: any = { pending: 'bg-orange-400 animate-pulse', processing: 'bg-blue-400', completed: 'bg-green-400' };
  return <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-zinc-300'}`} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = { pending: 'bg-orange-50 text-orange-600', processing: 'bg-blue-50 text-blue-600', completed: 'bg-green-50 text-green-600' };
  const labels: any = { pending: '待处理', processing: '处理中', completed: '已完成' };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

export { DashboardPage };
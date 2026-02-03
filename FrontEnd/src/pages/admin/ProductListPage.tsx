import React, { useEffect, useState } from 'react';
// --- 核心修复：改用封装好的 apiClient ---
import { apiClient } from '../../utils/apiClient';
import { FiPlus, FiTrash2, FiBox, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- 表单状态 ---
  const initialForm = {
    category: 'me',
    title: '',
    subtitle: '',
    summary: '',
    description: '',
    cover_image: '',
    specs: [{ label: '', value: '' }],
    highlights: [{ title: '', value: '' }]
  };

  const [formData, setFormData] = useState(initialForm);

  // --- 1. 获取列表：移除硬编码端口 ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.get('/products/');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      // 拦截器已处理全局报错
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // --- 2. 提交数据：使用 apiClient 自动注入 Token ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/products/', formData);
      setIsModalOpen(false);
      toast.success('工艺板块发布成功');
      fetchProducts();
      setFormData(initialForm); // 重置表单
    } catch (err) {
      // 报错已由拦截器处理
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. 删除操作 ---
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除此工艺内容吗？')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('已从资产库移除');
      setProducts(prev => prev.filter((p: any) => p.id !== id));
    } catch (err) {}
  };

  const updateItem = (type: 'specs' | 'highlights', index: number, field: string, val: string) => {
    const newList = [...formData[type]] as any[];
    newList[index][field] = val;
    setFormData({ ...formData, [type]: newList });
  };

  const addItem = (type: 'specs' | 'highlights') => {
    const newItem = type === 'specs' ? { label: '', value: '' } : { title: '', value: '' };
    setFormData({ ...formData, [type]: [...formData[type], newItem] });
  };

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 tracking-tight italic uppercase">Product & Craft / 工艺管理</h2>
          <p className="text-xs text-zinc-400 font-black uppercase tracking-[0.2em] mt-1">机电与装饰核心工艺数据管理</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-[#8C7355] transition-all"
        >
          <FiPlus className="mr-2 text-sm" /> New Content
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</div>
        ) : products.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-zinc-50 rounded-xl flex items-center justify-center text-[#8C7355] border border-zinc-100 shadow-inner">
                <FiBox size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.category === 'me' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    {p.category === 'me' ? '机电' : '装饰'}
                  </span>
                  <h4 className="font-bold text-zinc-900">{p.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 mt-2 italic">"{p.summary || '暂无摘要描述'}"</p>
              </div>
            </div>
            <button onClick={() => handleDelete(p.id)} className="p-3 text-zinc-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <FiTrash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-10">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-50">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Create Craft Block / 发布新工艺</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-300 hover:text-black"><FiX size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">所属分类</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#8C7355] outline-none">
                      <option value="me">机电 (Mechanical & Electrical)</option>
                      <option value="decoration">装饰 (Decoration / Finish)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">主标题</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：BIM集成机电系统" className="w-full p-4 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#8C7355] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">封面图路径</label>
                    <input type="text" value={formData.cover_image} onChange={e => setFormData({...formData, cover_image: e.target.value})} placeholder="/uploads/..." className="w-full p-4 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#8C7355] outline-none" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">副标题 (En)</label>
                    <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="English Subtitle" className="w-full p-4 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#8C7355] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">简短摘要</label>
                    <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} rows={4} className="w-full p-4 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#8C7355] outline-none resize-none" />
                  </div>
                </div>
              </div>

              {/* 动态 Specs */}
              <div className="mb-10">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex justify-between">
                  技术参数 (Specs) <button type="button" onClick={() => addItem('specs')} className="text-[#8C7355] text-[10px] font-black uppercase underline">+ Add Row</button>
                </label>
                {formData.specs.map((s, i) => (
                  <div key={i} className="flex gap-4 mb-3">
                    <input placeholder="参数名" value={s.label} onChange={e => updateItem('specs', i, 'label', e.target.value)} className="flex-1 p-3 bg-zinc-50 border-none rounded-lg text-xs" />
                    <input placeholder="参数值" value={s.value} onChange={e => updateItem('specs', i, 'value', e.target.value)} className="flex-1 p-3 bg-zinc-50 border-none rounded-lg text-xs font-bold" />
                  </div>
                ))}
              </div>

              {/* 动态 Highlights */}
              <div className="mb-10">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex justify-between">
                  工艺亮点 (Highlights) <button type="button" onClick={() => addItem('highlights')} className="text-[#8C7355] text-[10px] font-black uppercase underline">+ Add Highlight</button>
                </label>
                {formData.highlights.map((h, i) => (
                  <div key={i} className="space-y-3 mb-4 p-5 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <input placeholder="亮点标题" value={h.title} onChange={e => updateItem('highlights', i, 'title', e.target.value)} className="w-full p-3 bg-white border-none rounded-lg text-xs font-black uppercase tracking-widest" />
                    <textarea placeholder="详细描述内容" value={h.value} onChange={e => updateItem('highlights', i, 'value', e.target.value)} className="w-full p-3 bg-white border-none rounded-lg text-xs text-zinc-500 leading-relaxed" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-6 pt-6 border-t border-zinc-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-10 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center shadow-2xl hover:bg-[#8C7355] transition-all disabled:opacity-50"
                >
                  {submitting ? <FiLoader className="animate-spin mr-2" /> : <FiCheck className="mr-2" />} 
                  Confirm Archive / 确认发布
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
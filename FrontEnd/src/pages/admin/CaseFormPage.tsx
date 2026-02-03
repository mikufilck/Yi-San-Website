import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, getFileUrl } from '../../utils/apiClient'; // 核心：导入 getFileUrl
import { FiArrowLeft, FiImage, FiUpload, FiX, FiCheck, FiLoader, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORY_MAP: Record<string, string> = {
  '办公公共': 'office-public', '住宅人居': 'residential', '商业零售': 'commercial',
  '旧建筑改造': 'old-building-renovation', '酒店度假': 'hotel-vacation', '展会展厅': 'exhibition-hall'
};

const STYLE_MAP: Record<string, string> = {
  '现代简约': 'modern', '工业风格': 'industrial', '法式复古': 'french',
  '意式极简': 'italian', '东方禅意': 'oriental', '先锋艺术': 'avant-garde'
};

export const CaseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', chinese_title: '', slug: '', location: '',
    area: '', year: new Date().getFullYear(), description: '',
    categories: [] as string[], styles: [] as string[], images: [] as string[], 
  });

  useEffect(() => {
    if (isEdit) {
      const fetchDetail = async () => {
        try {
          const data: any = await apiClient.get(`/cases/${id}`);
          setFormData({
            title: data.title || '', chinese_title: data.chinese_title || '',
            slug: data.slug || '', location: data.location || '',
            area: data.area?.toString() || '', year: data.year || 2026,
            description: data.description || '', categories: data.categories || [],
            styles: data.styles || [], images: data.images || [],
          });
        } catch (err) { navigate('/admin/cases'); }
      };
      fetchDetail();
    }
  }, [id, isEdit, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        const res: any = await apiClient.post('/cases/upload', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        // 务实：数据库存储相对路径 /uploads/...
        setFormData(prev => ({ ...prev, images: [...prev.images, res.url] }));
      }
      toast.success('媒体资源上传成功');
    } catch (err) {
      toast.error('图片上传失败，请检查格式或文件大小');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return toast.error('请至少上传一张项目主图');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, '-'),
        area: parseFloat(formData.area as string) || 0
      };
      if (isEdit) {
        await apiClient.put(`/cases/${id}`, payload);
        toast.success('案例更新成功');
      } else {
        await apiClient.post('/cases/', payload);
        toast.success('新案例已发布至资产库');
      }
      navigate('/admin/cases');
    } catch (err: any) {
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32 selection:bg-[#8C7355] selection:text-white">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <button onClick={() => navigate('/admin/cases')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-4 transition-colors">
            <FiArrowLeft /> Return to Gallery
          </button>
          <h1 className="text-4xl font-light tracking-tighter text-zinc-900 italic uppercase">
            {isEdit ? 'Archive Edition' : 'New Creation'}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">YI SAN DESIGN CMS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-10">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Project Metadata / 项目概况</h2>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                    <FiInfo /> 填写信息将自动同步至前台官网
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">中文标题 (Chinese Title)</label>
                <input 
                  required 
                  placeholder="例：西溪首座 · 极简艺术办公空间"
                  className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300" 
                  value={formData.chinese_title} 
                  onChange={e => setFormData({...formData, chinese_title: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">英文标题 (Title)</label>
                <input 
                  required 
                  placeholder="例：Xixi Center Minimalist Office"
                  className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">路径别名 (Slug)</label>
                <input 
                  placeholder="例：xixi-center-office"
                  className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">地理位置 (Location)</label>
                <input 
                  placeholder="例：杭州 · 西湖区"
                  className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">建筑面积 (Area ㎡)</label>
                <input 
                  type="number" 
                  placeholder="例：120.5"
                  className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300" 
                  value={formData.area} 
                  onChange={e => setFormData({...formData, area: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest ml-1">项目描述 (Description)</label>
              <textarea 
                rows={6} 
                placeholder="请输入项目的设计背景、核心理念及主要材料说明..."
                className="w-full bg-white border-2 border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none placeholder:text-zinc-300 leading-relaxed" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-50 pb-6 mb-8">Media Resources / 媒体资源</h2>
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()} 
              className={`border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all ${uploading ? 'bg-zinc-50 border-zinc-300 cursor-not-allowed' : 'hover:bg-zinc-50 hover:border-zinc-900 border-zinc-100'}`}
            >
              <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileUpload} />
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <FiLoader className="animate-spin text-2xl" />
                  <span className="text-[10px] font-black uppercase">资源处理中...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <FiUpload className="mx-auto text-3xl text-zinc-200" />
                  <p className="text-[10px] font-black uppercase tracking-widest">点击或拖拽 WebP 项目图至此处</p>
                </div>
              )}
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {formData.images.map((img, i) => (
                <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border border-zinc-50 bg-zinc-50 shadow-sm">
                  {/* 核心修复：使用 getFileUrl 将相对路径解析为带域名的完整 URL */}
                  <img 
                    src={getFileUrl(img)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="preview"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Load+Error'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="bg-white text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl">
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-zinc-950 p-10 rounded-[2.5rem] shadow-2xl sticky top-8">
            {/* 分类与风格部分保持逻辑不变 */}
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Categories / 案例分类</h3>
              <div className="space-y-4">
                {Object.entries(CATEGORY_MAP).map(([cn, en]) => (
                  <label key={en} className="flex items-center cursor-pointer group">
                    <input type="checkbox" checked={formData.categories.includes(en)} onChange={() => setFormData({...formData, categories: formData.categories.includes(en) ? formData.categories.filter(i => i !== en) : [...formData.categories, en]})} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-[#8C7355] focus:ring-[#8C7355]" />
                    <span className="ml-4 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">{cn}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Styles / 设计风格</h3>
              <div className="space-y-4">
                {Object.entries(STYLE_MAP).map(([cn, en]) => (
                  <label key={en} className="flex items-center cursor-pointer group">
                    <input type="checkbox" checked={formData.styles.includes(en)} onChange={() => setFormData({...formData, styles: formData.styles.includes(en) ? formData.styles.filter(i => i !== en) : [...formData.styles, en]})} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-[#8C7355] focus:ring-[#8C7355]" />
                    <span className="ml-4 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">{cn}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="w-full bg-[#8C7355] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-2xl disabled:opacity-30"
            >
              {loading ? <FiLoader className="animate-spin mx-auto text-xl" /> : (isEdit ? 'Archive Updates / 更新资产' : 'Publish Archive / 发布作品')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
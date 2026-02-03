import React, { useEffect, useState } from 'react';
import { apiClient, getFileUrl } from '../../utils/apiClient'; // 核心：统一路径标准
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit3, FiTrash2, FiPlus, FiImage, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CaseListPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.get('/cases/');
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      // 拦截器自动处理全局错误提示
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要永久删除该项目吗？此操作将同步删除云端索引及物理文件。')) return;
    try {
      await apiClient.delete(`/cases/${id}`);
      toast.success('案例资产已成功移除');
      setCases(prev => prev.filter(c => c.id !== id));
    } catch (err) {}
  };

  return (
    <div className="space-y-8 selection:bg-[#8C7355] selection:text-white">
      {/* 顶部标题区 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic uppercase">Project Gallery</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">作品资产库管理中心</p>
        </div>
        <Link 
          to="/admin/cases/new" 
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-[#8C7355] transition-all duration-500 shadow-xl flex items-center text-[10px] tracking-widest uppercase"
        >
          <FiPlus className="mr-2 text-lg" /> New Archive
        </Link>
      </div>

      {/* 列表数据区 */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Preview / Project</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Metadata</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Stats</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right pr-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-32 text-center animate-pulse text-zinc-300 text-[10px] tracking-[0.3em] uppercase font-black">
                  Synchronizing Assets...
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-32 text-center text-zinc-300 text-[10px] tracking-[0.3em] uppercase font-black">
                  资产库暂无数据
                </td>
              </tr>
            ) : (
              // 核心修复：确保这里的括号嵌套完全正确
              cases.map((c) => (
                <tr key={c.id} className="group hover:bg-zinc-50/30 transition-all duration-300">
                  {/* 预览图与标题 */}
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-50 flex-shrink-0 shadow-inner relative">
                        {c.images && c.images.length > 0 ? (
                          <img
                            // 务实修复：补全后端域名
                            src={getFileUrl(c.images[0].replace('.webp', '_thumb.webp'))} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={c.chinese_title}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('_thumb.webp')) {
                                target.src = getFileUrl(c.images[0]);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-200">
                            <FiImage size={24}/>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-black text-zinc-900 leading-tight tracking-tighter uppercase italic">
                          {c.chinese_title}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-bold mt-1.5 uppercase tracking-widest">
                          {c.title}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 案例分类标签 */}
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                      {c.categories?.map((cat: string) => (
                        <span key={cat} className="text-[8px] font-black px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-sm uppercase tracking-widest border border-zinc-200/50">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 项目指标数据 */}
                  <td className="px-8 py-6">
                    <div className="text-sm text-zinc-900 font-bold tracking-tighter">{c.area} m²</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
                      {c.year} · {c.location}
                    </div>
                  </td>

                  {/* 操作按钮 */}
                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <a 
                        href={`/cases/${c.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-white text-zinc-400 hover:text-[#8C7355] hover:shadow-md rounded-xl transition-all border border-zinc-100"
                        title="预览前台"
                      >
                        <FiExternalLink />
                      </a>
                      <button 
                        onClick={() => navigate(`/admin/cases/edit/${c.id}`)} 
                        className="p-3 bg-white text-zinc-400 hover:text-black hover:shadow-md rounded-xl transition-all border border-zinc-100"
                        title="编辑"
                      >
                        <FiEdit3 />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="p-3 bg-white text-zinc-400 hover:text-red-500 hover:shadow-md rounded-xl transition-all border border-zinc-100"
                        title="永久删除"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { CaseListPage };
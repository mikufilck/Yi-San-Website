import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCategoryBySlug } from '../data/businessData';
import { apiClient, getFileUrl } from '../utils/apiClient'; // 核心：统一生产环境路径标准

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  useEffect(() => {
    const fetchCases = async () => {
      if (!categorySlug) return;
      setIsLoading(true);
      try {
        const response: any = await apiClient.get('/cases/', { 
          params: { category: categorySlug } 
        });
        
        if (Array.isArray(response)) {
          setCases(response);
          setTotal(response.length);
        } else {
          setCases(response.items || []);
          setTotal(response.total || 0);
        }
        setError(null);
      } catch (err: any) {
        console.error("加载案例失败:", err);
        setError("无法同步云端资产列表");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [categorySlug]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-light text-zinc-300 mb-6 tracking-widest uppercase italic">Category Not Found</h1>
          <Link to="/cases" className="text-[11px] font-black uppercase tracking-[0.3em] border-b border-black pb-1 hover:text-[#8C7355] hover:border-[#8C7355] transition-all">
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#8C7355] selection:text-white">
      <main className="pb-32">
        {/* Header Section */}
        <div className="bg-zinc-50 border-b border-zinc-100 pt-32 pb-16">
          <div className="container mx-auto px-8">
            <nav className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-10">
              <Link to="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <Link to="/cases" className="hover:text-black transition-colors">Practice</Link>
              <span>/</span>
              <span className="text-black italic">{category.chineseTitle}</span>
            </nav>

            <div className="max-w-4xl">
              <div className="mb-4">
                <span className="text-[#8C7355] text-xs font-black tracking-[0.4em] uppercase">
                  {category.englishTitle}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-zinc-900 mb-8 tracking-tighter italic">
                {category.chineseTitle}
              </h1>
              <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-3xl text-justify italic">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-8 py-20">
          {isLoading ? (
            <div className="text-center py-40">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-900 mb-6"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Synchronizing Portfolio...</p>
            </div>
          ) : error ? (
            <div className="text-center py-40 border border-dashed border-zinc-200 rounded-[2.5rem]">
              <p className="text-zinc-400 mb-6 font-light">{error}</p>
              <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest border-b border-black">Retry Connection</button>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-40 border border-dashed border-zinc-200 rounded-[2.5rem]">
              <h3 className="text-xl font-light text-zinc-300 mb-3 tracking-[0.2em] uppercase italic">Coming Soon</h3>
              <p className="text-zinc-400 text-sm font-light">一三设计在该分类下的实操案例正在整理上传中</p>
            </div>
          ) : (
            <>
              <div className="mb-16 flex justify-between items-end border-b border-zinc-100 pb-8">
                <div>
                  <h2 className="text-2xl font-light tracking-widest uppercase italic">Selected Works</h2>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-2">一三设计 · {category.chineseTitle}实践案例库</p>
                </div>
                <div className="text-[10px] font-mono text-zinc-300 tracking-widest uppercase">Index: {total.toString().padStart(2, '0')}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {cases.map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/cases/${categorySlug}/${item.slug}`)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 mb-8 rounded-sm shadow-sm">
                      <img
                        /* 核心修复：生产环境强制路径补全 */
                        src={item.images?.[0] ? getFileUrl(item.images[0]) : '/placeholder.jpg'}
                        alt={item.chinese_title}
                        className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 group-hover:rotate-1"
                        loading="lazy"
                        onError={(e) => {
                          // 生产环境安全回退：加载失败则隐藏或使用内部默认图
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.classList.add('bg-zinc-50');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-zinc-900/5 transition-colors duration-700" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-light text-zinc-900 group-hover:text-[#8C7355] transition-colors duration-500 tracking-tight italic">
                          {item.chinese_title}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-300 tracking-widest">{item.year}</span>
                      </div>
                      <p className="text-zinc-400 text-xs font-light line-clamp-2 leading-relaxed h-10 italic">
                        {item.description || "Exploration of contemporary space and human experience."}
                      </p>
                      <div className="flex items-center justify-between pt-5 border-t border-zinc-50 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <span className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#8C7355] rounded-full"></span>
                          {item.location}
                        </span>
                        <span>{item.area} m²</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
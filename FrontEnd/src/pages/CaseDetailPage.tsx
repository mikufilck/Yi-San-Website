import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, getFileUrl } from '../utils/apiClient'; // 核心：标准路径工具

const CaseDetailPage: React.FC = () => {
  const { caseSlug } = useParams<{ caseSlug: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!caseSlug) return;
      try {
        setLoading(true);
        // 通过 slug 获取项目详情 (后端路由: /cases/s/{slug})
        const data: any = await apiClient.get(`/cases/s/${caseSlug}`);
        setProject(data);
      } catch (err) {
        console.error("获取项目详情失败:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [caseSlug]);

  // 1. 加载状态：保持品牌色调与简约感
  if (loading) return (
    <div className="h-screen flex items-center justify-center font-mono uppercase tracking-[0.3em] text-zinc-300 bg-white">
      Synchronizing Details...
    </div>
  );
  
  // 2. 错误处理
  if (!project) return (
    <div className="h-screen flex flex-col items-center justify-center text-zinc-400 bg-white space-y-4">
      <p className="font-light tracking-widest uppercase">项目不存在 / Case Not Found</p>
      <button onClick={() => window.history.back()} className="text-[10px] font-black uppercase border-b border-black pb-1">Return</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#8C7355] selection:text-white">
      {/* 3. Hero 视觉区：采用生产环境标准路径 */}
      <section className="relative h-[80vh] bg-zinc-950 overflow-hidden">
        {project.images && project.images.length > 0 && (
          <img 
            src={getFileUrl(project.images[0])} 
            className="w-full h-full object-cover opacity-60 scale-105" 
            alt={project.chinese_title} 
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-7xl font-light text-white mb-6 tracking-tighter italic">
            {project.chinese_title}
          </h1>
          <p className="text-[#8C7355] font-mono text-sm md:text-lg tracking-[0.4em] uppercase">
            {project.title} / {project.year}
          </p>
        </div>
      </section>

      {/* 4. 项目核心参数：网格化排版 */}
      <section className="py-24 max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-10 border-l border-zinc-100 pl-8">
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Location</h4>
              <p className="text-xl font-light tracking-tight">{project.location || 'China'}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Area</h4>
              <p className="text-xl font-light tracking-tight">{project.area} m²</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Design Type</h4>
              <p className="text-xl font-light tracking-tight">{project.categories?.join(' / ')}</p>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-10 tracking-tight uppercase italic border-b border-zinc-50 pb-6">项目概况 / Concept</h3>
            <p className="text-zinc-500 leading-relaxed text-lg font-light whitespace-pre-line text-justify italic">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* 5. 图片瀑布流展示：每一张图都必须通过 getFileUrl 处理 */}
      <section className="pb-32 max-w-[1400px] mx-auto px-8 space-y-16">
        {project.images?.map((img: string, idx: number) => (
          <div key={idx} className="w-full overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm">
            <img 
              src={getFileUrl(img)} 
              alt={`${project.chinese_title}-${idx}`} 
              className="w-full h-auto object-cover block hover:scale-[1.01] transition-transform duration-[1.5s] ease-out" 
              loading="lazy"
              onError={(e) => { 
                // 生产环境安全处理：如果某张图加载失败，直接隐藏该容器
                e.currentTarget.parentElement?.style.setProperty('display', 'none'); 
              }}
            />
          </div>
        ))}
      </section>

      {/* 6. 页脚引导 */}
      <footer className="py-20 text-center border-t border-zinc-50">
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] mb-8">End of Archive</p>
         <button 
           onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
           className="text-[11px] font-bold uppercase tracking-widest hover:text-[#8C7355] transition-colors"
         >
           Back to Top / 返回顶部
         </button>
      </footer>
    </div>
  );
};

export default CaseDetailPage;
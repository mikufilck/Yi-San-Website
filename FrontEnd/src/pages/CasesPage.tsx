import React, { useState, useMemo } from 'react';
import CaseGrid from '../components/cases/CaseGrid';
import CaseFilter from '../components/cases/CaseFilter';
import { caseStudies } from '../data/caseStudies';
import { CaseFilter as FilterType } from '../types/case';

const CasesPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  // 筛选逻辑
  const filteredCases = useMemo(() => {
    return caseStudies.filter(caseStudy => {
      // 类别筛选
      if (filter.categories && filter.categories.length > 0) {
        const hasCategory = filter.categories.some(category => 
          caseStudy.categories.includes(category)
        );
        if (!hasCategory) return false;
      }

      // 年份筛选
      if (filter.yearFrom && caseStudy.year < filter.yearFrom) return false;
      if (filter.yearTo && caseStudy.year > filter.yearTo) return false;

      // 面积筛选
      if (filter.areaFrom && caseStudy.area < filter.areaFrom) return false;
      if (filter.areaTo && caseStudy.area > filter.areaTo) return false;

      // 精选筛选
      if (filter.featured !== undefined && caseStudy.featured !== filter.featured) {
        return false;
      }

      // 搜索筛选
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          caseStudy.chineseTitle.toLowerCase().includes(searchLower) ||
          caseStudy.title.toLowerCase().includes(searchLower) ||
          caseStudy.location.toLowerCase().includes(searchLower) ||
          caseStudy.description.toLowerCase().includes(searchLower) ||
          caseStudy.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [filter]);

  const categories = useMemo(() => {
    const allCategories = caseStudies.flatMap(c => c.categories);
    return Array.from(new Set(allCategories));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-black selection:text-white">
      {/* 注意：此处不再手动添加 Header，由 App.tsx 的 PublicLayout 提供 */}

      {/* 1. 页面标题区 */}
      <section className="bg-white border-b border-zinc-100 pt-32 pb-16">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-light text-zinc-900 mb-6 tracking-tighter">
              Selected Projects
              <span className="block text-2xl mt-2 font-normal text-zinc-400 tracking-normal">设计案例</span>
            </h1>
            <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-2xl mx-auto">
              探索一三设计团队的精彩作品。我们通过研究空间的流动、光线的折射以及材质的触感，为每一位客户量身定制独属于他们的精神堡垒。
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span className="px-4 py-2 bg-zinc-50 rounded-full">{caseStudies.length} Projects</span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
              <span className="px-4 py-2 bg-zinc-50 rounded-full">{new Set(caseStudies.map(c => c.year)).size} Years</span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
              <span className="px-4 py-2 bg-zinc-50 rounded-full">Global Presence</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 交互筛选区 (保持 Sticky 逻辑，适配 Layout Header 高度) */}
      <div className="sticky top-[64px] z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm">
        <div className="container mx-auto px-8">
          <div className="py-6">
            <CaseFilter
              filter={filter}
              onChange={setFilter}
              categories={categories}
            />
            <div className="flex items-center justify-between mt-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Found <span className="text-black">{filteredCases.length}</span> Results
              </div>
              <div className="flex items-center bg-zinc-100 p-1 rounded-lg">
                <button
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md ${
                    viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </button>
                <button
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md ${
                    viewMode === 'masonry' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                  onClick={() => setViewMode('masonry')}
                >
                  Masonry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 案例列表区 */}
      <main className="container mx-auto px-8 py-16">
        {filteredCases.length > 0 ? (
          <CaseGrid 
            cases={filteredCases}
            layout={viewMode}
          />
        ) : (
          <div className="py-40 text-center">
            <p className="text-zinc-400 font-light italic">No projects found matching your criteria.</p>
            <button 
              onClick={() => setFilter({})}
              className="mt-6 text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* 注意：此处不再手动添加 Footer，由 App.tsx 的 PublicLayout 提供 */}
    </div>
  );
};

export default CasesPage;
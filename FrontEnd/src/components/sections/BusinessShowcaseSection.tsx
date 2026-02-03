import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Featured.css'; 

/**
 * 业务精选区块 - 优化版
 * 布局策略：完全保留原有的 staggered grid (错落矩阵) 结构
 * 修复：类名拼写错误、高度展开动画、SPA 跳转逻辑
 */
const BusinessShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  // 务实：保持你原有的三段式路径逻辑
  const goToCase = (slug: string, category: string = 'all') => {
    navigate(`/cases/${category}/${slug}`);
  };

  return (
    <section className="featured-grid bg-white py-20 px-4 md:px-10 max-w-[1400px] mx-auto">
      {/* 头部标题区 */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-l-4 border-black pl-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            精选设计 <span className="text-gray-400 text-lg ml-4 font-light italic">COLLECTION</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed font-light">
            溯源本质，聚焦核心。在办公、人居与商业空间中，寻找美学与实用的平衡点。
          </p>
        </div>
        <button 
          onClick={() => navigate('/cases')}
          className="mt-6 md:mt-0 px-6 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-500 tracking-widest text-xs font-bold active:scale-95"
        >
          VIEW ALL
        </button>
      </div>

      {/* 第一部分：左侧双堆叠 + 右侧纵向大块 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              <GridItem 
                title="辦公公共" en="WORKPLACE" sub="聚焦環境健康，強調空間可持續性" 
                img="/images/business/办公室.webp"
                hClass="h-[200px]"
                onClick={() => goToCase('workplace', 'office-public')}
              />
              <GridItem 
                title="酒店度假" en="HOTELS" sub="重新定義奢華，塑造療愈的酒旅體驗" 
                img="/images/business/源昌中央公园酒店.webp"
                hClass="h-[200px]"
                onClick={() => goToCase('hotels', 'hotel-vacation')}
              />
            </div>
            <GridItem 
              title="住宅人居" en="RESIDENTIAL" sub="踐行時代新變化，引領人居新趨勢" 
              img="/images/business/建发璞玥云山3301.webp"
              hClass="h-full min-h-[412px]"
              onClick={() => goToCase('residential', 'residential')}
            />
        </div>
        
        <div className="md:col-span-1">
          <GridItem 
            title="舊建築改造" en="OLD BUILDING" sub="保留文化記憶，激活空間使用" 
            img="/images/business/莆田朱总祖宅.webp" 
            hClass="h-full min-h-[412px]"
            onClick={() => goToCase('renovation', 'old-building-renovation')}
          />
        </div>
      </div>

      {/* 第二部分：横向商业块 + 品牌文字装饰块 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="md:col-span-3">
          <GridItem 
            title="商業零售" en="COMMERCIAL" sub="打造多元感官體驗的“城市客廳”" 
            img="/images/business/厦门中交建发五缘海悦.webp"
            hClass="h-[220px]"
            onClick={() => goToCase('commercial', 'commercial')}
          />
        </div>
        
        {/* 品牌装饰块 */}
        <div className="md:col-span-1 bg-zinc-900 flex flex-col items-center justify-center text-white p-6 group overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10 text-center">
            <div className="text-xl font-light tracking-[0.5em] mb-2">YI SAN</div>
            <div className="text-[10px] font-extralight tracking-[0.2em] text-zinc-500 mb-4 uppercase">Design Studio</div>
            <div className="h-[1px] w-8 bg-zinc-700 group-hover:w-16 transition-all duration-700 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* 第三部分：收尾长条块 */}
      <div className="grid grid-cols-1 gap-3">
        <GridItem 
          title="展會展廳" en="IP CULTURAL TOURISM" sub="為空間創造更多文化精神表達方式" 
          img="/images/business/鑫易石材展会2026.webp"
          hClass="h-[200px]"
          onClick={() => goToCase('ip-tourism', 'exhibition-hall')}
        />
      </div>
    </section>
  );
};

/**
 * 内部网格项组件
 * 修复了关键类名拼写和高度动画逻辑
 */
const GridItem = ({ title, en, sub, img, onClick, hClass = "aspect-[16/9]" }: any) => (
  <div className={`item group ${hClass} relative overflow-hidden bg-black cursor-pointer`} onClick={onClick}>
    {/* 背景图层 */}
    <img 
      src={img} 
      alt={title} 
      className="one-img w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-all duration-1000 group-hover:scale-105" 
    />
    
    {/* 装饰图标 */}
    <div className="icon absolute top-4 right-4 flex gap-1">
      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
    </div>
    
    {/* 文字内容区 - 修正了拼写错误 business-list */}
    <div className="business-list absolute bottom-6 left-6 right-6 text-white z-10 pointer-events-none">
      <div className="text_title font-bold text-xl mb-1 tracking-tight">{title}</div>
      <div className="text_content text-[9px] font-mono tracking-[0.2em] opacity-50 uppercase">{en}</div>
      
      {/* 动效描述文字 - 优化了 max-height 以实现平滑展开 */}
      <div className="text_threeTitle text-xs opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 mt-0 group-hover:mt-3 transition-all duration-500 text-gray-300 leading-relaxed line-clamp-1">
        {sub}
      </div>
    </div>
  </div>
);

export default BusinessShowcaseSection;
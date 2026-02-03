import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1. 数据配置化：以后增加设计师只需在这里加对象
const DESIGNER_DATA = [
  {
    id: 1,
    name: "许斌",
    title: "中国 | 一三创始人",
    image: "/images/designer/许斌.webp"
  },
  // 下一位设计师直接贴在这里...
];

const DesignerSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 border-t border-zinc-100 bg-white">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col lg:flex-row gap-20">
        
        {/* 左侧标题 */}
        <div className="lg:w-1/4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-4">
            Our Visionaries
          </p>
          <h2 className="text-4xl font-light tracking-tighter text-zinc-900">
            设计师<span className="text-[#8C7355] ml-2">.</span>
          </h2>
        </div>

        {/* 右侧设计师矩阵 */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {DESIGNER_DATA.map((designer) => (
              <div 
                key={designer.id} 
                className="group cursor-pointer"
                onClick={() => navigate(`/about/teamshow/${designer.id}`)}
              >
                {/* 图片容器：固定比例，左对齐裁剪 */}
                <div className="aspect-[3/4] overflow-hidden bg-zinc-50 mb-8 relative">
                  <img 
                    src={designer.image} 
                    alt={designer.name}
                    // 核心修改：object-left 解决对齐，去除了所有缩放和灰度
                    className="w-full h-full object-cover object-left block transition-opacity duration-500 group-hover:opacity-90"
                  />
                </div>
                
                {/* 文字信息：保持极简 */}
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-zinc-900 tracking-tight">
                    {designer.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                    {designer.title}
                  </p>
                </div>
              </div>
            ))}

            {/* 当人数较少时，显示一个优雅的留白或占位 */}
            {DESIGNER_DATA.length < 3 && (
              <div className="hidden lg:flex aspect-[3/4] border border-dashed border-zinc-100 items-center justify-center p-12 text-center">
                <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.3em] leading-relaxed">
                  More talented designers <br /> joining the collective
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignerSection;
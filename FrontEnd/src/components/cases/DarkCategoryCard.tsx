import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子

interface DarkCategoryCardProps {
  category: {
    id: number;
    slug: string;
    chineseTitle: string;
    englishTitle: string;
    description: string;
    imageUrl: string;
  };
  reversed?: boolean;
}

const DarkCategoryCard: React.FC<DarkCategoryCardProps> = ({ category, reversed = false }) => {
  const navigate = useNavigate(); // 初始化跳转函数

  const handleClick = () => {
    navigate(`/cases/${category.slug}`);
  };

  return (
    <div 
      className={`group flex flex-col lg:flex-row items-stretch overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer shadow-2xl ${
        reversed ? 'lg:flex-row-reverse' : ''
      }`}
      onClick={handleClick}
    >
      {/* 图片区域 - 占2/5宽度 */}
      <div className="lg:w-2/5 h-80 lg:h-auto relative overflow-hidden">
        <img
          src={category.imageUrl}
          alt={category.chineseTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>
      
      {/* 文字区域 - 占3/5宽度 */}
      <div className="lg:w-3/5 p-10 lg:p-12 flex flex-col">
        {/* 标题区域 */}
        <div className="mb-8">
          <div className="inline-flex items-center mb-4">
            <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">
              {category.englishTitle}
            </span>
            <div className="w-8 h-px bg-amber-600 ml-4"></div>
          </div>
          
          <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {category.chineseTitle}
          </h3>
        </div>
        
        {/* 描述区域 */}
        <div className="flex-grow">
          <p className="text-gray-300 text-lg leading-relaxed">
            {category.description}
          </p>
        </div>
        
        {/* 底部交互提示 */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center text-amber-500 font-bold tracking-widest text-sm group-hover:text-amber-400 transition-colors">
            <span className="mr-4">VIEW PORTFOLIO</span>
            <svg 
              className="w-6 h-6 transform transition-transform group-hover:translate-x-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          
          <div className="text-gray-600 font-mono text-xs">
            © {new Date().getFullYear()} YI SAN
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkCategoryCard;
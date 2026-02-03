import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子

interface CategoryAltCardProps {
  category: {
    id: number;
    slug: string;
    chineseTitle: string;
    englishTitle: string;
    description: string;
    imageUrl: string;
  };
  reversed?: boolean; // 是否反转布局（图片在右）
}

const CategoryAltCard: React.FC<CategoryAltCardProps> = ({ category, reversed = false }) => {
  const navigate = useNavigate(); // 初始化跳转函数

  const handleClick = () => {
    navigate(`/cases/${category.slug}`);
  };

  return (
    <div 
      className={`flex flex-col lg:flex-row items-stretch overflow-hidden rounded-2xl shadow-xl bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        reversed ? 'lg:flex-row-reverse' : ''
      }`} 
      onClick={handleClick}
    >
      {/* 图片区域 */}
      <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
        <img
          src={category.imageUrl}
          alt={category.chineseTitle}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent lg:hidden" />
      </div>
      
      {/* 文字区域 */}
      <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-2">
          <span className="text-amber-600 text-sm font-medium tracking-wider">
            {category.englishTitle}
          </span>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {category.chineseTitle}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {category.description}
        </p>
        
        <div className="flex items-center text-amber-600 font-medium group">
          <span className="mr-2">探索案例</span>
          <svg 
            className="w-5 h-5 transition-transform group-hover:translate-x-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CategoryAltCard;
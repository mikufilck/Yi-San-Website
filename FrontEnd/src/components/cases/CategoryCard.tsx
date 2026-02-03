import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子

interface CategoryCardProps {
  category: {
    id: number;
    slug: string;
    chineseTitle: string;
    englishTitle: string;
    description: string;
    imageUrl: string;
  };
  onClick?: (slug: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const navigate = useNavigate(); // 初始化跳转函数

  const handleClick = () => {
    if (onClick) {
      onClick(category.slug);
    } else {
      navigate(`/cases/${category.slug}`);
    }
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={category.imageUrl}
          alt={category.chineseTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {category.chineseTitle}
            </h3>
            <p className="text-gray-600 text-sm">{category.englishTitle}</p>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>
        
        <div className="flex items-center text-amber-600 text-sm font-medium">
          查看案例
          <svg 
            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
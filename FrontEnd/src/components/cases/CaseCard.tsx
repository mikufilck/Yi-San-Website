import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子
import { CaseStudy, CaseCategory } from '../../types/case';

interface CaseCardProps {
  caseStudy: CaseStudy;
  onClick?: () => void;
  variant?: 'compact' | 'detailed';
}

const CaseCard: React.FC<CaseCardProps> = ({ 
  caseStudy, 
  onClick,
  variant = 'detailed' 
}) => {
  const navigate = useNavigate(); // 初始化跳转函数
  
  const primaryImage = caseStudy.images?.find(img => (img as any).isPrimary) || caseStudy.images?.[0];
  
  /**
   * 务实修复：路径清理函数保持不变，仅优化跳转逻辑
   */
  const cleanPath = (path: string) => {
    if (!path) return '/images/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return path.replace(/^\\/public/, '');
  };

  const getCategoryLabel = (category: any): string => {
    const labels: Record<string, string> = {
      'residential': '住宅设计',
      'commercial': '商业空间',
      'office-public': '办公空间',
      'hotel-vacation': '酒店餐饮',
      'cultural': '文化空间'
    };
    return labels[category] || '设计案例';
  };

  /**
   * 务实重构：使用 navigate 代替 window.location.href
   * 实现无刷新的单页应用跳转
   */
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止冒泡
    if (onClick) {
      onClick();
    } else {
      // 这里的跳转现在是平滑的 SPA 行为
      navigate(`/cases/detail/${caseStudy.slug || caseStudy.id}`);
    }
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
      onClick={handleNavigate}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cleanPath(primaryImage?.url || '')}
          alt={caseStudy.chineseTitle || caseStudy.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
          {getCategoryLabel(caseStudy.categories?.[0])}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5 line-clamp-1">
              {caseStudy.chineseTitle || caseStudy.title}
            </h3>
            <p className="text-gray-400 text-xs uppercase tracking-wider">{caseStudy.title}</p>
          </div>
        </div>
        
        {variant === 'detailed' && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
            <span className="flex items-center">
              📍 {caseStudy.location || '中国'}
            </span>
            <span>{caseStudy.area} ㎡</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseCard;
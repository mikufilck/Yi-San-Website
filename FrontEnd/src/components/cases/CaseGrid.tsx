import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子
import CaseCard from './CaseCard';
import { CaseStudy } from '../../types/case';

interface CaseGridProps {
  cases: CaseStudy[];
  onCaseClick?: (caseStudy: CaseStudy) => void;
  layout?: 'grid' | 'masonry';
  emptyMessage?: string;
}

const CaseGrid: React.FC<CaseGridProps> = ({ 
  cases, 
  onCaseClick,
  layout = 'grid',
  emptyMessage = '暂无设计案例'
}) => {
  const navigate = useNavigate(); // 初始化跳转函数

  if (cases.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-6xl mb-4">🏗️</div>
        <h3 className="text-xl font-medium text-gray-500 mb-2">{emptyMessage}</h3>
        <p className="text-gray-400">敬请期待更多精彩案例</p>
      </div>
    );
  }

  const handleCardClick = (caseStudy: CaseStudy) => {
    if (onCaseClick) {
      onCaseClick(caseStudy);
    } else {
      navigate(`/cases/${caseStudy.slug}`);
    }
  };

  if (layout === 'masonry') {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {cases.map((caseStudy) => (
          <div key={caseStudy.id} className="break-inside-avoid">
            <CaseCard 
              caseStudy={caseStudy} 
              onClick={() => handleCardClick(caseStudy)}
              variant="compact"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cases.map((caseStudy) => (
        <CaseCard 
          key={caseStudy.id} 
          caseStudy={caseStudy} 
          onClick={() => handleCardClick(caseStudy)}
        />
      ))}
    </div>
  );
};

export default CaseGrid;
import React from 'react';
import { CaseFilter as FilterType, CaseCategory } from '../../types/case';

interface CaseFilterProps {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
  categories?: string[];
}

const CaseFilter: React.FC<CaseFilterProps> = ({ 
  filter, 
  onChange, 
  categories = [] 
}) => {
  const handleCategoryChange = (category: string) => {
    const currentCategories = filter.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onChange({ ...filter, categories: newCategories });
  };

  const handleFeaturedChange = () => {
    onChange({ ...filter, featured: !filter.featured });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, search: e.target.value });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  // 类别标签映射
  const categoryLabels: Record<CaseCategory, string> = {
    [CaseCategory.RESIDENTIAL]: '住宅设计',
    [CaseCategory.COMMERCIAL]: '商业空间',
    [CaseCategory.OFFICE]: '办公空间',
    [CaseCategory.HOSPITALITY]: '酒店餐饮',
    [CaseCategory.CULTURAL]: '文化空间',
    [CaseCategory.MIXED_USE]: '混合用途'
  };

  const hasActiveFilters = () => {
    return (
      (filter.categories && filter.categories.length > 0) ||
      filter.featured !== undefined ||
      filter.search
    );
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索案例名称、地点、标签..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={filter.search || ''}
          onChange={handleSearchChange}
        />
        <div className="absolute left-3 top-3.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* 类别筛选 */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">设计类型</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filter.categories?.includes(category)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {categoryLabels[category] || category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 精选筛选 */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.featured || false}
            onChange={handleFeaturedChange}
            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">仅显示精选案例</span>
        </label>

        {/* 清除筛选按钮 */}
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
};


export default CaseFilter;

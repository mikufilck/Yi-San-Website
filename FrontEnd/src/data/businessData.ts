export interface BusinessCategory {
  id: number;
  slug: string;            // URL友好标识，如'office-public'
  chineseTitle: string;    // 中文标题，如'办公公共'
  englishTitle: string;    // 英文标题，如'WORKPLACE'
  description: string;     // 简短描述
  imageUrl: string;        // 分类图片（网络图片占位）
  size: 'small' | 'medium' | 'large'; // 卡片大小（用于主页随机布局）
}

// 您提供的6个分类，随机分配大小
export const businessCategories: BusinessCategory[] = [
  {
    id: 1,
    slug: 'office-public',
    chineseTitle: '办公公共',
    englishTitle: 'WORKPLACE',
    description: '聚焦环境健康，强调空间可持续性',
    imageUrl: '/images/business/办公室.webp',
    size: 'large'  // 随机分配：大卡片
  },
  {
    id: 2,
    slug: 'residential',
    chineseTitle: '住宅人居',
    englishTitle: 'RESIDENTIAL',
    description: '践行时代新变化，引领人居新趋势，为人居赋能',
    imageUrl: '/images/business/西溪半岛A03.webp',
    size: 'medium'  // 随机分配：中等卡片
  },
  {
    id: 3,
    slug: 'commercial',
    chineseTitle: '商业零售',
    englishTitle: 'COMMERCIAL',
    description: '打造多元感官体验的"城市客厅"',
    imageUrl: '/images/business/宁波建发养云营销中心.webp',
    size: 'small'  // 随机分配：小卡片
  },
  {
    id: 4,
    slug: 'old-building-renovation',
    chineseTitle: '旧建筑改造',
    englishTitle: 'OLD BUILDING RENOVATION',
    description: '保留文化记忆，激活空间使用，探索未来方向',
    imageUrl: '/images/business/莆田朱总祖宅.webp',
    size: 'medium'  // 随机分配：中等卡片
  },
  {
    id: 5,
    slug: 'hotel-vacation',
    chineseTitle: '酒店度假',
    englishTitle: 'HOTELS',
    description: '重新定义奢华，塑造疗愈的酒旅体验',
    imageUrl: '/images/business/源昌中央公园酒店.webp',
    size: 'large'  // 随机分配：大卡片
  },
  {
    id: 6,
    slug: 'exhibition-hall',
    chineseTitle: '展会展厅',
    englishTitle: 'EXHIBITION HALL',
    description: '全新展示智慧城市的未来蓝图',
    imageUrl: '/images/business/鑫易石材展会2026.webp',
    size: 'small'  // 随机分配：小卡片
  },
];

// 获取分类的函数
export const getCategoryBySlug = (slug: string): BusinessCategory | undefined => {
  return businessCategories.find(category => category.slug === slug);
};

// 获取所有分类的slug（用于路由生成）
export const getAllCategorySlugs = (): string[] => {
  return businessCategories.map(category => category.slug);
};
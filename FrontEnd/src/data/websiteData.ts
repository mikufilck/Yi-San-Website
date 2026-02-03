// 导航菜单项 - 更新设计案例的链接
export const navItems = [
  { id: 1, label: '首页', href: '/' },
  { id: 2, label: '关于我们', href: '/about' },
  { id: 3, label: '产品中心', href: '/product' },
  { id: 4, label: '设计案例', href: '/cases' }, // 指向分类总览
  { id: 5, label: '服务支持', href: '/support' },
  { id: 6, label: '联系我们', href: '/contact' },
];

// 轮播数据（替换为一三的实际图片链接）
export const carouselItems = [
  {
    id: 1,
    titleLine1: '原创设计',
    titleLine2: '西溪半岛3号',
    imageUrl: '/images/carousel/西溪半岛3号外观.webp',
    mobileImageUrl: '/images/carousel/西溪半岛3号外观.webp',
    linkUrl: '/product', // 点击跳转到产品页面
    backgroundColor: '#1a1a1a',
  },
  {
    id: 2,
    titleLine1: '原创设计',
    titleLine2: '瑞景楼中楼',
    imageUrl: '/images/carousel/瑞景楼中楼.webp',
    mobileImageUrl: '/images/carousel/瑞景楼中楼.webp',
    linkUrl: '/about', // 点击跳转到关于页面
    backgroundColor: '#ffffff',
  },
  {
    id: 3,
    titleLine1: '高端定制',
    titleLine2: '品质生活',
    imageUrl: '/images/carousel/莆田朱总祖宅.webp',
    mobileImageUrl: '/images/carousel/莆田朱总祖宅.webp',
    linkUrl: '/custom', // 点击跳转到定制页面
    backgroundColor: '#1a1a1a',
  },
  {
    id: 4,
    titleLine1: '高端定制',
    titleLine2: '品质生活',
    imageUrl: '/images/carousel/鑫易石材展会2026.webp',
    mobileImageUrl: '/images/carousel/鑫易石材展会2026.webp',
    linkUrl: '/custom', // 点击跳转到定制页面
    backgroundColor: '#1a1a1a',
  },
  {
    id: 5,
    titleLine1: '合作伙伴',
    titleLine2: '与Top50开发商等达成战略合作',
    imageUrl: '/images/carousel/合作伙伴.jpg',
    mobileImageUrl: '/images/carousel/合作伙伴.jpg',
    linkUrl: '/partners', // 点击跳转到定制页面
    backgroundColor: '#ffffff',
  },
];

// 精选产品数据
export const featuredProducts = [
  { id: 1, name: '观云沙发', category: '客厅家具', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: '简约线条，云感坐卧体验' },
  { id: 2, name: '听竹餐椅', category: '餐厅家具', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: '竹韵设计，自然与工艺结合' },
  { id: 3, name: '望月茶台', category: '茶室家具', image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: '传统榫卯，现代禅意空间' },
  { id: 4, name: '栖风床具', category: '卧室家具', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: '安宁设计，伴您一夜好眠' },
];

// 公司简介文本
export const companyIntro = {
  title: '物始为一 · 三生万物',
  subtitle: 'YI SAN DESIGN · 东方现代设计思考者',
  description: '一三设计（YI SAN）由资深设计师许彬先生创立。我们深耕于建筑与人居环境的逻辑重构，主张以“极简、自然、恒久”的设计语言，发掘中国当代生活方式的无限可能。我们不只是空间的构造者，更是时代美学的实践者。',
  features: [
    '一体化建筑逻辑', 
    '数字化材料实验', 
    '极致工艺交付', 
    '空间全生命周期顾问'
  ]
};

// 联系方式
export const contactInfo = {
  address: '中国厦门红星美凯龙(厦门全球家居1号店)海鸿楼6F, 3609号',
  phone: '400-888-9999',
  email: 'contact@yisan.com',
  wechat: 'yisan_Official',
  businessHours: '周一至周五 9:00-18:00'
};
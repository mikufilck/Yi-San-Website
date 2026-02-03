import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// --- 核心修復：改用封裝好的 apiClient ---
import { apiClient } from '../utils/apiClient';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiCheckCircle, FiLoader } from 'react-icons/fi';

// 接口定義保持不變
interface ProductData {
  id: number;
  category: string; 
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
  highlights: { title: string; value: string }[];
  cover_image: string;
}

const ProductDetailView: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  // --- 務實方案：使用 apiClient 統一管理數據請求 ---
  const { data: products, isLoading, isError } = useQuery<ProductData[]>({
    queryKey: ['product', category],
    queryFn: async () => {
      // 移除硬編碼 IP，使用相對路徑。攔截器會自動處理數據解構與 Token (如有)
      const res: any = await apiClient.get('/products/', {
        params: { category }
      });
      return Array.isArray(res) ? res : [];
    },
    enabled: !!category, 
  });

  const product = products?.[0];
  const isDarkTheme = category === 'me';

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
      <FiLoader className="animate-spin mb-4" size={32} />
      <span className="text-xs tracking-widest uppercase italic">Fetching Technical Data...</span>
    </div>
  );

  if (isError || !product) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <p className="text-zinc-500 mb-6">未找到 [{category}] 相關工藝說明或連接失敗</p>
      <button onClick={() => navigate('/product')} className="px-6 py-2 border border-zinc-800 text-xs uppercase tracking-widest">返回產品中心</button>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDarkTheme ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}`}>
      
      {/* 1. 頂部導航 */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <button onClick={() => navigate('/product')} className="flex items-center text-xs font-bold tracking-[0.2em] uppercase text-white hover:opacity-50 transition-opacity">
          <FiArrowLeft className="mr-2" /> Back / 返回
        </button>
      </nav>

      {/* 2. 英雄區 (Hero Section) */}
      <section className="relative h-[80vh] flex items-center px-8 md:px-20 overflow-hidden">
        <div className="z-10 max-w-4xl">
          <motion.p 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-[#8C7355] text-xs font-bold tracking-[0.4em] uppercase mb-6"
          >
            {product.subtitle}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-light tracking-tighter mb-8 leading-[1.1]"
          >
            {product.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className={`text-lg md:text-xl max-w-2xl leading-relaxed ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            {product.summary}
          </motion.p>
        </div>
        <div className="absolute right-0 bottom-10 opacity-[0.03] select-none pointer-events-none translate-x-1/4">
          <h2 className="text-[30vw] font-bold uppercase leading-none">{category}</h2>
        </div>
      </section>

      {/* 3. 技術參數區 (Specs Grid) */}
      <section className={`py-24 px-8 md:px-20 ${isDarkTheme ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-16 space-x-4 border-l-2 border-[#8C7355] pl-6">
            <div>
              <h3 className="text-sm font-bold tracking-[0.2em] uppercase">Technical Specs</h3>
              <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">核心技術參數指標</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-12">
            {product.specs?.map((spec, i) => (
              <div key={i} className="group border-b border-zinc-800/10 pb-6 hover:border-[#8C7355] transition-colors">
                <p className="text-[10px] text-[#8C7355] mb-3 uppercase tracking-widest font-bold">{spec.label}</p>
                <p className="text-xl md:text-3xl font-extralight tracking-tight group-hover:translate-x-1 transition-transform">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 核心優勢 (Highlights) */}
      <section className="py-32 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {product.highlights?.map((item, i) => (
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              key={i} className="space-y-6 p-8 rounded-2xl border border-transparent hover:border-zinc-100 hover:bg-zinc-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full border border-[#8C7355] flex items-center justify-center text-[#8C7355] group-hover:bg-[#8C7355] group-hover:text-white transition-all">
                <FiCheckCircle size={18} />
              </div>
              <h4 className="text-2xl font-medium tracking-tight">{item.title}</h4>
              <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. 底部呼籲 */}
      <section className="py-32 text-center">
        <div className="h-px w-20 bg-[#8C7355] mx-auto mb-10 opacity-30" />
        <p className="text-[10px] tracking-[0.4em] uppercase mb-8 opacity-60">Craftsmanship In Every Detail</p>
        <button 
          onClick={() => navigate('/appointment')}
          className={`px-12 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-500 hover:bg-[#8C7355] hover:border-[#8C7355] hover:text-white ${isDarkTheme ? 'border border-zinc-700' : 'border border-zinc-200'}`}
        >
          預約施工現場參觀
        </button>
      </section>
    </div>
  );
};

export default ProductDetailView;
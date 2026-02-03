import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCpu, FiLayers, FiArrowRight } from 'react-icons/fi';

const ProductPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* 顶部视觉引导 */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h2 className="text-[#8C7355] text-xs font-bold tracking-[0.3em] uppercase mb-4">Integrative Solution / 集成方案</h2>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 leading-tight">
            从隐蔽工程到感官美学 <br />
            <span className="font-serif italic text-zinc-400">构建完整的空间生命体系</span>
          </h1>
        </motion.div>
      </section>

      {/* 双板块入口 */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* 机电板块入口 */}
        <Link to="/product/me" className="group relative h-[70vh] overflow-hidden bg-zinc-900 flex flex-col justify-end p-12">
          {/* 这里预留一张高质量的机电施工全景图作为背景 */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
          <div className="relative z-10">
            <FiCpu className="text-[#8C7355] text-4xl mb-6" />
            <h3 className="text-white text-3xl font-light tracking-widest mb-4">机电系统 / MEP</h3>
            <p className="text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
              BIM驱动的隐蔽工程标准，解决恒温、恒湿、静音与安全。看不见的专业，才是豪宅真正的底气。
            </p>
            <span className="inline-flex items-center text-xs text-[#8C7355] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
              Explore System <FiArrowRight className="ml-2" />
            </span>
          </div>
        </Link>

        {/* 装饰板块入口 */}
        <Link to="/product/decoration" className="group relative h-[70vh] overflow-hidden bg-zinc-200 flex flex-col justify-end p-12">
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-all duration-700" />
          <div className="relative z-10 text-zinc-900">
            <FiLayers className="text-[#8C7355] text-4xl mb-6" />
            <h3 className="text-3xl font-light tracking-widest mb-4">装饰工艺 / FINISH</h3>
            <p className="text-zinc-500 text-sm max-w-sm mb-8 leading-relaxed">
              从基层挂网到福乐阁涂装体系。触手可及的细腻，来自于对毫米级误差的偏执。
            </p>
            <span className="inline-flex items-center text-xs text-[#8C7355] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
              Explore Craft <FiArrowRight className="ml-2" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default ProductPage;
import React from 'react';
import { motion } from 'framer-motion';
// 务实：直接从数据源导入，避免父组件传参导致的 undefined 风险
import { companyIntro } from '../../data/websiteData';

const IntroSection: React.FC = () => {
  // 防御性处理：确保 data 永远有值
  const data = companyIntro || {
    title: '物始为一 · 三生万物',
    subtitle: 'YI SAN DESIGN · 东方现代设计思考者',
    description: '一三设计（YI SAN）致力于建筑与人居环境的逻辑重构。',
    features: ['一体化建筑逻辑', '数字化材料实验', '极致工艺交付', '空间全生命周期顾问']
  };

  return (
    <section className="container mx-auto px-8 md:px-16 lg:px-24 py-24">
      {/* 顶部标题组：采用非对称排版 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="text-[#8C7355] text-xs tracking-[0.5em] uppercase block mb-6 font-bold">
            {data.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-900 leading-tight tracking-tighter">
            {(data.title || '').split(' · ').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-zinc-200 mx-4">/</span>}
                {part}
              </React.Fragment>
            ))}
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:pb-2"
        >
          <div className="h-[1px] w-24 bg-black hidden lg:block" />
        </motion.div>
      </div>

      {/* 核心内容区：2:3 比例划分 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
        {/* 左侧：四个特征列表，采用网格排版 */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-y-12 gap-x-8 border-t border-zinc-100 pt-12">
          {(data.features || []).map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-[10px] font-mono text-zinc-300 mb-2">0{index + 1}</p>
              <h4 className="text-sm font-bold tracking-widest text-zinc-800 uppercase leading-relaxed">
                {feature}
              </h4>
            </motion.div>
          ))}
        </div>

        {/* 右侧：长篇描述 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <p className="text-lg md:text-xl text-zinc-500 font-light leading-[2] text-justify">
            {data.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default IntroSection;
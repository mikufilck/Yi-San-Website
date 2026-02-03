import React from 'react';
import { motion } from 'framer-motion';
import { businessCategories } from '../data/businessData';

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#8C7355] selection:text-white">
      {/* 注意：此处不再手动添加 Header/Footer，由 App.tsx 的 PublicLayout 提供 */}

      {/* 1. Hero Section: Practice Overview */}
      <section className="relative h-[45vh] flex items-center justify-center bg-zinc-50 overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[30vw] font-bold absolute -bottom-20 -left-10 whitespace-nowrap">PRACTICE</span>
        </div>
        <div className="relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-[10px] tracking-[0.6em] text-zinc-400 uppercase mb-4 block font-bold"
          >
            Our Expertise
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-5xl md:text-7xl font-light text-zinc-900 tracking-tighter"
          >
            设计实践
          </motion.h1>
        </div>
      </section>

      {/* 2. Categories Grid: 错落排版 */}
      <main className="py-32 container mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
          {businessCategories.map((category, index) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`group flex flex-col ${index % 2 === 1 ? 'md:mt-40' : ''}`}
            >
              <a 
                href={`/cases/${category.slug}`} 
                className="relative aspect-[4/5] overflow-hidden bg-zinc-100 mb-10 block"
              >
                <img 
                  src={category.imageUrl} 
                  alt={category.chineseTitle} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              </a>
              <div className="max-w-md">
                <div className="flex items-center gap-4 mb-6 text-[#8C7355]">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{category.englishTitle}</span>
                  <div className="h-px flex-1 bg-current opacity-20" />
                </div>
                <h2 className="text-4xl font-light text-zinc-900 mb-6 tracking-tight">
                  {category.chineseTitle}
                </h2>
                <p className="text-zinc-500 font-light leading-relaxed mb-10 text-base line-clamp-3 text-justify">
                  {category.description}
                </p>
                <a 
                  href={`/cases/${category.slug}`} 
                  className="inline-block text-[11px] font-bold tracking-[0.3em] uppercase border-b border-zinc-200 pb-2 hover:border-[#8C7355] hover:text-[#8C7355] transition-all duration-300"
                >
                  Explore Collection / 探索作品
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* 3. CTA: Start a Project */}
      <section className="py-40 bg-zinc-950 text-white relative overflow-hidden">
        {/* 背景修饰文字 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-white/[0.02] whitespace-nowrap pointer-events-none">
          CONTACT US
        </div>
        
        <div className="container mx-auto px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-20 tracking-[0.3em]">START A PROJECT / 开启合作</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
              <div className="space-y-4">
                <p className="text-[#8C7355] text-[10px] font-bold tracking-[0.4em] uppercase">Email</p>
                <p className="text-xl font-light hover:text-[#8C7355] transition-colors cursor-pointer">contact@yisan.com</p>
              </div>
              <div className="space-y-4">
                <p className="text-[#8C7355] text-[10px] font-bold tracking-[0.4em] uppercase">Phone</p>
                <p className="text-xl font-light">400-888-9999</p>
              </div>
              <div className="space-y-4">
                <p className="text-[#8C7355] text-[10px] font-bold tracking-[0.4em] uppercase">Studio</p>
                <p className="text-xl font-light text-zinc-300">厦门 · 红星美凯龙</p>
              </div>
            </div>
            
            <a 
              href="/appointment" 
              className="mt-24 inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#8C7355] hover:text-white transition-all duration-500"
            >
              Online Appointment / 在线预约
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer 同样由 PublicLayout 自动提供 */}
    </div>
  );
};

export default CategoriesPage;
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import IntroSection from '../components/sections/IntroSection';
import BusinessShowcaseSection from '../components/sections/BusinessShowcaseSection';
import { companyIntro } from '../data/websiteData';

const HomePage: React.FC = () => {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  
  // 视差动效：随滚动平移背景文字
  const xTranslate = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacityFade = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* 注意：此处不再手动添加 Header，由 App.tsx 的 PublicLayout 提供 */}
      
      {/* 1. Hero Section - 全屏首屏 */}
      <section className="h-[92vh] w-full relative overflow-hidden bg-zinc-950">
        <HeroSection />
        
        {/* 向下引导指示器 */}
        <motion.div 
          style={{ opacity: opacityFade }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent" />
        </motion.div>
      </section>
      
      {/* 2. 内容主体区 */}
      <main className="relative bg-white">
        
        {/* 负 Margin-top 实现内容压在首屏图上的层级感 */}
        <div className="relative z-20 -mt-12 md:-mt-16">
          {/* 背景装饰文字：随着滚动移动 */}
          <motion.div 
            style={{ x: xTranslate }}
            className="absolute -top-24 left-10 text-[12vw] font-bold text-zinc-50 opacity-[0.05] whitespace-nowrap pointer-events-none uppercase italic"
          >
            YI SAN DESIGN
          </motion.div>

          {/* 核心介绍 */}
          <div className="bg-white relative z-10 border-t border-zinc-50 shadow-[0_-20px_50px_rgba(0,0,0,0.03)]">
            <div className="py-16 md:py-24">
              <IntroSection data={companyIntro} />
            </div>
          </div>
        </div>

        {/* 3. 业务精选区 */}
        <section className="py-20 md:py-40 border-t border-zinc-50">
          <BusinessShowcaseSection />
        </section>

        {/* 4. 格言/深度解读区 */}
        <section className="py-40 bg-white px-8 overflow-hidden border-t border-zinc-50">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <span className="text-[200px] font-serif absolute -top-32 -left-10 text-zinc-50 -z-10">“</span>
              <h2 className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-zinc-900">
                设计不是装饰，<br/>
                <span className="font-light italic text-zinc-400">而是对生活秩序的重塑。</span>
              </h2>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-zinc-500 leading-relaxed text-lg font-light">
                在一三设计，我们拒绝千篇一律的奢华。我们通过研究空间的流动、光线的折射以及材质的触感，为每一位客户量身定制独属于他们的精神堡垒。
              </p>
              <div className="h-px w-20 bg-black" />
            </motion.div>
          </div>
        </section>

        {/* 5. 动态预约区 */}
        <section className="flex flex-col lg:flex-row min-h-[65vh] border-t border-zinc-100">
          {/* 左侧：品牌影像 */}
            <div className="lg:w-1/2 bg-zinc-900 relative min-h-[450px] overflow-hidden group">
              <img 
                src="/images/business/办公室正门.webp" 
                className="w-full h-full object-cover object-left opacity-60 group-hover:scale-110 transition-transform duration-[3s] ease-out" 
                alt="Studio Interior" 
              />
            <div className="absolute inset-0 flex items-center justify-center p-20 text-center">
              <div className="text-white">
                <h3 className="text-sm tracking-[0.6em] uppercase mb-4 opacity-70">The Studio</h3>
                <p className="text-2xl font-light tracking-wide">亲临工作室，感受材质与光影的真实对话</p>
              </div>
            </div>
          </div>

          {/* 右侧：行动呼吁 */}
          <div className="lg:w-1/2 bg-zinc-50 flex items-center justify-center p-12 md:p-24">
            <div className="max-w-md w-full">
              <h2 className="text-4xl font-light text-zinc-900 mb-8 tracking-tighter">开启您的品质空间之旅</h2>
              <p className="text-zinc-500 mb-12 font-light leading-relaxed">
                预约一三设计顾问，我们将从建筑规划、室内美学到软装陈设，为您提供全周期的一体化解决方案。
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => navigate('/appointment')}
                  className="flex-1 px-8 py-5 bg-black text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:invert transition-all duration-700 shadow-xl"
                >
                  Appointment / 预约
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="flex-1 px-8 py-5 border border-zinc-300 text-zinc-900 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-700"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 注意：此处不再手动添加 Footer，由 App.tsx 的 PublicLayout 提供 */}
      </main>
    </div>
  );
};

export default HomePage;
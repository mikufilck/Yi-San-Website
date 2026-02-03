import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 动画配置
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: [0.215, 0.61, 0.355, 1] }
};

// 1. 坐标轴滚动组件：实现精密仪器感
const CoordinateTicker = ({ value, label }: { value: string, label: string }) => {
  const [displayValue, setDisplayValue] = useState("00.0000");
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = progress * end;
      setDisplayValue(current.toFixed(4));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-mono text-[#8C7355] tabular-nums tracking-tighter">
      {displayValue}° {label}
    </span>
  );
};

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F8] text-zinc-900 selection:bg-[#8C7355]/20 overflow-x-hidden relative">
      
      {/* 背景装饰：经纬度辅助线 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-0 left-1/2 w-px h-full bg-black"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-black"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute border-t border-black w-4" style={{ top: `${i * 10}%`, left: '50%', marginLeft: '-8px' }}></div>
        ))}
      </div>

      {/* 注意：此处不再手动添加 Header，由 App.tsx 的 PublicLayout 提供 */}
      
      <main className="pt-48 pb-32 px-8 md:px-16 max-w-[1500px] mx-auto relative z-10">
        
        {/* 1. 标题区：动态渐变张力 */}
        <section className="mb-32 flex flex-col lg:flex-row justify-between items-start gap-12">
          <motion.div className="max-w-4xl" {...fadeInUp}>
            <h1 className="text-6xl md:text-[10rem] font-bold tracking-[-0.05em] mb-12 uppercase leading-[0.8]">
              Start a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-zinc-700 to-[#8C7355]">Conversation</span>
            </h1>
            <div className="flex items-center gap-8">
              <motion.div 
                className="h-px bg-[#8C7355]"
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              ></motion.div>
              <p className="text-zinc-400 text-lg md:text-2xl font-light leading-relaxed italic">
                “ 无论您身在何处，一三的设计服务均可触达。”
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="hidden lg:block writing-vertical-rl text-[11px] tracking-[1.2em] text-zinc-300 uppercase py-2 border-r border-zinc-200"
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            ESTABLISHED IN XIAMEN / 2026
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 xl:gap-32">
          
          {/* 2. 左侧：触点矩阵 */}
          <div className="lg:col-span-7 space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
              <ContactMethod title="Business / 业务洽谈" content="hello@yisandesign.com" sub="项目咨询、设计委托及深度合作" />
              <ContactMethod title="Social / 社交媒体" content="微信公众号：一三设计 YI SAN" sub="获取最新案例发表与设计动态" />
              <ContactMethod title="Press / 媒体联络" content="pr@yisandesign.com" sub="出版采访、品牌活动与跨界联名" />
              <ContactMethod title="Join Us / 加入我们" content="career@yisandesign.com" sub="请随信附上个人简历及完整作品集" />
            </div>

            {/* 微信二维码入口优化 */}
            <motion.div 
              className="bg-white p-10 md:p-14 border border-zinc-100 flex items-center justify-between group cursor-pointer hover:shadow-[0_40px_80px_-15px_rgba(140,115,85,0.1)] transition-all duration-700 relative overflow-hidden"
              {...fadeInUp}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8C7355] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-[0.5em] uppercase text-[#8C7355]">Connect via WeChat</h3>
                <p className="text-zinc-500 text-base font-light leading-relaxed">扫描二维码或搜索 “一三设计” <br/> 关注我们的官方艺术频道</p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:border-[#8C7355] group-hover:bg-white transition-all duration-500">
                  <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center text-white text-[10px] tracking-tighter font-mono">SCAN QR</div>
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#8C7355] opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              </div>
            </motion.div>
          </div>

          {/* 3. 右侧：工作室 & 坐标动效 */}
          <motion.div className="lg:col-span-5" {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="sticky top-32 group">
              <div className="relative aspect-[4/5] bg-zinc-200 mb-10 overflow-hidden shadow-[30px_30px_60px_-15px_rgba(0,0,0,0.1)]">
                <img 
                  src="/images/contact/办公室.webp" 
                  alt="YI SAN Xiamen Studio"
                  className="w-full h-full object-cover grayscale transition-all duration-[3000ms] group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#8C7355]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute top-0 right-0 bg-zinc-900 text-white px-6 py-4 text-[10px] font-bold tracking-[0.3em] uppercase translate-x-full group-hover:translate-x-0 transition-transform duration-700">
                  Main Studio
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-end justify-between border-b border-zinc-200 pb-6">
                  <div>
                    <span className="text-[10px] text-[#8C7355] font-bold tracking-widest uppercase block mb-2">Location</span>
                    <h3 className="text-3xl font-bold tracking-tight">XIAMEN STUDIO</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] mb-1"><CoordinateTicker value="24.4798" label="N" /></div>
                    <div className="text-[11px]"><CoordinateTicker value="118.0894" label="E" /></div>
                  </div>
                </div>
                
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  中国厦门 · 湖里区红星美凯龙 (全球家居1号店) <br />
                  海鸿楼 6F, 3609号 · <span className="text-zinc-900 font-medium">一三设计研究中心</span>
                </p>
                
                <div className="pt-6">
                  <a href="#" className="inline-flex items-center group/link">
                    <div className="relative overflow-hidden">
                      <span className="text-[12px] font-bold tracking-[0.4em] uppercase text-zinc-900 block pb-2">View on Maps</span>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 -translate-x-full group-hover/link:translate-x-0 transition-transform duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8C7355] translate-x-0 group-hover/link:translate-x-full transition-transform duration-500 delay-100"></div>
                    </div>
                    <div className="ml-6 w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover/link:bg-zinc-900 group-hover/link:border-zinc-900 transition-all duration-500">
                      <svg className="w-5 h-5 text-zinc-900 group-hover/link:text-white transition-colors -rotate-45 group-hover/link:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* 注意：此处不再手动添加 Footer，由 App.tsx 的 PublicLayout 提供 */}
    </div>
  );
};

const ContactMethod = ({ title, content, sub }: any) => (
  <motion.div 
    className="border-l border-zinc-200 pl-10 pb-12 hover:border-[#8C7355] transition-all duration-700 group relative"
    {...fadeInUp}
  >
    <div className="absolute left-0 top-0 w-2 h-2 bg-[#8C7355] -ml-[4.5px] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
    <h4 className="text-[10px] font-bold tracking-[0.5em] text-[#8C7355] uppercase mb-6 opacity-80">
      {title}
    </h4>
    <p className="text-3xl font-light tracking-tight mb-4 text-zinc-800 group-hover:text-black transition-colors select-all leading-none">
      {content}
    </p>
    <p className="text-zinc-400 text-sm font-light tracking-wide italic max-w-xs">
      {sub}
    </p>
  </motion.div>
);

export default ContactPage;
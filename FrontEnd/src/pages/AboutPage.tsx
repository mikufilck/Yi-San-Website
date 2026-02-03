import React from 'react';
import { motion } from 'framer-motion'; 
import DesignerSection from '../components/sections/DesignerSection';

// 动画配置：优雅的向上滑入
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }
};

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F8] text-zinc-900 overflow-x-hidden font-sans">
      {/* 注意：此处不再手动添加 Header，由 App.tsx 的 PublicLayout 提供 */}

      {/* 1. Hero Section */}
      <section className="pt-44 pb-20 px-8 md:px-20 border-b border-zinc-100 bg-white">
        <motion.div 
          className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end"
          {...fadeInUp}
        >
          <div className="mb-10 md:mb-0">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-4 text-black">About <br/>YI SAN</h1>
            <p className="text-[#8C7355] tracking-[0.5em] text-sm uppercase font-medium">物始为一 · 三生万物</p>
          </div>
          <div className="max-w-xl text-right">
            <p className="text-lg leading-relaxed font-light text-zinc-600 italic">
              「一三设计」由著名设计师许彬创立。我们是时代的思考者，致力于创造真正属于中国的现代巅峰设计。
            </p>
          </div>
        </motion.div>
      </section>

      {/* 2. 核心理念区：错落异步矩阵布局 */}
      <section className="py-40 px-8 md:px-20 bg-white relative">
        <div className="absolute top-20 left-10 text-[20rem] font-bold text-zinc-50 opacity-[0.03] select-none pointer-events-none">
          YI SAN
        </div>

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-start gap-20">
          <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-x-12 xl:gap-x-20">
            <div className="space-y-32">
              <VerticalSection 
                title="一三之道" 
                delay={0.1}
                content={["「一三」起于简，终至繁。", "其意，以家为本，以人为本。", "昔人言：“一之谓甚，三则生变。”", "「一三」取其一，拓其三。", "循古训，汲古风，而新之。", "家之所需，人之所愿，皆由此始。"]}
              />
              <VerticalSection 
                title="一三之人" 
                delay={0.3}
                content={["「一三之人」皆业界翘楚。", "习古人之智，兼今人之技。", "设计新颖而不失古韵。", "工艺精细而不失现代之美。"]}
              />
            </div>

            <div className="space-y-32 md:mt-32">
              <VerticalSection 
                title="一三之工" 
                delay={0.2}
                content={["「一三之工」细如发丝，妙至毫巅。", "非特家居而已，商铺、写字楼亦能为之。", "或古典、或现代、或中西合璧。", "皆能得心应手。"]}
              />
              <VerticalSection 
                title="一三之愿" 
                delay={0.4}
                content={["愿为君造一隅之地，安身立命之所。", "或繁华、或简约、或宁静、或热烈。", "皆能如愿以偿。", "“物始为一、三生万物。”", "此为一三之道也。"]}
              />
            </div>
          </div>

          <motion.div 
            className="lg:w-2/5 lg:sticky lg:top-48 border-l border-zinc-100 pl-12 xl:pl-20 mt-20 lg:mt-0"
            {...fadeInUp}
          >
            <div className="space-y-10 text-black">
              <h3 className="text-[#8C7355] text-xs font-bold tracking-[0.5em] uppercase flex items-center">
                <span className="w-10 h-px bg-[#8C7355] mr-4"></span>
                Design Philosophy
              </h3>
              <p className="text-3xl font-light leading-[1.8] tracking-tight">
                我们在设计中发掘传统可能性，赋予每个设计以鲜明的个性和生命力。
                <span className="block mt-6 text-zinc-400 text-lg">
                  诚信为本、质量为魂。以客为尊、以工为基。持之以恒、精益求精。提供全考量、定制化的解决方案。
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. 团队荣誉 */}
      <section className="py-32 bg-zinc-950 text-white px-8 md:px-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <motion.div className="mb-20" {...fadeInUp}>
            <h2 className="text-[10px] font-bold tracking-[0.5em] uppercase text-zinc-600 mb-2">Recognition</h2>
            <p className="text-3xl font-light tracking-tight text-white">Team Honors / 团队荣誉</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4 border-t border-zinc-900 pt-10">
            <HonorItem year="2023" award="MUSE Design Awards" logoUrl="assets/awards/muse.png" />
            <HonorItem year="2023" award="FDA French Design Award" logoUrl="assets/awards/fda.png" />
            <HonorItem year="2022" award="WAF-INSIDE International" logoUrl="assets/awards/waf.png" />
            <HonorItem year="2022" award="German RED DOT Award" logoUrl="assets/awards/red_dot.png" />
            <HonorItem year="2016" award="中国最强室内设计企业" />
            <HonorItem year="2015" award="中国最具价值室内设计企业" />
            <HonorItem year="2015" award="最佳室内设计公司" />
            <HonorItem year="2010" award="中国尚高杯室内大奖优秀奖" />
            <HonorItem year="2009" award="中国室内设计大奖赛优秀奖" />
          </div>
        </div>
      </section>

      {/* 4. 我们服务 */}
      <section className="py-32 px-8 md:px-20 bg-zinc-50">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.div className="mb-24" {...fadeInUp}>
            <h2 className="text-4xl font-light mb-4 tracking-tight text-black">科学造房，一体化设计</h2>
            <p className="text-zinc-400 font-light tracking-[0.2em] uppercase text-[10px]">Architectural · Landscape · Interior · Engineering</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-zinc-200 border border-zinc-200">
            <ServiceCard title="建筑设计" desc="结合现代科技和创新理念，实现功能与美观的完美结合。" />
            <ServiceCard title="景观设计" desc="精心规划打造与建筑相辅相成的优美景观，融合自然与人文。" />
            <ServiceCard title="室内设计" desc="注重细节，提供个性化的设计方案。" />
            <ServiceCard title="机电设计" desc="定制智能、高效的机电设施。" />
            <ServiceCard title="软装设计" desc="精心搭配家具、配饰，打造独特的居住空间。" />
            <ServiceCard title="施工服务" desc="严格把控施工质量，确保工程进度和质量达到最优。" />
          </div>
        </div>
      </section>

      {/* 注意：此处不再手动添加 Footer，由 App.tsx 的 PublicLayout 提供 */}
      <DesignerSection /> {/* 直接放在最底部 */}
    </div>
  );
};

// --- 子组件保持原有逻辑，已移除多余引用 ---

const VerticalSection = ({ title, content, delay }: { title: string, content: string[], delay: number }) => (
  <motion.div {...fadeInUp} transition={{ delay }} className="group relative">
    <div className="writing-vertical-rl text-[16px] font-light tracking-[0.4em] leading-[2.8] text-zinc-500 border-r border-zinc-100 pr-10 min-h-[460px] transition-all duration-700 group-hover:border-[#8C7355]/30">
      <div className="mb-12 relative">
        <span className="text-black font-bold text-xl tracking-[0.6em] relative z-10">{title}</span>
        <div className="absolute -top-4 -right-2 w-1.5 h-1.5 bg-[#8C7355] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
      </div>
      <div className="flex flex-col">
        {content.map((line, i) => (
          <span key={i} className={`block transition-colors duration-500 ${line.includes('“') ? 'text-zinc-900 font-normal' : 'group-hover:text-zinc-800'}`}>{line}</span>
        ))}
      </div>
    </div>
  </motion.div>
);

const HonorItem = ({ year, award, logoUrl }: { year: string, award: string, logoUrl?: string }) => {
  const isMuse = logoUrl && logoUrl.includes('muse');

  return (
    <motion.div className="relative group overflow-hidden border-b border-zinc-800 pb-8 pt-6 transition-all hover:border-zinc-400" {...fadeInUp}>
      {logoUrl && (
        <div className="absolute -right-4 -bottom-4 w-28 h-28 pointer-events-none transition-all duration-1000">
          <img 
            src={logoUrl} 
            alt="" 
            className={`w-full h-full object-contain transition-all duration-1000
              ${isMuse 
                ? 'opacity-10 grayscale brightness-200 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-0 group-hover:invert' 
                : 'opacity-15 saturate-[0.5] mix-blend-lighten group-hover:opacity-60 group-hover:invert-0 group-hover:saturate-100 group-hover:brightness-100'
              }`} 
          />
        </div>
      )}
      <div className="relative z-10">
        <div className="text-zinc-600 font-mono text-[10px] mb-2 tracking-widest">{year}</div>
        <div className="text-sm tracking-[0.15em] font-light text-zinc-300 group-hover:text-white transition-colors uppercase">{award}</div>
      </div>
    </motion.div>
  );
};

const ServiceCard = ({ title, desc }: { title: string, desc: string }) => (
  <motion.div 
    className="bg-white p-14 relative group overflow-hidden text-left"
    {...fadeInUp}
  >
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8C7355] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8C7355] to-transparent translate-x-full group-hover:animate-[shimmer_2s_infinite_reverse] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="relative z-10">
      <h3 className="text-xl font-bold mb-6 tracking-widest text-black group-hover:text-[#8C7355] transition-colors duration-500">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed font-light group-hover:text-zinc-900 transition-colors duration-500">{desc}</p>
    </div>

    <div className="absolute inset-0 bg-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0"></div>
    
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}} />
  </motion.div>
);

export default AboutPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiFileText, FiSearch, FiCheckCircle } from 'react-icons/fi';

// 基于图片内容整理的四个核心阶段
const CONSTRUCTION_STEPS = [
  {
    percent: "0%",
    title: "前期策划与准备",
    description: "目标明确，计划执行及时纠偏",
    details: ["安全文明标化布置", "现场勘察图纸复核", "放线放样与目标明确", "精准物料计划表"]
  },
  {
    percent: "50%",
    title: "主控点质量检测",
    description: "一星自检，问题整改高标准",
    details: ["水电/防水施工及验收", "瓦工施工验收", "木工施工及验收", "精准放样复核"]
  },
  {
    percent: "80%",
    title: "主材跟盯与纠偏",
    description: "一步到位，步步到位",
    details: ["定制品到货安装", "成品保护逻辑", "总包管理质量纠偏", "涂饰施工及验收"]
  },
  {
    percent: "100%",
    title: "五星交付验收",
    description: "以客户满意为核心",
    details: ["强制精修处理", "精保洁交付标准", "完工总结持续改进", "终身维保服务"]
  }
];

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section & 客户登录入口 */}
      <section className="relative pt-40 pb-20 px-8 bg-zinc-950 text-white overflow-hidden">
        {/* 背景装饰字 */}
        <div className="absolute right-0 top-20 opacity-[0.05] select-none pointer-events-none">
          <h2 className="text-[20vw] font-black leading-none uppercase">Service</h2>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <motion.p 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-[#8C7355] text-[10px] font-black tracking-[0.5em] uppercase mb-6"
              >
                Service & Support
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-light tracking-tighter leading-tight"
              >
                一三设计 <br /> 
                <span className="text-[#8C7355]">50/80</span> 施工管理体系
              </motion.h1>
            </div>

            {/* 客户进度查询入口按钮 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="pb-4"
            >
              <button 
                onClick={() => navigate('/client/login')} // 跳转到登录页
                className="group flex items-center gap-6 bg-[#8C7355] hover:bg-white text-white hover:text-zinc-900 px-10 py-6 transition-all duration-500"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-80">Track My Project</p>
                  <p className="text-lg font-bold">客户专属通道</p>
                </div>
                <FiArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. 核心管理标准展示 (0-100%) */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-100 border border-zinc-100">
            {CONSTRUCTION_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white p-10 hover:bg-zinc-50 transition-colors"
              >
                <div className="text-5xl font-extralight text-[#8C7355] mb-8 italic">{step.percent}</div>
                <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-xs text-zinc-400 font-medium mb-8 uppercase tracking-widest leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-4">
                  {step.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-500 leading-tight">
                      <FiCheckCircle className="mt-1 text-[#8C7355] shrink-0" size={14} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 补充服务模块 */}
      <section className="py-32 px-8 border-t border-zinc-50">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-full">
              <FiShield size={20} />
            </div>
            <h4 className="text-2xl font-bold tracking-tight">品质保障</h4>
            <p className="text-zinc-500 text-sm leading-relaxed font-light">
              从前期拆除到安全文明标化布置，我们执行严苛的现场管理准则，确保每一寸空间的施工质量都符合“一星自检”标准。
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-full">
              <FiFileText size={20} />
            </div>
            <h4 className="text-2xl font-bold tracking-tight">透明文档</h4>
            <p className="text-zinc-500 text-sm leading-relaxed font-light">
              所有施工图纸、物料清单及验收记录均可在线实时查阅。我们通过数字化管理实现资源配置与进度计划的完美同步。
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-full">
              <FiSearch size={20} />
            </div>
            <h4 className="text-2xl font-bold tracking-tight">持续维保</h4>
            <p className="text-zinc-500 text-sm leading-relaxed font-light">
              交付不代表结束。我们的“强制精修”与长期维保服务，为您的空间提供全生命周期的专业守护。
            </p>
          </div>
        </div>
      </section>

      {/* 4. 底部 Slogan */}
      <footer className="py-20 text-center border-t border-zinc-50">
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-300">
          Professionalism · Transparency · Reliability
        </p>
      </footer>
    </div>
  );
};

export default SupportPage;
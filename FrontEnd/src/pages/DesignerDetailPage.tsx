import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { DESIGNERS } from '../data/designers'; 

const DesignerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const designer = DESIGNERS.find(d => d.id === Number(id));

  if (!designer) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-zinc-900">
        <p className="text-zinc-500 mb-6 uppercase tracking-widest text-xs font-bold">Designer Not Found / 信息整理中</p>
        <button onClick={() => navigate('/about')} className="px-8 py-3 border border-zinc-200 text-[10px] uppercase tracking-widest font-black hover:bg-zinc-900 hover:text-white transition-all">
          Back to Team
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#8C7355] selection:text-white">
      
      {/* 1. 沉浸式导航 */}
      <nav className="fixed top-0 w-full z-[100] px-8 py-10 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate('/about')} 
          className="pointer-events-auto flex items-center text-[10px] font-black tracking-[0.3em] uppercase text-zinc-900 hover:text-[#8C7355] transition-colors mix-blend-difference"
        >
          <FiArrowLeft className="mr-2 text-lg" /> Back / 返回
        </button>
      </nav>

      {/* 2. 英雄区 (Hero Section) */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-stretch pt-20">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <p className="text-[#8C7355] text-[10px] font-black tracking-[0.5em] uppercase mb-8">
              Principal Designer
            </p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-4 leading-none">
              {designer.name}
            </h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-12">
              {designer.fullTitle}
            </p>
            
            <div className="space-y-6 text-zinc-500 leading-relaxed text-base font-light border-l border-zinc-100 pl-8">
              {designer.bio.map((p, i) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 min-h-[60vh] lg:min-h-screen relative overflow-hidden"
        >
          <img 
            src={designer.image} 
            className="absolute inset-0 w-full h-full object-cover object-left" 
            alt={designer.name} 
          />
          <div className="absolute left-0 bottom-0 opacity-[0.03] select-none pointer-events-none p-8">
            <h2 className="text-[15vw] font-black uppercase leading-none tracking-tighter">
              {designer.name.split('').join(' ')}
            </h2>
          </div>
        </motion.div>
      </section>

      {/* 3. 作品展示区 (Works Section) */}
      <section className="py-32 px-8 md:px-20 bg-zinc-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-light tracking-tight">{designer.name}作品<span className="text-[#8C7355]">.</span></h3>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">Related Portfolio & Works</p>
            </div>
            <div className="h-px flex-1 bg-zinc-200 mx-12 hidden md:block opacity-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 pb-20">
            {designer.works.map((work, i) => (
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={work.id} 
                className="group cursor-pointer"
                onClick={() => navigate(`/cases/detail/${work.id}`)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-white relative mb-6">
                  <img 
                    src={work.image} 
                    className="w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-80" 
                    alt={work.title} 
                  />
                  <div className="absolute top-6 right-6 w-10 h-10 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <FiPlus className="text-zinc-900" size={20} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-zinc-900">{work.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{work.subTitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignerDetailPage;
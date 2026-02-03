import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Swiper as SwiperType } from 'swiper';
import ImageCarousel from '../ui/ImageCarousel';
import { carouselItems } from '../../data/websiteData';

const HeroSection: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  return (
    <section id="hero-section" className="relative h-full w-full">
      <div className="absolute inset-0 z-10">
        <ImageCarousel 
          items={carouselItems} 
          autoPlay={true} 
          delay={5000}
          onSlideChange={(index) => setCurrentSlideIndex(index)}
          setSwiperInstance={setSwiper}
        />
      </div>
      
      {/* 纯净漂浮导航 - 移除了磨砂背景和边框 */}
      <div className="absolute bottom-16 right-8 md:right-16 z-30 flex flex-col items-end">
        
        {/* 数字显示 */}
        <div className="flex items-baseline font-light mb-6 select-none text-white">
          <span className="text-4xl tracking-tighter tabular-nums leading-none">
            {String(currentSlideIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-white/20 text-xl mx-3 font-extralight">/</span>
          <span className="text-white/20 text-sm tracking-widest tabular-nums">
            {String(carouselItems.length).padStart(2, '0')}
          </span>
        </div>

        {/* 控制条 - 增加 w-16 让它稍微长一点，视觉更舒展 */}
        <div className="flex space-x-3">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => swiper?.slideToLoop(index)}
              className="group relative py-4"
            >
              <div className="relative w-12 md:w-16 h-[1.5px] bg-white/20 transition-all duration-300 group-hover:bg-white/60">
                <AnimatePresence>
                  {currentSlideIndex === index && (
                    <motion.div 
                      layoutId="hero-active-line"
                      className="absolute inset-0 bg-white z-10 h-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部渐变 - 稍微拉高一点点，确保在浅色图下控制条依然清晰 */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;
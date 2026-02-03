import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入路由钩子
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-fade';

export interface CarouselItem {
  id: number;
  titleLine1: string;
  titleLine2: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl: string;
  backgroundColor?: string;
}

interface ImageCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  delay?: number;
  onSlideChange?: (index: number) => void;
  setSwiperInstance?: (swiper: SwiperType) => void;
}

/**
 * 首页大图轮播组件
 * 务实改进：修复跳转刷新问题，支持内外链区分
 */
const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  items, 
  autoPlay = true, 
  delay = 5000,
  onSlideChange,
  setSwiperInstance
}) => {
  const navigate = useNavigate(); // 初始化跳转函数

  const handleImageClick = (linkUrl: string) => {
    if (!linkUrl || linkUrl === '#') return;

    /**
     * 务实重构：区分内外链
     * 1. 外部链接 (http/https): 使用新窗口打开
     * 2. 内部路由: 使用 navigate 进行无刷新跳转
     */
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(linkUrl);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        loop={items.length > 1}
        autoplay={autoPlay ? { delay, disableOnInteraction: false } : false}
        onSwiper={setSwiperInstance}
        className="h-full w-full"
        onSlideChange={(swiper) => {
          if (onSlideChange) onSlideChange(swiper.realIndex);
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} className="h-full w-full">
            <div 
              className="relative h-full w-full cursor-pointer overflow-hidden group"
              onClick={() => handleImageClick(item.linkUrl)}
            >
              {/* 背景填充颜色，防止图片加载前的瞬间白屏 */}
              <div 
                className="absolute inset-0 transition-transform duration-[10s] group-hover:scale-110"
                style={{ backgroundColor: item.backgroundColor || '#000' }}
              >
                {/* 桌面端图片 */}
                <img
                  src={item.imageUrl}
                  alt={item.titleLine1}
                  className="hidden md:block absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* 移动端图片 */}
                <img
                  src={item.mobileImageUrl || item.imageUrl}
                  alt={item.titleLine1}
                  className="md:hidden absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              
              {/* 装饰性暗色遮罩 */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageCarousel;
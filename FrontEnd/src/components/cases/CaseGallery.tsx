import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

interface CaseImage {
  id: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  isPrimary?: boolean;
  order: number;
}

interface CaseGalleryProps {
  images: CaseImage[];
}

const CaseGallery: React.FC<CaseGalleryProps> = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 務實修復：路徑清理函數
  const cleanPath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.replace(/^\/public/, '');
  };

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-2">🏞️</div>
          <p>暫無圖片</p>
        </div>
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden shadow-lg">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Zoom]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-white/70',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-white'
          }}
          thumbs={{ swiper: thumbsSwiper }}
          zoom={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full aspect-[16/9]"
        >
          {sortedImages.map((image) => (
            <SwiperSlide key={image.id} className="relative">
              <div className="swiper-zoom-container">
                <img
                  // 使用清理後的路徑
                  src={cleanPath(image.url)}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {image.alt}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {sortedImages.length > 1 && (
        <div className="px-8">
          <Swiper
            modules={[Thumbs]}
            watchSlidesProgress
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            className="thumbs-gallery"
          >
            {sortedImages.map((image, index) => (
              <SwiperSlide
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square max-w-[80px] ${
                  index === activeIndex ? 'ring-2 ring-amber-500' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  // 使用清理後的路徑
                  src={cleanPath(image.thumbnailUrl || image.url)}
                  alt={`縮略圖 - ${image.alt}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <div className="text-center text-gray-600 text-sm">
        圖片 {activeIndex + 1} / {sortedImages.length}
      </div>
    </div>
  );
};

export default CaseGallery;
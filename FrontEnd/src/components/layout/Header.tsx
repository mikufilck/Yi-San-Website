import React, { useState, useEffect } from 'react';
import { navItems } from '../../data/websiteData';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  variant?: 'transparent' | 'solid';
  forceDark?: boolean;
}

const Header: React.FC<HeaderProps> = ({ variant = 'solid', forceDark = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 切换页面关闭菜单，并恢复身体滚动
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  }, [location]);

  // 当菜单打开时，禁止背景滚动（务实体验）
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const isWhiteTextMode = variant === 'transparent' && !isScrolled && !forceDark;
  const showAccentBorder = !isWhiteTextMode;
  const accentColorSolid = 'rgba(140, 115, 85, 1)';

  const headerClass = isWhiteTextMode
    ? 'bg-transparent py-10' 
    : 'bg-white/95 backdrop-blur-md py-5 shadow-sm';

  const textColor = isWhiteTextMode ? 'text-white' : 'text-zinc-900';
  const logoFilter = isWhiteTextMode ? 'brightness(0) invert(1)' : 'none';

  return (
    <>
      <header className={`fixed top-0 left-0 w-full transition-all duration-700 z-[1000] ${headerClass}`}>
        <div 
          className="absolute bottom-0 left-0 w-full h-[1px] transition-all duration-700"
          style={{ 
            backgroundColor: accentColorSolid,
            opacity: showAccentBorder ? 1 : 0,
            transform: showAccentBorder ? 'scaleX(1)' : 'scaleX(0.9)',
          }} 
        />

        {isWhiteTextMode && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none -z-10 h-40" />
        )}

        <div className="container mx-auto px-8 md:px-12">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo-black.png" 
                  alt="YI SAN" 
                  className={`transition-all duration-700 ease-in-out ${isScrolled ? 'h-9 md:h-10' : 'h-12 md:h-14'}`}
                  style={{ filter: logoFilter }}
                />
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-12 xl:space-x-16">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`text-[12px] font-medium tracking-[0.4em] uppercase transition-all duration-300 ${textColor} hover:opacity-50 relative group`}
                >
                  {item.label}
                  <span 
                    className="absolute -bottom-2 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: isWhiteTextMode ? 'white' : accentColorSolid }}
                  />
                </Link>
              ))}
            </nav>

            {/* 汉堡按钮：层级必须最高 */}
            <button className="lg:hidden p-2 z-[1100] relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="w-6 space-y-2">
                <span className={`block h-[1.5px] w-full transition-all duration-300 ${isWhiteTextMode && !isMenuOpen ? 'bg-white' : 'bg-black'} ${isMenuOpen ? 'rotate-45 translate-y-2 bg-black' : ''}`}></span>
                <span className={`block h-[1.5px] w-full transition-all duration-300 ${isWhiteTextMode && !isMenuOpen ? 'bg-white' : 'bg-black'} ${isMenuOpen ? '-rotate-45 -translate-y-[1.5px] bg-black' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 移动端全屏菜单：移出 header，独立定位 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[1050] flex flex-col items-center justify-center"
          >
            {/* 菜单内容容器 */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col space-y-10 text-center"
            >
              {navItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.href} 
                  className="text-2xl font-light tracking-[0.5em] text-zinc-900 uppercase hover:text-[#8C7355] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 装饰线 */}
              <div className="w-8 h-[1px] bg-[#8C7355] mx-auto mt-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
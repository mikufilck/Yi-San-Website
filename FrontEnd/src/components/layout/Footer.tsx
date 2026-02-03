import React from 'react';
import { contactInfo } from '../../data/websiteData';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo和简介 */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-white">
              一三<span className="text-amber-500">YI SAN</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              融合东方美学与现代设计，创造永恒的空间艺术。
            </p>
            <div className="flex space-x-4">
              {['建筑', '室内', '家具', '照明'].map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">导航</h3>
            <ul className="space-y-3">
              {['设计案例', '关于我们', '服务流程', '团队介绍', '新闻动态'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-sm block py-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">联系</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-0.5">📍</span>
                <span className="text-gray-400">{contactInfo.address}</span>
              </li>
              <li className="flex items-center">
                <span className="text-amber-500 mr-3">📞</span>
                <span className="text-gray-400">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <span className="text-amber-500 mr-3">✉️</span>
                <span className="text-gray-400">{contactInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* 订阅或社交媒体 */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">关注</h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm mb-4">
                订阅我们的最新设计动态与案例分享。
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="输入您的邮箱"
                  className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm transition-colors">
                  订阅
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} 一三设计 版权所有</p>
          <p className="mt-2 text-xs">粤ICP备12345678号</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
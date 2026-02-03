import React from 'react';
import { Link } from 'react-router-dom';
import { featuredProducts } from '../../data/websiteData';

const ProductShowcaseSection: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 mb-4">精选产品 / <span className="italic font-serif text-zinc-400">Products</span></h2>
          <p className="text-zinc-500 max-w-2xl mx-auto font-light">
            探索一三的匠心之作，每一款设计都凝聚着对材料、工艺和美学的深思。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProducts.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="group bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700"
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <Link 
                    to="/product"
                    className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 px-8 py-3 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-widest"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              <div className="p-8">
                <span className="text-[#8C7355] text-[10px] font-bold uppercase tracking-widest mb-2 block">{product.category}</span>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{product.name}</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{product.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <Link
            to="/product"
            className="inline-flex items-center px-12 py-4 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#8C7355] transition-all duration-500 shadow-xl"
          >
            浏览全部产品
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
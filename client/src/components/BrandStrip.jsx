import React from 'react';

const BrandStrip = () => {
  const brands = ['FINANCE.CO', 'HEALTHSYNC', 'EDUCORE', 'SENDER', 'BLOCKBASE', 'NETFLUX'];
  
  return (
    <div className="w-full bg-brand-surface border-y border-brand-border py-6 overflow-hidden">
      <div className="text-center mb-4">
        <p className="text-[10px] font-semibold text-text-hint tracking-widest uppercase">
          Trusted by support teams at
        </p>
      </div>
      <div className="flex items-center justify-center gap-x-12 px-6">
        {brands.map((brand) => (
          <span 
            key={brand} 
            className="text-[16px] font-syne font-bold text-brand-border hover:text-text-hint transition-colors cursor-default"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BrandStrip;

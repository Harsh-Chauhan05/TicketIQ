import React from 'react';

const CTABanner = () => {
  return (
    <section className="py-24 bg-brand-surface border-y border-brand-border relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] ambient-magenta-bloom opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <p className="text-[10px] font-bold text-brand-magenta tracking-widest uppercase mb-4">
          Get Started Free
        </p>
        <h2 className="text-editorial-h2 md:text-[52px] text-text-primary max-w-[600px] mx-auto mb-6">
          Your support team deserves better tools.
        </h2>
        <p className="text-[15px] text-text-secondary max-w-[440px] mx-auto mb-10 font-dmsans">
          Scale your support operations without scaling your headcount. Deploy TicketIQ in minutes.
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-16">
          <button className="h-[48px] px-8 btn-cta text-[15px]">
            Start free trial →
          </button>
          <button className="h-[48px] px-7 btn-ghost text-[15px]">
            Book a demo
          </button>
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['500+ teams', '2M+ tickets', '99.9% uptime'].map((text) => (
            <div key={text} className="px-5 py-2.5 bg-brand-black border border-brand-border rounded-full text-[12px] text-text-secondary font-dmsans">
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTABanner;

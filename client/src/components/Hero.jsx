import React from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

const Hero = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const desktopScene = "https://prod.spline.design/sFVgdf5wd8JOuu8f/scene.splinecode";
  const mobileScene = "https://prod.spline.design/0fHk9xFAvfkFkvSt/scene.splinecode";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#080510] font-outfit">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#080510]">
          <div className="w-12 h-12 rounded-full border-t-2 border-[#00E5FF] animate-spin mb-4" />
          <p className="text-[#00E5FF] font-display text-[12px] uppercase tracking-[0.3em] animate-pulse">Initializing Interface...</p>
        </div>
      )}

      {/* 1. Spline 3D Background */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-auto transition-opacity duration-1000" style={{ opacity: isLoading ? 0 : 1 }}>
        <Spline 
          scene={isMobile ? mobileScene : desktopScene} 
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Subtle vignettes to ensure text remains readable */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#080510]/80 via-[#080510]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#080510] via-transparent to-transparent pointer-events-none" />

      {/* Container for asymmetrical layout */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-screen flex flex-col justify-center px-8 lg:px-16 pointer-events-none">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full pt-20 pb-10">
          
          {/* Left Column: Bold Typography & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 px-4 py-2 glass-panel rounded-full mb-8 pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[13px] font-semibold text-white tracking-[0.2em] uppercase">
                Next-Gen Support OS
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl lg:text-[84px] font-bold text-white leading-[1.05] tracking-tight mb-8">
              Resolve <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E040FB] to-[#00E5FF]">Faster.</span> <br/>
              Scale <span className="text-gray-400">Smarter.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-300 leading-relaxed max-w-[480px] mb-10 border-l-2 border-[#E040FB]/50 pl-6">
              TicketIQ automates routing, monitors SLA deadlines, and enforces your domain rules. Focus your team on what matters.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-5 pointer-events-auto">
              <button className="h-[60px] px-8 bg-white text-black font-semibold rounded-2xl text-[16px] transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Start for free
              </button>
              <button className="h-[60px] px-8 glass-panel text-white font-semibold rounded-2xl transition-all hover:bg-white/10 text-[16px] flex items-center gap-3">
                Watch Demo
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Floating Bento Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-end lg:items-end h-full w-full pointer-events-none pb-20"
          >
            <div className="grid grid-cols-2 gap-4 w-full max-w-[500px] pointer-events-auto">
              
              {/* Stat 1 */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#E040FB]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#E040FB]">bolt</span>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-white mb-1">99%</h3>
                  <p className="text-[14px] text-gray-400 font-medium">SLA Compliance</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#00E5FF]">check_circle</span>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-white mb-1">2.4M+</h3>
                  <p className="text-[14px] text-gray-400 font-medium">Tickets Resolved</p>
                </div>
              </div>

              {/* Wide Card */}
              <div className="col-span-2 glass-panel p-6 rounded-3xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#080510] bg-gray-600" />
                    <div className="w-12 h-12 rounded-full border-2 border-[#080510] bg-gray-500" />
                    <div className="w-12 h-12 rounded-full border-2 border-[#080510] bg-gray-400 flex items-center justify-center font-bold text-white text-xs">+1k</div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[16px]">Active Teams</h4>
                    <p className="text-[13px] text-gray-400">Globally deployed</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">arrow_forward</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
      
    </section>
  );
};

export default Hero;

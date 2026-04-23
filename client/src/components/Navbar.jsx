import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] flex justify-center pt-5 px-6 pointer-events-none">
      <div className={`
        floating-pill h-[52px] max-w-[780px] w-full flex items-center gap-8 justify-between px-2 pr-2 pointer-events-auto
        transition-all duration-300 ${scrolled ? 'bg-brand-surface/90' : 'bg-brand-surface/75'}
      `}>
        {/* Logo */}
        <div className="flex items-center pl-4 pr-2">
          <div className="w-[8px] h-[8px] bg-brand-magenta transform rotate-45 mr-2" />
          <span className="text-[14px] font-syne font-bold text-text-primary tracking-tight">TicketIQ</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7">
          {['Features', 'How it works', 'Pricing', 'Docs'].map((link) => (
            <a 
              key={link} 
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-[13px] font-dmsans text-text-secondary hover:text-text-primary transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="h-[34px] px-4 btn-ghost text-[13px] border-brand-border">Log in</button>
          <button className="h-[34px] px-5 btn-cta text-[13px] font-semibold">Get started</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

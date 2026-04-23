import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-black pt-20 pb-10 px-[8%] border-t border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          {/* Brand Info */}
          <div className="max-w-[240px]">
            <div className="flex items-center mb-3">
              <div className="w-[10px] h-[10px] bg-brand-magenta transform rotate-45 mr-3" />
              <span className="text-[16px] font-syne font-bold text-text-primary">TicketIQ</span>
            </div>
            <p className="text-[13px] font-dmsans text-text-hint leading-relaxed">
              Intelligent support, automated. The Kinetic Ledger for enterprise support teams.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-10">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] }
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-[11px] font-bold text-text-hint tracking-widest uppercase mb-5">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors font-dmsans">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[1px] w-full bg-brand-border mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[12px] text-text-hint font-dmsans">
            © 2026 TicketIQ. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {['Twitter', 'GitHub', 'LinkedIn'].map((app) => (
              <a key={app} href="#" className="text-[16px] text-text-hint hover:text-brand-magenta transition-colors">
                <span className="sr-only">{app}</span>
                {/* Social Icon Placeholders */}
                <div className="w-5 h-5 bg-current rounded-sm opacity-20" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

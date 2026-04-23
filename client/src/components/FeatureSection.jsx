import React from 'react';
import { motion } from 'framer-motion';

const FeatureSection = ({ 
  eyebrow, 
  title, 
  body, 
  items, 
  visualType, 
  reverse = false, 
  color = 'magenta' 
}) => {
  
  const accentColor = {
    magenta: 'text-brand-magenta',
    cyan: 'text-brand-cyan',
    teal: 'text-[#00E5A0]'
  }[color];

  const bgColor = reverse ? 'bg-brand-surface border-y border-brand-border' : 'bg-brand-black';

  return (
    <section className={`py-24 px-[8%] ${bgColor} overflow-hidden`}>
      <div className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* Left Column: Text */}
        <motion.div 
          initial={{ opacity: 0, x: reverse ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 max-w-[480px]"
        >
          <p className={`text-[10px] font-bold ${accentColor} tracking-widest uppercase mb-4`}>
            {eyebrow}
          </p>
          <h2 className="text-editorial-h2 text-text-primary mb-5">
            {title}
          </h2>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-8 font-dmsans">
            {body}
          </p>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-[10px] h-[10px] transform rotate-45 bg-${color === 'teal' ? '[#00E5A0]' : `brand-${color}`}`} />
                <span className="text-[14px] text-text-primary font-dmsans">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 w-full"
        >
          {visualType === 'prioritization' && (
            <div className="glass-card p-6 shadow-2xl shadow-brand-magenta/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text-hint font-dmsans tracking-wide">Priority Engine · Live</span>
                  <div className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'CRITICAL', text: 'Payment transaction failed', color: 'red-500', fill: '90%' },
                  { label: 'HIGH', text: 'Order not delivered — 3 days', color: 'amber-500', fill: '50%' },
                  { label: 'MEDIUM', text: 'Wrong item received', color: 'blue-500', fill: '80%' },
                  { label: 'LOW', text: 'Update shipping address', color: 'green-500', fill: '100%' },
                ].map((row, i) => (
                  <div key={i} className="py-3 border-b border-[#140F28] flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded bg-${row.color}/10 text-${row.color} border border-${row.color}/20 font-bold`}>
                        {row.label}
                      </span>
                      <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">{row.text}</span>
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-brand-border" />
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - parseInt(row.fill)} className={`text-${row.color}`} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visualType === 'sla' && (
            <div className="glass-card p-6 bg-brand-black shadow-2xl shadow-brand-cyan/5">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'BREACHED', color: 'red-500' },
                  { label: 'AT RISK', color: 'amber-500' },
                  { label: 'ON TRACK', color: 'green-500' }
                ].map((lane, i) => (
                  <div key={i} className="space-y-3">
                    <p className={`text-[9px] font-bold text-${lane.color} tracking-widest mb-2`}>{lane.label}</p>
                    <div className="bg-brand-surface p-3 rounded-lg border border-brand-border h-24 flex items-end justify-center">
                       <div className="w-2/3 h-[2px] bg-brand-border rounded-full relative">
                          <div className={`absolute inset-0 bg-${lane.color} rounded-full`} style={{ width: i === 0 ? '100%' : i === 1 ? '60%' : '30%' }} />
                       </div>
                    </div>
                    <div className="bg-brand-surface p-3 rounded-lg border border-brand-border h-24" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {visualType === 'domains' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Banking', color: 'amber-500', icon: '🏦' },
                { name: 'E-Commerce', color: 'blue-500', icon: '🛒' },
                { name: 'Healthcare', color: 'green-500', icon: '🏥' },
                { name: 'EdTech', color: 'magenta', icon: '🎓' }
              ].map((domain, i) => (
                <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-magenta/30 transition-all group">
                   <div className="text-xl mb-3">{domain.icon}</div>
                   <h4 className="text-text-primary font-syne font-bold text-[18px] mb-2">{domain.name}</h4>
                   <div className="space-y-1.5 opacity-60">
                     <div className="h-1 w-12 bg-text-hint rounded" />
                     <div className="h-1 w-20 bg-text-hint rounded" />
                   </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;

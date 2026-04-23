import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Building2, Globe, Mail, Lock, Info } from 'lucide-react';

const FieldRow = ({ icon: Icon, label, value, locked, description }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
    <div className="flex items-center gap-4 w-full sm:w-1/3">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-neon-cyan" />
      </div>
      <div>
        <div className="text-[13px] font-bold font-display uppercase tracking-wider text-white">{label}</div>
        {description && <div className="text-[11px] text-text-muted mt-0.5">{description}</div>}
      </div>
    </div>
    <div className="flex-1 flex items-center gap-3">
      <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-[14px] text-white font-mono">
        {value}
      </div>
      {locked && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 py-2 bg-white/5 rounded-lg border border-white/5">
          <Lock className="w-3 h-3" /> Locked
        </div>
      )}
    </div>
  </div>
);

const TenantSettings = () => {
  const { user } = useAuth();

  const DOMAIN_INFO = {
    banking:    { label: 'Banking & Finance', desc: 'Financial transaction and account support' },
    ecommerce:  { label: 'E-Commerce', desc: 'Order, payment, and delivery support' },
    healthcare: { label: 'Healthcare', desc: 'Patient records and appointment support' },
    edtech:     { label: 'EdTech', desc: 'Online learning and course support' },
  };
  const domainInfo = DOMAIN_INFO[user?.domain] || { label: user?.domain, desc: '' };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Workspace Settings</h1>
        <p className="text-text-muted text-lg">Your organisation's configuration and domain identity.</p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 p-5 bg-neon-purple/10 border border-neon-purple/20 rounded-xl"
      >
        <Info className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-bold text-white mb-1">Domain Identity is Immutable</p>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Your domain (<strong className="text-neon-cyan">{user?.domain}</strong>) determines which AI Priority rules apply to your tickets and which SLA policies govern your agents.
            Each domain has its own dedicated admin. To change domains, contact your system administrator.
          </p>
        </div>
      </motion.div>

      {/* Settings Fields */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-display uppercase tracking-widest text-text-muted font-bold px-1 mb-4">Organisation Identity</h3>

        <FieldRow
          icon={Building2}
          label="Admin Account"
          value={user?.name || '—'}
          locked={false}
          description="Your display name as seen by agents and customers"
        />

        <FieldRow
          icon={Mail}
          label="Admin Email"
          value={user?.email || '—'}
          locked={false}
          description="Login email — contact support to change"
        />

        <FieldRow
          icon={Globe}
          label="Business Domain"
          value={domainInfo.label}
          locked={true}
          description={domainInfo.desc}
        />
      </div>

      {/* Configuration Links */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-display uppercase tracking-widest text-text-muted font-bold px-1 mb-4">Configuration Modules</h3>
        {[
          { href: '/admin/domain-config', label: 'AI Priority Engine', desc: 'Manage keyword rules that auto-upgrade ticket priority', color: 'neon-purple' },
          { href: '/admin/sla-settings', label: 'SLA Deadlines', desc: 'Set resolution timers for Critical, High, Medium, Low tickets', color: 'neon-cyan' },
          { href: '/admin/users', label: 'User Management', desc: 'Manage agents, toggle access, and assign roles', color: 'amber-500' },
          { href: '/admin/reports', label: 'SLA Reports', desc: 'Live compliance metrics and breach breakdown', color: 'green-500' },
        ].map((link, i) => (
          <motion.a
            key={link.href}
            href={link.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer"
          >
            <div className={`w-2 h-10 rounded-full bg-${link.color} opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-neon-cyan transition-colors">{link.label}</div>
              <div className="text-[12px] text-text-muted">{link.desc}</div>
            </div>
            <div className="ml-auto text-white/20 group-hover:text-white/50 transition-colors text-lg">→</div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default TenantSettings;

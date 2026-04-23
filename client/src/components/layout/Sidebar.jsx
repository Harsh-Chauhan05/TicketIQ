import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, LayoutDashboard, Ticket, MessageSquarePlus, 
  Clock, Bell, Settings, Users, ShieldAlert, BarChart3, X, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getLinks = (role) => {
    switch (role) {
      case 'customer':
        return [
          { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
          { name: 'Submit Ticket', path: '/customer/submit', icon: MessageSquarePlus },
          { name: 'Notifications', path: '/customer/notifications', icon: Bell },
        ];
      case 'agent':
        return [
          { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
          { name: 'Ticket Queue', path: '/agent/queue', icon: Ticket },
          { name: 'SLA Monitor', path: '/agent/sla-monitor', icon: Clock },
          { name: 'Notifications', path: '/agent/notifications', icon: Bell },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'All Tickets', path: '/admin/tickets', icon: Ticket },
          { name: 'SLA Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'Routing Rules', path: '/admin/domain-config', icon: Zap },
          { name: 'SLA Settings', path: '/admin/sla-settings', icon: Clock },
          { name: 'Notifications', path: '/admin/notifications', icon: Bell },
          { name: 'Team', path: '/admin/users', icon: Users },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(user.role);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#050510] border-r border-white/5 flex flex-col h-full z-[70] transition-transform duration-300 transform md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center shadow-lg shadow-neon-purple/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white tracking-tight">TicketIQ</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-text-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${
                  isActive ? 'text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-neon-purple rounded-r-full" />
                )}
                <link.icon className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-neon-purple' : 'group-hover:text-neon-cyan'
                }`} />
                <span className="text-[14px] font-medium relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Mini-badge */}
        <div className="p-4 border-t border-white/5">
          <Link 
            to={`/${user.role}/profile`} 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-[12px] font-bold text-white uppercase font-display">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-text-muted truncate">{user.role}</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Settings, LogOut, User, Shield, 
  Check, Ticket, Calendar, AlertCircle, Loader2, X,
  ArrowRight, Inbox, Clock, Menu, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ticketAPI } from '../../api/tickets';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await ticketAPI.searchTickets(searchQuery);
          setSearchResults(res.data.data || []);
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (id) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(`/${user.role}/tickets/${id}`);
  };

  return (
    <header className="h-20 bg-[#050510]/80 border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl border border-white/5 text-text-muted hover:text-white hover:bg-white/5 flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden mr-2">
          <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center shadow-lg shadow-neon-purple/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white tracking-tight text-[15px] hidden xs:block">TicketIQ</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative hidden sm:block" ref={searchRef}>
        <div className={`relative flex items-center transition-all duration-300 ${showSearch ? 'w-full' : 'w-72'}`}>
          <Search className={`absolute left-4 w-4 h-4 transition-colors ${showSearch ? 'text-neon-cyan' : 'text-text-muted'}`} />
          <input 
            type="text" 
            placeholder="Search tickets by ID, title or content..." 
            value={searchQuery}
            onFocus={() => setShowSearch(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-12 pr-10 text-[14px] text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.05] transition-all placeholder:text-text-muted/40"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 hover:bg-white/10 rounded-lg text-text-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearch && searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-3 glass-strong border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[60]"
            >
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {isSearching ? 'Scanning Database...' : `Results for "${searchQuery}"`}
                </span>
                {!isSearching && <span className="text-[10px] font-bold text-neon-cyan">{searchResults.length} Found</span>}
              </div>
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {isSearching ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                    <span className="text-[12px] text-text-muted">AI searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => handleResultClick(t._id)}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all group cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                          t.finalPriority === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          t.finalPriority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                        }`}>
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[13px] font-bold text-white group-hover:text-neon-cyan transition-colors">{t.ticketNumber}</span>
                            <span className="text-[10px] text-text-muted">
                              {t.createdAt && !isNaN(new Date(t.createdAt).getTime()) 
                                ? `${formatDistanceToNow(new Date(t.createdAt))} ago` 
                                : 'Just now'}
                            </span>
                          </div>
                          <p className="text-[12px] text-text-secondary truncate pr-4 group-hover:text-white transition-colors">{t.title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-text-muted text-[14px]">No tickets found.</p>
                    <p className="text-[11px] text-text-muted/50 mt-1 uppercase tracking-wider">Try searching by ID (e.g. TKT-00001)</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              console.log('🔔 Notification icon clicked. Current state:', showNotifications);
              setShowNotifications(!showNotifications);
            }}
            className={`p-2.5 rounded-xl border border-white/5 transition-all relative group ${
              showNotifications ? 'bg-neon-purple/10 border-neon-purple/50 text-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5 text-text-muted hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-purple text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#050510] shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full -right-4 sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-[#0a0a16] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
              >
                <div className="p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-white text-[15px]">Notifications</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">You have {unreadCount || 0} unread alerts</p>
                  </div>
                </div>

                <div className="max-h-[480px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-16 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-8 h-8 text-text-muted/30" />
                      </div>
                      <p className="text-text-muted text-[14px]">Your inbox is empty</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const ticketId = n.ticketId?._id || n.ticketId;
                      const createdAt = n.createdAt ? new Date(n.createdAt) : null;
                      const isValidDate = createdAt && !isNaN(createdAt.getTime());

                      return (
                        <div key={n._id} className="p-5 hover:bg-white/[0.02] transition-colors group relative flex gap-4 border-l-2 border-transparent hover:border-neon-cyan">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.isRead ? 'bg-white/5 text-text-muted' : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                          }`}>
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={ticketId ? `/${user?.role}/tickets/${ticketId}` : '#'}
                              onClick={() => { if(markRead) markRead(n._id); setShowNotifications(false); }}
                              className="block"
                            >
                              <p className={`text-[13px] leading-relaxed mb-1.5 transition-colors ${n.isRead ? 'text-text-secondary' : 'text-white font-medium group-hover:text-neon-cyan'}`}>
                                {n.message}
                              </p>
                              <span className="text-[11px] text-text-muted flex items-center gap-1.5 font-display uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5" />
                                {isValidDate ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Recently'}
                              </span>
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <Link 
                  to={`/${user?.role}/notifications`} 
                  onClick={() => setShowNotifications(false)}
                  className="block p-4 text-center text-[12px] font-bold text-neon-cyan hover:text-white bg-white/[0.02] border-t border-white/10 transition-colors uppercase tracking-widest"
                >
                  Manage All Notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-[13px] font-bold text-white leading-none mb-1">{user?.name}</div>
            <div className="text-[10px] text-text-muted font-display uppercase tracking-widest">{user?.role}</div>
          </div>
          <Link to={`/${user?.role}/profile`} className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-neon-purple to-neon-cyan group transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="w-full h-full rounded-full bg-[#050510] flex items-center justify-center border-2 border-transparent group-hover:bg-[#0a0a16] transition-colors">
              <span className="text-[16px] font-bold text-white uppercase font-display tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#050510] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          </Link>
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { userAPI } from '../../api/users';
import { ArrowLeft, Clock, MessageSquare, Send, Loader2, User, ShieldAlert, CheckCircle2, FileText, Zap, Activity, Users, Paperclip, X, Download } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../utils/fileUrl';

const AgentTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [replyType, setReplyType] = useState('public'); // 'public' | 'internal'
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await ticketAPI.getTicket(id);
      setTicket(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    if (user?.role === 'admin') {
      userAPI.getUsers({ role: 'agent' })
        .then(res => setAgents(res.data.data || []))
        .catch(console.error);
    }
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) return;
    setFiles([...files, ...selectedFiles]);
  };

  const handleAction = async (actionFn, ...args) => {
    setSubmitting(true);
    try {
      await actionFn(...args);
      await fetchTicket();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (replyType === 'public') {
      if (!reply.trim() && files.length === 0) return;
      setSubmitting(true);
      try {
        const data = new FormData();
        data.append('message', reply);
        files.forEach(f => data.append('attachments', f));
        await ticketAPI.addComment(id, data);
        setReply('');
        setFiles([]);
        await fetchTicket();
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!note.trim()) return;
      handleAction(ticketAPI.addNote, id, note);
      setNote('');
    }
  };

  const renderAttachments = (attachments) => (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments?.map((file, idx) => (
        <a 
          key={idx}
          href={getFileUrl(file.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-neon-cyan/50 transition-all text-[12px] text-white group"
        >
          <FileText className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="truncate max-w-[120px]">{file.filename}</span>
          <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );

  if (loading) return <div className="p-8 text-text-muted">Loading ticket...</div>;
  if (!ticket) return <div className="p-8 text-red-500">Ticket not found.</div>;

  const isBreached = new Date() > new Date(ticket.slaDeadline);

  return (
    <div className="max-w-[1400px] mx-auto pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Link to={user.role === 'admin' ? '/admin/tickets' : '/agent/queue'} className="inline-flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase font-display text-text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {user.role === 'admin' ? 'Global Tickets' : 'Queue'}
        </Link>

        <div className="glass-strong border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <span className="text-[12px] font-display uppercase tracking-widest text-text-muted">ID: {ticket._id}</span>
              <div className="flex gap-2">
                <select 
                  value={ticket.status}
                  onChange={(e) => handleAction(ticketAPI.updateStatus, id, e.target.value)}
                  className="bg-[#13151f] border border-white/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-neon-cyan"
                >
                  <option value="open">Status: Open</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="resolved">Status: Resolved</option>
                  <option value="closed">Status: Closed</option>
                </select>
                <select 
                  value={ticket.finalPriority}
                  onChange={(e) => {
                    const reason = prompt("Reason for override:");
                    if(reason) handleAction(ticketAPI.overridePriority, id, e.target.value, reason);
                  }}
                  className={`bg-[#13151f] border rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider focus:outline-none transition-colors
                    ${ticket.finalPriority === 'critical' ? 'border-red-500/30 text-red-400' :
                      ticket.finalPriority === 'high' ? 'border-amber-500/30 text-amber-400' :
                      ticket.finalPriority === 'medium' ? 'border-blue-500/30 text-blue-400' :
                      'border-green-500/30 text-green-400'
                    }`}
                >
                  <option value="critical">Pri: Critical</option>
                  <option value="high">Pri: High</option>
                  <option value="medium">Pri: Medium</option>
                  <option value="low">Pri: Low</option>
                </select>
              </div>
            </div>

            <h1 className="text-2xl font-display font-bold text-white mb-6 leading-snug">{ticket.title}</h1>
            
            <div className="p-6 bg-black/20 rounded-xl border border-white/5 mb-6">
              <p className="text-[15px] leading-relaxed text-text-primary whitespace-pre-wrap mb-4">{ticket.description}</p>
              {renderAttachments(ticket.attachments)}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-[#05050A]">
            <h3 className="text-[12px] font-display uppercase tracking-widest text-text-muted mb-6 font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Activity Feed
            </h3>
            
            <div className="space-y-6">
              {ticket.internalNotes?.map(n => (
                <div key={n._id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[12px]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-bold text-amber-500 uppercase tracking-widest font-display">Internal Note ({n.author?.name})</span>
                      <span className="text-[11px] text-text-muted">{formatDistanceToNow(new Date(n.createdAt))} ago</span>
                    </div>
                    <div className="p-4 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl text-[13px] text-amber-100 whitespace-pre-wrap">
                      {n.note}
                    </div>
                  </div>
                </div>
              ))}

              {ticket.comments?.map((c) => {
                const isCustomer = c.author?.role === 'customer';
                return (
                  <div key={c._id} className="flex gap-4">
                    <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-[12px] text-white ${
                      isCustomer ? 'bg-white/10' : 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                    }`}>
                      {isCustomer ? <User className="w-4 h-4" /> : c.author?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-white">{isCustomer ? c.author?.name : `Agent ${c.author?.name}`}</span>
                        <span className="text-[11px] text-text-muted">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                      </div>
                      <div className={`p-4 rounded-xl text-[14px] whitespace-pre-wrap ${isCustomer ? 'bg-white/[0.03] border border-white/5 text-text-primary' : 'bg-neon-purple/10 border border-neon-purple/20 text-white'}`}>
                        {c.message}
                        {renderAttachments(c.attachments)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.02]">
            <div className="flex gap-1 mb-4">
              <button onClick={() => setReplyType('public')} className={`px-4 py-2 text-[12px] font-bold uppercase tracking-widest font-display rounded-t-lg transition-colors ${replyType === 'public' ? 'bg-neon-purple/20 text-neon-purple border-b-2 border-neon-purple' : 'text-text-muted hover:text-white'}`}>Public Reply</button>
              <button onClick={() => setReplyType('internal')} className={`px-4 py-2 text-[12px] font-bold uppercase tracking-widest font-display rounded-t-lg transition-colors ${replyType === 'internal' ? 'bg-amber-500/20 text-amber-500 border-b-2 border-amber-500' : 'text-text-muted hover:text-white'}`}>Internal Note</button>
            </div>
            
            <div className="space-y-4">
              {replyType === 'public' && files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 bg-neon-purple/10 border border-neon-purple/20 rounded-lg text-[11px] text-neon-purple">
                      <FileText className="w-3 h-3" /> {f.name}
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              
              <form onSubmit={submitReply} className="relative">
                <textarea 
                  value={replyType === 'public' ? reply : note}
                  onChange={(e) => replyType === 'public' ? setReply(e.target.value) : setNote(e.target.value)}
                  required
                  rows={4}
                  placeholder={replyType === 'public' ? "Reply to customer..." : "Add a private note for your team..."}
                  className={`w-full bg-black/20 border border-white/10 rounded-b-xl rounded-tr-xl px-4 py-4 pr-32 text-[14px] text-white focus:outline-none transition-all resize-y ${replyType === 'public' ? 'focus:border-neon-purple/50' : 'focus:border-amber-500/50'}`}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {replyType === 'public' && (
                    <label className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-text-muted hover:text-neon-purple cursor-pointer">
                      <Paperclip className="w-4 h-4" />
                      <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center p-0 disabled:opacity-50 transition-colors shadow-lg ${replyType === 'public' ? 'bg-neon-purple hover:bg-neon-purple/80 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 border border-white/5">
          <h3 className="text-[12px] font-display uppercase tracking-widest text-text-muted mb-4 font-bold flex items-center gap-2"><Users className="w-4 h-4" /> Assignment</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-text-muted">Assigned Agent</span>
              {ticket.assignedTo ? <span className="text-white font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> {ticket.assignedTo.name}</span> : <span className="text-text-muted italic">Unassigned</span>}
            </div>
            {user?.role === 'admin' && (
              <div className="pt-3 border-t border-white/5 space-y-3">
                <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-[#13151f] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neon-cyan/50">
                  <option value="">— Select an agent —</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
                <button disabled={!selectedAgent || submitting} onClick={() => handleAction(ticketAPI.assignTicket, id, selectedAgent)} className="w-full btn-primary py-2 text-[12px] flex items-center justify-center gap-2">Assign Ticket</button>
              </div>
            )}
            {user?.role === 'agent' && !ticket.assignedTo && (
              <div className="pt-3 border-t border-white/5">
                <button onClick={() => handleAction(ticketAPI.assignTicket, id, user._id)} className="w-full text-neon-cyan hover:text-white border border-neon-cyan/30 hover:border-white/20 transition-colors text-[12px] font-bold uppercase tracking-wider py-2 rounded-lg">Assign to me</button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 glow-purple">
          <h3 className="text-[12px] font-display uppercase tracking-widest text-white mb-4 font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-neon-purple" /> AI Priority Engine</h3>
          <div className="flex items-end justify-between bg-white/5 rounded-xl p-4 mb-4">
            <div>
              <div className="text-[11px] text-text-muted uppercase tracking-widest font-bold mb-1">Priority Level</div>
              <div className="text-3xl font-display font-bold text-white uppercase">{ticket.finalPriority}</div>
            </div>
            <Activity className="w-8 h-8 text-neon-purple opacity-50" />
          </div>
        </div>

        <div className={`glass-card p-6 border ${isBreached ? 'border-neon-pink/30 shadow-[0_0_20px_rgba(255,68,102,0.1)]' : 'border-white/5'}`}>
          <h3 className="text-[12px] font-display uppercase tracking-widest text-text-muted mb-4 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> SLA Deadline</h3>
          <div className="flex flex-col gap-2">
            <div className={`text-2xl font-display font-bold ${isBreached ? 'text-neon-pink' : 'text-white'}`}>{isBreached ? 'BREACHED' : formatDistanceToNow(new Date(ticket.slaDeadline), { addSuffix: true })}</div>
            <div className="text-[12px] text-text-secondary pr-4">Requires resolution by <strong>{ticket.slaDeadline ? format(new Date(ticket.slaDeadline), 'MMM d, h:mm a') : 'TBD'}</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTicketDetail;

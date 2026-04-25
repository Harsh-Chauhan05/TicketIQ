import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { ArrowLeft, Clock, MessageSquare, Send, Loader2, User, Paperclip, FileText, X, Download } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getFileUrl } from '../../utils/fileUrl';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('Max 5 files allowed.');
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() && files.length === 0) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('message', comment);
      files.forEach(f => data.append('attachments', f));

      await ticketAPI.addComment(id, data);
      setComment('');
      setFiles([]);
      fetchTicket();
    } catch (err) {
      setError('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">Loading ticket...</div>;
  if (!ticket) return <div className="p-8 text-red-500">Ticket not found.</div>;

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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase font-display text-text-muted hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="glass-card border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-[12px] font-display uppercase tracking-widest text-text-muted">ID: {ticket._id}</span>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border 
                ${ticket.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  ticket.status === 'closed' ? 'bg-text-muted/10 text-white/50 border-white/10' :
                  'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                }`}>
                {ticket.status}
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-white uppercase tracking-wider`}>
                <div className={`w-2 h-2 rounded-full ${
                  ticket.finalPriority === 'critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                  ticket.finalPriority === 'high' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                  ticket.finalPriority === 'medium' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' :
                  'bg-green-500 shadow-[0_0_8px_#22c55e]'
                }`} />
                {ticket.finalPriority}
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-6 leading-snug">
            {ticket.title}
          </h1>

          <div className="flex items-center gap-6 text-[13px] text-text-secondary">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              Created {format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b border-white/5">
          <h3 className="text-[11px] font-display uppercase tracking-widest text-text-muted mb-4 font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Description
          </h3>
          <p className="text-[15px] leading-relaxed text-text-primary whitespace-pre-wrap mb-4">
            {ticket.description}
          </p>
          {renderAttachments(ticket.attachments)}
        </div>

        <div className="p-6 md:p-8 bg-[#0a0e1a]/50">
          <h3 className="text-[13px] font-display uppercase tracking-widest text-white mb-6 font-bold">Activity Feed</h3>
          
          <div className="space-y-6 mb-8">
            {ticket.comments.length === 0 ? (
              <p className="text-text-muted text-[14px] italic">No activity yet.</p>
            ) : (
              ticket.comments.map((c) => {
                const isEmployee = c.author?.role === 'agent' || c.author?.role === 'admin';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={c._id} 
                    className={`flex gap-4 ${isEmployee ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0 ${
                      isEmployee ? 'bg-gradient-to-br from-neon-purple to-neon-cyan' : 'bg-white/10'
                    }`}>
                      {isEmployee ? 'S' : <User className="w-5 h-5 text-white/50" />}
                    </div>
                    <div className={`flex flex-col ${isEmployee ? 'items-start' : 'items-end'} max-w-[80%]`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[13px] font-bold text-white">
                          {isEmployee ? 'Support Agent' : 'You'}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        isEmployee 
                          ? 'bg-neon-purple/10 text-white border border-neon-purple/20 rounded-tl-sm' 
                          : 'bg-white/[0.04] text-white border border-white/10 rounded-tr-sm'
                      }`}>
                        {c.message}
                        {renderAttachments(c.attachments)}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {ticket.status !== 'closed' && (
            <div className="space-y-4">
              {/* Selected Files Preview */}
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {files.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg text-[11px] text-neon-cyan"
                    >
                      <FileText className="w-3 h-3" />
                      {f.name}
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <form onSubmit={handleComment} className="relative">
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 pr-24 text-[14px] text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.04] transition-all resize-y min-h-[100px]"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <label className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-text-muted hover:text-neon-cyan hover:border-neon-cyan/30 cursor-pointer transition-all">
                    <Paperclip className="w-4 h-4" />
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                  <button 
                    type="submit"
                    disabled={submitting || (!comment.trim() && files.length === 0)}
                    className="w-10 h-10 rounded-lg btn-primary flex items-center justify-center p-0 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;

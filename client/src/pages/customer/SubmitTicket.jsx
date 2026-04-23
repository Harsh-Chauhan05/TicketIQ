import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketAPI } from '../../api/tickets';
import { MessageSquarePlus, AlertCircle, Loader2, Info, Paperclip, X, FileText } from 'lucide-react';

const SubmitTicket = () => {
  const [formData, setFormData] = useState({ title: '', description: '', userPriority: 'low' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('You can only upload up to 5 files per ticket.');
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('userPriority', formData.userPriority);
      files.forEach(file => data.append('attachments', file));

      const res = await ticketAPI.createTicket(data);
      navigate(`/customer/tickets/${res.data.data._id}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan border border-neon-cyan/20">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Submit a Ticket</h1>
          <p className="text-text-muted mt-1">Our AI Priority Engine will review your request and route it immediately.</p>
        </div>
      </div>

      <div className="glass-card p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-[14px]">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2 font-display">
              Subject
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.04] transition-all placeholder:text-text-muted/50"
              placeholder="Brief summary of your issue..."
            />
          </div>

          <div className="bg-neon-purple/5 border border-neon-purple/20 p-4 rounded-xl flex gap-3 text-[13px] text-text-secondary">
            <Info className="w-5 h-5 text-neon-purple flex-shrink-0" />
            <p>
              <strong className="text-white">Heads up:</strong> AI keywords (like "urgent") will automatically influence your ticket priority.
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2 font-display">
              Description
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.04] transition-all resize-y placeholder:text-text-muted/50"
              placeholder="Provide details about the issue..."
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2 font-display">
              Attachments (Max 5)
            </label>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg group"
                  >
                    <FileText className="w-4 h-4 text-neon-cyan" />
                    <span className="text-[12px] text-white truncate max-w-[150px]">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-500/20 rounded-md text-text-muted hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {files.length < 5 && (
                <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/10 hover:border-neon-cyan/50 transition-all text-[12px] font-bold text-text-muted hover:text-white">
                  <Paperclip className="w-4 h-4" />
                  Attach Files
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2 font-display">
                Requested Priority
              </label>
              <select
                value={formData.userPriority}
                onChange={(e) => setFormData({ ...formData, userPriority: e.target.value })}
                className="w-full bg-[#13151f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Not blocking</option>
                <option value="high">High - Blocking user</option>
                <option value="critical">Critical - System down</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-8 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SubmitTicket;

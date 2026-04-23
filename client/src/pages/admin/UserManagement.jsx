import { useState, useEffect } from 'react';
import { userAPI } from '../../api/users';
import { ShieldUser, ShieldAlert, BadgeCheck, Power, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getUsers({});
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await userAPI.updateUser(id, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user role");
    }
  };

  const toggleActive = async (id) => {
    try {
      await userAPI.toggleActive(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">Loading team directory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-2">Team & Access</h1>
          <p className="text-text-muted">Manage agents, customers, and system administrators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-t border-neon-purple/50">
          <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold mb-2">Admins</div>
          <div className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="glass-card p-6 border-t border-neon-cyan/50">
          <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold mb-2">Agents</div>
          <div className="text-3xl font-bold text-white">{users.filter(u => u.role === 'agent').length}</div>
        </div>
        <div className="glass-card p-6 border-t border-white/20">
          <div className="text-text-muted font-display uppercase tracking-widest text-[11px] font-bold mb-2">Customers</div>
          <div className="text-3xl font-bold text-white">{users.filter(u => u.role === 'customer').length}</div>
        </div>
      </div>

      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-display text-text-muted bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Access Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isSelf = u._id === currentUser._id;
                
                return (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-[14px] ${
                          isAdmin ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' : 
                          u.role === 'agent' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' :
                          'bg-white/10 text-white border border-white/20'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[14px] text-white flex items-center gap-2">
                            {u.name} {isSelf && <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-text-muted uppercase">You</span>}
                          </div>
                          <div className="text-[12px] text-text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                          isAdmin ? 'text-neon-purple' : u.role === 'agent' ? 'text-neon-cyan' : 'text-text-secondary'
                        } disabled:opacity-50`}
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="flex items-center gap-1.5 text-[12px] text-green-400 font-medium">
                          <BadgeCheck className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[12px] text-red-400 font-medium">
                          <ShieldAlert className="w-4 h-4" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isSelf && (
                        <button 
                          onClick={() => toggleActive(u._id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            u.isActive 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                              : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                          }`}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

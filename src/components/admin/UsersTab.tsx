'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Trash2, User, ShieldAlert } from 'lucide-react';

interface AuthUser {
  username: string;
  role: string;
  createdAt: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{username: string, role: string} | null>(null);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
          setCurrentUser(data.currentUser);
        } else {
          // Fallback if backend hasn't updated yet
          setUsers(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAdding(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Nepodařilo se přidat uživatele');
      }
    } catch (e) {
      setError('Chyba komunikace se serverem');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Opravdu chcete TRVALE smazat přístup uživatele ${username}?`)) return;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Nepodařilo se smazat uživatele');
      }
    } catch (e) {
      alert('Chyba komunikace se serverem');
    }
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    if (!confirm(`Opravdu chcete změnit roli uživatele ${username} na ${newRole}?`)) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Nepodařilo se změnit roli');
      }
    } catch (e) {
      alert('Chyba komunikace se serverem');
    }
  };

  const isSuperadmin = currentUser?.role === 'superadmin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Users className="text-[#D9005B]" /> Aktivní Administrátoři
          </h2>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.username} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-white/5 border border-white/10 rounded-xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-lg"><User size={20} /></div>
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {u.username}
                      {currentUser?.username === u.username && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-normal uppercase">Vy</span>}
                    </div>
                    <div className="text-xs text-[#888888]">Přidán: {new Date(u.createdAt).toLocaleDateString('cs-CZ')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Role Selector or Badge */}
                  {isSuperadmin && currentUser?.username !== u.username ? (
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.username, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase outline-none cursor-pointer border ${u.role === 'superadmin' ? 'bg-[#D9005B]/10 text-[#D9005B] border-[#D9005B]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}
                    >
                      <option value="admin" className="bg-[#020202] text-blue-400">ADMIN</option>
                      <option value="superadmin" className="bg-[#020202] text-[#D9005B]">SUPERADMIN</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${u.role === 'superadmin' ? 'bg-[#D9005B]/10 text-[#D9005B] border-[#D9005B]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                      {u.role}
                    </span>
                  )}

                  {/* Delete Button */}
                  {isSuperadmin && currentUser?.username !== u.username && (
                    <button 
                      onClick={() => handleDeleteUser(u.username)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                      title="Odebrat přístup"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isSuperadmin ? (
          <form onSubmit={handleAddUser} className="glass-panel p-6 relative overflow-hidden group border border-[#D9005B]/30">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <UserPlus className="text-[#D9005B]" /> Přidat uživatele
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Přihlašovací jméno</label>
                <input 
                  type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)}
                  autoComplete="off" data-lpignore="true" data-1p-ignore="true"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 outline-none transition-all placeholder:text-gray-600 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Bezpečnostní heslo</label>
                <input 
                  type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password" data-lpignore="true" data-1p-ignore="true"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 outline-none transition-all placeholder:text-gray-600 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Úroveň oprávnění</label>
                <select 
                  value={newRole} onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 outline-none transition-all text-white focus:border-[#D9005B]"
                >
                  <option value="admin">Administrátor</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              {error && <div className="text-red-400 text-sm mt-2 font-medium">{error}</div>}
              <button 
                type="submit" disabled={isAdding}
                className="w-full mt-4 bg-white text-black hover:bg-gray-200 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {isAdding ? 'Vytvářím...' : 'Vytvořit přístup'}
              </button>
            </div>
          </form>
        ) : (
          <div className="glass-panel p-6 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 py-12">
            <ShieldAlert size={48} className="text-[#888888] opacity-50" />
            <div>
              <h3 className="font-bold text-lg mb-1">Omezený přístup</h3>
              <p className="text-sm text-[#888888]">
                Pro přidávání nových uživatelů, mazání a změnu rolí potřebujete oprávnění úrovně Superadmin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

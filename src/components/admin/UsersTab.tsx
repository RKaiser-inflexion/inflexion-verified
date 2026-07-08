'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Trash2, User } from 'lucide-react';

interface AuthUser {
  username: string;
  role: string;
  createdAt: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Users className="text-[#D9005B]" /> Aktivní Administrátoři
          </h2>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.username} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-lg"><User size={20} /></div>
                  <div>
                    <div className="font-bold text-lg">{u.username}</div>
                    <div className="text-xs text-[#888888]">Přidán: {new Date(u.createdAt).toLocaleDateString('cs-CZ')}</div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'superadmin' ? 'bg-[#D9005B]/20 text-[#D9005B] border border-[#D9005B]/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleAddUser} className="glass-panel p-6 relative overflow-hidden group border border-[#D9005B]/30">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <UserPlus className="text-[#D9005B]" /> Přidat uživatele
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Přihlašovací jméno</label>
              <input 
                type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 outline-none transition-all placeholder:text-gray-600 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Bezpečnostní heslo</label>
              <input 
                type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
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
      </div>
    </div>
  );
}

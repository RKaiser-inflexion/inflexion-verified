'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, Server, Plus, AlertOctagon, CheckCircle2, RefreshCw, Mail, Lock, Key, User, Loader2, Trash2, Edit3, Shield, Users } from 'lucide-react';
import UsersTab from '@/components/admin/UsersTab';
import LogsTab from '@/components/admin/LogsTab';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import RegistrationForm from '@/components/admin/RegistrationForm';

interface Threat {
  id: string;
  domain: string;
  ip: string;
  timestamp: string;
  status: 'BLOCKED' | 'PENDING' | 'RESOLVED';
  source: 'BEAR_TRAP' | 'MANUAL_REPORT';
  description?: string;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
  domain: string;
}

export default function AdminDashboard() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'logs'>('dashboard');

  // --- DASHBOARD STATE ---
  const [threats, setThreats] = useState<Threat[]>([]);
  const [advisors, setAdvisors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Registration Form State
  const [editData, setEditData] = useState<{domain: string, name: string, id: string, isDemo: boolean} | null>(null);

  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Opravdu chcete odebrat doménu ${domain} z whitelistu?`)) return;
    try {
      await fetch('/api/advisors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditDomain = (domain: string, advisor: any) => {
    setEditData({
      domain,
      name: advisor.name,
      id: advisor.id,
      isDemo: advisor.isDemo || false
    });
    // Posunout okno na formulář
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThreatStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/threats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchData(); // Obnovit data
    } catch (e) {
      console.error('Chyba při změně statusu:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        setAuthError(true);
      }
    } catch (e) {
      setAuthError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [resThreats, resAdvisors] = await Promise.all([
        fetch('/api/threats'),
        fetch('/api/advisors')
      ]);
      
      if (resThreats.ok && resAdvisors.ok) {
        setIsAuthenticated(true);
        const dataThreats = await resThreats.json();
        const dataAdvisors = await resAdvisors.json();
        setThreats(dataThreats);
        setAdvisors(dataAdvisors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ověření při načtení stránky
    fetchData(true);
  }, []);

  useEffect(() => {
    // Cyklický refresh pouze pokud jsme přihlášeni
    if (isAuthenticated) {
      const interval = setInterval(() => fetchData(false), 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Odesílání formuláře je nyní v RegistrationForm.tsx
  const handleRegistrationSuccess = () => {
    setEditData(null);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BLOCKED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'RESOLVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ---------------------------------------------
  // LOGIN SCREEN
  // ---------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D9005B]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md w-full mx-auto relative z-10 p-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D9005B]/10 rounded-3xl border border-[#D9005B]/30 mb-6 shadow-[0_0_40px_rgba(217,0,91,0.2)]">
              <Lock className="text-[#D9005B]" size={40} />
            </div>
            <h1 className="text-3xl font-black mb-2">Inflexion SecOps</h1>
            <p className="text-[#888888]">Ověření totožnosti bezpečnostního analytika</p>
          </div>

          <form onSubmit={handleLogin} className="glass-panel p-8 space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Přihlašovací jméno</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-[#888888]" size={20} />
                </div>
                <input 
                  id="username"
                  name="username"
                  type="text" 
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Bezpečnostní heslo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="text-[#888888]" size={20} />
                </div>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white"
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                Přístup odepřen. Neplatné přihlašovací údaje.
              </div>
            )}

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-[#D9005B] to-pink-600 hover:from-pink-600 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(217,0,91,0.2)] hover:shadow-[0_15px_40px_rgba(217,0,91,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {isAuthenticating ? (
                <><Loader2 className="animate-spin" size={20} /> Ověřování identity...</>
              ) : (
                'Autentizovat'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // ADMIN DASHBOARD
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 relative overflow-hidden font-sans animate-in fade-in duration-1000">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D9005B]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#D9005B]/20 p-3 rounded-2xl border border-[#D9005B]/30">
              <Lock className="text-[#D9005B]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                Inflexion SecOps
                <span className="text-xs font-bold uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-md">Confidential</span>
              </h1>
              <p className="text-[#888888] text-sm mt-1">Globální bezpečnostní řídicí centrum pro síť 4fin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 flex items-center gap-3 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Firewall Active
            </div>
            <button onClick={() => fetchData(true)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <RefreshCw size={20} className={isLoading ? 'animate-spin text-[#888888]' : 'text-[#888888]'} />
            </button>
            <button 
              onClick={async () => {
                await fetch('/api/auth', { method: 'DELETE' });
                setIsAuthenticated(false);
              }} 
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold transition-colors"
            >
              Odhlásit
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-6 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`font-semibold pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-[#D9005B] text-white' : 'border-transparent text-[#888888] hover:text-white'}`}
          >
            <Shield size={18} /> Whitelist & Hrozby
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`font-semibold pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-[#D9005B] text-white' : 'border-transparent text-[#888888] hover:text-white'}`}
          >
            <Users size={18} /> Správa uživatelů
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`font-semibold pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-[#D9005B] text-white' : 'border-transparent text-[#888888] hover:text-white'}`}
          >
            <Activity size={18} /> Bezpečnostní Logy
          </button>
        </div>

        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Threat Feed */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Analytics Chart */}
            <AnalyticsChart />

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-6 flex flex-col justify-center">
                <div className="text-[#888888] text-sm font-medium mb-2 flex items-center gap-2"><ShieldAlert size={16}/> Hrozby celkem</div>
                <div className="text-4xl font-black">{threats.length}</div>
              </div>
              <div className="glass-panel p-6 flex flex-col justify-center">
                <div className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2"><AlertOctagon size={16}/> Bear Trap zachytil</div>
                <div className="text-4xl font-black text-white">{threats.filter(t => t.source === 'BEAR_TRAP').length}</div>
              </div>
              <div className="glass-panel p-6 flex flex-col justify-center">
                <div className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-2"><Server size={16}/> Chráněných domén</div>
                <div className="text-4xl font-black">{Object.keys(advisors).length}</div>
              </div>
            </div>

            {/* Threat Table */}
            <div className="glass-panel overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="text-[#D9005B]" /> Živý feed hrozeb (Bear Trap)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-xs uppercase tracking-widest text-[#888888]">
                      <th className="p-4 font-semibold">Čas (UTC)</th>
                      <th className="p-4 font-semibold">Typ hrozby</th>
                      <th className="p-4 font-semibold">Cílová Doména</th>
                      <th className="p-4 font-semibold">IP Adresa</th>
                      <th className="p-4 font-semibold text-right">Status DNS</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {threats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#888888]">Žádné zaznamenané hrozby.</td>
                      </tr>
                    )}
                    {threats.map(threat => (
                      <tr key={threat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-[#888888] font-mono text-xs">{new Date(threat.timestamp).toLocaleTimeString()}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${threat.source === 'BEAR_TRAP' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-400'}`}>
                            {threat.source}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{threat.domain}</td>
                        <td className="p-4 font-mono text-[#888888]">{threat.ip}</td>
                        <td className="p-4 text-right">
                          <select 
                            value={threat.status}
                            onChange={(e) => handleThreatStatusChange(threat.id, e.target.value)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer appearance-none ${getStatusColor(threat.status)}`}
                          >
                            <option value="PENDING" className="bg-[#020202] text-amber-500">PENDING</option>
                            <option value="BLOCKED" className="bg-[#020202] text-red-500">BLOCKED</option>
                            <option value="RESOLVED" className="bg-[#020202] text-emerald-500">RESOLVED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Whitelist Table */}
            <div className="glass-panel overflow-hidden flex flex-col mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Server className="text-emerald-400" /> Whitelist (Aktivní domény)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-xs uppercase tracking-widest text-[#888888]">
                      <th className="p-4 font-semibold">Doména</th>
                      <th className="p-4 font-semibold">Jméno poradce</th>
                      <th className="p-4 font-semibold">ID (4fin)</th>
                      <th className="p-4 font-semibold text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Object.keys(advisors).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[#888888]">Žádné domény ve whitelistu.</td>
                      </tr>
                    )}
                    {Object.entries(advisors).map(([domain, advisor]: any) => (
                      <tr key={domain} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-medium text-white">
                          {domain}
                          {advisor.isDemo && <span className="ml-2 text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded text-[#888888]">Ukázka</span>}
                        </td>
                        <td className="p-4 text-[#888888]">{advisor.name}</td>
                        <td className="p-4 font-mono text-xs text-[#888888]">{advisor.id}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditDomain(domain, advisor)}
                              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                              title="Upravit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteDomain(domain)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                              title="Smazat"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Email Notification Simulation */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold">E-mailové Alerty</h3>
                  <p className="text-xs text-blue-400/80">Aktivní bezpečnostní smyčka</p>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                {threats.slice(0,2).map(t => (
                  <div key={t.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-[#f0f0f0]">🚨 Kritický incident zachycen</div>
                      <div className="text-xs text-[#888888] mt-1 truncate">Bear Trap zablokoval IP {t.ip} na doméně {t.domain}</div>
                    </div>
                  </div>
                ))}
                {threats.length === 0 && (
                  <div className="text-sm text-[#888888] italic">Čekání na incidenty...</div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-[#888888] flex justify-between items-center relative z-10">
                <span>Napojeno na: security@inflexion.cz</span>
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12}/> Online</span>
              </div>
            </div>

            {/* Registration Form */}
            <RegistrationForm 
              onSuccess={handleRegistrationSuccess} 
              editData={editData} 
              onCancelEdit={() => setEditData(null)} 
            />

          </div>
        </div>
        )}
      </div>
    </div>
  );
}

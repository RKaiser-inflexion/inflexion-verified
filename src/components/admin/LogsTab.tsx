'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, CheckCircle2, ShieldBan, UserPlus } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'IP_BLOCKED' | 'USER_CREATED';
  ip: string;
  username?: string;
  details?: string;
}

export default function LogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        if (res.ok) setLogs(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    log.ip.includes(searchQuery) || 
    log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS': return <CheckCircle2 className="text-emerald-500" />;
      case 'LOGIN_FAILED': return <Activity className="text-orange-500" />;
      case 'IP_BLOCKED': return <ShieldBan className="text-red-500" />;
      case 'USER_CREATED': return <UserPlus className="text-blue-500" />;
      default: return <ShieldAlert className="text-gray-500" />;
    }
  };

  return (
    <div className="glass-panel p-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-[#D9005B]" /> Bezpečnostní Logy (Audit)
        </h2>
        <input 
          type="text" 
          placeholder="Hledat IP, účet nebo událost..." 
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#D9005B] w-full md:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[#888888] text-sm uppercase tracking-wider">
              <th className="pb-4 font-semibold px-4">Čas</th>
              <th className="pb-4 font-semibold px-4">Událost</th>
              <th className="pb-4 font-semibold px-4">Účet / Cíl</th>
              <th className="pb-4 font-semibold px-4">IP Adresa</th>
              <th className="pb-4 font-semibold px-4">Detaily</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedLogs.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-[#888888]">{searchQuery ? 'Zadanému hledání neodpovídá žádný záznam.' : 'Žádné záznamy v logu.'}</td></tr>
            ) : paginatedLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-sm text-[#888888]">
                  {new Date(log.timestamp).toLocaleString('cs-CZ')}
                </td>
                <td className="py-4 px-4 font-medium flex items-center gap-2">
                  {getLogIcon(log.type)}
                  <span className={log.type === 'IP_BLOCKED' ? 'text-red-400' : 'text-white'}>
                    {log.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm font-bold">{log.username || '-'}</td>
                <td className="py-4 px-4 text-sm font-mono text-[#888888]">{log.ip}</td>
                <td className="py-4 px-4 text-sm text-[#888888]">{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#888888]">
        <div>Zobrazeno {paginatedLogs.length} z {filteredLogs.length} logů</div>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1.5 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors"
          >Předchozí</button>
          <span className="px-3 py-1.5 font-medium">Stránka {currentPage} z {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1.5 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors"
          >Další</button>
        </div>
      </div>
    </div>
  );
}

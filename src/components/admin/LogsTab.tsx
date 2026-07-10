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
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Activity className="text-[#D9005B]" /> Bezpečnostní Logy (Audit)
      </h2>
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
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-[#888888]">Žádné záznamy v logu.</td></tr>
            ) : logs.map(log => (
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
    </div>
  );
}

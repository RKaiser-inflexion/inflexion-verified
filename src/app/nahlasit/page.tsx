'use client';

import React, { useState } from 'react';
import { ShieldAlert, Send, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';

export default function ReportPage() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setStatus('LOADING');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description })
      });

      if (res.ok) {
        setStatus('SUCCESS');
        setUrl('');
        setDescription('');
      } else {
        setStatus('ERROR');
      }
    } catch {
      setStatus('ERROR');
    }
  };

  return (
    <main className="w-full flex-grow py-20 px-6 font-sans relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-3xl border border-red-500/30 mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <AlertOctagon className="text-red-500" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
            Nahlásit podvod
          </h1>
          <p className="text-[#888888] text-lg max-w-2xl mx-auto leading-relaxed">
            Narazili jste na webovou stránku, která se vydává za poradce 4fin, ale nemá zelený odznak Inflexion Verified? Pomozte nám chránit ostatní a nahlaste ji.
          </p>
        </div>

        {status === 'SUCCESS' ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Hlášení přijato</h2>
            <p className="text-[#888888] max-w-md">
              Děkujeme. Doménu jsme předali naší bezpečnostní AI a analytikům k prozkoumání. Pokud se podvod potvrdí, okamžitě zablokujeme DNS.
            </p>
            <button 
              onClick={() => setStatus('IDLE')}
              className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
            >
              Nahlásit další web
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert size={120} />
            </div>

            <div className="relative z-10">
              <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                URL adresa podvodného webu *
              </label>
              <input 
                type="text" 
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="např. www.falesny-poradce.cz" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all"
                disabled={status === 'LOADING'}
              />
            </div>

            <div className="relative z-10">
              <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                Doplňující informace (volitelné)
              </label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jak jste na stránku narazili? Nabízel vám někdo investice přes WhatsApp?" 
                rows={4}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all resize-none"
                disabled={status === 'LOADING'}
              ></textarea>
            </div>

            {status === 'ERROR' && (
              <div className="text-red-400 text-sm font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                Při odesílání hlášení došlo k chybě. Zkuste to prosím znovu.
              </div>
            )}

            <div className="relative z-10 pt-4">
              <button 
                type="submit" 
                disabled={status === 'LOADING'}
                className="w-full md:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'LOADING' ? (
                  <><Loader2 className="animate-spin" size={20} /> Odesílám analýze...</>
                ) : (
                  <><Send size={20} /> Odeslat bezpečnostnímu týmu</>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </main>
  );
}

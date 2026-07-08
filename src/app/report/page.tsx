'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Loader2, Link2, FileText, Send } from 'lucide-react';

export default function ReportPage() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description })
      });

      if (response.ok) {
        setStatus('success');
        setUrl('');
        setDescription('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="w-full flex-grow py-20 px-6">
      <div className="max-w-2xl mx-auto relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D9005B]/10 text-[#D9005B] px-5 py-2 rounded-full text-sm font-bold tracking-wider uppercase border border-[#D9005B]/20 mb-6 shadow-[0_0_20px_rgba(217,0,91,0.15)]">
            <AlertTriangle size={18} />
            Bezpečnostní centrum
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Nahlásit podvod
          </h1>
          <p className="text-xl text-[#888888]">
            Našli jste web, který se vydává za poradce 4fin, ale nemá platný štítek Inflexion Verified? Pomozte nám chránit ostatní.
          </p>
        </div>

        {status === 'success' ? (
          <div className="glass-panel text-center py-16 animate-in zoom-in duration-500">
            <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/50">
              <ShieldCheck className="text-emerald-500" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>
              Úspěšně nahlášeno
            </h3>
            <p className="text-[#888888] mb-8 max-w-md mx-auto">
              Děkujeme. Vaše hlášení bylo předáno našemu AI bezpečnostnímu týmu k okamžité analýze.
              Pokud se prokáže, že se jedná o phishing, doménu zablokujeme.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-colors border border-white/10"
            >
              Nahlásit další web
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                Podezřelá URL adresa <span className="text-[#D9005B]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="text-[#888888]" size={20} />
                </div>
                <input
                  type="url"
                  required
                  placeholder="např. https://falesny-web-4fin.cz"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                Další informace (volitelné)
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 flex items-center pointer-events-none">
                  <FileText className="text-[#888888]" size={20} />
                </div>
                <textarea
                  rows={4}
                  placeholder="Kde jste na tento odkaz narazili? (e-mail, SMS, sociální sítě...)"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] text-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                <AlertTriangle size={20} />
                <span>Nastala neočekávaná chyba při odesílání hlášení. Zkuste to prosím znovu.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !url}
              className="w-full bg-gradient-to-r from-[#D9005B] to-pink-600 hover:from-pink-600 hover:to-pink-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(217,0,91,0.2)] hover:shadow-[0_15px_40px_rgba(217,0,91,0.4)]"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Odesílám k analýze...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Odeslat do Security centra
                </>
              )}
            </button>
            <p className="text-center text-xs text-[#888888] mt-4">
              Všechna hlášení jsou anonymní a podléhají striktním pravidlům Inflexion Verified Privacy Policy.
            </p>
          </form>
        )}

      </div>
    </main>
  );
}

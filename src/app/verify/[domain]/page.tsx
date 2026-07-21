import React from 'react';
import { getAdvisors } from '@/lib/db';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function VerifyPage({ params }: { params: { domain: string } }) {
  const cleanDomain = decodeURIComponent(params.domain).replace(/^www\./, '').split(':')[0];
  const advisors = await getAdvisors();
  const advisor = advisors[cleanDomain as keyof typeof advisors];

  if (!advisor) {
    return (
      <main className="flex flex-col items-center justify-center py-20 px-8 text-center w-full min-h-[70vh]">
        <AlertTriangle size={80} className="text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4 text-red-400">VAROVÁNÍ: Falešný web</h1>
        <p className="text-xl mb-8 max-w-2xl text-red-200">
          Doména <strong>{cleanDomain}</strong> NENÍ na seznamu oficiálních webů 4fin. 
          Pravděpodobně se jedná o pokus o podvod (phishing).
        </p>
        <div className="bg-black/40 p-6 rounded-xl border border-red-500/30 max-w-lg text-left">
          <p className="text-sm text-red-300">
            Naše systémy tento incident (tzv. &quot;Past na medvěda&quot;) právě zaznamenaly a nahlásily tuto doménu do bezpečnostních databází k zablokování. 
            Nikdy na této doméně nezadávejte své osobní údaje.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 md:px-12 w-full min-h-[70vh] relative z-10">

      <div className="mb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#D9005B]/10 text-[#D9005B] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase border border-[#D9005B]/20 mb-4 shadow-[0_0_15px_rgba(217,0,91,0.2)]">
          <ShieldCheck size={18} />
          Inflexion Verified Registry
        </div>
        <h1 className="text-3xl md:text-4xl text-[#f0f0f0] font-bold">Oficiální digitální průkaz</h1>
      </div>

      <div className="w-full max-w-xl glass-panel relative z-10 !p-8 md:!p-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D9005B] to-pink-500"></div>
        
        <div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#D9005B]/30 shrink-0">
              <img src={advisor.photoUrl} alt={advisor.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h2 className="text-3xl font-bold text-white m-0 leading-tight" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>{advisor.name}</h2>
                <ShieldCheck className="text-[#D9005B]" size={24} />
              </div>
              {advisor.isDemo && (
                <div className="inline-block bg-white/10 text-[#888888] text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded mb-4">
                  Demo ukázka
                </div>
              )}
              <p className="text-[#D9005B] font-medium text-lg mb-4">{advisor.role}</p>
              <div className="space-y-2 text-[#888888]">
                <p><strong className="text-[#f0f0f0]">IČO:</strong> {advisor.id}</p>
                <p><strong className="text-[#f0f0f0]">Telefon:</strong> {advisor.phone}</p>
                <p><strong className="text-[#f0f0f0]">E-mail:</strong> {advisor.email}</p>
                <p><strong className="text-[#f0f0f0]">Ověřený web:</strong> <a href={`https://${cleanDomain}`} className="text-[#D9005B] hover:underline hover:text-pink-400 transition-colors">{cleanDomain}</a></p>
              </div>
            </div>
          </div>

          <div className="bg-[#D9005B]/10 rounded-2xl p-6 border border-[#D9005B]/20 flex flex-col sm:flex-row items-center gap-4 text-white mb-8">
            <div className="bg-[#D9005B]/20 p-3 rounded-full shrink-0 border border-[#D9005B]/30">
              <ShieldCheck className="text-[#D9005B]" size={32} />
            </div>
            <div className="text-center sm:text-left text-sm leading-relaxed">
              Tento profil je kryptograficky svázán s doménou <strong>{cleanDomain}</strong>. Značka 4fin garantuje, že jednáte s oficiálním zástupcem.
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-white/10 w-full sm:w-auto hover:border-[#D9005B]/50 hover:shadow-[0_0_20px_rgba(217,0,91,0.2)]">
              Prozkoumat národní registr poradců 4fin
            </Link>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-[#888888] text-sm relative z-10">Powered by Inflexion Verified &copy; {new Date().getFullYear()}</p>
    </main>
  );
}

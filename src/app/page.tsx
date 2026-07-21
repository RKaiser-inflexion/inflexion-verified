import React from 'react';
import { getAdvisors, getThreats } from '@/lib/db';
import { ShieldCheck, Database, Users, AlertOctagon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export const revalidate = 60; // ISR cache - revalidates every 60 seconds

export default async function Home() {
  const advisorsData = await getAdvisors();
  const threatsData = await getThreats();
  
  const allAdvisorsList = Object.entries(advisorsData).filter(([domain]) => domain !== 'localhost' && domain !== '127.0.0.1');
  
  // Real stats calculation (ignoring demo)
  const realAdvisors = allAdvisorsList.filter(([_, adv]) => !adv.isDemo);
  const totalDomains = realAdvisors.length;
  const uniqueAdvisorsCount = new Set(realAdvisors.map(([_, adv]) => adv.id)).size;

  return (
    <main className="w-full">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D9005B]/10 text-[#D9005B] px-5 py-2 rounded-full text-sm font-bold tracking-wider uppercase border border-[#D9005B]/20 mb-8 shadow-[0_0_20px_rgba(217,0,91,0.15)]">
            Oficiální národní registr
          </div>
          <h1 className="text-white mb-6">
            Centrální <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9005B] to-pink-500">Databáze</span> Poradců
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-12 text-[#888888]">
            Kryptograficky zabezpečený registr garantující pravost osobních webů a identit vázaných zástupců sítě 4fin.
          </p>

          {/* Search Bar */}
          <SearchBar advisors={allAdvisorsList.map(([domain, adv]) => ({ domain, name: adv.name, id: adv.id }))} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 glass-panel !rounded-none !border-x-0 !p-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="text-center md:text-left px-4">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-[#D9005B]">
                <Database size={20} />
                <span className="font-semibold uppercase tracking-wider text-sm">Registrovaných webů</span>
              </div>
              <div className="text-4xl font-black text-white" style={{fontFamily: "'Playfair Display', serif"}}>{totalDomains}</div>
            </div>
            <div className="text-center md:text-left px-4 pt-8 md:pt-0">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-white">
                <Users size={20} />
                <span className="font-semibold uppercase tracking-wider text-sm">Ověřených poradců</span>
              </div>
              <div className="text-4xl font-black text-white" style={{fontFamily: "'Playfair Display', serif"}}>{uniqueAdvisorsCount}</div>
            </div>
            <div className="text-center md:text-left px-4 pt-8 md:pt-0">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-red-400">
                <AlertOctagon size={20} />
                <span className="font-semibold uppercase tracking-wider text-sm">Blokováno hrozeb</span>
              </div>
              <div className="text-4xl font-black text-white" style={{fontFamily: "'Playfair Display', serif"}}>{threatsData.length}</div>
              <div className="text-xs text-[#888888] mt-1">za posledních 30 dní</div>
            </div>

          </div>
        </div>
      </section>

      {/* Directory Listing */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-white mb-2">Nedávno ověřené profily</h2>
            <p className="text-[#888888]">Live výpis z chráněné sítě Inflexion Verified</p>
          </div>
          <button className="text-[#D9005B] hover:text-[#b0004a] font-medium flex items-center gap-1 transition-colors">
            Zobrazit všechny <ChevronRight size={18} />
          </button>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAdvisorsList.map(([domain, advisor]) => (
            <Link href={`/verify/${domain}`} key={domain} className="block">
              <div className="glass-card p-6 h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9005B]/5 blur-[50px] group-hover:bg-[#D9005B]/15 transition-colors"></div>
                
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#D9005B]/50 transition-colors">
                    <img src={advisor.photoUrl} alt={advisor.name} className="w-full h-full object-cover" />
                  </div>
                    <div>
                      <h3 className="text-white font-bold text-xl leading-tight" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>{advisor.name}</h3>
                      <p className="text-[#D9005B] text-sm font-medium mt-1">
                        {advisor.id}
                        {advisor.isDemo && <span className="ml-2 text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded text-[#888888]">Demo ukázka</span>}
                      </p>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-[#888888] relative z-10 pt-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <span>Doména:</span>
                    <span className="text-white">{domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-[#D9005B] flex items-center gap-1"><ShieldCheck size={14} /> Ověřeno</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}

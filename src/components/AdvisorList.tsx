'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface Advisor {
  domain: string;
  name: string;
  id: string;
  photoUrl: string;
  isDemo?: boolean;
}

export default function AdvisorList({ advisors }: { advisors: Advisor[] }) {
  const INITIAL_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  
  // Řadíme tak, aby nejnovější nebo ne-demo byli vidět, 
  // případně zachováme pořadí z props.
  const visibleAdvisors = advisors.slice(0, visibleCount);
  const hasMore = visibleCount < advisors.length;
  const isExpanded = visibleCount > INITIAL_COUNT;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, advisors.length));
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_COUNT);
    // Skok zpět na začátek sekce
    document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="directory-section" className="py-24 max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-white mb-2">Nedávno ověřené profily</h2>
          <p className="text-[#888888]">Live výpis z chráněné sítě Inflexion Verified</p>
        </div>
        <div className="text-[#888888] text-sm">
          Zobrazeno {visibleAdvisors.length} z {advisors.length} profilů
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleAdvisors.map((advisor) => (
          <Link href={`/verify/${advisor.domain}`} key={advisor.domain} className="block">
            <div className="glass-card p-6 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9005B]/5 blur-[50px] group-hover:bg-[#D9005B]/15 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#D9005B]/50 transition-colors shrink-0">
                  <img src={advisor.photoUrl} alt={advisor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl leading-tight" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>{advisor.name}</h3>
                  <p className="text-[#D9005B] text-sm font-medium mt-1 flex flex-wrap items-center gap-2">
                    {advisor.id}
                    {advisor.isDemo && <span className="text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded text-[#888888]">Demo ukázka</span>}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-[#888888] relative z-10 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Doména:</span>
                  <span className="text-white truncate ml-2">{advisor.domain}</span>
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

      {(hasMore || isExpanded) && (
        <div className="mt-12 flex justify-center gap-4">
          {hasMore && (
            <button 
              onClick={handleShowMore}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Načíst další profily <ChevronDown size={18} />
            </button>
          )}
          {isExpanded && (
            <button 
              onClick={handleShowLess}
              className="bg-transparent hover:bg-white/5 text-[#888888] hover:text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Skrýt <ChevronUp size={18} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

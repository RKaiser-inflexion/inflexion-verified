import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-white/10 glass-panel !rounded-none !p-0 !border-x-0 !border-t-0 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-[#D9005B]/20 p-2.5 rounded-xl border border-[#D9005B]/30 group-hover:bg-[#D9005B]/30 transition-colors">
            <ShieldCheck className="text-[#D9005B]" size={26} />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight leading-none group-hover:text-[#D9005B] transition-colors">Inflexion Verified</div>
            <div className="text-[#D9005B]/80 text-xs font-semibold tracking-widest uppercase mt-1">Securing 4fin Network</div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white hover:text-[#D9005B] transition-colors">Databáze</Link>
          <Link href="/technologie" className="text-white hover:text-[#D9005B] transition-colors">Technologie</Link>
          <Link href="/report" className="text-white hover:text-[#D9005B] transition-colors">Nahlásit podvod</Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2 text-[#D9005B]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9005B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D9005B]"></span>
            </span>
            Systém je aktivní
          </div>
        </div>
      </div>
    </header>
  );
}

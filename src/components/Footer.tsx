import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 glass-panel !rounded-none !border-x-0 !border-b-0 py-12 mt-12 relative z-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-50">
          <ShieldCheck size={20} />
          <span className="font-bold tracking-widest uppercase text-sm text-white">Inflexion Verified</span>
        </div>
        <div className="text-sm text-[#888888]">
          © {new Date().getFullYear()} Inflexion & 4fin. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}

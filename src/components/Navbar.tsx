'use client';

import React, { useState } from 'react';
import { ShieldCheck, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  // Získáme admin session z cookies? Client component nemůže použít next/headers cookies().
  // Ale jelikož jen skrýváme tlačítko, můžeme použít JS document.cookie pokud to není HttpOnly,
  // nebo to uděláme jednodušeji. Původně tu bylo hasAdminSession.
  // Místo toho můžeme zjistit podle cookies klienta:
  const [isOpen, setIsOpen] = useState(false);
  
  // Zjistíme admin z cookies (pokud je dostupná)
  const [isAdmin, setIsAdmin] = useState(false);
  React.useEffect(() => {
    if (document.cookie.includes('inflexion_secops_session')) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <header className="border-b border-white/10 glass-panel !rounded-none !p-0 !border-x-0 !border-t-0 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-auto min-h-[80px] flex flex-wrap items-center justify-between py-4 md:py-0">
        
        {/* Mobile menu button (Left) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo (Centered on mobile, Left on desktop) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group mx-auto md:mx-0">
          <div className="bg-[#D9005B]/20 p-2 sm:p-2.5 rounded-xl border border-[#D9005B]/30 group-hover:bg-[#D9005B]/30 transition-colors hidden sm:block">
            <ShieldCheck className="text-[#D9005B]" size={24} />
          </div>
          <div className="text-center md:text-left">
            <div className="text-white font-bold text-lg sm:text-xl tracking-tight leading-none group-hover:text-[#D9005B] transition-colors flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="text-[#D9005B] sm:hidden" size={20} />
              Inflexion Verified
            </div>
            <div className="text-[#D9005B]/80 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Securing 4fin Network</div>
          </div>
        </Link>

        {/* Placeholder pro zachování flex layoutu na mobilu */}
        <div className="w-10 md:hidden"></div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {isAdmin && (
            <Link href="/admin" className="text-[#D9005B] hover:text-pink-500 transition-colors flex items-center gap-2 bg-[#D9005B]/10 px-4 py-2 rounded-lg border border-[#D9005B]/20">
              <Settings size={16} /> Administrace
            </Link>
          )}
          <Link href="/" className="text-white hover:text-[#D9005B] transition-colors">Databáze</Link>
          <Link href="/technologie" className="text-white hover:text-[#D9005B] transition-colors">Technologie</Link>
          <Link href="/report" className="text-white hover:text-[#D9005B] transition-colors">Nahlásit podvod</Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2 text-[#D9005B]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9005B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D9005B]"></span>
            </span>
            Aktivní
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#020202]/95 backdrop-blur-xl absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-4 shadow-2xl">
          {isAdmin && (
            <Link onClick={() => setIsOpen(false)} href="/admin" className="text-[#D9005B] flex items-center gap-2 py-2 font-medium">
              <Settings size={18} /> Administrace
            </Link>
          )}
          <Link onClick={() => setIsOpen(false)} href="/" className="text-white py-2 font-medium">Databáze poradců</Link>
          <Link onClick={() => setIsOpen(false)} href="/technologie" className="text-white py-2 font-medium">Použité technologie</Link>
          <Link onClick={() => setIsOpen(false)} href="/report" className="text-white py-2 font-medium">Nahlásit podvod</Link>
          <div className="h-px w-full bg-white/10 my-2"></div>
          <div className="flex items-center gap-2 text-[#D9005B] font-medium py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9005B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D9005B]"></span>
            </span>
            Ochranný systém je aktivní
          </div>
        </div>
      )}
    </header>
  );
}

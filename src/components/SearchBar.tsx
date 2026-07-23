'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AdvisorInfo {
  domain: string;
  name: string;
  id: string;
}

export default function SearchBar({ advisors }: { advisors: AdvisorInfo[] }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const filteredAdvisors = advisors.filter(a => 
    a.domain.toLowerCase().includes(query.toLowerCase()) || 
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Omezíme na prvních 5 výsledků

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Pokud je zadán přesný match nebo chceme vzít první výsledek
    const match = filteredAdvisors.length > 0 ? filteredAdvisors[0] : null;
    if (match) {
        router.push(`/verify/${match.domain}`);
    } else {
        let cleanQuery = query.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        router.push(`/verify/${cleanQuery}`);
    }
  };

  return (
    <div className="relative group w-full max-w-2xl mx-auto z-50">
      <div className="absolute inset-0 bg-[#D9005B] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      <form onSubmit={handleSearch} className="relative glass-panel !p-2 sm:!pl-6 !rounded-2xl flex flex-col sm:flex-row items-center shadow-2xl gap-2 sm:gap-0">
        <div className="flex items-center w-full sm:w-auto flex-1 px-2 sm:px-0">
          <Search className="text-gray-500 mr-3 shrink-0" size={20} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Hledat poradce nebo webovou doménu..." 
            className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500 text-sm sm:text-lg py-2 w-full"
          />
        </div>
        <button type="submit" className="w-full sm:w-auto bg-[#D9005B] hover:bg-[#b0004a] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shrink-0 text-sm sm:text-base">
          Ověřit
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && query && filteredAdvisors.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 glass-panel !p-2 !rounded-xl overflow-hidden shadow-2xl">
          {filteredAdvisors.map(adv => (
            <div 
              key={adv.domain}
              className="px-4 py-3 hover:bg-white/10 cursor-pointer rounded-lg flex justify-between items-center transition-colors text-left"
              onMouseDown={() => router.push(`/verify/${adv.domain}`)}
            >
              <div>
                <div className="text-white font-medium">{adv.name}</div>
                <div className="text-xs text-[#888888]">{adv.id}</div>
              </div>
              <div className="text-[#D9005B] text-sm hidden sm:block">{adv.domain}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

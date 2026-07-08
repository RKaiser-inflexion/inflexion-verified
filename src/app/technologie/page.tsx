import React from 'react';
import { Cpu, Key, EyeOff, ShieldBan, Lock } from 'lucide-react';

export default function TechnologiePage() {
  return (
    <main className="w-full flex-grow py-20 px-6">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#D9005B]/10 text-[#D9005B] px-5 py-2 rounded-full text-sm font-bold tracking-wider uppercase border border-[#D9005B]/20 mb-6 shadow-[0_0_20px_rgba(217,0,91,0.15)]">
            <Cpu size={18} />
            Architektura systému
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Technologie <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9005B] to-pink-500">Inflexion Verified</span>
          </h1>
          <p className="text-xl text-[#888888] max-w-2xl mx-auto">
            Jak zabezpečujeme národní síť 4fin před phishingem a zneužitím identity.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Feature 1 */}
          <div className="glass-panel p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D9005B]/10 blur-[60px] group-hover:bg-[#D9005B]/20 transition-all duration-700"></div>
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="bg-[#D9005B]/10 p-5 rounded-2xl border border-[#D9005B]/30 shrink-0">
                <Key className="text-[#D9005B]" size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>Real-time ověření identity</h3>
                <p className="text-[#888888] leading-relaxed text-lg">
                  Identitu poradce ověřujeme nepřetržitě na pozadí pomocí našich bezpečnostních serverů. Jakmile navštívíte osobní web, proběhne neviditelný kryptografický test pravosti. Pokud byste narazili na podvodnou kopii stránky, Inflexion štítek vás okamžitě varuje.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 blur-[60px] group-hover:bg-pink-500/20 transition-all duration-700"></div>
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="bg-pink-500/10 p-5 rounded-2xl border border-pink-500/30 shrink-0">
                <EyeOff className="text-pink-500" size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>Dynamická ochrana známky (Anti-Spoofing)</h3>
                <p className="text-[#888888] leading-relaxed text-lg">
                  Běžné certifikáty na internetu lze jednoduše zkopírovat jako obrázek. Náš štítek je proto neustále živý – neustále pulzuje a zobrazuje aktuální přesný čas s přesností na vteřiny. Máte tak absolutní jistotu, že se díváte na skutečné a aktivní ověření.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-500/10 blur-[60px] group-hover:bg-red-500/20 transition-all duration-700"></div>
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/30 shrink-0">
                <ShieldBan className="text-red-500" size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: "'Geist Variable', 'Inter', sans-serif"}}>Aktivní monitoring hrozeb</h3>
                <p className="text-[#888888] leading-relaxed text-lg">
                  Nespoléháme se pouze na pasivní obranu. Pokud se útočník pokusí zcizit náš ověřovací kód na svůj falešný web, systém tuto anomálii detekuje, zobrazí klientům varování a incident skrytě nahlásí SecOps centrále k okamžitému zablokování útočníka.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

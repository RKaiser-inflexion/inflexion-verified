import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
          Zásady ochrany soukromí
        </h1>
        
        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Jaká data shromažďujeme</h2>
            <p>
              V rámci systému <strong>Inflexion Trust API</strong> zpracováváme osobní údaje pouze v nezbytném rozsahu:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-400">
              <li>Při nahlášení podvodného webu zaznamenáváme vaši IP adresu pro účely zabezpečení (ochrana proti DDoS a spamu).</li>
              <li>U ověřených poradců uchováváme kontaktní údaje (jméno, e-mail, telefon) za účelem poskytování API služby.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Jak dlouho data uchováváme (Data Retention)</h2>
            <p>
              Zavedli jsme striktní procesy pro ochranu vašeho soukromí (tzv. Privacy by Design):
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-400">
              <li>IP adresy a popisné informace u neprokázaných hrozeb jsou <strong>automaticky anonymizovány po 30 dnech</strong>.</li>
              <li>Ověření poradci mohou kdykoliv požádat o okamžité smazání svých údajů z registru.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Jak data chráníme</h2>
            <p>
              Naše infrastruktura je chráněna pomocí moderních Enterprise Security standardů, včetně:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-400">
              <li>Komunikace běží výhradně přes šifrované HTTPS/TLS protokoly.</li>
              <li>Striktní sanitizace vstupů proti injekčním útokům (XSS, NoSQL injection).</li>
              <li>Přihlašování administrátorů je kryptograficky chráněno přes JSON Web Tokens (JWT).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Kontakt</h2>
            <p>
              Pokud máte dotazy ohledně zpracování vašich osobních údajů, kontaktujte nás na <a href="mailto:privacy@inflexion.cz" className="text-blue-400 hover:text-blue-300">privacy@inflexion.cz</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

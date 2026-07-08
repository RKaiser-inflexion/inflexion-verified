# Inflexion Trust API & SecOps Admin

Enterprise-grade API a administrátorský panel pro ověřování identit finančních poradců a evidenci bezpečnostních hrozeb (Phishing, Scam). Aplikace slouží jako backendová páteř pro bezpečné rozšíření do prohlížeče (Chrome Extension).

## 🚀 Hlavní funkce

- **Ověřování domén (`/api/verify`):** Rychlý endpoint pro ověření, zda webová stránka patří certifikovanému poradci.
- **Reporting hrozeb (`/api/report`):** Veřejný endpoint pro nahlašování podvodných domén s automatickým notifikačním systémem.
- **SecOps Admin Panel (`/admin`):** Zabezpečené rozhraní pro správu nahlášených hrozeb a auditní logy.
- **Honeypot Systém:** Automatická detekce a klamání útočníků při pokusu o zneužití API.
- **Automatická údržba:** Cron joby pro odstraňování nepotvrzených hrozeb a starých PII údajů (GDPR compliance).

## 🔒 Bezpečnostní a Enterprise Vrstvy (Agentic Engineering)

Aplikace byla navržena s důrazem na absolutní bezpečnost a "Fail-Fast" architekturu:
- **Zod Validace:** Striktní typová kontrola na všech veřejných i privátních endpointech (žádný neočekávaný vstup se nedostane do systému).
- **Rate Limiting:** Globální i specifické omezování požadavků proti DDoS a Brute-force útokům (postavené pro Redis).
- **JWT Autentizace:** Přísné zabezpečení administrátorské zóny pomocí JSON Web Tokenů a HttpOnly cookies.
- **Bezpečnostní hlavičky (Security Headers):** HSTS, prevence clickjackingu a MIME-sniffingu (`helmet` ekvivalent pro Next.js).
- **Fail-Fast Secrets:** Pokud v produkci chybí důležité klíče, aplikace agresivně spadne, aby předešla běhu v nezabezpečeném stavu s fallback hesly.
- **Redis Caching & Sentry:** (Připraveno) Infrastruktura navržená pro cachování odpovědí a okamžitý error tracking.

## 🛠️ Technologie

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Jazyk:** TypeScript
- **Stylování:** Tailwind CSS
- **Testování:** Vitest (Unit testy) & Playwright (E2E testy)
- **E-maily:** Resend API

## 🚦 Spuštění pro vývoj (Local Development)

1. **Instalace závislostí:**
   ```bash
   npm install
   ```

2. **Proměnné prostředí:**
   Zkopírujte `.env.example` do `.env.local` a vyplňte potřebné klíče.
   ```bash
   cp .env.example .env.local
   ```
   *Poznámka: Bez platného `JWT_SECRET` a `RESEND_API_KEY` aplikace v produkčním režimu nenastartuje!*

3. **Spuštění serveru:**
   ```bash
   npm run dev
   ```
   Aplikace poběží na `http://localhost:3000`.

## 🧪 Testování

- **Unit testy:** `npm run test`
- **E2E testy (Playwright):** `npm run test:e2e`

## 📦 Nasazení (Deployment)

Aplikace je plně připravena pro nasazení na [Vercel](https://vercel.com).
Po nasazení je nutné v administraci Vercelu nakonfigurovat produkční Environment Variables.

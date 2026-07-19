(function() {
  // Dynamicky získáme doménu, odkud byl tento skript načten (např. vercel.app nebo inflexion.cz)
  const currentScript = document.currentScript;
  const BASE_URL = currentScript ? new URL(currentScript.src).origin : 'https://inflexion-verified.vercel.app';

  // Config
  const API_URL = `${BASE_URL}/api/verify`;
  const TRUST_PORTAL_URL = `${BASE_URL}/verify`;
  const BEAR_TRAP_URL = `${BASE_URL}/api/bear-trap`;
  
  const wrapper = document.createElement('div');
  wrapper.id = 'inflexion-trust-badge';
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '24px';
  wrapper.style.right = '24px';
  wrapper.style.zIndex = '999999';
  document.body.appendChild(wrapper);

  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

    .ifx-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px 12px 16px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: 1px solid rgba(255, 255, 255, 0.25);
      color: white;
      text-decoration: none;
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      font-family: 'Outfit', system-ui, sans-serif;
    }
    
    /* Premium Shimmer Effect */
    .ifx-badge::before {
      content: '';
      position: absolute;
      top: 0; 
      left: -150%; 
      width: 150%; 
      height: 100%;
      background: linear-gradient(
        90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.03) 30%, 
        rgba(255, 255, 255, 0.25) 50%, 
        rgba(255, 255, 255, 0.03) 70%, 
        transparent 100%
      );
      transform: skewX(-25deg);
      animation: ifx-premium-sweep 5s infinite cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
    
    @keyframes ifx-premium-sweep {
      0% { left: -150%; }
      20% { left: 150%; }
      100% { left: 150%; }
    }

    .ifx-badge:hover {
      transform: translateY(-6px) scale(1.03);
      background: linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(5, 10, 30, 1) 100%);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.2);
    }
    
    .ifx-icon-wrapper {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      flex-shrink: 0;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.3);
      z-index: 2;
    }
    
    /* Glowing pulse behind the icon */
    .ifx-icon-wrapper::after {
      content: '';
      position: absolute;
      top: -4px; left: -4px; right: -4px; bottom: -4px;
      border-radius: 50%;
      background: #10B981;
      opacity: 0.3;
      filter: blur(8px);
      animation: ifx-pulse 2s infinite ease-in-out;
      z-index: -1;
    }
    
    @keyframes ifx-pulse {
      0% { transform: scale(0.9); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.2; }
      100% { transform: scale(0.9); opacity: 0.5; }
    }

    .ifx-icon-wrapper.scam {
      background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255,255,255,0.3);
    }
    .ifx-icon-wrapper.scam::after {
      background: #EF4444;
      animation: ifx-pulse-scam 1s infinite ease-in-out;
    }
    @keyframes ifx-pulse-scam {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 0.1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }
    
    .ifx-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 2;
    }
    
    .ifx-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.2px;
      margin: 0 0 3px 0;
      line-height: 1.1;
      background: linear-gradient(to right, #ffffff, #a7f3d0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .ifx-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: #94a3b8;
      margin: 0;
      font-weight: 500;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    /* Small live indicator dot */
    .ifx-live-dot {
      width: 6px;
      height: 6px;
      background-color: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
      animation: ifx-blink 1s infinite;
    }
    @keyframes ifx-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);

  // Fetch verification
  const currentDomain = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  
  fetch(`${API_URL}?domain=${encodeURIComponent(currentDomain)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'verified') {
        renderVerifiedBadge(data.advisor);
      } else {
        renderScamBadge();
        // TRIGGER BEAR TRAP (Silent background report)
        fetch(BEAR_TRAP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: currentDomain }),
          // keepalive ensures the request finishes even if the user closes the page immediately
          keepalive: true
        }).catch(() => {});
      }
    })
    .catch(err => {
      console.error('Inflexion Verified API Error:', err);
    });

  function updateTime(el) {
    const months = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
    
    function refresh() {
      const now = new Date();
      const dateStr = `${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`;
      const timeStr = now.toLocaleTimeString('cs-CZ');
      el.innerHTML = `<div class="ifx-live-dot"></div>${dateStr} • ${timeStr}`;
    }
    
    setInterval(refresh, 1000);
    refresh();
  }

  function renderVerifiedBadge(advisor) {
    const a = document.createElement('a');
    a.href = `${TRUST_PORTAL_URL}/${encodeURIComponent(currentDomain)}`;
    a.target = '_blank';
    a.className = 'ifx-badge';
    
    // Premium Shield SVG
    const svg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`;
    
    a.innerHTML = `
      <div class="ifx-icon-wrapper">${svg}</div>
      <div class="ifx-content">
        <span class="ifx-title">Oficiální web 4fin</span>
        <span class="ifx-time" id="ifx-clock">Načítám zabezpečení...</span>
      </div>
    `;
    
    wrapper.appendChild(a);
    updateTime(document.getElementById('ifx-clock'));
  }

  function renderScamBadge() {
    const div = document.createElement('div');
    div.className = 'ifx-badge';
    div.style.background = 'linear-gradient(135deg, rgba(69, 10, 10, 0.95) 0%, rgba(30, 0, 0, 1) 100%)';
    div.style.borderColor = 'rgba(239, 68, 68, 0.5)';
    
    const styleElem = document.createElement('style');
    styleElem.innerHTML = `.ifx-badge::before { display: none; } .ifx-badge:hover { transform: none; box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); border-color: rgba(239, 68, 68, 0.8); cursor: not-allowed; }`;
    document.head.appendChild(styleElem);

    const svg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    
    div.innerHTML = `
      <div class="ifx-icon-wrapper scam">${svg}</div>
      <div class="ifx-content">
        <span class="ifx-title" style="background: none; -webkit-text-fill-color: #FCA5A5;">FALEŠNÁ IDENTITA</span>
        <span class="ifx-time" style="color: #FCA5A5;">
          <div class="ifx-live-dot" style="background-color: #EF4444; box-shadow: 0 0 8px #EF4444;"></div>
          Probíhá blokace domény
        </span>
      </div>
    `;
    
    wrapper.appendChild(div);
  }
})();

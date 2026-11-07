/*
 * Inlet Performance — design preview storefront.
 * Static pages under /inlet/. Sample catalog, prices, reviews and orders; no backend calls,
 * nothing is charged or saved on the server. The bag, wishlist, compare list and sample sign-in live in this browser only.
 * Its own code and its own look: a calm light-blue harbor theme with serif type, a transparent header over the home
 * hero, a slide-down search panel, portrait cards with a compare tray, and a mini-bag that drops from the bag icon.
 * There is deliberately no vehicle picker / garage / fit filter: what a part fits is plain product text.
 */
(function () {
  'use strict';

  const CAT = window.PREVIEW_CATALOG;
  const ART = window.PartsArt;
  const BASE = '/inlet';
  const BRAND = 'Inlet Performance';
  const TIER = 'expensive';
  const HARBOR = '#1f7fb8';
  const P = CAT.products;

  // Customer rules from the CFOODS handoff (Nov 5, 2026). Same for every CFOODS store unless the owner overrides.
  const FREE_SHIP = 30;
  const SHIP_FLAT = 7;
  const SHIP_ZONES = { us: ['Lower 48 states', null], akhi: ['Alaska or Hawaii', 50], ca: ['Canada', 100], intl: ['Other countries', 150] };
  const RETURN_DAYS = 7;
  const RESTOCK = 0.05;
  const shipFor = (zone, subtotal) => (zone === 'us' || !SHIP_ZONES[zone] ? (subtotal >= FREE_SHIP || subtotal <= 0 ? 0 : SHIP_FLAT) : SHIP_ZONES[zone][1]);

  // ------------------------------------------------------------------ helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const whole = (n) => (Number(n) % 1 ? money(n) : `$${Number(n).toLocaleString('en-US')}`);
  const params = new URLSearchParams(window.location.search);
  const byId = (id) => P.find((p) => p.id === id);
  const price = (p) => p.price[TIER];
  const dash = (s) => String(s).replace(/(\d{4})-(\d{4})/g, '$1–$2');
  const title = (p) => dash(p.title);
  const catById = (id) => CAT.categories.find((c) => c.id === id);
  const isPhone = () => window.matchMedia('(max-width: 640px)').matches;

  const store = {
    get(key, fallback) {
      try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: the page still works for this visit */ }
    },
    session(key, value) {
      try {
        if (value === undefined) { const v = window.sessionStorage.getItem(key); return v ? JSON.parse(v) : null; }
        if (value === null) window.sessionStorage.removeItem(key); else window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) { /* ignore */ }
      return null;
    },
  };

  const url = {
    home: `${BASE}/home/`,
    all: `${BASE}/collection/`,
    cat: (id) => `${BASE}/collection/?category=${encodeURIComponent(id)}`,
    product: (p) => `${BASE}/product/?p=${encodeURIComponent(p.id)}`,
    search: (q) => `${BASE}/search/?q=${encodeURIComponent(q)}`,
    page: (name) => `${BASE}/${name}/`,
  };

  const I = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    bag: '<path d="M6 8h12l-.8 12.2H6.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6"/>',
    truck: '<path d="M2.5 6.5h11v9h-11zM13.5 10h3.8l2.7 2.8v2.7h-6.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3l7.5 3v5.6c0 4.7-3.2 7.8-7.5 9.4-4.3-1.6-7.5-4.7-7.5-9.4V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    returns: '<path d="M4 10h11a5 5 0 0 1 0 10H9"/><path d="M8 6l-4 4 4 4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    menu: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
    chev: '<path d="M9.5 6l6 6-6 6"/>',
    back: '<path d="M14.5 6l-6 6 6 6"/>',
    down: '<path d="M6 9.5l6 6 6-6"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/>',
    lock: '<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    wrench: '<path d="M15 4a5 5 0 0 0-4.6 6.9L4 17.3V20h2.7l6.4-6.4A5 5 0 0 0 20 9l-3 1-2-2 1-3z"/>',
    box: '<path d="M3.5 7.5l8.5-4 8.5 4v9l-8.5 4-8.5-4z"/><path d="M3.5 7.5l8.5 4 8.5-4M12 11.5v9"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    tag: '<path d="M3.5 12V4.5H11l9.5 9.5-7.5 7.5z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
    pin: '<path d="M12 21s6.5-5.8 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',
    chat: '<path d="M4 5.5h16v10.5H9.5L5 20z"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8 3l4 6 4-6M12 12.5v5"/>',
    bolt: '<path d="M13 2.5L4.5 14h7l-1 7.5L19 10h-7z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.8.9-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.9z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.3"/>',
    play: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
    out: '<path d="M14 4.5h5.5v15H14M10 12h9.5M6.5 8l-4 4 4 4"/>',
    heart: '<path d="M12 19.5s-7-4.3-7-9.7a3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 7 2.4c0 5.4-7 9.7-7 9.7z"/>',
    key: '<circle cx="8" cy="15" r="3.8"/><path d="M10.8 12.2l8.7-8.7M16.5 6.5l3 3M14.5 8.5l2 2"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
    upload: '<path d="M12 16V4.5M7 9.5l5-5 5 5M4.5 20h15"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    anchor: '<circle cx="12" cy="5.5" r="2"/><path d="M12 7.5v13M8 11h8M4.5 13.5c0 4 3.4 7 7.5 7s7.5-3 7.5-7"/>',
    wave: '<path d="M2.5 9c2.4 0 2.4-2 4.75-2S9.6 9 12 9s2.4-2 4.75-2S19.1 9 21.5 9M2.5 15c2.4 0 2.4-2 4.75-2S9.6 15 12 15s2.4-2 4.75-2 2.35 2 4.75 2"/>',
    sliders: '<path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
    lighthouse: '<path d="M10 7h4l1.5 13h-7zM9 7l3-3 3 3M8.5 20h7M10.5 11h3M10 15h4"/>',
  };
  I.cart = I.bag;
  I.car = I.wrench;
  const icon = (name, cls = '') => `<svg class="in-i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ''}</svg>`;

  // Inlet draws its parts as brushed stainless with harbor-blue details.
  const art = (p, view = 'main') => ART.svg(p.art, { finish: 'steel', accent: HARBOR, coupler: '#0d2a3f', view, label: title(p) });
  const catArt = (c, view = 'main') => ART.svg(c.art, { finish: 'steel', accent: HARBOR, coupler: '#0d2a3f', view, label: c.name });

  const priceTag = (n, cls = '') => `<span class="in-price ${cls}">${whole(n)}</span>`;
  const stars = (r) => `<span class="in-stars" style="--r:${((r / 5) * 100).toFixed(0)}%" role="img" aria-label="${r} out of 5 stars"></span>`;

  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysAgo = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return isoDay(d); };
  const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return isoDay(d); };
  const niceDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ------------------------------------------------------------------ bag, wishlist, compare
  const cart = {
    read() { return store.get('in_preview_cart', []).filter((l) => l && byId(l.id) && l.qty > 0); },
    write(lines) { store.set('in_preview_cart', lines); updateBadges(); },
    add(id, qty = 1) {
      const lines = this.read();
      const line = lines.find((l) => l.id === id);
      if (line) line.qty = Math.min(20, line.qty + qty); else lines.push({ id, qty: Math.min(20, qty) });
      this.write(lines);
    },
    setQty(id, qty) { this.write(this.read().map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l))); },
    remove(id) { this.write(this.read().filter((l) => l.id !== id)); },
    clear() { this.write([]); },
    count() { return this.read().reduce((a, l) => a + l.qty, 0); },
    subtotal() { return this.read().reduce((a, l) => a + price(byId(l.id)) * l.qty, 0); },
  };
  const wish = {
    read() { return store.get('in_preview_wishlist', []).filter((id) => byId(id)); },
    has(id) { return this.read().includes(id); },
    set(id, on) { const list = this.read().filter((x) => x !== id); store.set('in_preview_wishlist', on ? [...list, id] : list); return on; },
    toggle(id) { return this.set(id, !this.has(id)); },
  };
  const COMPARE_MAX = 3;
  const compare = {
    read() { return (store.session('in_preview_compare') || []).filter((id) => byId(id)).slice(0, COMPARE_MAX); },
    has(id) { return this.read().includes(id); },
    set(id, on) {
      const list = this.read().filter((x) => x !== id);
      if (on && list.length >= COMPARE_MAX) return false;
      store.session('in_preview_compare', on ? [...list, id] : list);
      return true;
    },
    clear() { store.session('in_preview_compare', []); },
  };
  const wishButton = (p) => `<button class="in-save${wish.has(p.id) ? ' is-on' : ''}" type="button" data-wish="${p.id}" aria-pressed="${wish.has(p.id)}" aria-label="Save ${esc(title(p))} to your wishlist">${icon('heart')}<span>${wish.has(p.id) ? 'Saved' : 'Save'}</span></button>`;

  // What a part fits is plain product text (like the title). There is no vehicle picker or garage.
  const fitText = (p) => (p.universal ? 'Universal fit' : p.fits.map((f) => `${f.from}–${f.to} ${f.make} ${f.model}`).join(', '));
  const isOffroad = (p) => p.category === 'downpipe' || p.category === 'test-pipe';

  // Price bands for a premium store (set so every band has parts).
  const BANDS = { all: [0, Infinity, 'Any price', ''], u150: [0, 150, 'Under $150', 'Flanges, tips and small parts'], '150-400': [150, 400, '$150–$400', 'Test pipes and resonators'], '400-600': [400, 600, '$400–$600', 'Headers and intakes'], o600: [600, Infinity, '$600 and up', 'Downpipes and big headers'] };
  const BAND_KEYS = ['u150', '150-400', '400-600', 'o600'];
  const inBand = (p, band) => { const [lo, hi] = BANDS[band] || BANDS.all; return price(p) >= lo && price(p) < hi; };

  // ------------------------------------------------------------------ search
  // Plain keyword search over what a product already has: title, category, engine and part number.
  function searchProducts(q) {
    const tokens = String(q || '').toLowerCase().replace(/["'(),]/g, ' ').split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return P.map((p) => {
      const hay = [p.title, p.categoryName, p.category.replace(/-/g, ' '), p.engine, p.sku, p.art, p.universal ? 'universal' : ''].join(' ').toLowerCase();
      const t0 = p.title.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        const single = t.length > 3 ? t.replace(/(es|s)$/, '') : t;
        if (!hay.includes(t) && !hay.includes(single)) return null;
        score += t0.includes(t) || t0.includes(single) ? 3 : 1;
        if (p.categoryName.toLowerCase().includes(single)) score += 2;
      }
      return { p, score: score + p.reviewCount / 1000 };
    }).filter(Boolean).sort((a, b) => b.score - a.score).map((x) => x.p);
  }
  function highlight(text, q) {
    let out = esc(text);
    String(q || '').toLowerCase().split(/\s+/).filter((t) => t.length > 1).forEach((t) => {
      const safe = esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`(${safe})(?![^<]*>)`, 'ig'), '<mark>$1</mark>');
    });
    return out;
  }

  // ------------------------------------------------------------------ shared pieces
  const compassMark = (cls = 'in-logo-mark') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="13.5" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.5 2.2"/><path d="M20 3.5l3 13.5-3 3-3-3z" fill="currentColor"/><path d="M20 36.5l-3-13.5 3-3 3 3z" fill="currentColor" opacity=".45"/><path d="M3.5 20l13.5-3 3 3-3 3z" fill="currentColor" opacity=".45"/><path d="M36.5 20l-13.5 3-3-3 3-3z" fill="currentColor" opacity=".45"/><circle cx="20" cy="20" r="1.8" fill="#e8664d"/></svg>`;
  const logo = () => `${compassMark()}<span class="in-logo-text"><b>Inlet</b><small>Performance</small></span>`;
  const WAVE = (cls = '') => `<svg class="in-wave ${cls}" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true"><path d="M0 26 C 160 6 320 6 480 24 S 800 44 960 24 S 1280 6 1440 22 L1440 48 L0 48 Z"/></svg>`;

  function card(p) {
    const out = p.stock <= 0;
    const badge = out ? '<span class="in-badge is-muted">Sold out</span>' : p.isNew ? '<span class="in-badge is-new">New</span>' : p.best ? '<span class="in-badge">Most loved</span>' : '';
    const cmp = compare.has(p.id);
    return `<article class="in-card${out ? ' is-out' : ''}">
      <a class="in-card-media" href="${url.product(p)}" tabindex="-1" aria-hidden="true"><span class="in-card-pic">${art(p)}</span><span class="in-card-pic is-alt">${art(p, 'flip')}</span>${badge}</a>
      ${out ? '' : `<button class="in-card-bag" type="button" data-add="${p.id}" aria-label="Add ${esc(title(p))} to bag">${icon('bag')}</button>`}
      <div class="in-card-body">
        <p class="in-card-kicker">${esc(p.categoryName)}</p>
        <h3 class="in-card-title"><a href="${url.product(p)}">${esc(title(p))}</a></h3>
        <p class="in-card-fit">${p.universal ? 'Universal fit' : esc(p.fits.length > 1 ? `${p.fits.length} models` : `Fits ${fitText(p)}`)}</p>
        <div class="in-card-foot">${priceTag(price(p))}<span class="in-card-rate">${stars(p.rating)}<small>${p.rating}</small></span></div>
        <label class="in-compare-check"><input type="checkbox" data-compare="${p.id}"${cmp ? ' checked' : ''}><span>Compare</span></label>
      </div>
    </article>`;
  }
  const grid = (list) => `<div class="in-grid">${list.map(card).join('')}</div>`;

  function shipProgress(sub) {
    const left = FREE_SHIP - sub;
    const pct = Math.max(3, Math.min(100, (sub / FREE_SHIP) * 100));
    return `<div class="in-meter${left <= 0 ? ' is-done' : ''}"><p>${left > 0 ? `<span>${money(left)} away from free shipping</span>` : `${icon('check')}<span>Free shipping to the lower 48</span>`}</p><div class="in-meter-bar" aria-hidden="true"><span style="width:${pct}%"></span></div></div>`;
  }

  const crumbs = (items) => `<nav class="in-crumbs" aria-label="Breadcrumb">${items.map(([label, href], i) => (href && i < items.length - 1 ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`)).join('<span class="in-crumb-sep" aria-hidden="true">—</span>')}</nav>`;

  function header() {
    const page = document.body.dataset.page;
    const cur = (on) => (on ? ' aria-current="page"' : '');
    return `<header class="in-header${page === 'home' ? ' is-over' : ''}" id="inHeader">
      <div class="in-wrap in-header-inner">
        <a class="in-logo" href="${url.home}" aria-label="Inlet Performance home">${logo()}</a>
        <nav class="in-nav" aria-label="Main">
          <a href="${url.all}"${cur(page === 'collection' && !params.get('category'))}>Shop all</a>
          <div class="in-nav-drop">
            <button type="button" class="in-nav-btn" data-collections aria-expanded="false" aria-controls="inCollections">Collections${icon('down')}</button>
            <div class="in-drop" id="inCollections" hidden>
              <div class="in-drop-grid">${CAT.categories.map((c) => `<a class="in-drop-item" href="${url.cat(c.id)}"><span class="in-drop-art">${catArt(c)}</span><span><b>${esc(c.name)}</b><small>${P.filter((p) => p.category === c.id).length} parts</small></span></a>`).join('')}</div>
              <a class="in-drop-all" href="${url.all}">Browse every part${icon('arrow')}</a>
            </div>
          </div>
          <a href="${url.page('faq')}"${cur(['faq', 'contact', 'shipping', 'refund', 'warranty'].includes(page))}>Help</a>
        </nav>
        <div class="in-icons">
          <button class="in-icon-btn" type="button" data-open-search aria-label="Search" aria-expanded="false" aria-controls="inSearch">${icon('search')}</button>
          <a class="in-icon-btn in-hide-phone" href="${url.page('account')}" aria-label="Account">${icon('user')}</a>
          <a class="in-icon-btn in-bag-link" id="inBagLink" href="${url.page('cart')}" aria-label="Bag">${icon('bag')}<span class="in-bag-count" aria-hidden="true">0</span></a>
          <button class="in-icon-btn in-menu-btn" type="button" data-open-menu aria-label="Menu" aria-controls="inMenu" aria-expanded="false">${icon('menu')}</button>
          <div class="in-minibag" id="inMiniBag" role="dialog" aria-label="Added to your bag" hidden></div>
        </div>
      </div>
      <div class="in-searchpanel" id="inSearch" hidden>
        <div class="in-wrap">
          <form class="in-search-form" action="${BASE}/search/" method="get" role="search" autocomplete="off">
            ${icon('search')}<label class="in-visually-hidden" for="inSearchInput">Search Inlet Performance</label>
            <input id="inSearchInput" name="q" type="search" placeholder="Search parts, part numbers or help">
            <button class="in-btn in-btn-primary in-btn-sm" type="submit">Search</button>
            <button class="in-icon-btn" type="button" data-close-search aria-label="Close search">${icon('x')}</button>
          </form>
          <div class="in-search-cols" id="inSearchBody" aria-live="polite"></div>
        </div>
      </div>
    </header>`;
  }

  function menuOverlay() {
    return `<div class="in-menu" id="inMenu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
      <div class="in-menu-top"><a class="in-logo" href="${url.home}" aria-label="Inlet Performance home">${logo()}</a><button class="in-icon-btn" type="button" data-close-menu aria-label="Close menu">${icon('x')}</button></div>
      <div class="in-menu-body">
        <nav class="in-menu-links" aria-label="Menu">
          <a href="${url.home}">Home</a>
          <a href="${url.all}">Shop all</a>
          <a href="${url.page('faq')}">Help</a>
          <a href="${url.page('track')}">Track an order</a>
          <a href="${url.page('account')}">Account</a>
          <a href="${url.page('cart')}">Bag <span class="in-bag-count">0</span></a>
        </nav>
        <p class="in-menu-label">Collections</p>
        <div class="in-menu-grid">${CAT.categories.map((c) => `<a href="${url.cat(c.id)}"><span>${catArt(c)}</span><b>${esc(c.name)}</b></a>`).join('')}</div>
        <p class="in-menu-note">${icon('compass')}Free shipping on $${FREE_SHIP}+ in the lower 48 &middot; ${RETURN_DAYS}-day returns &middot; help 24/7</p>
      </div>
    </div>`;
  }

  const HELP_LINKS = [['Track order', 'track'], ['Start a return or claim', 'request'], ['Shipping', 'shipping'], ['Returns & refunds', 'refund'], ['Warranty', 'warranty'], ['FAQ', 'faq'], ['Contact us', 'contact']];
  const COMPANY_LINKS = [['About us', 'about'], ['Customer reviews', 'reviews'], ['Military discount', 'military'], ['Social', 'social']];
  const LEGAL_LINKS = [['Privacy policy', 'privacy'], ['Terms & conditions', 'terms'], ['Vehicle compliance waiver', 'vcw'], ['Consumer use agreement', 'cua'], ['Proposition 65', 'prop65']];
  const linkList = (list) => list.map(([label, page]) => `<li><a href="${url.page(page)}">${esc(label)}</a></li>`).join('');

  function footer() {
    return `<footer class="in-footer">
      ${WAVE('in-wave-top')}
      <div class="in-footer-body">
        <div class="in-wrap">
          <div class="in-footer-top">
            <div class="in-footer-brand">
              ${compassMark('in-footer-mark')}
              <h2>Letters from the harbor</h2>
              <p>New parts and the occasional install guide. A few emails a season, never spam.</p>
              <form class="in-news" id="footNews" novalidate><label class="in-visually-hidden" for="footEmail">Email address</label><input id="footEmail" type="email" placeholder="Your email" autocomplete="email"><button class="in-btn in-btn-primary" type="submit">Sign up</button></form>
              <p class="in-form-msg" id="footMsg" role="status"></p>
            </div>
            <div class="in-footer-cols">
              <div><h3>Shop</h3><ul><li><a href="${url.all}">Shop all</a></li>${CAT.categories.map((c) => `<li><a href="${url.cat(c.id)}">${esc(c.name)}</a></li>`).join('')}</ul></div>
              <div><h3>Help</h3><ul>${linkList(HELP_LINKS)}</ul></div>
              <div><h3>Inlet</h3><ul>${linkList(COMPANY_LINKS)}<li><a href="${url.page('account')}">My account</a></li></ul></div>
              <div><h3>Legal</h3><ul>${linkList(LEGAL_LINKS)}</ul></div>
            </div>
          </div>
          <div class="in-footer-bottom">
            <p>&copy; 2026 Inlet Performance</p>
            <p>Design preview with sample products, prices, reviews and orders. Nothing here can be bought. <a href="${url.page('emails')}">See the email designs</a></p>
          </div>
        </div>
      </div>
    </footer>`;
  }

  function overlays(withChat = true) {
    return `${menuOverlay()}
    <div class="in-tray" id="inTray" role="region" aria-label="Compare list" hidden></div>
    <div class="in-modal" id="inCompare" role="dialog" aria-modal="true" aria-labelledby="inCompareTitle" hidden>
      <div class="in-modal-backdrop" data-close-compare></div>
      <div class="in-modal-box"><div class="in-modal-head"><h2 id="inCompareTitle">Compare parts</h2><button class="in-icon-btn" type="button" data-close-compare aria-label="Close compare">${icon('x')}</button></div><div class="in-modal-body" id="inCompareBody"></div></div>
    </div>
    <div class="in-toast" id="inToast" role="status" aria-live="polite"></div>
    ${withChat ? `<button class="in-chat-launch" type="button" data-open-chat aria-label="Ask Inlet Performance support" aria-controls="inChat" aria-expanded="false">${icon('chat')}<span>Ask us</span></button>
    <section class="in-chat" id="inChat" hidden role="dialog" aria-labelledby="inChatTitle">
      <div class="in-chat-head">${compassMark('in-chat-mark')}<div><b id="inChatTitle">Harbor desk</b><small>Here to help, any hour</small></div><button class="in-icon-btn" type="button" data-close-chat aria-label="Close chat">${icon('x')}</button></div>
      <div class="in-chat-body" id="inChatBody" aria-live="polite"><div class="in-bubble is-team"><small>Inlet Performance</small><p>Hello. We’re here to help with orders, shipping, returns and part fitment. How can we help?</p></div></div>
      <form class="in-chat-form" id="inChatForm" novalidate><label class="in-visually-hidden" for="inChatInput">Message</label><input id="inChatInput" placeholder="Write a message" autocomplete="off"><button class="in-btn in-btn-primary in-btn-sm" type="submit">Send</button></form>
      <p class="in-chat-note">Preview: replies aren't live yet.</p>
    </section>` : ''}`;
  }

  function updateBadges() {
    const n = cart.count();
    $$('.in-bag-count').forEach((el) => { el.textContent = n; el.classList.toggle('is-empty', n === 0); });
    const link = document.getElementById('inBagLink');
    if (link) link.setAttribute('aria-label', `Bag, ${n} item${n === 1 ? '' : 's'}`);
  }

  function toast(text) {
    const el = document.getElementById('inToast');
    if (!el) return;
    el.innerHTML = `${icon('compass')}<span>${esc(text)}</span>`;
    el.classList.add('is-on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('is-on'), 2800);
  }

  // Menu overlay (phone and iPad).
  let lastFocus = null;
  function setMenu(open) {
    const el = document.getElementById('inMenu');
    if (!el) return;
    if (open) {
      lastFocus = document.activeElement;
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-open'));
      document.documentElement.classList.add('in-lock');
      setTimeout(() => { const b = $('[data-close-menu]', el); if (b) b.focus(); }, 40);
    } else if (!el.hidden) {
      el.classList.remove('is-open');
      el.hidden = true;
      document.documentElement.classList.remove('in-lock');
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
    }
    $$('[data-open-menu]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
  }

  // Collections dropdown in the header (desktop).
  function setCollections(open) {
    const drop = document.getElementById('inCollections');
    if (!drop) return;
    drop.hidden = !open;
    $$('[data-collections]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
  }

  // Search panel that slides down from under the header.
  const POPULAR = ['headers', 'downpipe', 'intake', 'flange', 'returns', 'HDR-1001'];
  function drawSearch(q) {
    const body = document.getElementById('inSearchBody');
    if (!body) return;
    const query = q.trim();
    if (!query) {
      body.innerHTML = `<div class="in-search-col"><p class="in-search-label">Popular searches</p><ul class="in-suggest">${POPULAR.map((t) => `<li><a href="${url.search(t)}">${icon('search')}${esc(t)}</a></li>`).join('')}</ul></div>
        <div class="in-search-col"><p class="in-search-label">Collections</p><div class="in-search-tiles">${CAT.categories.slice(0, 4).map((c) => `<a class="in-search-tile" href="${url.cat(c.id)}"><span>${catArt(c)}</span><b>${esc(c.name)}</b></a>`).join('')}</div></div>`;
      return;
    }
    const found = searchProducts(query);
    const ql = query.toLowerCase();
    const cats = CAT.categories.filter((c) => c.name.toLowerCase().includes(ql.replace(/s$/, '')) || found.some((p) => p.category === c.id)).slice(0, 3);
    const suggestions = [...cats.map((c) => [url.cat(c.id), `${c.name}`, 'Collection']), ...found.slice(0, 5).map((p) => [url.product(p), title(p), p.sku])];
    body.innerHTML = `<div class="in-search-col"><p class="in-search-label">Suggestions</p>${suggestions.length ? `<ul class="in-suggest">${suggestions.map(([href, label, note]) => `<li><a href="${href}">${icon('search')}<span>${highlight(label, query)}</span><small>${esc(note)}</small></a></li>`).join('')}</ul>` : '<p class="in-muted">No parts match yet. Press Enter to search the help pages too.</p>'}
      <a class="in-link" href="${url.search(query)}">See all results for &ldquo;${esc(query)}&rdquo;${icon('arrow')}</a></div>
      <div class="in-search-col"><p class="in-search-label">Parts</p>${found.length ? `<div class="in-search-tiles">${found.slice(0, 4).map((p) => `<a class="in-search-tile" href="${url.product(p)}"><span>${art(p)}</span><b>${esc(title(p))}</b><em>${whole(price(p))}</em></a>`).join('')}</div>` : '<p class="in-muted">Try a part type like &ldquo;header&rdquo; or a part number.</p>'}</div>`;
  }
  function setSearch(open) {
    const panel = document.getElementById('inSearch');
    if (!panel) return;
    setCollections(false);
    hideMiniBag();
    panel.hidden = !open;
    document.getElementById('inHeader').classList.toggle('is-searching', open);
    $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open) {
      const input = document.getElementById('inSearchInput');
      input.value = '';
      drawSearch('');
      setTimeout(() => input.focus(), 40);
    }
  }
  function bindSearch() {
    const input = document.getElementById('inSearchInput');
    if (!input) return;
    input.addEventListener('input', () => drawSearch(input.value));
  }

  // Mini bag: drops from the bag icon (iPad and desktop), a banner from the top on phones.
  function showMiniBag(id, qty) {
    const box = document.getElementById('inMiniBag');
    const p = byId(id);
    if (!box || !p) return;
    const sub = cart.subtotal();
    box.innerHTML = `<div class="in-mb-head"><p>${icon('check')}Added to your bag</p><button class="in-icon-btn" type="button" data-close-minibag aria-label="Close">${icon('x')}</button></div>
      <div class="in-mb-item"><span class="in-mb-art">${art(p)}</span><span><b>${esc(title(p))}</b><small>Qty ${qty} &middot; ${whole(price(p) * qty)}</small></span></div>
      <dl class="in-mb-sum"><div><dt>Bag subtotal (${cart.count()})</dt><dd>${money(sub)}</dd></div></dl>
      ${shipProgress(sub)}
      <div class="in-mb-actions"><a class="in-btn in-btn-ghost" href="${url.page('cart')}">View bag</a><a class="in-btn in-btn-primary" href="${url.page('checkout')}">Checkout</a></div>`;
    box.hidden = false;
    box.classList.remove('is-on');
    void box.offsetWidth;
    box.classList.add('is-on');
    clearTimeout(showMiniBag.t);
    showMiniBag.t = setTimeout(hideMiniBag, 5000);
  }
  function hideMiniBag() {
    const box = document.getElementById('inMiniBag');
    if (!box || box.hidden) return;
    clearTimeout(showMiniBag.t);
    box.classList.remove('is-on');
    box.hidden = true;
  }

  // Compare tray and table.
  const compareRows = (p) => [
    ['Price', priceTag(price(p))],
    ['Type', esc(p.categoryName)],
    ['Fits', esc(p.universal ? 'Universal' : fitText(p))],
    ['Material', esc(p.specs.Material || p.specs.Tube || '—')],
    ['Flange', esc(p.specs.Flange || p.specs.Thickness || '—')],
    ['Warranty', esc(p.warranty)],
    ['Rating', `${stars(p.rating)} <span class="in-muted">${p.rating} (${p.reviewCount})</span>`],
    ['Stock', p.stock > 0 ? '<span class="in-ok">In stock</span>' : '<span class="in-bad">Sold out</span>'],
  ];
  function drawTray() {
    const tray = document.getElementById('inTray');
    if (!tray) return;
    const list = compare.read().map(byId);
    const page = document.body.dataset.page;
    const show = list.length > 0 && !['checkout', 'cart', 'confirmation'].includes(page);
    tray.hidden = !show;
    document.documentElement.classList.toggle('in-has-tray', show);
    $$('[data-compare]').forEach((c) => { c.checked = compare.has(c.dataset.compare); });
    $$('[data-compare-btn]').forEach((b) => { const on = compare.has(b.dataset.compareBtn); b.setAttribute('aria-pressed', String(on)); $('span', b).textContent = on ? 'In compare' : 'Add to compare'; });
    if (!show) return;
    const open = tray.classList.contains('is-open') || !isPhone();
    tray.innerHTML = `<button class="in-tray-pill" type="button" data-tray-toggle aria-expanded="${open}">${icon('scale')}Compare (${list.length})</button>
      <div class="in-tray-inner">
        <p class="in-tray-title">${icon('scale')}<span><b>Compare</b><small>${list.length} of ${COMPARE_MAX} picked</small></span></p>
        <ul class="in-tray-picks">${list.map((p) => `<li><span class="in-tray-art">${art(p)}</span><span class="in-tray-name">${esc(title(p))}</span><button class="in-icon-btn" type="button" data-uncompare="${p.id}" aria-label="Remove ${esc(title(p))} from compare">${icon('x')}</button></li>`).join('')}${Array.from({ length: COMPARE_MAX - list.length }, () => '<li class="is-empty"><span>Pick another part</span></li>').join('')}</ul>
        <div class="in-tray-actions"><button class="in-btn in-btn-primary" type="button" data-open-compare${list.length < 2 ? ' disabled' : ''}>Compare now</button><button class="in-link-btn" type="button" data-clear-compare>Clear</button></div>
      </div>`;
  }
  function openCompare() {
    const list = compare.read().map(byId);
    const modal = document.getElementById('inCompare');
    if (!modal || list.length < 2) return;
    const rows = list.map(compareRows);
    document.getElementById('inCompareBody').innerHTML = `<div class="in-cmp-scroll"><table class="in-cmp">
      <thead><tr><th scope="col"><span class="in-visually-hidden">Detail</span></th>${list.map((p) => `<th scope="col"><a class="in-cmp-art" href="${url.product(p)}">${art(p)}</a><a class="in-cmp-name" href="${url.product(p)}">${esc(title(p))}</a><button class="in-link-btn" type="button" data-uncompare="${p.id}">Remove</button></th>`).join('')}</tr></thead>
      <tbody>${rows[0].map(([label], r) => `<tr><th scope="row">${label}</th>${rows.map((cells) => `<td>${cells[r][1]}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row"><span class="in-visually-hidden">Add to bag</span></th>${list.map((p) => `<td>${p.stock > 0 ? `<button class="in-btn in-btn-primary in-btn-sm" type="button" data-add="${p.id}">${icon('bag')}Add to bag</button>` : '<span class="in-muted">Sold out</span>'}</td>`).join('')}</tr></tbody>
    </table></div>`;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('in-lock');
    setTimeout(() => { const b = $('.in-modal-head [data-close-compare]'); if (b) b.focus(); }, 40);
  }
  function closeCompare() {
    const modal = document.getElementById('inCompare');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.documentElement.classList.remove('in-lock');
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }

  function openChat() {
    const panel = document.getElementById('inChat');
    if (!panel) return;
    panel.hidden = false;
    $$('.in-chat-launch').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    setTimeout(() => { const input = document.getElementById('inChatInput'); if (input) input.focus(); }, 30);
  }
  function closeChat() {
    const panel = document.getElementById('inChat');
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    $$('.in-chat-launch').forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.focus(); });
  }

  // ------------------------------------------------------------------ pages
  const PAGES = {};
  let onCartChange = null; // the bag page sets this so it redraws when something is added
  let onWishChange = null; // the account wishlist section sets this

  // ------------------------------------------------------------------ home
  // The harbor scene behind the home hero. It moves: clouds and gulls drift, a car drives the road cut
  // into the mountains, the lighthouse beam turns, the sailboats rock and the waves roll. Animations pause while the
  // hero is off screen and stay still for people who ask for reduced motion (see heroMotion below).
  const wavePath = (y, amp) => { let d = `M-480 ${y}`; for (let x = -480; x < 1920; x += 240) d += ` q60 ${-amp} 120 0 t120 0`; return d; };
  const cloud = (y, s, dur, begin) => `<g opacity=".9"><animateTransform attributeName="transform" type="translate" from="1600 0" to="-420 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="translate(0 ${y}) scale(${s})" fill="#ffffff"><ellipse cx="0" cy="0" rx="62" ry="20"/><ellipse cx="-26" cy="-10" rx="30" ry="22"/><ellipse cx="18" cy="-16" rx="36" ry="28"/><ellipse cx="50" cy="-4" rx="26" ry="16"/></g></g>`;
  const gull = (y, dur, begin, s) => `<g><animateTransform attributeName="transform" type="translate" values="1500 ${y};700 ${y - 30};-200 ${y + 10}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="scale(${s})"><path d="M-10 0 q5 -6 10 0 q5 -6 10 0" fill="none" stroke="#0d2a3f" stroke-width="1.8" stroke-linecap="round"><animateTransform attributeName="transform" type="scale" values="1 1;1 .35;1 1" dur=".9s" repeatCount="indefinite"/></path></g></g>`;
  // The beam turns around the lamp: seen from the side it sweeps right, narrows toward you (the lamp
  // flashes), sweeps left, and narrows away from you.
  const BEAM = [1, 0.87, 0.5, 0.02, -0.5, -0.87, -1, -0.87, -0.5, -0.02, 0.5, 0.87, 1];
  // The far mountains' outline, left to right: it draws the mountains and their snow.
  const RIDGE = [[528, 520], [612, 446], [640, 450], [742, 374], [790, 400], [862, 346], [912, 382], [962, 356], [1036, 410], [1082, 400], [1164, 466], [1212, 520]];
  const PEAKS = [RIDGE[3], RIDGE[5], RIDGE[7]];
  const f1 = (n) => Math.round(n * 10) / 10;
  // Rounds every corner of a line through these points.
  const roundPath = (pts, r) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i += 1) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      const [nx, ny] = pts[i + 1];
      const a = Math.min(r, Math.hypot(x - px, y - py) / 2) / Math.hypot(x - px, y - py);
      const b = Math.min(r, Math.hypot(nx - x, ny - y) / 2) / Math.hypot(nx - x, ny - y);
      d += ` L${f1(x - (x - px) * a)} ${f1(y - (y - py) * a)} Q${x} ${y} ${f1(x + (nx - x) * b)} ${f1(y + (ny - y) * b)}`;
    }
    const [lx, ly] = pts[pts.length - 1];
    return `${d} L${lx} ${ly}`;
  };
  // A smooth curve through these points (for the road, so the car drives it without jolts).
  const smoothPath = (pts) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const p0 = pts[Math.max(0, i - 1)];
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ` C${f1(x1 + (x2 - p0[0]) / 6)} ${f1(y1 + (y2 - p0[1]) / 6)} ${f1(x2 - (p3[0] - x1) / 6)} ${f1(y2 - (p3[1] - y1) / 6)} ${x2} ${y2}`;
    }
    return d;
  };
  const EDGE = roundPath(RIDGE, 12);
  // Snow on each top: everything of the mountain above a jagged line, so it always fits the outline.
  const snowCap = ([x, y]) => `M${x - 46} ${y - 14} H${x + 46} V${y + 10} L${x + 30} ${y + 21} L${x + 18} ${y + 15} L${x + 8} ${y + 24} L${x - 4} ${y + 16} L${x - 16} ${y + 25} L${x - 28} ${y + 18} L${x - 46} ${y + 10} Z`;
  // The side of each mountain facing away from the sun, from its top down the ridge below it.
  const SHADE = 'M612 446 L640 450 L742 374 L766 520 H600 Z M790 400 L862 346 L886 520 H784 Z M912 382 L962 356 L986 520 H906 Z M1036 410 L1082 400 L1102 520 H1030 Z';
  // The road is cut into the mountainsides: it comes out from behind the near hills, climbs across the first
  // mountain, runs through a tunnel in the tallest one, crosses the third and winds down behind the
  // lighthouse. The car drives on it.
  // It bends out around each ridge and back into each dip between the mountains, like a road that follows the slope.
  const ROAD_PTS = [[598, 504], [648, 476], [700, 451], [751, 434], [792, 416], [830, 408], [864, 403], [898, 399], [932, 402], [970, 412], [1008, 420], [1044, 428], [1090, 448], [1132, 463], [1182, 494]];
  const ROAD = smoothPath(ROAD_PTS);
  const TUNNEL = [[830, 408], [898, 399]]; // where the road goes in and comes out
  const portal = ([x, y]) => `<path d="M${x - 6} ${y + 1} V${y - 7} A6 6 0 0 1 ${x + 6} ${y - 7} V${y + 1} Z" fill="#46677d" stroke="#eef4f7" stroke-width="1.6" stroke-linejoin="round"/>`;
  const HERO_SCENE = `<svg class="in-hero-scene" viewBox="0 0 1440 720" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="inSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe7f5"/><stop offset=".62" stop-color="#eef7fc"/><stop offset="1" stop-color="#f8fbfd"/></linearGradient>
      <radialGradient id="inSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6e3"/><stop offset=".55" stop-color="#fdeccc" stop-opacity=".8"/><stop offset="1" stop-color="#fdeccc" stop-opacity="0"/></radialGradient>
      <linearGradient id="inSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc3e2"/><stop offset="1" stop-color="#1f7fb8"/></linearGradient>
      <linearGradient id="inFar" gradientUnits="userSpaceOnUse" x1="0" y1="346" x2="0" y2="520"><stop offset="0" stop-color="#a9c8db"/><stop offset="1" stop-color="#c7dfec"/></linearGradient>
      <linearGradient id="inBeam" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="260" y2="0"><stop offset="0" stop-color="#ffe39a" stop-opacity=".9"/><stop offset=".6" stop-color="#fff0c4" stop-opacity=".45"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
      <path id="inRoad" d="${ROAD}"/>
      <clipPath id="inRange"><path d="${EDGE} Z"/></clipPath>
      <clipPath id="inTunnel"><path d="M${TUNNEL[0][0] + 1} ${TUNNEL[0][1] - 20} L${TUNNEL[1][0] - 1} ${TUNNEL[1][1] - 20} V${TUNNEL[1][1] + 6} L${TUNNEL[0][0] + 1} ${TUNNEL[0][1] + 6} Z"/></clipPath>
    </defs>
    <rect width="1440" height="720" fill="url(#inSky)"/>
    <circle cx="1040" cy="300" r="190" fill="url(#inSun)"><animate attributeName="r" values="186;198;186" dur="9s" repeatCount="indefinite"/></circle>
    <g fill="none" stroke="#0b4f7c" stroke-opacity=".07" stroke-width="1">${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${60 + i * 50} H1440"/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 96} 0 V720"/>`).join('')}</g>
    ${cloud(150, 1, 95, -20)}${cloud(230, 0.7, 120, -75)}${cloud(110, 0.55, 140, -40)}${cloud(300, 0.85, 110, -100)}
    ${gull(250, 38, -6, 1)}${gull(205, 46, -26, 0.8)}
    <path d="M0 470 C 140 430 260 445 380 425 S 640 400 760 430 S 980 440 1080 418 S 1300 400 1440 430 V520 H0Z" fill="#b9d8ea"/>
    <g id="inMountains">
      <path d="${EDGE} Z" fill="url(#inFar)"/>
      <path d="${PEAKS.map(snowCap).join(' ')}" fill="#f4f9fc" clip-path="url(#inRange)"/>
      <path d="${SHADE}" fill="#5f8fae" fill-opacity=".16" clip-path="url(#inRange)"/>
    </g>
    <g class="in-scene-road" fill="none" stroke-linecap="round">
      <use href="#inRoad" xlink:href="#inRoad" stroke="#87a9bf" stroke-width="7.5" transform="translate(0 -2.4)"/>
      <use href="#inRoad" xlink:href="#inRoad" stroke="#a3c1d3" stroke-width="2.4" transform="translate(0 2.2)"/>
      <use href="#inRoad" xlink:href="#inRoad" stroke="#f3f7f9" stroke-width="3.8"/>
    </g>
    <g class="in-scene-car">
      <animateMotion dur="26s" repeatCount="indefinite" rotate="auto" begin="-7s"><mpath href="#inRoad" xlink:href="#inRoad"/></animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.04;.96;1" dur="26s" begin="-7s" repeatCount="indefinite"/>
      <g transform="translate(0 -1.4) scale(.8)">
        <path d="M-15 -3 H15 V-8 L9 -9.5 L5 -14 H-6 L-10 -9.5 L-15 -8.5 Z" fill="#e8664d" stroke="#0d2a3f" stroke-width="1.1"/>
        <path d="M-5 -12.6 H4 L7 -9.6 H-8 Z" fill="#dff1fb"/>
        <circle cx="-8.5" cy="-2.6" r="3" fill="#0d2a3f"/><circle cx="8.5" cy="-2.6" r="3" fill="#0d2a3f"/>
        <circle cx="15" cy="-6" r="1.4" fill="#fff6d8"/>
      </g>
    </g>
    <use href="#inMountains" xlink:href="#inMountains" clip-path="url(#inTunnel)"/>
    ${TUNNEL.map(portal).join('')}
    <path d="M560 502 C 620 470 660 462 700 452 C 760 438 800 446 840 436 C 900 422 940 432 990 440 C 1040 448 1080 470 1140 502 Z" fill="#9cc2d8"/>
    <g transform="translate(1180 230)">
      <path d="M-120 300 C -80 250 -30 238 20 236 S 120 250 170 300 Z" fill="#7f9aab"/>
      <path d="M-14 236 L-4 70 H34 L44 236 Z" fill="#ffffff" stroke="#0d2a3f" stroke-width="2"/>
      <path d="M-9 170 H39 L41 196 H-11 Z M-6 110 H36 L37 134 H-7 Z" fill="#e8664d"/>
      <g transform="translate(14 56)">
        <g class="in-scene-beam"><animateTransform attributeName="transform" type="scale" values="${BEAM.map((v) => `${v} 1`).join(';')}" dur="9s" repeatCount="indefinite"/>
          <path d="M0 -6 L260 -40 L260 40 L0 6 Z" fill="url(#inBeam)"/>
        </g>
        <circle r="20" fill="#fff4d6"><animate attributeName="opacity" values=".35;.45;.7;1;.7;.45;.35;.3;.25;.2;.25;.3;.35" dur="9s" repeatCount="indefinite"/><animate attributeName="r" values="18;19;22;30;22;19;18;17;16;16;16;17;18" dur="9s" repeatCount="indefinite"/></circle>
      </g>
      <rect x="-8" y="42" width="44" height="28" rx="4" fill="#fdf3dc" stroke="#0d2a3f" stroke-width="2"/>
      <circle cx="14" cy="56" r="6" fill="#ffd36e"><animate attributeName="fill" values="#ffd36e;#fff2c4;#ffd36e" dur="4.5s" repeatCount="indefinite"/></circle>
      <path d="M-12 42 L15 18 L42 42 Z" fill="#0d2a3f"/>
      <path d="M-14 236 H44" stroke="#0d2a3f" stroke-width="3"/>
    </g>
    <rect y="500" width="1440" height="220" fill="url(#inSea)"/>
    <g transform="translate(720 552)"><g class="in-scene-boat"><animateTransform attributeName="transform" type="translate" values="0 0;140 3;0 0" dur="56s" repeatCount="indefinite"/>
      <g fill="#0d2a3f" opacity=".85"><animateTransform attributeName="transform" type="rotate" values="-2 48 8;2.5 48 8;-2 48 8" dur="3.8s" repeatCount="indefinite"/><path d="M0 0 H96 L84 16 H10 Z"/><path d="M44 0 V-58 L80 -6 Z" fill="#fff" stroke="#0d2a3f" stroke-width="2"/><path d="M42 -6 V-44 L16 -6 Z" fill="#e8664d" opacity=".9"/></g>
    </g></g>
    <g transform="translate(960 636)"><g><animateTransform attributeName="transform" type="translate" values="0 0;-110 6;0 0" dur="64s" repeatCount="indefinite"/>
      <g fill="#0d2a3f"><animateTransform attributeName="transform" type="rotate" values="2 30 6;-3 30 6;2 30 6" dur="3.1s" repeatCount="indefinite"/><path d="M0 0 H60 L52 11 H7 Z"/><path d="M28 0 V-40 L52 -4 Z" fill="#ffffff" stroke="#0d2a3f" stroke-width="1.6"/></g>
    </g></g>
    <g class="in-scene-waves" fill="none" stroke="#ffffff" stroke-linecap="round">
      <path d="${wavePath(540, 10)}" stroke-opacity=".55" stroke-width="2"><animateTransform attributeName="transform" type="translate" from="0 0" to="-240 0" dur="7s" repeatCount="indefinite"/></path>
      <path d="${wavePath(590, 12)}" stroke-opacity=".4" stroke-width="2.2"><animateTransform attributeName="transform" type="translate" from="-240 0" to="0 0" dur="10s" repeatCount="indefinite"/></path>
      <path d="${wavePath(640, 14)}" stroke-opacity=".3" stroke-width="2.4"><animateTransform attributeName="transform" type="translate" from="0 0" to="-240 0" dur="6s" repeatCount="indefinite"/></path>
      <path d="${wavePath(690, 16)}" stroke-opacity=".22" stroke-width="2.6"><animateTransform attributeName="transform" type="translate" from="-240 0" to="0 0" dur="8.5s" repeatCount="indefinite"/></path>
    </g>
    <g stroke="#fff6e3" stroke-linecap="round" stroke-width="3">${[[1000, 520, 70, 2.4], [1020, 548, 44, 3.1], [990, 576, 90, 2.7], [1030, 606, 36, 3.6], [1004, 636, 64, 2.2], [1040, 668, 30, 3.3]].map(([x, y, w, d]) => `<path d="M${x} ${y} h${w}" stroke-opacity=".75"><animate attributeName="stroke-opacity" values=".2;.85;.2" dur="${d}s" repeatCount="indefinite"/></path>`).join('')}</g>
  </svg>`;

  // Starts, pauses and freezes the hero scene: still for reduced motion, paused while off screen.
  function heroMotion() {
    const scene = document.querySelector('.in-hero-scene');
    if (!scene || typeof scene.pauseAnimations !== 'function') return;
    const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    let visible = true;
    const apply = () => {
      if (reduce.matches) {
        try { scene.setCurrentTime(9); } catch (_) { /* keep the first frame */ }
        scene.pauseAnimations();
        return;
      }
      if (visible) scene.unpauseAnimations(); else scene.pauseAnimations();
    };
    apply();
    if (reduce.addEventListener) reduce.addEventListener('change', apply);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; apply(); }).observe(scene);
  }

  PAGES.home = () => {
    const feat = byId('s2000-00-09-header');
    const stories = [
      ['header', 'Collection 01', 'Equal-length primaries, flanges cut flat so they seal the first time, and welds you would be happy to show off.'],
      ['downpipe', 'Collection 02', 'A full 3" path off the turbo with a braided flex section, so the whole system moves with the engine instead of cracking.'],
      ['cold-air-intake', 'Collection 03', 'Mandrel-bent aluminum tubes and washable filters that pull cooler air from outside the engine bay.'],
    ];
    const rest = CAT.categories.filter((c) => !stories.some(([id]) => id === c.id));
    const quotes = ['s2000-00-09-header', 'wrx-08-14-downpipe', 'miata-99-05-intake', 'k-series-header-flange', 'integra-94-01-header']
      .map((id) => { const p = byId(id); const r = CAT.featuredReview(p); return { p, r }; });
    const from = (pred) => Math.min(...P.filter(pred).map(price));
    return {
      title: 'Performance parts, built for the long haul',
      html: `
      <section class="in-hero">
        ${HERO_SCENE}
        <div class="in-wrap in-hero-inner">
          <div class="in-hero-copy">
            <p class="in-eyebrow">${icon('compass')}Stainless performance parts</p>
            <h1>Built for the<br><em>long haul.</em></h1>
            <p class="in-hero-sub">Headers, downpipes and intakes made to outlast the car they go on. Fewer parts, chosen carefully, with every spec written down.</p>
            <div class="in-hero-actions"><a class="in-btn in-btn-primary in-btn-lg" href="${url.all}">Shop the collection</a><a class="in-btn in-btn-ghost in-btn-lg" href="#compareIntro">How to compare</a></div>
          </div>
          <a class="in-hero-feature" href="${url.product(feat)}"><span class="in-hero-feature-art">${art(feat)}</span><span><small>New in the harbor</small><b>${esc(title(feat))}</b><em>${whole(price(feat))}</em></span></a>
        </div>
      </section>

      <section class="in-trust-strip" aria-label="Why Inlet">
        <div class="in-wrap"><ul>${[['truck', `Free shipping over $${FREE_SHIP}`, 'Lower 48, tracked'], ['returns', `${RETURN_DAYS}-day returns`, 'Free return label'], ['shield', 'Warranty on every part', 'Replacement first'], ['chat', 'Help any hour', 'Chat or email']].map(([ic, b, s]) => `<li>${icon(ic)}<span><b>${b}</b><small>${s}</small></span></li>`).join('')}</ul></div>
      </section>

      <div class="in-wrap">
        ${stories.map(([id, kicker, copy], i) => { const c = catById(id); const n = P.filter((p) => p.category === id).length; return `<section class="in-story${i % 2 ? ' is-flip' : ''}" aria-labelledby="story-${id}">
          <a class="in-story-pic" href="${url.cat(id)}" tabindex="-1" aria-hidden="true">${catArt(c)}<span class="in-story-num">0${i + 1}</span></a>
          <div class="in-story-text"><p class="in-eyebrow">${kicker}</p><h2 id="story-${id}">${esc(c.name)}</h2><p class="in-lead">${esc(copy)}</p><p class="in-muted">${esc(c.blurb)} ${n} parts, from ${whole(from((p) => p.category === id))}.</p><a class="in-btn in-btn-outline" href="${url.cat(id)}">Explore ${esc(c.name.toLowerCase())}${icon('arrow')}</a></div>
        </section>`; }).join('')}
        <div class="in-also"><p>Also in the collection</p>${rest.map((c) => `<a href="${url.cat(c.id)}"><span>${catArt(c)}</span>${esc(c.name)}</a>`).join('')}</div>
      </div>

      <section class="in-band-sea" aria-labelledby="priceTitle">
        ${WAVE('in-wave-flip')}
        <div class="in-wrap">
          <div class="in-section-head is-center"><p class="in-eyebrow">Shop by price</p><h2 id="priceTitle">Start with what you want to spend</h2></div>
          <div class="in-prices">${BAND_KEYS.map((b) => { const list = P.filter((p) => inBand(p, b)); return `<a class="in-price-card" href="${url.all}?price=${b}"><b>${BANDS[b][2]}</b><span>${esc(BANDS[b][3])}</span><small>${list.length} parts &middot; from ${whole(Math.min(...list.map(price)))}</small>${icon('arrow')}</a>`; }).join('')}</div>
        </div>
        ${WAVE()}
      </section>

      <div class="in-wrap">
        <section class="in-compare-promo" id="compareIntro" aria-labelledby="cmpTitle">
          <div class="in-compare-pic" aria-hidden="true">${['accord-94-97-header', 'integra-94-01-header', 'civic-96-00-header'].map((id, i) => `<span class="in-mini-card${i < 2 ? ' is-on' : ''}"><span>${art(byId(id))}</span><i>${icon('check')}</i><b>${whole(price(byId(id)))}</b></span>`).join('')}</div>
          <div><p class="in-eyebrow">Compare before you buy</p><h2 id="cmpTitle">Side by side, in plain numbers</h2><p class="in-lead">Tick <b>Compare</b> on up to three parts. We line up price, fit, materials, flange thickness and warranty so the choice is easy.</p><a class="in-btn in-btn-primary" href="${url.cat('header')}">Start with headers${icon('arrow')}</a></div>
        </section>

        <section class="in-section" aria-labelledby="quoteTitle">
          <div class="in-section-head is-center"><p class="in-eyebrow">4.7 average rating</p><h2 id="quoteTitle">From people who installed them</h2></div>
          <div class="in-quotes" id="quotes" aria-roledescription="carousel" aria-label="Customer reviews">
            ${quotes.map(({ p, r }, i) => `<figure class="in-quote${i === 0 ? ' is-on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${quotes.length}"${i ? ' aria-hidden="true"' : ''}><div class="in-quote-stars">${stars(r.rating)}</div><blockquote><p>&ldquo;${esc(r.body)}&rdquo;</p></blockquote><figcaption><b>${esc(r.name)}</b>${r.vehicle ? ` &middot; ${esc(r.vehicle)}` : ''}<a href="${url.product(p)}"${i ? ' tabindex="-1"' : ''}>${esc(title(p))}</a></figcaption></figure>`).join('')}
          </div>
          <div class="in-quote-nav"><button class="in-icon-btn" type="button" data-quote="-1" aria-label="Previous review">${icon('back')}</button><span class="in-pips">${quotes.map((_, i) => `<button type="button" class="in-pip${i === 0 ? ' is-on' : ''}" data-quote-to="${i}" aria-label="Review ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</span><button class="in-icon-btn" type="button" data-quote="1" aria-label="Next review">${icon('chev')}</button></div>
        </section>

        <section class="in-section" aria-labelledby="harborTitle">
          <div class="in-section-head"><div><p class="in-eyebrow">From the harbor</p><h2 id="harborTitle">Before you order</h2></div><a class="in-link" href="${url.page('faq')}">All help${icon('arrow')}</a></div>
          <div class="in-helps">${[['truck', 'Shipping', `Free over $${FREE_SHIP} in the lower 48. Tracking on every order.`, 'shipping'], ['returns', 'Returns', `${RETURN_DAYS} days, unused parts, free label.`, 'refund'], ['shield', 'Warranty', 'Listed on every part. We replace first.', 'warranty'], ['pin', 'Track an order', 'Your order number and email is all it takes.', 'track'], ['chat', 'Talk to us', 'Chat or email any hour.', 'contact']].map(([ic, h, t, pg]) => `<a class="in-help" href="${url.page(pg)}">${icon(ic)}<b>${h}</b><span>${t}</span></a>`).join('')}</div>
        </section>
      </div>`,
      after() {
        heroMotion();
        const slides = $$('.in-quote');
        const dots = $$('[data-quote-to]');
        let at = 0;
        let timer = null;
        const show = (n) => {
          at = (n + slides.length) % slides.length;
          slides.forEach((s, i) => { s.classList.toggle('is-on', i === at); if (i === at) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); $$('a', s).forEach((a) => { a.tabIndex = i === at ? 0 : -1; }); });
          dots.forEach((d, i) => { d.classList.toggle('is-on', i === at); if (i === at) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
        };
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const start = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => show(at + 1), 7000); } };
        const stop = () => clearInterval(timer);
        $$('[data-quote]').forEach((b) => b.addEventListener('click', () => { show(at + Number(b.dataset.quote)); start(); }));
        dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.quoteTo)); start(); }));
        const box = document.getElementById('quotes');
        box.addEventListener('mouseenter', stop);
        box.addEventListener('mouseleave', start);
        box.addEventListener('focusin', stop);
        start();
      },
    };
  };

  // ------------------------------------------------------------------ shop (collection) with a filter drawer
  const SORTS = { featured: 'Featured', 'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low', rating: 'Best rated', new: 'Newest' };
  function sortList(list, sort) {
    const out = list.slice();
    if (sort === 'price-asc') out.sort((a, b) => price(a) - price(b));
    if (sort === 'price-desc') out.sort((a, b) => price(b) - price(a));
    if (sort === 'rating') out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    if (sort === 'new') out.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === 'featured') out.sort((a, b) => Number(b.best) - Number(a.best) || Number(b.stock > 0) - Number(a.stock > 0));
    return out;
  }
  const filterList = (s) => sortList(P.filter((p) => (!s.category || p.category === s.category) && inBand(p, s.price) && (!s.stock || p.stock > 0)), s.sort);

  PAGES.collection = () => {
    const state = {
      category: catById(params.get('category')) ? params.get('category') : '',
      price: BANDS[params.get('price')] ? params.get('price') : 'all',
      sort: SORTS[params.get('sort')] ? params.get('sort') : 'featured',
      stock: params.get('stock') === '1',
    };
    const c = catById(state.category);
    return {
      title: c ? c.name : 'Shop all',
      html: `<div class="in-wrap in-shop">
        ${crumbs([['Home', url.home], ['Shop all', c ? url.all : null], ...(c ? [[c.name]] : [])])}
        <header class="in-shop-head"><h1 class="in-page-title" id="colTitle">${esc(c ? c.name : 'Shop all')}</h1><p class="in-muted" id="colBlurb">${esc(c ? c.blurb : 'Every Inlet part, with the specs written down. Tick Compare on up to three to see them side by side.')}</p></header>
        <div class="in-colls" role="group" aria-label="Collections">
          <button type="button" class="in-coll" data-cat="" aria-pressed="false"><span class="in-coll-all">${icon('compass')}</span>All</button>
          ${CAT.categories.map((x) => `<button type="button" class="in-coll" data-cat="${x.id}" aria-pressed="false"><span>${catArt(x)}</span>${esc(x.name)}</button>`).join('')}
        </div>
        <div class="in-toolbar"><p class="in-count" id="colCount"></p><button class="in-btn in-btn-outline in-btn-sm" type="button" id="openDrawer" aria-controls="inDrawer" aria-expanded="false">${icon('sliders')}Filter &amp; sort<span class="in-filter-n" id="filterN"></span></button></div>
        <div class="in-tags" id="colTags"></div>
        <div id="colResults" aria-live="polite"></div>
      </div>
      <div class="in-drawer-wrap" id="inDrawerWrap" hidden>
        <div class="in-drawer-backdrop" data-close-drawer></div>
        <aside class="in-drawer" id="inDrawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
          <div class="in-drawer-head"><h2 id="drawerTitle">Filter &amp; sort</h2><button class="in-icon-btn" type="button" data-close-drawer aria-label="Close filters">${icon('x')}</button></div>
          <div class="in-drawer-body">
            <details class="in-acc" open><summary>Price${icon('down')}</summary><div class="in-acc-body">${[['all', 'Any price'], ...BAND_KEYS.map((b) => [b, BANDS[b][2]])].map(([v, l]) => `<label class="in-radio"><input type="radio" name="fprice" value="${v}"><span>${esc(l)}</span><small>${v === 'all' ? '' : P.filter((p) => inBand(p, v)).length}</small></label>`).join('')}</div></details>
            <details class="in-acc" open><summary>Availability${icon('down')}</summary><div class="in-acc-body"><label class="in-radio"><input type="checkbox" name="fstock"><span>In stock only</span></label></div></details>
            <details class="in-acc"><summary>Sort by${icon('down')}</summary><div class="in-acc-body">${Object.entries(SORTS).map(([v, l]) => `<label class="in-radio"><input type="radio" name="fsort" value="${v}"><span>${esc(l)}</span></label>`).join('')}</div></details>
          </div>
          <div class="in-drawer-foot"><button class="in-link-btn" type="button" id="drawerClear">Clear all</button><button class="in-btn in-btn-primary" type="button" id="showN">Show parts</button></div>
        </aside>
      </div>`,
      after() {
        const $id = (id) => document.getElementById(id);
        const sync = () => {
          const q = new URLSearchParams();
          if (state.category) q.set('category', state.category);
          if (state.price !== 'all') q.set('price', state.price);
          if (state.sort !== 'featured') q.set('sort', state.sort);
          if (state.stock) q.set('stock', '1');
          if (params.get('checkout')) q.set('checkout', params.get('checkout'));
          try { window.history.replaceState(null, '', `${window.location.pathname}${q.toString() ? `?${q}` : ''}`); } catch (e) { /* ignore */ }
        };
        const draw = () => {
          const list = filterList(state);
          const cc = catById(state.category);
          $id('colTitle').textContent = cc ? cc.name : 'Shop all';
          $id('colBlurb').textContent = cc ? cc.blurb : 'Every Inlet part, with the specs written down. Tick Compare on up to three to see them side by side.';
          document.title = `${cc ? cc.name : 'Shop all'} | ${BRAND}`;
          $$('[data-cat]').forEach((b) => { const on = b.dataset.cat === state.category; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
          $id('colCount').innerHTML = `<b>${list.length}</b> part${list.length === 1 ? '' : 's'}${state.sort !== 'featured' ? ` &middot; ${esc(SORTS[state.sort])}` : ''}`;
          const tags = [];
          if (state.price !== 'all') tags.push(['price', BANDS[state.price][2]]);
          if (state.stock) tags.push(['stock', 'In stock']);
          if (state.sort !== 'featured') tags.push(['sort', SORTS[state.sort]]);
          $id('filterN').textContent = tags.length ? String(tags.length) : '';
          $id('colTags').innerHTML = tags.map(([k, l]) => `<button type="button" class="in-tag" data-untag="${k}" aria-label="Remove ${esc(l)}">${esc(l)}${icon('x')}</button>`).join('') + (tags.length > 1 ? '<button type="button" class="in-link-btn" data-untag="all">Clear all</button>' : '');
          $id('colResults').innerHTML = list.length ? grid(list) : `<div class="in-empty">${icon('compass')}<h2>Nothing in these waters</h2><p>No parts match those filters. Try another price or collection.</p><button class="in-btn in-btn-primary" type="button" data-untag="all">Clear filters</button></div>`;
          drawTray();
          sync();
        };
        // Drawer: changes are pending until "Show N parts".
        const wrap = $id('inDrawerWrap');
        const pending = {};
        const readDrawer = () => {
          pending.price = ($('input[name="fprice"]:checked', wrap) || { value: 'all' }).value;
          pending.sort = ($('input[name="fsort"]:checked', wrap) || { value: 'featured' }).value;
          pending.stock = $('input[name="fstock"]', wrap).checked;
          const n = filterList({ ...state, ...pending }).length;
          $id('showN').textContent = `Show ${n} part${n === 1 ? '' : 's'}`;
          $id('showN').disabled = n === 0;
        };
        const openDrawer = () => {
          $$('input[name="fprice"]', wrap).forEach((r) => { r.checked = r.value === state.price; });
          $$('input[name="fsort"]', wrap).forEach((r) => { r.checked = r.value === state.sort; });
          $('input[name="fstock"]', wrap).checked = state.stock;
          readDrawer();
          wrap.hidden = false;
          requestAnimationFrame(() => wrap.classList.add('is-open'));
          document.documentElement.classList.add('in-lock');
          $id('openDrawer').setAttribute('aria-expanded', 'true');
          setTimeout(() => $('[data-close-drawer].in-icon-btn', wrap).focus(), 40);
        };
        const closeDrawer = () => {
          if (wrap.hidden) return;
          wrap.classList.remove('is-open');
          wrap.hidden = true;
          document.documentElement.classList.remove('in-lock');
          $id('openDrawer').setAttribute('aria-expanded', 'false');
          $id('openDrawer').focus();
        };
        $id('openDrawer').addEventListener('click', openDrawer);
        wrap.addEventListener('change', readDrawer);
        wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close-drawer]')) closeDrawer(); });
        $id('drawerClear').addEventListener('click', () => {
          $$('input[name="fprice"]', wrap).forEach((r) => { r.checked = r.value === 'all'; });
          $$('input[name="fsort"]', wrap).forEach((r) => { r.checked = r.value === 'featured'; });
          $('input[name="fstock"]', wrap).checked = false;
          readDrawer();
        });
        $id('showN').addEventListener('click', () => { Object.assign(state, pending); draw(); closeDrawer(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !wrap.hidden) closeDrawer(); });
        $$('[data-cat]').forEach((b) => b.addEventListener('click', () => { state.category = b.dataset.cat; draw(); }));
        document.querySelector('.in-main').addEventListener('click', (e) => {
          const t = e.target.closest('[data-untag]');
          if (!t) return;
          const k = t.dataset.untag;
          if (k === 'price' || k === 'all') state.price = 'all';
          if (k === 'stock' || k === 'all') state.stock = false;
          if (k === 'sort' || k === 'all') state.sort = 'featured';
          if (k === 'all') state.category = '';
          draw();
        });
        draw();
      },
    };
  };

  // ------------------------------------------------------------------ search: parts and help answers
  const textOf = (html) => { const d = document.createElement('div'); d.innerHTML = html.replace(/></g, '> <'); return d.textContent.replace(/\s+/g, ' ').trim(); };
  function helpIndex() {
    const out = [];
    Object.entries(INFO).forEach(([key, info]) => {
      if (key === 'reviews' || key === 'social') return;
      if (key === 'faq') {
        const d = document.createElement('div');
        d.innerHTML = info.body();
        $$('details', d).forEach((det) => out.push({ page: 'faq', group: 'FAQ', title: $('summary', det).textContent.trim(), text: $('p', det).textContent.replace(/\s+/g, ' ').trim() }));
        return;
      }
      out.push({ page: key, group: info.kicker, title: info.title, text: `${info.lead} ${textOf(info.body()).replace(/Sample text for the design preview\.[^.]*\./, '')}` });
    });
    return out;
  }
  function searchHelp(q) {
    const tokens = String(q || '').toLowerCase().split(/\s+/).filter((t) => t.length > 1).map((t) => (t.length > 3 ? t.replace(/(es|s)$/, '') : t));
    if (!tokens.length) return [];
    return helpIndex().map((h) => {
      const hay = `${h.title} ${h.text}`.toLowerCase();
      if (!tokens.every((t) => hay.includes(t))) return null;
      const score = tokens.reduce((a, t) => a + (h.title.toLowerCase().includes(t) ? 5 : 0) + hay.split(t).length - 1, 0);
      const at = Math.max(0, h.text.toLowerCase().indexOf(tokens[0]) - 60);
      const snip = `${at > 0 ? '…' : ''}${h.text.slice(at, at + 170).trim()}${h.text.length > at + 170 ? '…' : ''}`;
      return { ...h, score, snip };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
  }

  PAGES.search = () => {
    const q = (params.get('q') || '').trim();
    const found = searchProducts(q);
    const help = searchHelp(q);
    const tab = params.get('tab') === 'help' || (!found.length && help.length) ? 'help' : 'parts';
    const tabBtn = (id, label, n) => `<button type="button" role="tab" class="in-tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${tab === id}" tabindex="${tab === id ? 0 : -1}">${label} <span>${n}</span></button>`;
    return {
      title: q ? `Search: ${q}` : 'Search',
      html: `<div class="in-wrap in-search-page">
        ${crumbs([['Home', url.home], ['Search']])}
        <h1 class="in-page-title">${q ? `Results for &ldquo;${esc(q)}&rdquo;` : 'Search'}</h1>
        <form class="in-bigsearch" action="${BASE}/search/" method="get" role="search">${icon('search')}<label class="in-visually-hidden" for="bigQ">Search parts and help</label><input id="bigQ" name="q" type="search" value="${esc(q)}" placeholder="Search parts, part numbers or help" autocomplete="off"><button class="in-btn in-btn-primary" type="submit">Search</button></form>
        ${found.length || help.length ? `
        <div class="in-tabs" role="tablist" aria-label="Search results">${tabBtn('parts', 'Parts', found.length)}${tabBtn('help', 'Help answers', help.length)}</div>
        <section class="in-tabpanel" id="panel-parts" role="tabpanel" aria-labelledby="tab-parts"${tab === 'parts' ? '' : ' hidden'}>
          ${found.length ? grid(found) : `<p class="in-muted in-pad">No parts match &ldquo;${esc(q)}&rdquo;. The help answers might have what you need.</p>`}
        </section>
        <section class="in-tabpanel" id="panel-help" role="tabpanel" aria-labelledby="tab-help"${tab === 'help' ? '' : ' hidden'}>
          ${help.length ? `<ol class="in-answers">${help.map((h) => `<li><a class="in-answer" href="${url.page(h.page)}"><small>${esc(h.group)}${INFO[h.page] && INFO[h.page].title !== h.group ? ` &middot; ${esc(INFO[h.page].title)}` : ''}</small><b>${highlight(h.title, q)}</b><span>${highlight(h.snip, q)}</span></a></li>`).join('')}</ol>` : `<p class="in-muted in-pad">No help answers mention &ldquo;${esc(q)}&rdquo;. <a href="${url.page('contact')}">Ask us</a> and we’ll answer.</p>`}
        </section>` : `
        <div class="in-empty">${icon('compass')}<h2>${q ? `Nothing found for &ldquo;${esc(q)}&rdquo;` : 'What can we help you find?'}</h2><p>${q ? 'Try a part type like header or intake, a part number like HDR-1001, or a question like returns.' : 'Search parts, part numbers, or help topics like shipping and returns.'}</p>
          <div class="in-chips">${POPULAR.map((t) => `<a class="in-chip" href="${url.search(t)}">${esc(t)}</a>`).join('')}</div></div>
        <div class="in-section-head"><div><p class="in-eyebrow">While you're here</p><h2>Most loved</h2></div></div>${grid(P.filter((p) => p.best).slice(0, 4))}`}
      </div>`,
      after() {
        const tabs = $$('.in-tab');
        const pick = (t, focus) => {
          tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; document.getElementById(b.getAttribute('aria-controls')).hidden = !on; });
          if (focus) t.focus();
          const id = t.id.replace('tab-', '');
          const qs = new URLSearchParams(window.location.search);
          if (id === 'help') qs.set('tab', 'help'); else qs.delete('tab');
          try { window.history.replaceState(null, '', `${window.location.pathname}?${qs}`); } catch (e) { /* ignore */ }
        };
        tabs.forEach((t, i) => {
          t.addEventListener('click', () => pick(t));
          t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pick(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true); } });
        });
      },
    };
  };

  // ------------------------------------------------------------------ product
  function craft(p) {
    const c = catById(p.category);
    const s = p.specs;
    const mat = s.Material || s.Tube || 'Stainless steel';
    const made = [s.Welds && `${s.Welds} welds`, s.Process, s.Flange && `${s.Flange} flange`, s.Thickness && `${s.Thickness} thick`, s.Diameter && `${s.Diameter} tubing`, s['Flex section'] && 'a braided flex section', s.Couplers && `${s.Couplers.toLowerCase()} couplers`].filter(Boolean);
    return [
      ['detail', 'The material', `${mat}${made.length ? `, with ${made.join(', ')}` : ''}. ${c.blurb}`],
      ['flip', 'The fit', p.universal ? `A universal part. Check the sizes in the specifications below before you order, or ask us and we’ll confirm the fit.` : `Made for the ${fitText(p)} with the ${p.engine}. In the box: ${p.inBox.join(', ').toLowerCase()}.`],
      ['box', 'The finish', `${s.Finish || 'Clean'} finish, checked by hand before it ships. Covered by a ${p.warranty} warranty against defects like cracked welds and warped flanges, and we replace first.`],
    ];
  }

  PAGES.product = () => {
    const p = byId(params.get('p'));
    if (!p) {
      return { title: 'Part not found', html: `<div class="in-wrap"><div class="in-empty">${icon('compass')}<h1>Off the chart</h1><p>That part may have moved. Search, or browse the whole collection.</p><a class="in-btn in-btn-primary" href="${url.all}">Shop all</a></div></div>` };
    }
    const c = catById(p.category);
    const out = p.stock <= 0;
    const reviews = CAT.reviewsFor(p);
    const reviewCard = (r) => `<article class="in-review" data-rating="${r.rating}"><div class="in-review-top">${stars(r.rating)}<b>${esc(r.title)}</b></div><p>${esc(r.body)}</p><p class="in-review-by">${esc(r.name)}${r.vehicle ? ` &middot; ${esc(r.vehicle)}` : ''} &middot; ${niceDate(r.date)}${r.verified ? ` <span class="in-verified">${icon('check')}Verified buyer</span>` : ''}</p></article>`;
    const related = P.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    const more = related.length ? related : P.filter((x) => x.best && x.id !== p.id).slice(0, 4);
    const split = CAT.ratingSplit(p);
    const views = [['main', 'Front'], ['flip', 'Side'], ['detail', 'Close-up'], ['box', 'In the box']];
    const specs = Object.entries({ 'Part number': p.sku, Type: c.single, ...p.specs, Fits: p.universal ? 'Universal' : fitText(p) });
    const half = Math.ceil(specs.length / 2);
    const cmpOn = compare.has(p.id);
    return {
      title: title(p),
      html: `<div class="in-wrap">
        ${crumbs([['Home', url.home], [c.name, url.cat(c.id)], [title(p)]])}
        <div class="in-pdp">
          <div class="in-gallery-col">
            <div class="in-gallery" id="gallery" tabindex="0" aria-label="Pictures of ${esc(title(p))}">${views.map(([v, label], i) => `<figure class="in-shot" id="shot${i}">${art(p, v)}<figcaption>${label}</figcaption></figure>`).join('')}</div>
            <div class="in-pips in-gallery-pips" role="group" aria-label="Choose a picture">${views.map(([, label], i) => `<button type="button" class="in-pip${i === 0 ? ' is-on' : ''}" data-shot="${i}" aria-label="${label}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
          </div>
          <div class="in-buy">
            <p class="in-buy-kicker"><a href="${url.cat(c.id)}">${esc(c.name)}</a><span>${esc(p.sku)}</span>${p.isNew ? '<span class="in-badge is-new">New</span>' : ''}</p>
            <h1 class="in-buy-title">${esc(title(p))}</h1>
            <a class="in-buy-rating" href="#reviews">${stars(p.rating)}<span>${p.rating} &middot; ${p.reviewCount} reviews</span></a>
            <p class="in-buy-price">${priceTag(price(p), 'in-price-xl')}<small>${price(p) >= FREE_SHIP ? 'Free shipping in the lower 48' : `Free shipping on $${FREE_SHIP}+`}</small></p>
            <p class="in-buy-fit">${p.universal ? '<b>Universal fit.</b> Check the sizes under Specifications.' : `<b>Fits ${esc(fitText(p))}</b> &middot; ${esc(p.engine)}`} <a href="${url.page('contact')}">Ask about fit</a></p>
            <ul class="in-buy-facts"><li>${icon('shield')}<span>${esc(p.warranty)} warranty</span></li><li class="${out ? 'is-out' : p.stock < 10 ? 'is-low' : 'is-ok'}">${icon(out ? 'clock' : 'check')}<span>${out ? 'Sold out right now' : p.stock < 10 ? `Only ${p.stock} left` : 'In stock, ships in its own box'}</span></li></ul>
            ${out ? `<div class="in-notify"><b>Write me when it's back</b><p>One email when it's restocked. It doesn't hold a part for you.</p><form class="in-inline-form" id="notifyForm" novalidate><label class="in-visually-hidden" for="notifyEmail">Email for a restock alert</label><input id="notifyEmail" type="email" placeholder="Your email"><button class="in-btn in-btn-navy" type="submit">Notify me</button></form><p class="in-form-msg" id="notifyMsg" role="status"></p></div>` : `
            <div class="in-buy-row">
              <label class="in-qty"><span>Quantity</span><select id="pdpQty">${Array.from({ length: 10 }, (_, i) => `<option>${i + 1}</option>`).join('')}</select></label>
              <button class="in-btn in-btn-primary in-btn-lg in-grow" type="button" id="pdpAdd">${icon('bag')}Add to bag</button>
            </div>
            <button class="in-btn in-btn-navy in-btn-block" type="button" id="pdpBuy">Buy now</button>`}
            <div class="in-buy-row2">${wishButton(p)}<button class="in-save" type="button" data-compare-btn="${p.id}" aria-pressed="${cmpOn}">${icon('scale')}<span>${cmpOn ? 'In compare' : 'Add to compare'}</span></button></div>
            ${isOffroad(p) ? `<p class="in-legal">${icon('anchor')}<span>For off-road and competition use only. Not legal for street use in California or states with similar emissions laws. <a href="${url.page('vcw')}">Read the waiver</a></span></p>` : ''}
          </div>
        </div>

        <section class="in-craft" aria-labelledby="craftTitle">
          <div class="in-section-head is-center"><p class="in-eyebrow">The craft</p><h2 id="craftTitle">What goes into it</h2></div>
          ${craft(p).map(([v, h, t], i) => `<div class="in-craft-row${i % 2 ? ' is-flip' : ''}"><div class="in-craft-pic">${art(p, v)}</div><div class="in-craft-text"><p class="in-craft-num">0${i + 1}</p><h3>${h}</h3><p>${esc(t)}</p></div></div>`).join('')}
        </section>

        <section class="in-section" aria-labelledby="specTitle">
          <div class="in-section-head"><h2 id="specTitle">Specifications</h2></div>
          <div class="in-specs">${[specs.slice(0, half), specs.slice(half)].map((rows) => `<table class="in-spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`).join('')}</div>
        </section>

        <aside class="in-note-block" aria-label="Shipping and returns">
          <div>${icon('truck')}<p><b>Shipping.</b> Free to the lower 48 on orders of $${FREE_SHIP}+, otherwise $${SHIP_FLAT}. Alaska and Hawaii $${SHIP_ZONES.akhi[1]}, Canada $${SHIP_ZONES.ca[1]}, other countries $${SHIP_ZONES.intl[1]}. <a href="${url.page('shipping')}">Details</a></p></div>
          <div>${icon('returns')}<p><b>Returns.</b> Unused and uninstalled, within ${RETURN_DAYS} days of delivery, with a free label. Refunds to your card have a 5% restocking fee; store credit has none. <a href="${url.page('refund')}">Return policy</a></p></div>
          <div>${icon('shield')}<p><b>Warranty.</b> ${esc(p.warranty)} for the original buyer. We replace first. <a href="${url.page('warranty')}">Warranty</a></p></div>
        </aside>

        <section class="in-section in-reviews" id="reviews" aria-labelledby="revTitle">
          <div class="in-section-head"><h2 id="revTitle">Reviews</h2><button class="in-btn in-btn-outline in-btn-sm" type="button" id="writeReview">Write a review</button></div>
          <p class="in-form-msg" id="reviewMsg" role="status"></p>
          <div class="in-rev-grid">
            <div class="in-score"><p class="in-score-num">${p.rating}</p>${stars(p.rating)}<p class="in-muted">${p.reviewCount} reviews</p>
              <div class="in-dist" role="group" aria-label="Filter reviews by stars">${[5, 4, 3, 2, 1].map((s, i) => `<button type="button" class="in-dist-row" data-star="${s}" aria-pressed="false"><span>${s} star</span><span class="in-dist-bar"><i style="width:${split[i]}%"></i></span><span>${split[i]}%</span></button>`).join('')}</div>
              <button class="in-link-btn" type="button" id="showAllRev" hidden>Show all reviews</button></div>
            <div class="in-rev-main"><div class="in-review-tools"><p class="in-review-count" id="revCount"></p><label class="in-select"><span>Sort</span><select id="revSort"><option value="new">Most recent</option><option value="high">Highest rated</option><option value="low">Lowest rated</option></select></label></div><div class="in-rev-list" id="revList"></div><div class="in-review-more"><button class="in-btn in-btn-outline" type="button" id="revMore"></button><button class="in-btn in-btn-outline" type="button" id="revAll"></button></div></div>
          </div>
        </section>

        <section class="in-section" aria-labelledby="moreTitle">
          <div class="in-section-head"><div><p class="in-eyebrow">You may also like</p><h2 id="moreTitle">${related.length ? `More ${esc(c.name.toLowerCase())}` : 'Most loved'}</h2></div><a class="in-link" href="${url.cat(c.id)}">See all${icon('arrow')}</a></div>
          ${grid(more)}
        </section>
      </div>`,
      after() {
        const gallery = document.getElementById('gallery');
        const dots = $$('[data-shot]');
        const setDot = (n) => dots.forEach((d, i) => { d.classList.toggle('is-on', i === n); if (i === n) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
        dots.forEach((d) => d.addEventListener('click', () => { const s = document.getElementById(`shot${d.dataset.shot}`); gallery.scrollTo({ left: s.offsetLeft - gallery.offsetLeft, behavior: 'smooth' }); setDot(Number(d.dataset.shot)); }));
        gallery.addEventListener('scroll', () => { if (gallery.scrollWidth > gallery.clientWidth + 4) setDot(Math.round(gallery.scrollLeft / gallery.clientWidth)); }, { passive: true });
        const qty = document.getElementById('pdpQty');
        if (qty) {
          document.getElementById('pdpAdd').addEventListener('click', () => addToCart(p.id, Number(qty.value) || 1));
          document.getElementById('pdpBuy').addEventListener('click', () => { cart.add(p.id, Number(qty.value) || 1); window.location.href = url.page('checkout') + (params.get('checkout') ? `?checkout=${encodeURIComponent(params.get('checkout'))}` : ''); });
        }
        const notify = document.getElementById('notifyForm');
        if (notify) notify.addEventListener('submit', (e) => {
          e.preventDefault();
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('notifyEmail').value.trim());
          const msg = document.getElementById('notifyMsg');
          msg.textContent = ok ? 'Thank you. One email when it’s back. (Preview: nothing was sent.)' : 'Enter a valid email address.';
          msg.className = `in-form-msg ${ok ? 'is-ok' : 'is-bad'}`;
        });
        // Every review can be read: a page at a time, or all at once.
        const pager = CAT.pageReviews({ reviews: reviews, card: reviewCard, list: document.getElementById('revList'), count: document.getElementById('revCount'), more: document.getElementById('revMore'), all: document.getElementById('revAll'), sort: document.getElementById('revSort'), empty: '<p class="in-muted">No reviews with that many stars yet.</p>' });
        document.getElementById('writeReview').addEventListener('click', () => {
          const msg = document.getElementById('reviewMsg');
          msg.textContent = 'We email a review link 7 days after delivery. We read every review before it goes up, good or bad. (Preview)';
          msg.className = 'in-form-msg is-ok';
        });
        // Star breakdown filters the reviews.
        const rows = $$('[data-star]');
        const showAll = document.getElementById('showAllRev');
        const filter = (star) => {
          rows.forEach((r) => { const on = Number(r.dataset.star) === star; r.classList.toggle('is-on', on); r.setAttribute('aria-pressed', String(on)); });
          pager.filter(star ? (r) => r.rating === star : null);
          showAll.hidden = !star;
        };
        rows.forEach((r) => r.addEventListener('click', () => filter(r.classList.contains('is-on') ? 0 : Number(r.dataset.star))));
        showAll.addEventListener('click', () => filter(0));
      },
    };
  };

  function totals(lines, zone = 'us', discount = 0, credit = 0) {
    const sub = lines.reduce((a, l) => a + price(byId(l.id)) * l.qty, 0);
    const off = Math.round(sub * discount * 100) / 100;
    const ship = lines.length ? shipFor(zone, sub - off) : 0;
    const before = sub - off + ship;
    const used = Math.min(credit, before);
    return { sub, off, ship, tax: 0, credit: used, total: Math.round((before - used) * 100) / 100 };
  }
  // When CFOODS can't confirm stock, browsing stays up and checkout pauses. Preview it with ?checkout=paused.
  const checkoutPaused = () => params.get('checkout') === 'paused';
  const pausedNote = () => `<div class="in-paused" role="status">${icon('clock')}<div><b>Checkout is paused for a few minutes.</b><span>Your cart is saved and you can keep browsing. Try again shortly.</span></div></div>`;

  // Inlet's bag: a quantity menu per line, an order note and a shipping estimator.
  PAGES.cart = () => {
    const ZONE_KEYS = ['us', 'akhi', 'ca', 'intl'];
    let zone = ZONE_KEYS.includes(store.session('in_preview_zone')) ? store.session('in_preview_zone') : 'us';
    const draw = () => {
      const lines = cart.read();
      const holder = document.getElementById('cartHolder');
      if (!lines.length) {
        holder.innerHTML = `<div class="in-empty">${icon('bag')}<h2>Your bag is empty</h2><p>Nothing aboard yet. Start with a collection, or search by part number.</p><div class="in-empty-actions"><a class="in-btn in-btn-primary" href="${url.all}">Shop all</a><button class="in-btn in-btn-outline" type="button" data-open-search>${icon('search')}Search</button></div></div>
          <section class="in-section"><div class="in-section-head"><div><p class="in-eyebrow">Most loved</p><h2>A good place to start</h2></div></div>${grid(P.filter((p) => p.best).slice(0, 4))}</section>`;
        return;
      }
      const t = totals(lines, zone);
      holder.innerHTML = `<div class="in-bag">
        <div class="in-bag-main">
          ${shipProgress(t.sub)}
          <ul class="in-lines">${lines.map((l) => { const p = byId(l.id); return `<li class="in-line">
            <a class="in-line-art" href="${url.product(p)}" tabindex="-1" aria-hidden="true">${art(p)}</a>
            <div class="in-line-info">
              <p class="in-card-kicker">${esc(p.categoryName)}</p>
              <a class="in-line-title" href="${url.product(p)}">${esc(title(p))}</a>
              <p class="in-line-meta">${esc(p.sku)} &middot; ${whole(price(p))} each${isOffroad(p) ? ' &middot; off-road use' : ''}</p>
              <div class="in-line-actions">
                <label class="in-qty in-qty-sm"><span>Qty</span><select data-line-qty="${p.id}" aria-label="Quantity for ${esc(title(p))}">${Array.from({ length: 20 }, (_, i) => `<option${i + 1 === l.qty ? ' selected' : ''}>${i + 1}</option>`).join('')}</select></label>
                <button class="in-link-btn" type="button" data-remove="${p.id}">Remove</button>
              </div>
            </div>
            <strong class="in-line-total">${money(price(p) * l.qty)}</strong>
          </li>`; }).join('')}</ul>
          <div class="in-note-field"><label for="bagNote"><b>Order note</b><small>Optional. Anything we should know when packing, like a delivery window.</small></label><textarea id="bagNote" rows="3" maxlength="400" placeholder="Add a note to your order">${esc(store.session('in_preview_note') || '')}</textarea></div>
        </div>
        <aside class="in-summary" aria-label="Order summary">
          <h2>Summary</h2>
          <label class="in-field in-estimate" for="estZone"><span>Estimate shipping to</span><select id="estZone">${ZONE_KEYS.map((z) => `<option value="${z}"${z === zone ? ' selected' : ''}>${esc(SHIP_ZONES[z][0])}</option>`).join('')}</select></label>
          <dl>
            <div><dt>Subtotal (${cart.count()} item${cart.count() === 1 ? '' : 's'})</dt><dd>${money(t.sub)}</dd></div>
            <div><dt>Shipping (${esc(zoneLabel(zone))})</dt><dd id="estShip">${t.ship ? money(t.ship) : '<b class="in-free">Free</b>'}</dd></div>
            <div><dt>Sales tax</dt><dd>${money(0)}</dd></div>
            <div class="in-total"><dt>Estimated total</dt><dd>${money(t.total)}</dd></div>
          </dl>
          ${zone === 'ca' || zone === 'intl' ? `<p class="in-small in-muted">Import duties and taxes are charged by your country on delivery and paid by you.</p>` : ''}
          ${checkoutPaused() ? `${pausedNote()}<button class="in-btn in-btn-primary in-btn-lg in-btn-block" type="button" disabled>${icon('lock')}Checkout paused</button>` : `<a class="in-btn in-btn-primary in-btn-lg in-btn-block" href="${url.page('checkout')}">${icon('lock')}Check out</a>`}
          <p class="in-pay-ways" aria-label="Ways to pay"><span>Card</span><span>Apple Pay</span><span>Google Pay</span><span>Link</span></p>
          <a class="in-link" href="${url.all}">${icon('back')}Continue shopping</a>
        </aside>
      </div>`;
    };
    return {
      title: 'Bag',
      html: `<div class="in-wrap in-bag-page">${crumbs([['Home', url.home], ['Bag']])}<h1 class="in-page-title">Your bag</h1><div id="cartHolder"></div></div>`,
      after() {
        draw();
        const holder = document.getElementById('cartHolder');
        holder.addEventListener('click', (e) => {
          const rm = e.target.closest('[data-remove]');
          if (rm) { const p = byId(rm.dataset.remove); cart.remove(rm.dataset.remove); draw(); toast(`Removed ${title(p)}`); }
        });
        holder.addEventListener('change', (e) => {
          const sel = e.target.closest('[data-line-qty]');
          if (sel) { cart.setQty(sel.dataset.lineQty, Number(sel.value) || 1); draw(); const again = $(`[data-line-qty="${sel.dataset.lineQty}"]`); if (again) again.focus(); }
          if (e.target.id === 'estZone') { zone = e.target.value; store.session('in_preview_zone', zone); draw(); document.getElementById('estZone').focus(); }
        });
        holder.addEventListener('input', (e) => { if (e.target.id === 'bagNote') store.session('in_preview_note', e.target.value.slice(0, 400)); });
        onCartChange = draw;
      },
    };
  };

  const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
  const COUNTRIES = [['US', 'United States'], ['CA', 'Canada'], ['AU', 'Australia'], ['DE', 'Germany'], ['JP', 'Japan'], ['MX', 'Mexico'], ['NZ', 'New Zealand'], ['SE', 'Sweden'], ['GB', 'United Kingdom']];
  const zoneOf = (country, st) => (country === 'US' ? (st === 'AK' || st === 'HI' ? 'akhi' : 'us') : country === 'CA' ? 'ca' : 'intl');
  const zoneLabel = (zone) => (SHIP_ZONES[zone] || SHIP_ZONES.us)[0];
  const signedInUser = () => store.session('in_preview_user');
  const CREDIT_BALANCE = 15; // sample store credit for the signed-in preview account (see the account ledger)

  // Inlet's checkout: three separate screens (Information, Shipping, Payment) with a breadcrumb.
  PAGES.checkout = () => {
    const lines = cart.read();
    if (!lines.length) {
      return { title: 'Checkout', chrome: 'checkout', html: `<div class="in-wrap in-co-wrap"><div class="in-empty">${icon('bag')}<h1>Your bag is empty</h1><p>Add a part before checking out.</p><a class="in-btn in-btn-primary" href="${url.all}">Shop all</a></div></div>` };
    }
    if (checkoutPaused()) {
      return { title: 'Checkout', chrome: 'checkout', html: `<div class="in-wrap in-co-wrap in-paused-page">${pausedNote()}<p>Nothing was charged. <a href="${url.page('cart')}">Back to your bag</a> or <a href="${url.all}">keep browsing</a>.</p></div>` };
    }
    const user = signedInUser();
    const offroad = lines.map((l) => byId(l.id)).filter(isOffroad);
    const state = { zone: 'us', country: 'US', discount: 0, code: '', useCredit: false, done: 0, pay: 'card' };
    const SCREENS = ['information', 'shipping', 'payment'];
    const field = (id, label, type = 'text', extra = '') => `<label class="in-field" for="${id}"><span>${label}</span><input id="${id}" name="${id}" type="${type}" ${extra}><em class="in-field-err" id="${id}Err"></em></label>`;
    const drawSummary = () => {
      const t = totals(lines, state.zone, state.discount, state.useCredit ? CREDIT_BALANCE : 0);
      document.getElementById('coSummaryBody').innerHTML = `
        <ul class="in-co-lines">${lines.map((l) => { const p = byId(l.id); return `<li><span class="in-co-art">${art(p)}<i>${l.qty}</i></span><span>${esc(title(p))}<small>${esc(p.sku)}</small></span><b>${money(price(p) * l.qty)}</b></li>`; }).join('')}</ul>
        <form class="in-code" id="codeForm" novalidate><label class="in-visually-hidden" for="code">Discount code</label><input id="code" placeholder="Discount code" value="${esc(state.code)}" autocomplete="off"><button class="in-btn in-btn-outline in-btn-sm" type="submit">Apply</button></form>
        <p class="in-form-msg${state.discount ? ' is-ok' : ''}" id="codeMsg" role="status">${state.discount ? `Code ${esc(state.code)} applied: ${state.discount * 100}% off` : ''}</p>
        <dl>
          <div><dt>Subtotal</dt><dd>${money(t.sub)}</dd></div>
          ${t.off ? `<div class="in-discount"><dt>Discount</dt><dd>&minus;${money(t.off)}</dd></div>` : ''}
          <div><dt>Shipping</dt><dd>${state.done >= 1 ? (t.ship ? money(t.ship) : '<b class="in-free">Free</b>') : '<span class="in-muted">Next step</span>'}</dd></div>
          <div><dt>Sales tax</dt><dd>${money(0)}</dd></div>
          ${t.credit ? `<div class="in-discount"><dt>Store credit</dt><dd>&minus;${money(t.credit)}</dd></div>` : ''}
          <div class="in-total"><dt>Total</dt><dd>${money(t.total)}</dd></div>
        </dl>`;
      document.getElementById('coToggleTotal').textContent = money(t.total);
      document.getElementById('coPlace').innerHTML = `${icon('lock')}Place order &middot; ${money(t.total)}`;
      document.getElementById('shipBox').innerHTML = `<label class="in-radio-card is-only"><input type="radio" name="method" checked><span><b>Standard shipping with tracking</b><small>${esc(zoneLabel(state.zone))}${state.zone === 'us' && t.sub - t.off < FREE_SHIP ? ` &middot; free on orders of $${FREE_SHIP}+` : ''}</small></span><em>${t.ship ? money(t.ship) : '<b class="in-free">Free</b>'}</em></label>
        ${state.zone === 'ca' || state.zone === 'intl' ? `<p class="in-co-note">${icon('box')}<span>Import duties, taxes and brokerage fees may be charged by your country on delivery. They are paid by you and are not included here.</span></p>` : ''}`;
      document.getElementById('codeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('code').value.trim().toUpperCase();
        if (val === 'HARBOR10') { state.discount = 0.1; state.code = val; drawSummary(); return; }
        const msg = document.getElementById('codeMsg');
        msg.textContent = val ? 'That code isn’t valid.' : 'Enter a code.';
        msg.className = 'in-form-msg is-bad';
      });
    };
    const review = (rows) => `<dl class="in-review-box">${rows.map(([k, id, screen]) => `<div><dt>${k}</dt><dd id="${id}"></dd><dd><a href="#${screen}" class="in-link-btn" data-goto-screen="${screen}">Change</a></dd></div>`).join('')}</dl>`;
    return {
      title: 'Checkout',
      chrome: 'checkout',
      html: `
      <div class="in-wrap in-checkout">
        <button class="in-co-toggle" type="button" id="coToggle" aria-expanded="false" aria-controls="coSummary">${icon('bag')}<span>Show order summary</span>${icon('down')}<b id="coToggleTotal"></b></button>
        <div class="in-co-main">
          <nav class="in-co-steps" aria-label="Checkout steps"><ol>
            <li><a href="${url.page('cart')}">Bag</a></li>
            ${SCREENS.map((s, i) => `<li><a href="#${s}" data-goto-screen="${s}" data-step-link="${i}">${s.charAt(0).toUpperCase() + s.slice(1)}</a></li>`).join('')}
          </ol></nav>
          <form id="coForm" novalidate>
            <section class="in-screen" data-screen="information" aria-labelledby="hInfo">
              <h1 class="in-co-title" id="hInfo" tabindex="-1">Information</h1>
              <p class="in-co-guest">${user ? `Signed in as <b>${esc(user.email)}</b>.` : `Checking out as a guest. <a href="${url.page('login')}">Sign in</a> to use store credit and keep this order in your account.`}</p>
              <h2 class="in-co-sub">Contact</h2>
              ${field('email', 'Email', 'email', `autocomplete="email" required value="${user ? esc(user.email) : ''}"`)}
              <label class="in-check-line"><input type="checkbox" id="optin"> <span>Send me new parts and install guides (optional)</span></label>
              <h2 class="in-co-sub">Ship to</h2>
              <label class="in-field" for="country"><span>Country</span><select id="country" autocomplete="country">${COUNTRIES.map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}</select></label>
              <div class="in-field-row">${field('first', 'First name', 'text', 'autocomplete="given-name" required')}${field('last', 'Last name', 'text', 'autocomplete="family-name" required')}</div>
              ${field('address', 'Street address', 'text', 'autocomplete="address-line1" required')}
              ${field('address2', 'Apartment, suite (optional)', 'text', 'autocomplete="address-line2"')}
              <div class="in-field-row in-field-row-3">${field('city', 'City', 'text', 'autocomplete="address-level2" required')}
                <label class="in-field" for="state" id="stateWrap"><span>State</span><select id="state" required autocomplete="address-level1"><option value="">Choose</option>${STATES.map((s) => `<option>${s}</option>`).join('')}</select><em class="in-field-err" id="stateErr"></em></label>
                <label class="in-field" for="region" id="regionWrap" hidden><span>Province / region</span><input id="region" autocomplete="address-level1"><em class="in-field-err" id="regionErr"></em></label>
                <label class="in-field" for="zip"><span id="zipLabel">ZIP code</span><input id="zip" name="zip" autocomplete="postal-code" required><em class="in-field-err" id="zipErr"></em></label></div>
              ${field('phone', 'Phone (for delivery questions)', 'tel', 'autocomplete="tel"')}
              <div class="in-screen-nav"><a class="in-link" href="${url.page('cart')}">${icon('back')}Return to bag</a><button class="in-btn in-btn-primary in-btn-lg" type="button" data-next="information">Continue to shipping</button></div>
            </section>
            <section class="in-screen" data-screen="shipping" aria-labelledby="hShip" hidden>
              <h1 class="in-co-title" id="hShip" tabindex="-1">Shipping</h1>
              ${review([['Contact', 'revContact', 'information'], ['Ship to', 'revShip', 'information']])}
              <h2 class="in-co-sub">Shipping method</h2>
              <div id="shipBox"></div>
              <div class="in-screen-nav"><a class="in-link" href="#information" data-goto-screen="information">${icon('back')}Return to information</a><button class="in-btn in-btn-primary in-btn-lg" type="button" data-next="shipping">Continue to payment</button></div>
            </section>
            <section class="in-screen" data-screen="payment" aria-labelledby="hPay" hidden>
              <h1 class="in-co-title" id="hPay" tabindex="-1">Payment</h1>
              ${review([['Contact', 'revContact2', 'information'], ['Ship to', 'revShip2', 'information'], ['Method', 'revMethod', 'shipping']])}
              <h2 class="in-co-sub">How would you like to pay?</h2>
              <div class="in-pay-options" role="radiogroup" aria-label="Payment method">
                ${[['card', 'Card', 'Visa, Mastercard, Amex, Discover'], ['apple', 'Apple Pay', 'On Safari and Apple devices'], ['google', 'Google Pay', 'On Chrome and Android'], ['link', 'Link', 'Your saved details from Stripe']].map(([v, l, s], i) => `<label class="in-radio-card"><input type="radio" name="pay" value="${v}"${i === 0 ? ' checked' : ''}><span><b>${l}</b><small>${s}</small></span></label>`).join('')}
              </div>
              <div class="in-pay-box" id="payBox">${icon('lock')}<div><b>Card details go in Stripe's secure form</b><p>On the live store this is Stripe's payment form for Inlet Performance's own merchant account. Card numbers are never typed into these pages.</p></div></div>
              <p class="in-pay-ways" aria-label="Ways to pay"><span>Card</span><span>Apple Pay</span><span>Google Pay</span><span>Link</span></p>
              ${user ? `<label class="in-check-line"><input type="checkbox" id="useCredit"> <span>Use store credit (<b>${money(CREDIT_BALANCE)}</b> available). You'll confirm with your passkey or authenticator app.</span></label>` : `<p class="in-co-note">${icon('coin')}<span>Have store credit? <a href="${url.page('login')}">Sign in</a> to use it.</span></p>`}
              ${offroad.length ? `<div class="in-ack"><b>Before you order</b><p>These parts are for off-road and competition use only: ${offroad.map((p) => esc(title(p))).join(', ')}.</p>
                <label class="in-check-line"><input type="checkbox" id="ack"> <span>I've read the <a href="${url.page('vcw')}" target="_blank" rel="noopener">vehicle compliance waiver</a> and will only use these parts off-road, where it's legal.</span></label><em class="in-field-err" id="ackErr"></em></div>` : ''}
              <p class="in-preview-flag">Design preview: placing this order does not charge anything. It just shows the confirmation page.</p>
              <div class="in-screen-nav"><a class="in-link" href="#shipping" data-goto-screen="shipping">${icon('back')}Return to shipping</a><button class="in-btn in-btn-primary in-btn-lg" type="submit" id="coPlace">Place order</button></div>
              <p class="in-co-legal">By placing your order you agree to the <a href="${url.page('terms')}">terms</a>, <a href="${url.page('refund')}">return policy</a> and <a href="${url.page('privacy')}">privacy policy</a>.</p>
            </section>
          </form>
        </div>
        <aside class="in-co-summary" id="coSummary" aria-label="Order summary"><h2>Order summary</h2><div id="coSummaryBody"></div></aside>
      </div>`,
      after() {
        const $id = (id) => document.getElementById(id);
        const val = (id) => $id(id).value.trim();
        const us = () => state.country === 'US';
        const syncCountry = () => {
          state.country = $id('country').value;
          $id('stateWrap').hidden = !us();
          $id('regionWrap').hidden = us();
          $id('zipLabel').textContent = us() ? 'ZIP code' : 'Postal code';
          state.zone = zoneOf(state.country, $id('state').value);
          drawSummary();
        };
        $id('country').addEventListener('change', syncCountry);
        $id('state').addEventListener('change', syncCountry);
        const credit = $id('useCredit');
        if (credit) credit.addEventListener('change', () => { state.useCredit = credit.checked; drawSummary(); });
        syncCountry();
        const toggle = $id('coToggle');
        toggle.addEventListener('click', () => {
          const open = $id('coSummary').classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', String(open));
          $('span', toggle).textContent = open ? 'Hide order summary' : 'Show order summary';
        });
        const rules = () => ({
          information: {
            email: (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) || 'Enter a valid email.',
            first: (x) => Boolean(x) || 'Enter a first name.',
            last: (x) => Boolean(x) || 'Enter a last name.',
            address: (x) => x.length > 3 || 'Enter a street address.',
            city: (x) => Boolean(x) || 'Enter a city.',
            ...(us() ? { state: (x) => Boolean(x) || 'Choose a state.' } : {}),
            ...(state.country === 'CA' ? { region: (x) => Boolean(x) || 'Enter a province.' } : {}),
            zip: (x) => (us() ? /^\d{5}(-\d{4})?$/.test(x) || 'Enter a 5-digit ZIP.' : state.country === 'CA' ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(x) || 'Enter a postal code like K1A 0B1.' : x.length >= 3 || 'Enter a postal code.'),
          },
        });
        const check = (screen) => {
          let first = null;
          Object.entries(rules()[screen] || {}).forEach(([id, test]) => {
            const el = $id(id);
            const res = test(el.value.trim());
            $id(`${id}Err`).textContent = res === true ? '' : res;
            if (res !== true) { el.setAttribute('aria-invalid', 'true'); if (!first) first = el; } else el.removeAttribute('aria-invalid');
          });
          return first;
        };
        const countryName = () => (COUNTRIES.find(([c]) => c === state.country) || [])[1] || '';
        const address = () => [val('address'), val('address2'), us() ? `${val('city')}, ${val('state')} ${val('zip')}` : `${val('city')} ${val('region')} ${val('zip')}`.replace(/\s+/g, ' ').trim(), us() ? '' : countryName()].filter(Boolean);
        const fillReview = () => {
          const t = totals(lines, state.zone, state.discount);
          ['revContact', 'revContact2'].forEach((id) => { $id(id).textContent = val('email'); });
          ['revShip', 'revShip2'].forEach((id) => { $id(id).textContent = `${val('first')} ${val('last')}, ${address().join(', ')}`; });
          $id('revMethod').textContent = `Standard with tracking · ${t.ship ? money(t.ship) : 'Free'}`;
        };
        const show = (screen, focus = true) => {
          let target = SCREENS.includes(screen) ? screen : 'information';
          if (SCREENS.indexOf(target) > state.done) target = SCREENS[state.done];
          $$('.in-screen').forEach((s) => { s.hidden = s.dataset.screen !== target; });
          const n = SCREENS.indexOf(target);
          $$('[data-step-link]').forEach((a) => {
            const k = Number(a.dataset.stepLink);
            a.classList.toggle('is-done', k < n);
            if (k === n) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
            a.classList.toggle('is-locked', k > state.done);
            if (k > state.done) a.setAttribute('aria-disabled', 'true'); else a.removeAttribute('aria-disabled');
          });
          if (n > 0) fillReview();
          drawSummary();
          try { window.history.replaceState(null, '', `#${target}`); } catch (e) { /* ignore */ }
          if (focus) { const h = $('.in-co-title', $(`.in-screen[data-screen="${target}"]`)); h.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        };
        const form = $id('coForm');
        form.addEventListener('input', (e) => { const err = $id(`${e.target.id}Err`); if (err) err.textContent = ''; e.target.removeAttribute('aria-invalid'); });
        form.addEventListener('change', (e) => {
          if (e.target.id === 'ack') $id('ackErr').textContent = '';
          if (e.target.name === 'pay') { state.pay = e.target.value; $id('payBox').hidden = state.pay !== 'card'; if (state.pay !== 'card') toast(`Preview: ${e.target.closest('label').querySelector('b').textContent} would open when you place the order.`); }
        });
        form.addEventListener('click', (e) => {
          const next = e.target.closest('[data-next]');
          if (next) {
            const screen = next.dataset.next;
            const bad = check(screen);
            if (bad) { bad.focus(); return; }
            state.done = Math.max(state.done, SCREENS.indexOf(screen) + 1);
            show(SCREENS[SCREENS.indexOf(screen) + 1]);
          }
        });
        document.querySelector('.in-checkout').addEventListener('click', (e) => {
          const go = e.target.closest('[data-goto-screen]');
          if (go) { e.preventDefault(); if (go.getAttribute('aria-disabled') === 'true') return; show(go.dataset.gotoScreen); }
        });
        window.addEventListener('hashchange', () => show(window.location.hash.slice(1), false));
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const bad = check('information');
          if (bad) { state.done = 0; show('information'); setTimeout(() => bad.focus(), 60); return; }
          if (state.done < 2) { show(SCREENS[state.done]); return; }
          const ack = $id('ack');
          if (ack && !ack.checked) { $id('ackErr').textContent = 'Please confirm you’ve read the waiver for off-road parts.'; ack.focus(); return; }
          const t = totals(lines, state.zone, state.discount, state.useCredit ? CREDIT_BALANCE : 0);
          store.session('in_preview_order', {
            n: `INL-${String(Date.now()).slice(-6)}`,
            email: val('email'), name: `${val('first')} ${val('last')}`, guest: !user,
            address: address(),
            zone: state.zone, lines, ...t,
          });
          cart.clear();
          window.location.href = url.page('confirmation');
        });
        show(window.location.hash.slice(1), false);
      },
    };
  };

  // Sample orders, dated relative to today: one being packed, one delivered 2 days ago (still returnable),
  // one delivered two weeks ago (return window closed, warranty open) and an older one.
  const SAMPLE_ORDERS = [
    { n: 'INL-104611', date: daysAgo(1), status: 1, items: [['civic-06-11-intake', 1]], credit: 10, tracking: '', carrier: 'UPS Ground' },
    { n: 'INL-104590', date: daysAgo(6), status: 5, items: [['wrx-08-14-downpipe', 1], ['o2-spacer-90-pair', 1]], tracking: '1Z RR4 590 03 1288 4410', carrier: 'UPS Ground' },
    { n: 'INL-104233', date: daysAgo(18), status: 5, items: [['accord-94-97-header', 1], ['header-install-kit', 1]], tracking: '1Z RR4 233 03 1842 7731', carrier: 'UPS Ground' },
    { n: 'INL-103871', date: daysAgo(64), status: 5, items: [['slant-tip-3-4', 2]], tracking: '9400 1112 0261 3871 0042 19', carrier: 'USPS Ground Advantage' },
  ];
  const STEPS = ['Order placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  const orderTotals = (o) => totals(o.items.map(([id, qty]) => ({ id, qty })), 'us', 0, o.credit || 0);
  const deliveredOn = (o) => (o.status >= 5 ? addDays(o.date, 4) : null);
  const returnUntil = (o) => (deliveredOn(o) ? addDays(deliveredOn(o), RETURN_DAYS) : null);
  const canReturn = (o) => Boolean(returnUntil(o)) && returnUntil(o) >= daysAgo(0);
  function timeline(status, date) {
    const d = new Date(`${date}T12:00:00`);
    return `<ol class="in-timeline">${STEPS.map((s, i) => {
      const when = new Date(d); when.setDate(d.getDate() + [0, 1, 1, 4, 4][i]);
      const state = i < status ? 'is-done' : i === status ? 'is-now' : '';
      return `<li class="${state}"><span class="in-dot">${i < status ? icon('check') : ''}</span><b>${s}</b><small>${i < status ? when.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : i === status ? 'Next' : ''}</small></li>`;
    }).join('')}</ol>`;
  }
  const signedIn = () => store.session('in_preview_user') || { first: 'Jamie', last: 'Rivera', email: 'jamie.rivera@example.com' };
  const statusName = (s) => (s >= 5 ? 'Delivered' : STEPS[s - 1] || 'Processing');

  PAGES.confirmation = () => {
    const o = store.session('in_preview_order') || {
      n: 'INL-104612', email: 'jamie.rivera@example.com', name: 'Jamie Rivera', address: ['1420 Main Street', 'Apt 3', 'Denver, CO 80202'], zone: 'us', guest: true,
      lines: [{ id: 'accord-94-97-header', qty: 1 }, { id: 'header-install-kit', qty: 1 }], ...totals([{ id: 'accord-94-97-header', qty: 1 }, { id: 'header-install-kit', qty: 1 }]),
    };
    return {
      title: 'Order confirmed',
      html: `<div class="in-wrap in-confirm">
        <div class="in-confirm-head">
          <span class="in-confirm-check">${icon('check')}</span>
          <p class="in-eyebrow">Order ${esc(o.n)}</p>
          <h1>Thanks, ${esc(o.name.split(' ')[0])}. Your parts are on the list.</h1>
          <p>A receipt is on its way to <b>${esc(o.email)}</b>. We'll email tracking as soon as it ships.</p>
        </div>
        <div class="in-confirm-grid">
          <section class="in-card-box"><h2>What happens next</h2>${timeline(1, daysAgo(0))}</section>
          <section class="in-card-box"><h2>Your order</h2>
            <ul class="in-co-lines">${o.lines.map((l) => { const p = byId(l.id); return p ? `<li><span class="in-co-art">${art(p)}<i>${l.qty}</i></span><span>${esc(title(p))}</span><b>${money(price(p) * l.qty)}</b></li>` : ''; }).join('')}</ul>
            <dl><div><dt>Subtotal</dt><dd>${money(o.sub)}</dd></div>${o.off ? `<div class="in-discount"><dt>Discount</dt><dd>&minus;${money(o.off)}</dd></div>` : ''}<div><dt>Shipping (${esc(zoneLabel(o.zone))})</dt><dd>${o.ship ? money(o.ship) : 'Free'}</dd></div>${o.credit ? `<div class="in-discount"><dt>Store credit</dt><dd>&minus;${money(o.credit)}</dd></div>` : ''}<div class="in-summary-total"><dt>Total</dt><dd>${money(o.total)}</dd></div></dl>
          </section>
          <section class="in-card-box"><h2>Shipping to</h2><p>${esc(o.name)}<br>${o.address.map(esc).join('<br>')}</p>
            ${o.guest ? `<h2>Keep track of it</h2><p>Make an Inlet Performance account with <b>${esc(o.email)}</b> to see this order, start returns and get store credit.</p><a class="in-btn in-btn-navy in-btn-sm" href="${url.page('signup')}">Create account</a>` : ''}
          </section>
        </div>
        <div class="in-confirm-actions"><a class="in-btn in-btn-primary" href="${url.page('track')}?order=${encodeURIComponent(o.n)}">${icon('truck')}Track this order</a><a class="in-btn in-btn-outline" href="${url.all}">Keep shopping</a></div>
        <p class="in-preview-flag">Design preview: no order was placed and nothing was charged.</p>
      </div>`,
    };
  };

  function authShell(kind) {
    const isLogin = kind === 'login';
    return `<div class="in-wrap in-auth">
      <div class="in-auth-card">
        <h1>${isLogin ? 'Sign in' : 'Create your account'}</h1>
        <p class="in-muted">${isLogin ? 'Track orders, start returns and check out faster.' : 'Takes 30 seconds. See every order in one place.'}</p>
        <form id="authForm" novalidate>
          ${isLogin ? '' : '<div class="in-field-row"><label class="in-field"><span>First name</span><input id="aFirst" autocomplete="given-name" required><em class="in-field-err" id="aFirstErr"></em></label><label class="in-field"><span>Last name</span><input id="aLast" autocomplete="family-name" required><em class="in-field-err" id="aLastErr"></em></label></div>'}
          <label class="in-field"><span>Email</span><input id="aEmail" type="email" autocomplete="email" required><em class="in-field-err" id="aEmailErr"></em></label>
          <label class="in-field"><span>Password${isLogin ? '' : ' (8+ characters)'}</span><span class="in-pass"><input id="aPass" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required><button type="button" class="in-link-btn" id="aShow" aria-label="Show password">${icon('eye')}</button></span><em class="in-field-err" id="aPassErr"></em></label>
          ${isLogin ? `<p class="in-auth-forgot"><button type="button" class="in-link-btn" id="aForgot">Forgot password?</button></p>` : ''}
          <button class="in-btn in-btn-primary in-btn-lg in-btn-block" type="submit">${isLogin ? 'Sign in' : 'Create account'}</button>
          <p class="in-form-msg" id="authMsg" role="status"></p>
        </form>
        <p class="in-auth-switch">${isLogin ? `New to Inlet Performance? <a href="${url.page('signup')}">Create an account</a>` : `Already have an account? <a href="${url.page('login')}">Sign in</a>`}</p>
      </div>
      <aside class="in-auth-side">
        <h2>Why make an account?</h2>
        <ul class="in-checklist">
          <li>${icon('truck')}Track every order in one place</li>
          <li>${icon('pin')}Save your address for faster checkout</li>
          <li>${icon('returns')}Start returns in two clicks</li>
          <li>${icon('tag')}Get deal drops before anyone else</li>
        </ul>
        <span class="in-auth-art">${art(byId('wrx-08-14-downpipe'))}</span>
      </aside>
    </div>`;
  }
  function bindAuth(kind) {
    const form = document.getElementById('authForm');
    const pass = document.getElementById('aPass');
    document.getElementById('aShow').addEventListener('click', (e) => { pass.type = pass.type === 'password' ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', pass.type === 'password' ? 'Show password' : 'Hide password'); });
    const forgot = document.getElementById('aForgot');
    if (forgot) forgot.addEventListener('click', () => {
      const msg = document.getElementById('authMsg');
      const email = document.getElementById('aEmail').value.trim();
      msg.className = `in-form-msg ${email ? 'is-ok' : 'is-bad'}`;
      msg.textContent = email ? `If there's an account for ${email}, a reset link is on its way. (Preview: nothing was sent.)` : 'Enter your email first, then press Forgot password.';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rules = [['aEmail', (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) || 'Enter a valid email.'], ['aPass', (x) => (kind === 'login' ? x.length > 0 : x.length >= 8) || (kind === 'login' ? 'Enter your password.' : 'Use at least 8 characters.')]];
      if (kind === 'signup') rules.unshift(['aFirst', (x) => Boolean(x) || 'Enter your first name.'], ['aLast', (x) => Boolean(x) || 'Enter your last name.']);
      let bad = null;
      rules.forEach(([id, test]) => { const el = document.getElementById(id); const r = test(el.value.trim()); document.getElementById(`${id}Err`).textContent = r === true ? '' : r; if (r !== true && !bad) bad = el; });
      if (bad) { bad.focus(); return; }
      const email = document.getElementById('aEmail').value.trim();
      const first = kind === 'signup' ? document.getElementById('aFirst').value.trim() : 'Jamie';
      const last = kind === 'signup' ? document.getElementById('aLast').value.trim() : 'Rivera';
      store.session('in_preview_user', { first, last, email });
      window.location.href = url.page('account');
    });
  }
  PAGES.login = () => ({ title: 'Sign in', html: authShell('login'), after: () => bindAuth('login') });
  PAGES.signup = () => ({ title: 'Create account', html: authShell('signup'), after: () => bindAuth('signup') });

  // Sample support threads (Messages tab).
  const THREADS = [
    { subject: 'When will my intake ship?', order: 'INL-104611', date: daysAgo(1), status: 'Answered', messages: [
      ['you', 'Hi, I ordered the Civic intake yesterday. When will it ship?'],
      ['team', 'Thanks for your order! INL-104611 is being packed now. You’ll get an email with tracking as soon as the label is made.'],
    ] },
    { subject: 'Will the WRX downpipe fit a 2011 STI?', order: '', date: daysAgo(9), status: 'Answered', messages: [
      ['you', 'Will the 3" downpipe for the 2008–2014 WRX fit my 2011 STI?'],
      ['team', 'Good question. This downpipe is listed for the 2008–2014 Subaru WRX with the 2.5L EJ255. The STI uses a different engine, so we can’t confirm it fits yet. We’re checking with our parts team and will reply here.'],
      ['staff', 'Checked it: the STI’s turbo outlet and length are different, so this one won’t fit. Sorry about that!'],
    ] },
  ];
  const CREDIT_LEDGER = [
    { date: daysAgo(58), what: 'Refund as store credit: 1 × Slant-Cut Exhaust Tip (INL-103871). No restocking fee.', amount: 25 },
    { date: daysAgo(1), what: 'Used on order INL-104611', amount: -10 },
  ];

  // Inlet's account: one long page, every section a card, with a sticky chip menu that scrolls to each one.
  PAGES.account = () => {
    const u = signedIn();
    const twoStep = () => store.session('in_preview_2fa') === true;
    const passkeys = () => store.session('in_preview_passkeys') || [];
    const secured = () => twoStep() || passkeys().length > 0;
    let balance = 0;
    const ledger = CREDIT_LEDGER.map((r) => { balance += r.amount; return { ...r, balance }; });
    const SECTIONS = [['orders', 'Orders', 'box'], ['messages', 'Messages', 'chat'], ['credit', 'Store credit', 'coin'], ['wishlist', 'Wishlist', 'heart'], ['addresses', 'Addresses', 'pin'], ['security', 'Security', 'lock']];
    const securityState = () => `<span class="in-status ${twoStep() ? 's5' : 's3'}">${twoStep() ? 'On' : 'Off'}</span>`;
    const creditGuard = () => (secured()
      ? `<p class="in-credit-guard is-on">${icon('shield')}<span>Protected. You'll confirm with your ${twoStep() ? 'authenticator app or ' : ''}passkey each time you use credit.</span></p>`
      : `<p class="in-credit-guard">${icon('lock')}<span>To use store credit, turn on two-step sign-in or add a passkey. <a class="in-link-btn" href="#security" data-scroll="security">Set it up</a></span></p>`);
    const drawWishlist = () => {
      const list = wish.read().map(byId);
      document.getElementById('wishHolder').innerHTML = list.length ? grid(list) : `<div class="in-empty-small">${icon('heart')}<p>Nothing saved yet. Press <b>Save</b> on any part to keep it here.</p><a class="in-btn in-btn-primary" href="${url.all}">Shop all</a></div>`;
      const n = document.querySelector('[data-scroll="wishlist"] small');
      if (n) n.textContent = list.length;
    };
    const section = (id, label, ic, inner, note = '') => `<section class="in-acct-card" id="${id}" aria-labelledby="h-${id}">
      <header class="in-acct-card-head"><span class="in-acct-icon">${icon(ic)}</span><h2 id="h-${id}">${label}</h2>${note}</header>${inner}</section>`;
    return {
      title: 'My account',
      html: `<div class="in-wrap in-account">
        ${crumbs([['Home', url.home], ['My account']])}
        <div class="in-account-head"><div><p class="in-eyebrow">${icon('compass')}My account</p><h1 class="in-page-title">Welcome aboard, ${esc(u.first)}.</h1><p class="in-muted">${esc(u.email)}</p></div><button class="in-btn in-btn-outline in-btn-sm" type="button" id="signOut">${icon('out')}Sign out</button></div>
        <nav class="in-acct-nav" id="acctNav" aria-label="Account sections">${SECTIONS.map(([id, label]) => `<a href="#${id}" data-scroll="${id}">${label}${id === 'wishlist' ? ' <small></small>' : ''}</a>`).join('')}</nav>
        <div class="in-acct-stack">
        ${section('orders', 'Orders', 'box', `<ul class="in-order-list">${SAMPLE_ORDERS.map((o) => { const t = orderTotals(o); return `<li class="in-order">
            <div class="in-order-arts">${o.items.map(([id, q]) => `<span class="in-mini-art" title="${esc(title(byId(id)))}">${art(byId(id))}${q > 1 ? `<i>${q}</i>` : ''}</span>`).join('')}</div>
            <div class="in-order-info"><p><b>${o.n}</b> <span class="in-status s${o.status}">${statusName(o.status)}</span></p><p class="in-muted">${niceDate(o.date)} &middot; ${money(t.total)}</p><p class="in-order-names">${o.items.map(([id]) => esc(title(byId(id)))).join(', ')}</p></div>
            <div class="in-order-actions"><a class="in-btn in-btn-navy in-btn-sm" href="${url.page('orderview')}?n=${o.n}">View order</a><a class="in-btn in-btn-outline in-btn-sm" href="${url.page('track')}?order=${o.n}">Track</a>${canReturn(o) ? `<a class="in-btn in-btn-outline in-btn-sm" href="${url.page('request')}?type=return&n=${o.n}">Return</a>` : ''}</div>
          </li>`; }).join('')}</ul>`, `<span class="in-muted in-small">${SAMPLE_ORDERS.length} orders</span>`)}
        ${section('messages', 'Messages', 'chat', `<p class="in-muted in-panel-intro">Your conversations with Inlet Performance support. Write to us any hour; we reply right here and by email.</p>
          <div class="in-threads">${THREADS.map((th, i) => `<details class="in-thread"${i === 0 ? ' open' : ''}>
            <summary><span><b>${esc(th.subject)}</b><small>${th.order ? `${th.order} &middot; ` : ''}${niceDate(th.date)}</small></span><span class="in-status s5">${th.status}</span></summary>
            <div class="in-bubbles">${th.messages.map(([who, text]) => `<div class="in-bubble is-${who}"><small>${who === 'you' ? 'You' : who === 'team' ? 'Inlet Performance support' : 'Sam at Inlet Performance'}</small><p>${esc(text)}</p></div>`).join('')}</div>
            <form class="in-reply" data-reply novalidate><label class="in-visually-hidden" for="reply${i}">Reply</label><textarea id="reply${i}" rows="2" placeholder="Write a reply"></textarea><button class="in-btn in-btn-navy in-btn-sm" type="submit">Send</button></form>
          </details>`).join('')}</div>
          <a class="in-btn in-btn-outline" href="${url.page('contact')}">${icon('chat')}Start a new message</a>`)}
        ${section('credit', 'Store credit', 'coin', `<div class="in-credit-card"><div><small>Available</small><strong>${money(balance)}</strong></div><p>Inlet Performance only &middot; never expires &middot; can't be cashed out</p></div>
          <div id="creditGuard">${creditGuard()}</div>
          <div class="in-table-wrap"><table class="in-table in-ledger"><thead><tr><th>Date</th><th>What happened</th><th>Amount</th><th>Balance</th></tr></thead><tbody>${ledger.slice().reverse().map((r) => `<tr><td>${niceDate(r.date)}</td><td>${esc(r.what)}</td><td class="${r.amount > 0 ? 'in-plus' : 'in-minus'}">${r.amount > 0 ? '+' : '&minus;'}${money(Math.abs(r.amount))}</td><td>${money(r.balance)}</td></tr>`).join('')}</tbody></table></div>
          <p class="in-muted in-small">Store credit comes from refunds you choose to take as credit, or from our support team. Every change is listed here and emailed to you. Credit can pay for parts, shipping and tax, and works with discount codes.</p>`)}
        ${section('wishlist', 'Wishlist', 'heart', '<div id="wishHolder"></div>')}
        ${section('addresses', 'Addresses', 'pin', `<div class="in-address-card"><span class="in-badge">Default</span><p><b>${esc(u.first)} ${esc(u.last)}</b><br>1420 Main Street, Apt 3<br>Denver, CO 80202</p><button class="in-link-btn" type="button" data-preview-msg="Editing addresses is not part of the preview.">Edit</button></div>
          <p class="in-muted in-small">Saved cards are stored by Stripe, our payment processor. Inlet Performance never sees or keeps your full card number.</p>`)}
        ${section('security', 'Security', 'lock', `<div class="in-sec-list">
            <div class="in-sec-row">
              <div class="in-sec-head">${icon('phone')}<div><b>Two-step sign-in</b><span>Use an authenticator app like Google Authenticator. Needed to use store credit (or add a passkey).</span></div><span id="twoStepState">${securityState()}</span></div>
              <div id="twoStepBody">${twoStep() ? '<p class="in-muted">On. You’ll enter a 6-digit code when you sign in on a new device and each time you use store credit.</p>' : '<button class="in-btn in-btn-navy in-btn-sm" type="button" id="twoStepStart">Set up</button>'}</div>
            </div>
            <div class="in-sec-row">
              <div class="in-sec-head">${icon('key')}<div><b>Passkeys</b><span>Sign in with Face ID, Touch ID or your device PIN instead of a password.</span></div></div>
              <ul class="in-passkeys" id="passkeyList"></ul>
              <button class="in-btn in-btn-outline in-btn-sm" type="button" id="addPasskey">Add a passkey</button>
            </div>
            <div class="in-sec-row">
              <div class="in-sec-head">${icon('mail')}<div><b>Emails on this account</b><span>Add other emails you've ordered with, to see those guest orders here.</span></div></div>
              <p class="in-email-line"><b>${esc(u.email)}</b> <span class="in-badge">Primary</span></p>
              <form class="in-inline-form" id="addEmailForm" novalidate><input type="email" id="addEmail" placeholder="another@email.com" aria-label="Another email address"><button class="in-btn in-btn-navy" type="submit">Send code</button></form>
              <p class="in-form-msg" id="addEmailMsg" role="status"></p>
            </div>
            <form class="in-sec-row in-settings-form" id="pwForm" novalidate>
              <div class="in-sec-head">${icon('lock')}<div><b>Password</b><span>At least 8 characters.</span></div></div>
              <label class="in-field"><span>Current password</span><input type="password" id="pw0" autocomplete="current-password"></label>
              <label class="in-field"><span>New password</span><input type="password" id="pw1" autocomplete="new-password"></label>
              <button class="in-btn in-btn-navy" type="submit">Update password</button>
              <p class="in-form-msg" id="pwMsg" role="status"></p>
            </form>
            <div class="in-sec-row">
              <div class="in-sec-head">${icon('mail')}<div><b>Email preferences</b><span>Order, shipping and account emails always go out.</span></div></div>
              <label class="in-check-line"><input type="checkbox" checked disabled> <span>Order and shipping emails (always on)</span></label>
              <label class="in-check-line"><input type="checkbox" id="optDeals"> <span>New parts and install guides</span></label>
            </div>
            <div class="in-sec-row in-sec-danger">
              <div class="in-sec-head">${icon('trash')}<div><b>Delete account</b><span>Order records and any store credit are kept as the law requires. You can get your credit back later by proving it's you.</span></div></div>
              <button class="in-btn in-btn-outline in-btn-sm" type="button" data-preview-msg="On the live store this asks you to confirm with your password, then deletes your account.">Delete my account</button>
            </div>
          </div>`, `<span id="secBadge">${secured() ? '<span class="in-status s5">Protected</span>' : '<span class="in-status s3">Needs setup</span>'}</span>`)}
        </div>
      </div>`,
      after() {
        const nav = document.getElementById('acctNav');
        const links = $$('[data-scroll]', nav);
        const goTo = (id, smooth = true) => {
          const el = document.getElementById(id);
          if (!el) return;
          const top = el.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight + (document.getElementById('inHeader') || { offsetHeight: 0 }).offsetHeight + 12);
          window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
          try { window.history.replaceState(null, '', `#${id}`); } catch (e) { /* ignore */ }
          links.forEach((a) => { if (a.dataset.scroll === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        };
        document.querySelector('.in-account').addEventListener('click', (e) => { const a = e.target.closest('[data-scroll]'); if (a) { e.preventDefault(); goTo(a.dataset.scroll); } });
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => {
            entries.filter((en) => en.isIntersecting).forEach((en) => {
              links.forEach((a) => { if (a.dataset.scroll === en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
              const on = links.find((a) => a.dataset.scroll === en.target.id);
              if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
            });
          }, { rootMargin: '-30% 0px -60% 0px' });
          SECTIONS.forEach(([id]) => io.observe(document.getElementById(id)));
        }
        drawWishlist();
        onWishChange = drawWishlist;
        const hash = window.location.hash.slice(1);
        if (SECTIONS.some(([id]) => id === hash)) setTimeout(() => goTo(hash, false), 60);
        document.getElementById('signOut').addEventListener('click', () => { store.session('in_preview_user', null); window.location.href = url.page('login'); });
        $$('[data-reply]').forEach((f) => f.addEventListener('submit', (e) => {
          e.preventDefault();
          const box = $('textarea', f);
          if (!box.value.trim()) { box.focus(); return; }
          box.value = '';
          toast('Sent to Inlet Performance support (preview)');
        }));
        const refreshSecurity = () => {
          document.getElementById('twoStepState').innerHTML = securityState();
          document.getElementById('creditGuard').innerHTML = creditGuard();
          document.getElementById('secBadge').innerHTML = secured() ? '<span class="in-status s5">Protected</span>' : '<span class="in-status s3">Needs setup</span>';
        };
        // Two-step sign-in setup (sample: any 6 digits works)
        const body = document.getElementById('twoStepBody');
        const start = document.getElementById('twoStepStart');
        if (start) start.addEventListener('click', () => {
          body.innerHTML = `<div class="in-totp"><div class="in-qr" aria-hidden="true"></div><div><p>Scan this with your authenticator app, or type the key:</p><p class="in-totp-key">INPV 7K2M 4QXD 9LTA</p>
            <form class="in-inline-form" id="totpForm" novalidate><input id="totpCode" inputmode="numeric" maxlength="6" placeholder="6-digit code" aria-label="6-digit code" autocomplete="one-time-code"><button class="in-btn in-btn-navy" type="submit">Turn on</button></form><p class="in-form-msg" id="totpMsg" role="status"></p></div></div>`;
          document.getElementById('totpCode').focus();
          document.getElementById('totpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('totpCode').value.trim();
            const msg = document.getElementById('totpMsg');
            if (!/^\d{6}$/.test(code)) { msg.textContent = 'Enter the 6-digit code from your app.'; msg.className = 'in-form-msg is-bad'; return; }
            store.session('in_preview_2fa', true);
            body.innerHTML = '<p class="in-form-msg is-ok">Two-step sign-in is on. Save your recovery codes somewhere safe. (Preview)</p>';
            refreshSecurity();
          });
        });
        const keys = document.getElementById('passkeyList');
        const drawKeys = () => { const list = passkeys(); keys.innerHTML = list.length ? list.map((k) => `<li>${icon('key')}<span>${esc(k)}</span></li>`).join('') : '<li class="in-muted">No passkeys yet.</li>'; };
        drawKeys();
        document.getElementById('addPasskey').addEventListener('click', () => {
          store.session('in_preview_passkeys', [...passkeys(), `This device · added ${niceDate(daysAgo(0))}`]);
          drawKeys();
          refreshSecurity();
          toast('Passkey added (preview: your device would ask for Face ID or your PIN)');
        });
        document.getElementById('addEmailForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = document.getElementById('addEmail').value.trim();
          const msg = document.getElementById('addEmailMsg');
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          msg.textContent = ok ? `We sent a code to ${v}. Enter it to add the email. (Preview: nothing was sent.)` : 'Enter a valid email address.';
          msg.className = `in-form-msg ${ok ? 'is-ok' : 'is-bad'}`;
        });
        document.getElementById('pwForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const msg = document.getElementById('pwMsg');
          const ok = document.getElementById('pw0').value && document.getElementById('pw1').value.length >= 8;
          msg.textContent = ok ? 'Password updated. (Preview: nothing was saved.)' : 'Enter your current password and a new one with 8+ characters.';
          msg.className = `in-form-msg ${ok ? 'is-ok' : 'is-bad'}`;
        });
      },
    };
  };

  PAGES.orderview = () => {
    const o = SAMPLE_ORDERS.find((x) => x.n === params.get('n')) || SAMPLE_ORDERS[1];
    const t = orderTotals(o);
    const u = signedIn();
    const returnLine = o.status < 5 ? 'Returns open once it’s delivered.' : canReturn(o) ? `Returns open until ${niceDate(returnUntil(o))}.` : `The return window closed ${niceDate(returnUntil(o))}. Warranty claims are still open.`;
    return {
      title: `Order ${o.n}`,
      html: `<div class="in-wrap">
        ${crumbs([['Home', url.home], ['My account', url.page('account')], [`Order ${o.n}`]])}
        <div class="in-account-head"><div><h1 class="in-page-title">Order ${o.n}</h1><p class="in-muted">Placed ${niceDate(o.date)} &middot; <span class="in-status s${o.status}">${statusName(o.status)}</span></p></div><a class="in-btn in-btn-outline in-btn-sm" href="${url.page('account')}">${icon('back')}All orders</a></div>
        <section class="in-card-box">${timeline(o.status, o.date)}<p class="in-tracking">${icon('truck')}${o.tracking ? `${esc(o.carrier)} &middot; <b>${esc(o.tracking)}</b>` : 'Tracking is emailed as soon as the label is made.'}</p></section>
        <div class="in-confirm-grid">
          <section class="in-card-box"><h2>Items</h2>
            <ul class="in-co-lines">${o.items.map(([id, q]) => { const p = byId(id); return `<li><span class="in-co-art">${art(p)}<i>${q}</i></span><span><a href="${url.product(p)}">${esc(title(p))}</a></span><b>${money(price(p) * q)}</b></li>`; }).join('')}</ul>
            <dl><div><dt>Subtotal</dt><dd>${money(t.sub)}</dd></div><div><dt>Shipping</dt><dd>${t.ship ? money(t.ship) : 'Free'}</dd></div><div><dt>Sales tax</dt><dd>${money(0)}</dd></div>${t.credit ? `<div class="in-discount"><dt>Store credit</dt><dd>&minus;${money(t.credit)}</dd></div>` : ''}<div class="in-summary-total"><dt>Total</dt><dd>${money(t.total)}</dd></div></dl>
          </section>
          <section class="in-card-box"><h2>Shipped to</h2><p>${esc(u.first)} ${esc(u.last)}<br>1420 Main Street, Apt 3<br>Denver, CO 80202</p><h2>Paid with</h2><p>Visa ending in 4242${t.credit ? ` and ${money(t.credit)} store credit` : ''}</p></section>
          <section class="in-card-box"><h2>Need something?</h2>
            <p class="in-muted in-small">${returnLine}</p>
            <div class="in-stack">
              ${canReturn(o) ? `<a class="in-btn in-btn-navy in-btn-block" href="${url.page('request')}?type=return&n=${o.n}">${icon('returns')}Start a return</a>` : ''}
              ${o.status >= 5 ? `<a class="in-btn in-btn-outline in-btn-block" href="${url.page('request')}?type=warranty&n=${o.n}">${icon('shield')}Warranty claim</a>` : ''}
              ${o.status < 3 ? `<button class="in-btn in-btn-outline in-btn-block" type="button" data-preview-msg="You can cancel before it ships. Refunds to your card have a 5% fee where allowed; choose store credit and there's no fee.">${icon('x')}Cancel order</button>` : ''}
              <a class="in-btn in-btn-outline in-btn-block" href="${url.page('account')}#messages">${icon('chat')}Ask about this order</a>
              ${o.status >= 5 ? `<button class="in-btn in-btn-outline in-btn-block" type="button" data-preview-msg="We email a review link 7 days after delivery. We read every review before it goes up.">${icon('star')}Review your parts</button>` : ''}
            </div>
          </section>
        </div>
      </div>`,
    };
  };

  PAGES.track = () => {
    const n = (params.get('order') || '').trim().toUpperCase();
    const o = n ? (SAMPLE_ORDERS.find((x) => x.n === n) || (/^INL-\d{6}$/.test(n) ? { n, date: daysAgo(0), status: 1, carrier: 'UPS Ground', tracking: '' } : null)) : null;
    return {
      title: 'Track your order',
      html: `<div class="in-wrap in-track">
        <div class="in-track-card">
          <span class="in-modal-icon">${icon('truck')}</span>
          <h1>Track your order</h1>
          <p class="in-muted">Enter the order number from your receipt (it starts with INL-).</p>
          <form class="in-track-form" action="${url.page('track')}" method="get" novalidate>
            <label class="in-field"><span>Order number</span><input name="order" value="${esc(n)}" placeholder="INL-104590" required></label>
            <label class="in-field"><span>Email or ZIP code</span><input name="check" value="${esc(params.get('check') || '')}" placeholder="you@email.com"></label>
            <button class="in-btn in-btn-primary in-btn-lg" type="submit">Track</button>
          </form>
        </div>
        ${n ? (o ? `<section class="in-card-box in-track-result"><div class="in-track-result-head"><div><p class="in-eyebrow">Order ${esc(o.n)}</p><h2>${statusName(o.status)}</h2></div><span class="in-status s${o.status}">${statusName(o.status)}</span></div>${timeline(o.status, o.date)}<p class="in-tracking">${icon('truck')}${o.tracking ? `${esc(o.carrier)} &middot; <b>${esc(o.tracking)}</b>` : 'Tracking is emailed as soon as the label is made.'}</p>${o.status >= 5 ? `<p class="in-track-more"><a class="in-btn in-btn-outline in-btn-sm" href="${url.page('request')}?n=${o.n}&type=${canReturn(o) ? 'return' : 'warranty'}">${canReturn(o) ? 'Start a return' : 'Start a warranty claim'}</a></p>` : ''}</section>` : `<div class="in-empty">${icon('search')}<h2>No order matches ${esc(n)}</h2><p>Check the number on your receipt email. Sample numbers: ${SAMPLE_ORDERS.map((x) => `<a href="${url.page('track')}?order=${x.n}">${x.n}</a>`).join(', ')}.</p></div>`) : ''}
      </div>`,
    };
  };

  // Returns and warranty claims: from the account, or as a guest with order number + email.
  PAGES.request = () => {
    const type = params.get('type') === 'warranty' ? 'warranty' : 'return';
    const n = (params.get('n') || '').trim().toUpperCase();
    const o = SAMPLE_ORDERS.find((x) => x.n === n);
    const isReturn = type === 'return';
    const tabsHtml = `<div class="in-chips in-req-tabs" role="navigation" aria-label="Request type"><a class="in-chip${isReturn ? ' is-on' : ''}" href="${url.page('request')}?type=return${o ? `&n=${o.n}` : ''}">Return</a><a class="in-chip${isReturn ? '' : ' is-on'}" href="${url.page('request')}?type=warranty${o ? `&n=${o.n}` : ''}">Warranty claim</a></div>`;
    const head = `<section class="in-info-head"><div class="in-wrap">${crumbs([['Home', url.home], ['Returns & warranty claims']])}<p class="in-eyebrow">Help</p><h1 class="in-page-title">${isReturn ? 'Start a return' : 'Warranty claim'}</h1><p class="in-page-sub">${isReturn ? `Unused, uninstalled parts within ${RETURN_DAYS} days of delivery. The return label is free.` : 'A part failed or arrived broken? We replace first.'}</p></div></section>`;
    if (!o) {
      return {
        title: isReturn ? 'Start a return' : 'Warranty claim',
        html: `${head}<div class="in-wrap in-request">${tabsHtml}
          <form class="in-card-box in-lookup" action="${url.page('request')}" method="get" novalidate>
            <h2>Find your order</h2>
            <input type="hidden" name="type" value="${type}">
            <label class="in-field"><span>Order number</span><input name="n" value="${esc(n)}" placeholder="INL-104590" required></label>
            <label class="in-field"><span>Email used for the order</span><input name="email" type="email" placeholder="you@email.com"></label>
            <button class="in-btn in-btn-primary" type="submit">Continue</button>
            ${n ? `<p class="in-form-msg is-bad">We couldn't find ${esc(n)}. Check your receipt email.</p>` : ''}
            <p class="in-muted in-small">Signed in? Your orders are in <a href="${url.page('account')}">your account</a>. Sample orders: ${SAMPLE_ORDERS.filter((x) => x.status >= 5).map((x) => `<a href="${url.page('request')}?type=${type}&n=${x.n}">${x.n}</a>`).join(', ')}.</p>
          </form></div>`,
      };
    }
    const blocked = isReturn && !canReturn(o)
      ? (o.status < 5 ? 'You can start a return once this order is delivered.' : `The ${RETURN_DAYS}-day return window for this order closed ${niceDate(returnUntil(o))}. If a part failed or arrived broken, start a warranty claim instead.`)
      : (!isReturn && o.status < 5 ? 'Warranty claims open once the order is delivered.' : '');
    const REASONS = isReturn
      ? [['changed', 'Changed my mind'], ['wrong-order', 'Ordered the wrong part'], ['nofit', "Doesn't fit my car"], ['damaged', 'Arrived damaged'], ['wrong-item', 'You sent the wrong item'], ['other', 'Something else']]
      : [['cracked', 'Cracked weld or crack'], ['warped', 'Warped flange or leak'], ['broken', 'Part broke or failed'], ['other', 'Something else']];
    const OUR_FAULT = ['damaged', 'wrong-item'];
    return {
      title: isReturn ? `Return for ${o.n}` : `Warranty claim for ${o.n}`,
      html: `${head}<div class="in-wrap in-request">${tabsHtml}
        <p class="in-req-order">${icon('box')}Order <b>${o.n}</b> &middot; placed ${niceDate(o.date)}${deliveredOn(o) ? ` &middot; delivered ${niceDate(deliveredOn(o))}` : ''}</p>
        ${blocked ? `<div class="in-callout">${icon('clock')}<div><b>${isReturn ? 'Return not available' : 'Not yet'}</b><p>${blocked}</p>${isReturn && o.status >= 5 ? `<p><a class="in-btn in-btn-navy in-btn-sm" href="${url.page('request')}?type=warranty&n=${o.n}">Start a warranty claim</a></p>` : ''}</div></div>` : `
        <form class="in-req-grid" id="reqForm" novalidate>
          <div class="in-req-main">
            <section class="in-card-box"><h2>Which parts?</h2>
              <ul class="in-req-items">${o.items.map(([id, q]) => { const p = byId(id); return `<li><label class="in-check"><input type="checkbox" data-item="${id}"><span class="in-mini-art">${art(p)}</span><span>${esc(title(p))}<small>${money(price(p))} each${isReturn ? '' : ` &middot; ${esc(p.warranty)} warranty`}</small></span></label>${q > 1 ? `<label class="in-select"><span>Qty</span><select data-qty="${id}">${Array.from({ length: q }, (_, k) => `<option>${k + 1}</option>`).join('')}</select></label>` : ''}</li>`; }).join('')}</ul>
              <em class="in-field-err" id="itemsErr"></em>
            </section>
            <section class="in-card-box"><h2>${isReturn ? 'Why are you returning it?' : 'What went wrong?'}</h2>
              <label class="in-field"><span>Reason</span><select id="reason"><option value="">Choose a reason</option>${REASONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><em class="in-field-err" id="reasonErr"></em></label>
              <label class="in-field"><span>Tell us more${isReturn ? ' (optional)' : ''}</span><textarea id="details" rows="4" placeholder="${isReturn ? 'Anything we should know' : 'When did it happen, and how is the part installed?'}"></textarea><em class="in-field-err" id="detailsErr"></em></label>
              <label class="in-field in-upload"><span>Photos or video ${isReturn ? '(needed if it arrived damaged or wrong)' : '(needed)'}</span><input type="file" id="photos" multiple accept="image/*,video/*,application/pdf"><em class="in-field-err" id="photosErr"></em></label>
              <ul class="in-file-list" id="fileList"></ul>
            </section>
            ${isReturn ? `<section class="in-card-box"><h2>How should we refund you?</h2>
              <label class="in-radio-card"><input type="radio" name="refund" value="card" checked><span><b>Original payment</b><small id="cardNote">5% restocking fee</small></span><em id="cardAmt"></em></label>
              <label class="in-radio-card"><input type="radio" name="refund" value="credit"><span><b>Inlet Performance store credit</b><small>No fee &middot; never expires &middot; needs two-step sign-in or a passkey</small></span><em id="creditAmt"></em></label>
            </section>` : `<section class="in-card-box"><h2>What happens next</h2><ol class="in-steps-list"><li><b>We review it</b><span>Usually within one business day. We may ask for more photos.</span></li><li><b>Send it back if needed</b><span>If we need the part, we email a free return label.</span></li><li><b>We replace it</b><span>Replacement comes first. If we're out, you're first in line for the next delivery.</span></li></ol></section>`}
          </div>
          <aside class="in-card-box in-req-summary"><h2>Summary</h2>
            <dl id="reqSummary"></dl>
            <button class="in-btn in-btn-primary in-btn-lg in-btn-block" type="submit">${isReturn ? 'Request return' : 'Send claim'}</button>
            <p class="in-muted in-small">${isReturn ? 'Tax is refunded in proportion. Parts that were used or broken in use go through warranty instead.' : 'Warranty covers the original buyer. It doesn’t change any rights you have by law.'}</p>
          </aside>
        </form>
        <div id="reqDone" hidden></div>`}
      </div>`,
      after() {
        const form = document.getElementById('reqForm');
        if (!form) return;
        const $id = (id) => document.getElementById(id);
        const picked = () => $$('[data-item]').filter((c) => c.checked).map((c) => { const sel = $(`[data-qty="${c.dataset.item}"]`); return { p: byId(c.dataset.item), qty: sel ? Number(sel.value) : 1 }; });
        const calc = () => {
          const value = picked().reduce((a, x) => a + price(x.p) * x.qty, 0);
          const waived = OUR_FAULT.includes($id('reason').value);
          const fee = isReturn && !waived ? Math.round(value * RESTOCK * 100) / 100 : 0;
          return { value, fee, waived };
        };
        const draw = () => {
          const { value, fee, waived } = calc();
          if (isReturn) {
            const toCard = $$('input[name="refund"]').find((r) => r.checked).value === 'card';
            $id('cardNote').textContent = waived ? 'No fee: this one is on us' : '5% restocking fee';
            $id('cardAmt').textContent = money(value - fee);
            $id('creditAmt').textContent = money(value);
            $id('reqSummary').innerHTML = `<div><dt>Parts</dt><dd>${money(value)}</dd></div>${toCard && fee ? `<div><dt>Restocking fee (5%)</dt><dd>&minus;${money(fee)}</dd></div>` : ''}<div><dt>Return label</dt><dd><b class="in-free">Free</b></dd></div><div class="in-summary-total"><dt>${toCard ? 'Back to your card' : 'Store credit'}</dt><dd>${money(toCard ? value - fee : value)}</dd></div>`;
          } else {
            $id('reqSummary').innerHTML = `<div><dt>Parts</dt><dd>${picked().reduce((a, x) => a + x.qty, 0) || 0}</dd></div><div><dt>Remedy</dt><dd>Replacement</dd></div><div><dt>Return label</dt><dd><b class="in-free">Free if needed</b></dd></div>`;
          }
        };
        form.addEventListener('change', (e) => {
          if (e.target.id === 'photos') $id('fileList').innerHTML = Array.from(e.target.files || []).map((f) => `<li>${icon('upload')}${esc(f.name)}</li>`).join('');
          ['itemsErr', 'reasonErr', 'photosErr', 'detailsErr'].forEach((k) => { $id(k).textContent = ''; });
          draw();
        });
        draw();
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const reason = $id('reason').value;
          const needPhotos = !isReturn || OUR_FAULT.includes(reason);
          let ok = true;
          if (!picked().length) { $id('itemsErr').textContent = 'Pick at least one part.'; ok = false; }
          if (!reason) { $id('reasonErr').textContent = 'Choose a reason.'; ok = false; }
          if (!isReturn && $id('details').value.trim().length < 10) { $id('detailsErr').textContent = 'Tell us what happened (10+ characters).'; ok = false; }
          if (needPhotos && !($id('photos').files || []).length) { $id('photosErr').textContent = 'Add at least one photo or video.'; ok = false; }
          if (!ok) return;
          const ref = `${isReturn ? 'INL-R' : 'INL-W'}-${String(Date.now()).slice(-5)}`;
          form.hidden = true;
          const done = $id('reqDone');
          done.hidden = false;
          done.innerHTML = `<div class="in-card-box in-req-done"><span class="in-confirm-check">${icon('check')}</span><h2>Request ${ref} sent</h2><p>${isReturn ? 'We review it within one business day, then email your free return label. Your refund goes out once the part is back and checked.' : 'We review it within one business day and email you what happens next.'}</p><p class="in-preview-flag">Design preview: nothing was sent or uploaded.</p><a class="in-btn in-btn-outline" href="${url.page('account')}">Back to my account</a></div>`;
          done.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
      },
    };
  };

  // ------------------------------------------------------------------ help, company and legal pages
  const SAMPLE_LEGAL = '<p class="in-sample-note">Sample text for the design preview. Replace with Inlet Performance’s real policy before launch.</p>';
  const INFO = {
    about: {
      title: 'About us', kicker: 'Our story', lead: 'Fewer parts, made carefully, explained plainly.',
      body: () => `<p>Inlet Performance began at a small shop near the water, building exhaust for people who keep their cars for a long time. We would rather sell one part that lasts than three that don't, so the catalog is short and every part on it has its specs written down.</p>
        <div class="in-values">${[['compass', 'Chosen carefully', 'A short catalog of parts we would put on our own cars.'], ['scale', 'Easy to compare', 'Price, fit, materials and warranty, side by side.'], ['truck', `Free shipping over $${FREE_SHIP}`, 'To the lower 48 states, with tracking on every order.'], ['shield', 'Warranty on every part', 'If a weld cracks or a flange warps, we replace it first.']].map(([ic, h, t]) => `<div>${icon(ic)}<h3>${h}</h3><p>${t}</p></div>`).join('')}</div>
        <div class="in-stat-band"><div><b>${P.length}</b><span>parts, chosen carefully</span></div><div><b>4.7</b><span>average rating</span></div><div><b>24/7</b><span>help by chat or email</span></div></div>
        <p>If something isn't right, write to us. We read every message and get back to you.</p>`,
    },
    contact: {
      title: 'Contact us', kicker: 'Help', lead: 'Chat or email any time. We answer promptly and we’re here to help with anything about your order or your car.',
      body: () => `<div class="in-contact-grid">
        <form class="in-contact-form" id="contactForm" novalidate>
          <div class="in-field-row"><label class="in-field"><span>Name</span><input id="cName" autocomplete="name" required><em class="in-field-err" id="cNameErr"></em></label><label class="in-field"><span>Email</span><input id="cEmail" type="email" autocomplete="email" required><em class="in-field-err" id="cEmailErr"></em></label></div>
          <div class="in-field-row"><label class="in-field"><span>Order number (optional)</span><input id="cOrder" placeholder="INL-104590"></label><label class="in-field"><span>Topic</span><select id="cTopic"><option>Fitment question</option><option>Order status</option><option>Return or exchange</option><option>Warranty claim</option><option>Something else</option></select></label></div>
          <label class="in-field"><span>Message</span><textarea id="cMsg" rows="6" required></textarea><em class="in-field-err" id="cMsgErr"></em></label>
          <button class="in-btn in-btn-primary in-btn-lg" type="submit">Send message</button>
          <p class="in-form-msg" id="contactMsg" role="status"></p>
        </form>
        <div class="in-contact-side">
          <div class="in-card-box">${icon('chat')}<h3>Help 24/7</h3><p>Chat from any page, or send this form. Orders, fit, returns or anything else, we’re here to help.</p><button class="in-btn in-btn-navy in-btn-sm" type="button" data-open-chat>Open chat</button></div>
          <div class="in-card-box">${icon('wrench')}<h3>Fitment questions</h3><p>Include your year, make, model and engine. A VIN is even better.</p></div>
          <div class="in-card-box">${icon('truck')}<h3>Where's my order?</h3><p><a href="${url.page('track')}">Track it here</a> with your order number.</p></div>
        </div>
      </div>`,
      after() {
        document.getElementById('contactForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const rules = [['cName', (x) => Boolean(x) || 'Enter your name.'], ['cEmail', (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) || 'Enter a valid email.'], ['cMsg', (x) => x.length >= 10 || 'Tell us a bit more (10+ characters).']];
          let bad = null;
          rules.forEach(([id, test]) => { const el = document.getElementById(id); const r = test(el.value.trim()); document.getElementById(`${id}Err`).textContent = r === true ? '' : r; if (r !== true && !bad) bad = el; });
          const msg = document.getElementById('contactMsg');
          if (bad) { bad.focus(); msg.textContent = ''; return; }
          msg.textContent = 'Thanks. You’ll get an answer by email, and it will show up under Messages in your account. (Preview: nothing was sent.)';
          msg.className = 'in-form-msg is-ok';
          e.target.reset();
        });
      },
    },
    reviews: {
      title: 'Customer reviews', kicker: 'Reviews', lead: 'What people say after the parts are on the car.',
      body: () => {
        const total = P.reduce((a, p) => a + p.reviewCount, 0);
        const avg = (P.reduce((a, p) => a + CAT.reviewsFor(p).reduce((b, r) => b + r.rating, 0), 0) / total).toFixed(1);
        return `<div class="in-reviews-top"><div><p class="in-big-score">${avg}</p>${stars(Number(avg))}<p>${total.toLocaleString()} reviews across ${P.length} parts</p></div>
          <div class="in-chips" id="revChips"><button type="button" class="in-chip is-on" data-rcat="">All</button>${CAT.categories.map((c) => `<button type="button" class="in-chip" data-rcat="${c.id}">${esc(c.name)}</button>`).join('')}</div></div>
          <div class="in-review-tools"><p class="in-review-count" id="revCount"></p><label class="in-select"><span>Sort</span><select id="revSort"><option value="new">Most recent</option><option value="high">Highest rated</option><option value="low">Lowest rated</option></select></label></div><div class="in-review-wall" id="revWall"></div><div class="in-review-more"><button class="in-btn in-btn-outline" type="button" id="revMore"></button><button class="in-btn in-btn-outline" type="button" id="revAll"></button></div>`;
      },
      after() {
        // Every review from every part, newest first, a page at a time; the chips narrow it to one kind of part.
        const all = P.flatMap((p) => CAT.reviewsFor(p).map((r) => ({ ...r, p })));
        const card = (r) => `<article class="in-review" data-rc="${r.p.category}"><div class="in-review-top">${stars(r.rating)}<b>${esc(r.title)}</b></div><p>${esc(r.body)}</p><p class="in-review-by">${esc(r.name)}${r.vehicle ? ` &middot; ${esc(r.vehicle)}` : ''} &middot; ${niceDate(r.date)}</p><a class="in-review-product" href="${url.product(r.p)}"><span class="in-mini-art">${art(r.p)}</span>${esc(title(r.p))}</a></article>`;
        const wall = CAT.pageReviews({ reviews: all, card: card, list: document.getElementById('revWall'), count: document.getElementById('revCount'), more: document.getElementById('revMore'), all: document.getElementById('revAll'), sort: document.getElementById('revSort'), first: 24, step: 24 });
        $$('[data-rcat]').forEach((b) => b.addEventListener('click', () => {
          $$('[data-rcat]').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
          wall.filter(b.dataset.rcat ? (r) => r.p.category === b.dataset.rcat : null);
        }));
      },
      wide: true,
    },
    shipping: {
      title: 'Shipping', kicker: 'Help', lead: `Free shipping to the lower 48 states on orders of $${FREE_SHIP} or more.`,
      body: () => `${SAMPLE_LEGAL}<table class="in-table in-ship-table"><thead><tr><th>Where it's going</th><th>Shipping</th></tr></thead><tbody>
          <tr><td>Lower 48 states</td><td>Free on orders of $${FREE_SHIP}+, otherwise $${SHIP_FLAT}</td></tr>
          <tr><td>Alaska and Hawaii</td><td>$${SHIP_ZONES.akhi[1]}</td></tr>
          <tr><td>Canada</td><td>$${SHIP_ZONES.ca[1]}</td></tr>
          <tr><td>Other countries we ship to</td><td>$${SHIP_ZONES.intl[1]}</td></tr></tbody></table>
        <h2>How it ships</h2><p>Every order ships with tracking from our warehouse, using the best carrier for where it's going. You get an email with the tracking number as soon as the label is made. Big orders can ship in more than one box, each with its own tracking.</p>
        <h2>Outside the US</h2><p>Import duties, taxes and brokerage fees are set by your country, are paid by you on delivery and are not included in our prices or shipping.</p>
        <h2>Damaged in shipping</h2><p>Send photos of the box and the part through a <a href="${url.page('request')}?type=return">return request</a> and we'll sort it out. Keep the packaging until it's settled.</p>`,
    },
    refund: {
      title: 'Returns & refunds', kicker: 'Help', lead: `${RETURN_DAYS} days to send back a part you haven't used. The return label is free.`,
      body: () => `${SAMPLE_LEGAL}<ol class="in-steps-list"><li><b>Start the return</b><span>From your account, open the order and press Start a return. No account? <a href="${url.page('request')}?type=return">Start it with your order number and email</a>.</span></li><li><b>Tell us why, add photos</b><span>Pick the parts and the reason. Photos are needed if a part arrived damaged or wrong.</span></li><li><b>Ship it free</b><span>Once we approve it, we email you a prepaid return label.</span></li><li><b>Get your refund</b><span>We check the part when it arrives, then refund you the way you chose.</span></li></ol>
        <h2>What can be returned</h2><p>Parts that are unused and uninstalled, within ${RETURN_DAYS} days of delivery. Test-fitting a part without running it is fine. A part that broke while in use is a <a href="${url.page('warranty')}">warranty claim</a>, not a return.</p>
        <h2>Your refund</h2><table class="in-table"><tbody>
          <tr><th scope="row">Back to your card</th><td>Minus a 5% restocking fee</td></tr>
          <tr><th scope="row">As Inlet Performance store credit</th><td>Full amount, no fee</td></tr>
          <tr><th scope="row">Our mistake (damaged, wrong item, defect)</th><td>No fee either way</td></tr></tbody></table>
        <p>Tax is refunded in proportion to what you return. If you paid partly with store credit, that part comes back as credit.</p>
        <h2>Cancelling an order</h2><p>You can cancel before it ships. Refunds to your card have the same 5% fee where allowed; choose store credit and there's no fee. If we cancel, or a delay means you're owed a full refund, there's no fee.</p>`,
    },
    warranty: {
      title: 'Warranty', kicker: 'Help', lead: 'Every part has a warranty. We replace first.',
      body: () => `${SAMPLE_LEGAL}<p>Each part's warranty period is listed on its page, under Specs. It covers defects in materials and workmanship, like a cracked weld or a warped flange, for the original buyer.</p>
        <h2>Making a claim</h2><ol class="in-steps-list"><li><b>Start a claim</b><span>From your account, or <a href="${url.page('request')}?type=warranty">with your order number and email</a>. Your receipt works too.</span></li><li><b>Show us</b><span>Add photos or a short video. Sometimes we'll need the part back, and we send a free label for it.</span></li><li><b>Get a replacement</b><span>If we're out of stock, you're first in line when the next ones arrive. You keep the rest of your original warranty on the replacement.</span></li></ol>
        <h2>Not covered</h2><ul class="in-bullets"><li>Damage from installation mistakes, accidents or impacts</li><li>Discoloring from heat (normal on stainless)</li><li>Parts that have been modified</li><li>Labor, tuning or other costs</li></ul>
        <p>This warranty doesn't take away any rights you have by law.</p>`,
    },
    faq: {
      title: 'FAQ', kicker: 'Help', lead: 'Quick answers to what people ask most.',
      body: () => `<div class="in-faq">${[
        ['How do I know a part fits my car?', `Every part lists the years, models and engine it fits, right under the price. Still not sure? <a href="${url.page('contact')}">Send us your VIN</a> and we'll confirm before you order.`],
        ['How much is shipping?', `Free to the lower 48 states on orders of $${FREE_SHIP}+, otherwise $${SHIP_FLAT}. Alaska and Hawaii $${SHIP_ZONES.akhi[1]}, Canada $${SHIP_ZONES.ca[1]}, other countries $${SHIP_ZONES.intl[1]}. <a href="${url.page('shipping')}">Shipping details</a>.`],
        ['Do you ship outside the US?', `Yes, to Canada and many other countries. Import duties and taxes are paid by you on delivery.`],
        ['Can I return a part?', `Yes, within ${RETURN_DAYS} days of delivery if it's unused and uninstalled. The return label is free. Refunds to your card have a 5% restocking fee; store credit has none. <a href="${url.page('refund')}">Return policy</a>.`],
        ['What is store credit?', 'Money in your Inlet Performance account from a refund you chose to take as credit. It never expires, works on anything (including shipping), and is protected by two-step sign-in or a passkey.'],
        ['Do I need a tune for a downpipe?', 'On most turbo cars, yes. Without one the car may run poorly or show a check engine light.'],
        ['Are your parts street legal?', 'Parts marked for off-road use are for off-road and competition vehicles only. Check your state’s emissions laws before installing.'],
        ['Can I change or cancel my order?', 'Yes, before it ships. Message us right away. Refunds to your card have a 5% fee where allowed; store credit has none.'],
        ['Do you sell gift cards?', 'Not right now.'],
        ['Do you offer a military discount?', `Yes. See the <a href="${url.page('military')}">military discount page</a>.`],
      ].map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div>`,
    },
    military: {
      title: 'Military discount', kicker: 'Company', lead: '10% off for active duty, veterans, Guard and Reserve.',
      body: () => `<div class="in-callout">${icon('medal')}<div><b>Thank you for your service.</b><p>Get 10% off every order, with no limit on how often you use it.</p></div></div>
        <ol class="in-steps-list"><li><b>Send proof</b><span>Use the <a href="${url.page('contact')}">contact form</a> and pick Something else. A photo of a military ID or DD-214 with personal numbers covered is fine.</span></li><li><b>Get your code</b><span>We reply with a personal code within one business day.</span></li><li><b>Save on every order</b><span>Enter the code at checkout.</span></li></ol>`,
    },
    social: {
      title: 'Social', kicker: 'Company', lead: 'Builds, installs and new parts. Tag yours with #InletBuilt.',
      body: () => `<div class="in-social-cards">${[['camera', 'Instagram', 'Build photos and new parts'], ['play', 'YouTube', 'Install walk-throughs and sound clips'], ['bolt', 'TikTok', 'Quick before-and-after sound checks'], ['chat', 'Facebook', 'Group for owners and questions']].map(([ic, n, t]) => `<div class="in-card-box">${icon(ic)}<h3>${n}</h3><p>${t}</p><span class="in-soon">Coming soon</span></div>`).join('')}</div>
        <h2>From the community</h2>
        <div class="in-builds">${[['wrx-08-14-downpipe', '2011 WRX', '3" downpipe and a pro tune'], ['accord-94-97-header', '1996 Accord', 'The $100 header, installed in an afternoon'], ['370z-09-20-test-pipes', '2015 370Z', 'Test pipes for track days'], ['civic-06-11-intake', '2009 Civic', 'Intake and a cleaner sound'], ['mustang-gt-11-14-x-pipe', '2013 Mustang GT', 'X-pipe for the crossover rasp'], ['miata-99-05-intake', '2003 Miata', 'Weekend autocross build']].map(([id, car, cap]) => `<a class="in-build" href="${url.product(byId(id))}"><span>${art(byId(id))}</span><b>${car}</b><small>${cap}</small></a>`).join('')}</div>`,
      wide: true,
    },
    privacy: {
      title: 'Privacy policy', kicker: 'Legal', lead: 'What we collect, why, and what you can do about it.',
      body: () => `${SAMPLE_LEGAL}<h2>What we collect</h2><p>Your name, email, shipping address and phone number when you order. Your order history, wishlist and support messages if you make an account. Basic device and browsing data to keep the site working.</p>
        <h2>Your Inlet Performance account is only for Inlet Performance</h2><p>Your account, orders, store credit and emails here are kept separate from any other store.</p>
        <h2>How we use it</h2><p>To fill and ship orders, answer questions, prevent fraud and, if you opt in, send deal emails.</p>
        <h2>Who we share it with</h2><p>Only the companies that help us run the store: our payment processor, shipping carriers and email provider. We never sell your information.</p>
        <h2>Payments</h2><p>Card details go straight to our payment processor. Inlet Performance never sees or stores your full card number.</p>
        <h2>Your choices</h2><p>Deal emails are only sent if you opt in, and you can unsubscribe at any time. You can delete your account yourself; order and payment records are kept as the law requires. Ask us to see or correct your data through the <a href="${url.page('contact')}">contact page</a>.</p>`,
    },
    terms: {
      title: 'Terms & conditions', kicker: 'Legal', lead: 'The rules for buying from Inlet Performance.',
      body: () => `${SAMPLE_LEGAL}<h2>Orders</h2><p>An order is accepted when it ships. We may cancel an order with a pricing or stock error and refund it in full.</p>
        <h2>Prices</h2><p>Prices are in US dollars and can change without notice. The price at checkout is the price you pay.</p>
        <h2>Installation and use</h2><p>Performance parts should be installed by someone qualified. You are responsible for following the laws where you drive, including emissions laws.</p>
        <h2>Off-road parts</h2><p>Parts marked for off-road use may not be installed on vehicles driven on public roads. See the <a href="${url.page('vcw')}">vehicle compliance waiver</a>.</p>
        <h2>Returns, cancellations and store credit</h2><p>See the <a href="${url.page('refund')}">return policy</a>. Store credit can only be used at Inlet Performance, doesn't expire and can't be exchanged for cash unless the law requires it.</p>
        <h2>Limits</h2><p>Our responsibility is limited to the price you paid for the part, except where the law says otherwise.</p>`,
    },
    vcw: {
      title: 'Vehicle compliance waiver', kicker: 'Legal', lead: 'Read this before buying parts marked for off-road use.',
      body: () => `${SAMPLE_LEGAL}<p>Some parts on this site, including catless downpipes and test pipes, change or remove emissions equipment. They are sold for off-road and competition vehicles only.</p>
        <h2>By buying an off-road part you confirm that</h2><ul class="in-bullets"><li>The part will be installed on a vehicle that is not driven on public roads</li><li>You understand federal and state emissions laws and will follow them</li><li>You are responsible for any fines, failed inspections or warranty loss that come from installing the part</li></ul>
        <h2>California and similar states</h2><p>These parts are not legal for use on public roads in California or states that follow California emissions rules.</p>`,
    },
    cua: {
      title: 'Consumer use agreement', kicker: 'Legal', lead: 'How Inlet Performance parts are meant to be used.',
      body: () => `${SAMPLE_LEGAL}<p>Performance parts change how a vehicle runs. Installing them can affect drivability, emissions, noise and manufacturer warranties.</p>
        <h2>You agree to</h2><ul class="in-bullets"><li>Have parts installed by a qualified person</li><li>Check fitment before installing</li><li>Use parts only where it is legal to do so</li><li>Stop using a part that is damaged or not working correctly</li></ul>`,
    },
    prop65: {
      title: 'Proposition 65', kicker: 'Legal', lead: 'Information for California customers.',
      body: () => `${SAMPLE_LEGAL}<div class="in-callout in-callout-warn">${icon('shield')}<div><b>WARNING</b><p>These products can expose you to chemicals including nickel and chromium (hexavalent compounds), which are known to the State of California to cause cancer. For more information go to www.P65Warnings.ca.gov.</p></div></div>
        <p>Stainless steel exhaust parts contain nickel and chromium. Wear gloves when handling and cutting parts, and wash your hands after installation.</p>`,
    },
  };
  const INFO_NAV = [['Help', HELP_LINKS.filter(([, k]) => k !== 'track' && k !== 'request')], ['Company', COMPANY_LINKS], ['Legal', LEGAL_LINKS]];

  Object.entries(INFO).forEach(([key, info]) => {
    PAGES[key] = () => ({
      title: info.title,
      html: `<section class="in-info-head"><div class="in-wrap">${crumbs([['Home', url.home], [info.title]])}<p class="in-eyebrow">${esc(info.kicker)}</p><h1 class="in-page-title">${esc(info.title)}</h1><p class="in-page-sub">${esc(info.lead)}</p></div></section>
        <div class="in-wrap in-info${info.wide ? ' is-wide' : ''}">
          ${info.wide ? '' : `<nav class="in-info-nav" aria-label="Help pages">${INFO_NAV.map(([group, links]) => `<p>${group}</p><ul>${links.map(([label, k]) => `<li><a href="${url.page(k)}"${k === key ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('')}</ul>`).join('')}</nav>`}
          <article class="in-prose">${info.body()}</article>
        </div>`,
      after: info.after,
    });
  });

  // Inlet Performance's transactional email designs (each store sends its own, from its own domain).
  PAGES.emails = () => {
    const o = SAMPLE_ORDERS[1];
    const t = orderTotals(o);
    const u = signedIn();
    const btn = (label) => `<span class="in-mail-btn">${label}</span>`;
    const itemRows = o.items.map(([id, q]) => { const p = byId(id); return `<tr><td class="in-mail-art">${art(p)}</td><td>${esc(title(p))}<small>Qty ${q}</small></td><td>${money(price(p) * q)}</td></tr>`; }).join('');
    const mail = (id, label, subject, inner) => `<section class="in-mail-wrap" id="${id}">
      <p class="in-mail-label">${label}</p>
      <div class="in-mail-meta"><p><b>From</b> Inlet Performance</p><p><b>Subject</b> ${subject}</p></div>
      <div class="in-mail">
        <div class="in-mail-top"><span class="in-logo">${logo(true)}</span></div>
        <div class="in-mail-rails" aria-hidden="true"></div>
        <div class="in-mail-body">${inner}</div>
        <div class="in-mail-foot"><p><b>Inlet Performance</b> &middot; Help 24/7: reply to this email or chat on the site</p><p>You're getting this email because you ordered from Inlet Performance.</p></div>
      </div>
    </section>`;
    const list = [
      ['confirm', 'Order confirmed', `Order ${o.n} confirmed`, `<h1>Thanks, ${esc(u.first)}. We've got your order.</h1><p>We'll email tracking as soon as it ships.</p>
        <table class="in-mail-items">${itemRows}</table>
        <table class="in-mail-totals"><tr><td>Subtotal</td><td>${money(t.sub)}</td></tr><tr><td>Shipping</td><td>${t.ship ? money(t.ship) : 'Free'}</td></tr><tr class="is-total"><td>Total</td><td>${money(t.total)}</td></tr></table>${btn('View your order')}`],
      ['shipped', 'Shipped', 'Your Inlet Performance order is on the way', `<h1>It's on the way.</h1><p>Order ${o.n} left our warehouse.</p><div class="in-mail-box"><small>${esc(o.carrier)}</small><b>${esc(o.tracking)}</b></div>${btn('Track package')}<p class="in-mail-small">Big orders can ship in more than one box. Each one gets its own tracking email.</p>`],
      ['return', 'Return approved', 'Return approved: your free label is ready', `<h1>Your return is approved.</h1><ol class="in-mail-steps"><li>Print the label below.</li><li>Pack the part, in its original box if you can.</li><li>Drop it off with the carrier within 7 days.</li></ol>${btn('Download return label')}<p class="in-mail-small">We'll refund you the way you chose once the part is back and checked: to your card (minus the 5% restocking fee) or as store credit with no fee.</p>`],
      ['credit', 'Store credit added', 'You have $25.00 in Inlet Performance store credit', `<h1>$25.00 store credit added.</h1><div class="in-mail-box in-mail-credit"><small>Your balance</small><b>${money(25)}</b></div><p>From your return on order INL-103871. It never expires and works on anything at Inlet Performance, including shipping.</p><p class="in-mail-small">To use it you'll confirm with your passkey or authenticator app, so only you can spend it.</p>${btn('See your store credit')}`],
      ['review', 'Review request (7 days after delivery)', `How's the ${esc(title(byId(o.items[0][0])))}?`, `<h1>How's it going on the car?</h1><p>Rate your ${esc(title(byId(o.items[0][0])))}. It helps other people pick the right part.</p><p class="in-mail-stars">${[1, 2, 3, 4, 5].map((n) => `<span aria-label="${n} stars">&#9733;</span>`).join('')}</p><p class="in-mail-small">We read every review before it's posted, good or bad.</p>`],
    ];
    return {
      title: 'Email designs',
      html: `<section class="in-info-head"><div class="in-wrap">${crumbs([['Home', url.home], ['Email designs']])}<p class="in-eyebrow">Design preview</p><h1 class="in-page-title">Inlet Performance emails</h1><p class="in-page-sub">How Inlet Performance's order emails look. Each store sends its own, from its own address.</p></div></section>
        <div class="in-wrap in-mails">
          <div class="in-chips">${list.map(([id, label]) => `<a class="in-chip" href="#${id}">${label.replace(/ \(.*\)/, '')}</a>`).join('')}</div>
          <div class="in-mail-grid">${list.map(([id, label, subject, inner]) => mail(id, label, subject, inner)).join('')}</div>
        </div>`,
    };
  };

  PAGES.notfound = () => ({ title: 'Page not found', html: `<div class="in-wrap"><div class="in-empty">${icon('search')}<h1>Off the chart</h1><p>Try the search, or head back home.</p><a class="in-btn in-btn-primary" href="${url.home}">Go home</a></div></div>` });


  // ------------------------------------------------------------------ render and global events
  function addToCart(id, qty = 1) {
    const p = byId(id);
    if (!p || p.stock <= 0) return;
    cart.add(id, qty);
    if (onCartChange) onCartChange();
    closeCompare();
    if (document.body.dataset.page === 'cart') toast(`Added ${title(p)}`); else showMiniBag(id, qty);
  }

  function render() {
    const root = document.getElementById('in-root');
    const key = document.body.dataset.page;
    const view = (PAGES[key] || PAGES.notfound)();
    document.title = `${view.title} | ${BRAND}`;
    const checkoutChrome = view.chrome === 'checkout';
    document.documentElement.classList.toggle('in-checkout-chrome', checkoutChrome);
    const main = `<main id="main" class="in-main in-page-${esc(key)}" tabindex="-1">${view.html}</main>`;
    root.innerHTML = checkoutChrome
      ? `<a class="in-skip" href="#main">Skip to content</a>
        <header class="in-co-header"><div class="in-wrap in-co-header-inner"><a class="in-logo" href="${url.home}" aria-label="Inlet Performance home">${logo()}</a><span class="in-co-secure">${icon('lock')}Secure checkout</span></div></header>
        ${main}
        <footer class="in-co-footer"><div class="in-wrap"><a href="${url.page('refund')}">Returns</a><a href="${url.page('shipping')}">Shipping</a><a href="${url.page('privacy')}">Privacy</a><a href="${url.page('terms')}">Terms</a></div></footer>
        ${overlays(false)}`
      : `<a class="in-skip" href="#main">Skip to content</a>${header()}${main}${footer()}${overlays(true)}`;
    updateBadges();
    bindSearch();
    onCartChange = null;
    onWishChange = null;
    if (view.after) view.after();
    drawTray();
    syncHeader();
  }

  function syncHeader() {
    const h = document.getElementById('inHeader');
    if (h) h.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  document.addEventListener('click', (e) => {
    const drop = document.getElementById('inCollections');
    if (drop && !drop.hidden && !e.target.closest('.in-nav-drop')) setCollections(false);
    const mini = document.getElementById('inMiniBag');
    if (mini && !mini.hidden && !e.target.closest('#inMiniBag, [data-add], #pdpAdd')) hideMiniBag();
    const panel = document.getElementById('inSearch');
    if (panel && !panel.hidden && !e.target.closest('#inSearch, [data-open-search]')) setSearch(false);

    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      addToCart(add.dataset.add, 1);
      add.classList.add('is-added');
      setTimeout(() => add.classList.remove('is-added'), 1200);
      return;
    }
    if (e.target.closest('[data-collections]')) { setCollections(document.getElementById('inCollections').hidden); return; }
    if (e.target.closest('[data-open-search]')) { setMenu(false); const p = document.getElementById('inSearch'); if (p) setSearch(p.hidden); return; }
    if (e.target.closest('[data-close-search]')) { setSearch(false); const b = $('.in-header [data-open-search]'); if (b) b.focus(); return; }
    if (e.target.closest('[data-open-menu]')) { setSearch(false); setMenu(true); return; }
    if (e.target.closest('[data-close-menu]')) { setMenu(false); return; }
    if (e.target.closest('#inMenu a')) { setMenu(false); return; }
    if (e.target.closest('[data-close-minibag]')) { hideMiniBag(); return; }
    const cmpBtn = e.target.closest('[data-compare-btn]');
    if (cmpBtn) {
      const id = cmpBtn.dataset.compareBtn;
      const on = !compare.has(id);
      if (!compare.set(id, on)) { toast(`You can compare up to ${COMPARE_MAX} parts. Remove one first.`); return; }
      toast(on ? 'Added to compare' : 'Removed from compare');
      drawTray();
      return;
    }
    const un = e.target.closest('[data-uncompare]');
    if (un) {
      compare.set(un.dataset.uncompare, false);
      drawTray();
      const modal = document.getElementById('inCompare');
      if (modal && !modal.hidden) { if (compare.read().length >= 2) openCompare(); else closeCompare(); }
      return;
    }
    if (e.target.closest('[data-clear-compare]')) { compare.clear(); drawTray(); return; }
    if (e.target.closest('[data-open-compare]')) { openCompare(); return; }
    if (e.target.closest('[data-close-compare]')) { closeCompare(); return; }
    if (e.target.closest('[data-tray-toggle]')) {
      const tray = document.getElementById('inTray');
      tray.classList.toggle('is-open');
      drawTray();
      return;
    }
    if (e.target.closest('[data-open-chat]')) { const p = document.getElementById('inChat'); if (p && !p.hidden && e.target.closest('.in-chat-launch')) closeChat(); else openChat(); return; }
    if (e.target.closest('[data-close-chat]')) { closeChat(); return; }
    const save = e.target.closest('[data-wish]');
    if (save) {
      const on = wish.toggle(save.dataset.wish);
      $$(`[data-wish="${save.dataset.wish}"]`).forEach((b) => { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); const s = $('span', b); if (s) s.textContent = on ? 'Saved' : 'Save'; });
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
      if (onWishChange) onWishChange();
      return;
    }
    const msg = e.target.closest('[data-preview-msg]');
    if (msg) toast(msg.dataset.previewMsg);
  });

  document.addEventListener('change', (e) => {
    const box = e.target.closest('[data-compare]');
    if (!box) return;
    const ok = compare.set(box.dataset.compare, box.checked);
    if (!ok) { box.checked = false; toast(`You can compare up to ${COMPARE_MAX} parts. Remove one first.`); return; }
    drawTray();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('inCompare');
    if (modal && !modal.hidden) { closeCompare(); return; }
    const menu = document.getElementById('inMenu');
    if (menu && !menu.hidden) { setMenu(false); return; }
    const panel = document.getElementById('inSearch');
    if (panel && !panel.hidden) { setSearch(false); const b = $('.in-header [data-open-search]'); if (b) b.focus(); return; }
    const drop = document.getElementById('inCollections');
    if (drop && !drop.hidden) { setCollections(false); const b = $('[data-collections]'); if (b) b.focus(); return; }
    const mini = document.getElementById('inMiniBag');
    if (mini && !mini.hidden) { hideMiniBag(); return; }
    closeChat();
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'footNews') {
      e.preventDefault();
      const email = document.getElementById('footEmail');
      const msg = document.getElementById('footMsg');
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      msg.textContent = ok ? 'Thank you, you’re on the list. (Preview: nothing was sent.)' : 'Enter a valid email address.';
      msg.className = `in-form-msg ${ok ? 'is-ok' : 'is-bad'}`;
      if (ok) email.value = '';
      return;
    }
    if (e.target.id !== 'inChatForm') return;
    e.preventDefault();
    const input = document.getElementById('inChatInput');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const body = document.getElementById('inChatBody');
    body.insertAdjacentHTML('beforeend', `<div class="in-bubble is-you"><small>You</small><p>${esc(text)}</p></div>`);
    input.value = '';
    setTimeout(() => {
      body.insertAdjacentHTML('beforeend', '<div class="in-bubble is-team"><small>Inlet Performance</small><p>Thank you. On the live store we’d answer right here, any hour. (Preview)</p></div>');
      body.scrollTop = body.scrollHeight;
    }, 450);
    body.scrollTop = body.scrollHeight;
  });

  window.addEventListener('storage', (e) => { if (e.key === 'in_preview_cart') { updateBadges(); if (onCartChange) onCartChange(); } });
  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 1024) setMenu(false); drawTray(); });

  render();
})();

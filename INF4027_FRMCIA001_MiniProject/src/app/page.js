"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import BestDeals from '@/components/BestDeals';
import ValueProposition from '@/components/ValueProposition';
import Logo from '@/components/Logo';

// Page-level CSS: animations, palette variables, layout helpers.
// Defined here so every child component can reference these classes and variables.
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');

  /* ── Palette ─────────────────────────────────── */
  :root {
    --rv-white:       #FFFFFF;
    --rv-warm:        #F7F5F2;
    --rv-warm2:       #EFEDE9;
    --rv-ink:         #111827;
    --rv-ink2:        #6B7280;
    --rv-ink3:        #9CA3AF;
    --rv-border:      #E5E7EB;
    --rv-indigo:      #4F46E5;
    --rv-indigo-h:    #4338CA;
    --rv-indigo-soft: #EEF2FF;
    --rv-indigo-bd:   #C7D2FE;
    --rv-red:         #EF4444;
    --rv-red-soft:    #FEF2F2;
    --rv-red-bd:      #FECACA;
  }

  /* ── Base ────────────────────────────────────── */
  .rv-root {
    font-family: 'Barlow', var(--font-geist-sans), sans-serif;
    background: var(--rv-white);
    color: var(--rv-ink);
  }

  /* ── Keyframes ───────────────────────────────── */
  @keyframes rv-fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes rv-slideLeft { from { opacity:0; transform:translateX(-28px);} to { opacity:1; transform:none; } }
  @keyframes rv-scaleIn   { from { opacity:0; transform:scale(0.9);       } to { opacity:1; transform:scale(1); } }
  @keyframes rv-ticker    { from { transform:translateX(0);               } to { transform:translateX(-50%); } }
  @keyframes rv-spin      { to   { transform:rotate(360deg); } }

  /* ── Hero entrance ───────────────────────────── */
  .rv-ha-label { animation: rv-slideLeft 0.5s ease both; }
  .rv-ha-h1a   { animation: rv-fadeUp 0.6s ease 0.10s both; }
  .rv-ha-h1b   { animation: rv-fadeUp 0.6s ease 0.22s both; }
  .rv-ha-sub   { animation: rv-fadeUp 0.6s ease 0.34s both; }
  .rv-ha-srch  { animation: rv-fadeUp 0.5s ease 0.46s both; }
  .rv-ha-chips { animation: rv-fadeUp 0.5s ease 0.56s both; }

  /* ── Scroll reveal ───────────────────────────── */
  .rv-reveal { opacity:0; transform:translateY(16px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .rv-reveal.is-visible { opacity:1; transform:none; }
  .rv-d1 { transition-delay: 0.04s; }
  .rv-d2 { transition-delay: 0.10s; }
  .rv-d3 { transition-delay: 0.16s; }
  .rv-d4 { transition-delay: 0.22s; }

  /* ── Hero split layout ───────────────────────── */
  .rv-hero-grid { display: grid; grid-template-columns: 56% 44%; min-height: 82vh; }
  @media (max-width: 767px) {
    .rv-hero-grid { grid-template-columns: 1fr; }
    .rv-hero-img  { display: none; }
    .rv-hero-left { min-height: 72vh; padding: 56px 24px 56px; }
  }

  /* ── Ticker ──────────────────────────────────── */
  .rv-ticker-track { display:flex; width:max-content; animation: rv-ticker 32s linear infinite; }
  .rv-ticker-track:hover { animation-play-state: paused; }

  /* ── Search bar ──────────────────────────────── */
  .rv-srch { transition: border-color 0.2s, box-shadow 0.2s; }
  .rv-srch:focus-within {
    border-color: var(--rv-indigo) !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
  }
  .rv-srch input { caret-color: var(--rv-indigo); }
  .rv-srch input::placeholder { color: var(--rv-ink3); }
  .rv-srch input:focus { outline: none; }
  .rv-srch-btn:hover { background: var(--rv-indigo-h) !important; }

  /* ── Category pill ───────────────────────────── */
  .rv-pill { transition: color 0.18s, background 0.18s, border-color 0.18s; text-decoration:none; display:inline-block; }
  .rv-pill:hover { background: var(--rv-indigo-soft) !important; border-color: var(--rv-indigo-bd) !important; color: var(--rv-indigo) !important; }

  /* ── Indigo left-bar accent ──────────────────── */
  .rv-accent { position:relative; padding-left:16px; }
  .rv-accent::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--rv-indigo); border-radius:1px; }

  /* ── Dividers ────────────────────────────────── */
  .rv-bdr-b { border-bottom: 1px solid var(--rv-border); }
  .rv-bdr-t { border-top: 1px solid var(--rv-border); }
  .rv-bdr-r { border-right: 1px solid var(--rv-border); }

  /* ── Scrollbar hide ──────────────────────────── */
  .rv-no-scroll::-webkit-scrollbar { display: none; }
  .rv-no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── Ghost wordmark (footer) ─────────────────── */
  .rv-ghost { font-family:'Bebas Neue',cursive; font-size:clamp(2.2rem,5.5vw,5rem); letter-spacing:0.06em; line-height:1; color:transparent; -webkit-text-stroke:1px rgba(255,255,255,0.1); user-select:none; pointer-events:none; }

  /* ── Utility ─────────────────────────────────── */
  .rv-h { font-family:'Bebas Neue',cursive; letter-spacing:0.04em; line-height:1; }
  .rv-label { font-size:10px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; }
  .rv-link-hover { transition: color 0.18s; }
  .rv-link-hover:hover { color: var(--rv-indigo) !important; }
`;

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiSearching, setAiSearching] = useState(false);

  // Fetch all homepage data in parallel on mount
  useEffect(() => {
    fetch('/api/products?sortBy=newest')
      .then(res => res.json())
      .then(data => setNewArrivals(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setNewArrivals([]));

    fetch('/api/products?sortBy=discount')
      .then(res => res.json())
      .then(data => setBestDeals(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setBestDeals([]));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Scroll-reveal: adds 'is-visible' class when each product card enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    document.querySelectorAll('.rv-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [newArrivals, bestDeals]);

  // AI-powered search handler — translates natural language into filter params
  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) { router.push('/products'); return; }

    setAiSearching(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const { filters } = await res.json();
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.gender)   params.set('gender',   filters.gender);
      if (filters.colour)   params.set('colour',   filters.colour);
      if (filters.brand)    params.set('brand',     filters.brand);
      if (filters.minPrice) params.set('minPrice',  filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice',  filters.maxPrice);
      if (filters.size)     params.set('size',      filters.size);
      if (filters.condition)params.set('condition', filters.condition);
      if (filters.fit)      params.set('fit',       filters.fit);
      if (filters.wash)     params.set('wash',      filters.wash);
      if (filters.onSale)   params.set('onSale',    filters.onSale);
      if (filters.sortBy)   params.set('sortBy',    filters.sortBy);
      if (filters.search)   params.set('search',    filters.search);
      router.push(`/products?${params.toString()}`);
    } catch {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } finally {
      setAiSearching(false);
    }
  };

  return (
    <div className="rv-root">
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        handleSearch={handleSearch}
        aiSearching={aiSearching}
      />

      <FeaturedProducts items={newArrivals} />

      <BestDeals items={bestDeals} />

      <ValueProposition />

      {/* Footer */}
      <footer style={{ background: '#111827', paddingTop: '40px', paddingBottom: '32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Ghost wordmark */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '20px', marginBottom: '28px', overflow: 'hidden' }}>
            <p className="rv-ghost">DENIM REVIBE</p>
          </div>

          {/* Footer body */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Logo variant="light" size="sm" />
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Sustainable fashion, one pair at a time <Heart style={{ width: '12px', height: '12px', color: '#EF4444', fill: '#EF4444' }} />
              </p>
            </div>

            <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
              {[
                { href: '/products',   label: 'Browse' },
                { href: '/cart',       label: 'Cart' },
                { href: '/auth/login', label: 'Login / Register' },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rv-link-hover"
                  style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B7280', textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(107,114,128,0.6)', letterSpacing: '0.04em' }}>Denim Revibe © 2026. Designed for South Africa.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[{ href: '#', label: 'Terms' }, { href: '#', label: 'Privacy' }].map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="rv-link-hover"
                  style={{ fontSize: '11px', color: 'rgba(107,114,128,0.6)', letterSpacing: '0.06em', textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

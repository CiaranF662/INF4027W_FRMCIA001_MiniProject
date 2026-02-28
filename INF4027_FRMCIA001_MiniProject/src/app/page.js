"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Flame, Tag, ArrowRight, Heart, ShieldCheck, Leaf, Sparkles, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiSearching, setAiSearching] = useState(false);

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

  // Scroll-reveal observer
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
      if (filters.gender) params.set('gender', filters.gender);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.size) params.set('size', filters.size);
      if (filters.condition) params.set('condition', filters.condition);
      if (filters.fit) params.set('fit', filters.fit);
      if (filters.wash) params.set('wash', filters.wash);
      if (filters.onSale) params.set('onSale', filters.onSale);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.search) params.set('search', filters.search);
      router.push(`/products?${params.toString()}`);
    } catch {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } finally {
      setAiSearching(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="rv-root">

        {/* ╔══════════════════════════════════════╗
            ║  1. HERO  — split layout             ║
            ╚══════════════════════════════════════╝ */}
        <section className="rv-hero-grid rv-bdr-b relative overflow-hidden">

          {/* ── Left panel: white content ── */}
          <div
            className="rv-hero-left"
            style={{
              background: 'var(--rv-white)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(64px, 8vw, 100px) clamp(24px, 5vw, 72px)',
              position: 'relative', zIndex: 1,
            }}
          >
            {/* Subtle dot grid */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'radial-gradient(rgba(79,70,229,0.1) 1px, transparent 1px)',
              backgroundSize: '28px 28px', opacity: 0.55,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Eyebrow */}
              <div className="rv-ha-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '2px', background: 'var(--rv-indigo)', flexShrink: 0 }} />
                <span className="rv-label" style={{ color: 'var(--rv-indigo)' }}>South Africa&apos;s Denim Marketplace</span>
              </div>

              {/* Headline */}
              <h1 className="rv-ha-h1a rv-h" style={{ fontSize: 'clamp(3.6rem, 9vw, 8rem)', color: 'var(--rv-ink)', margin: 0 }}>
                Find Your
              </h1>
              <h1 className="rv-ha-h1b rv-h" style={{ fontSize: 'clamp(3.6rem, 9vw, 8rem)', color: 'var(--rv-indigo)', marginBottom: '24px' }}>
                Perfect Denim
              </h1>

              {/* Sub */}
              <p className="rv-ha-sub" style={{
                fontWeight: 300, fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)',
                color: 'var(--rv-ink2)', maxWidth: '400px',
                lineHeight: 1.8, letterSpacing: '0.01em', marginBottom: '32px',
              }}>
                Pre-loved vintage jeans, jackets &amp; unique denim pieces — curated for South Africa.
              </p>

              {/* AI Search */}
              <form onSubmit={handleSearch} className="rv-ha-srch" style={{ maxWidth: '520px' }}>
                <div
                  className="rv-srch"
                  style={{
                    display: 'flex', alignItems: 'center',
                    background: 'var(--rv-white)',
                    border: '1.5px solid var(--rv-border)',
                    borderRadius: '6px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', flexShrink: 0 }}>
                    <Sparkles style={{ width: '15px', height: '15px', color: 'var(--rv-indigo)', opacity: 0.8 }} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. relaxed Levi's size 32, under R400…"
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'transparent', border: 'none', outline: 'none',
                      padding: '14px 10px', fontSize: '14px',
                      color: 'var(--rv-ink)',
                      fontFamily: "'Barlow', sans-serif", fontWeight: 400,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={aiSearching}
                    className="rv-srch-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '0 22px', height: '50px', flexShrink: 0,
                      background: aiSearching ? 'rgba(79,70,229,0.6)' : 'var(--rv-indigo)',
                      color: '#fff', border: 'none',
                      borderRadius: '0 4px 4px 0',
                      cursor: aiSearching ? 'default' : 'pointer',
                      fontSize: '12px', fontFamily: "'Barlow', sans-serif",
                      fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      transition: 'background 0.2s',
                    }}
                  >
                    {aiSearching
                      ? <Loader2 style={{ width: '15px', height: '15px', animation: 'rv-spin 0.8s linear infinite' }} />
                      : <><Search style={{ width: '14px', height: '14px' }} />Search</>
                    }
                  </button>
                </div>
              </form>

              {/* Category chips */}
              {categories.length > 0 && (
                <div className="rv-ha-chips" style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '7px' }}>
                  <span className="rv-label" style={{ color: 'var(--rv-ink3)', marginRight: '2px' }}>Browse:</span>
                  {categories.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/products?category=${cat.name}`}
                      style={{
                        padding: '4px 13px', fontSize: '12px', fontWeight: 600,
                        letterSpacing: '0.04em', color: 'var(--rv-ink2)',
                        border: '1px solid var(--rv-border)',
                        borderRadius: '4px', textDecoration: 'none',
                        background: 'var(--rv-white)',
                        transition: 'color 0.18s, border-color 0.18s, background 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--rv-indigo)'; e.currentTarget.style.borderColor = 'var(--rv-indigo-bd)'; e.currentTarget.style.background = 'var(--rv-indigo-soft)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--rv-ink2)'; e.currentTarget.style.borderColor = 'var(--rv-border)'; e.currentTarget.style.background = 'var(--rv-white)'; }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Right panel: denim image ── */}
          <div className="rv-hero-img" style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src="/denim-hero.jpg"
              alt="Denim collection"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
            {/* Soft left-edge blend into white */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.25) 0%, transparent 25%)' }} />
            {/* Indigo tint overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(49,46,129,0.15)' }} />
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║  2. INDIGO TICKER MARQUEE            ║
            ╚══════════════════════════════════════╝ */}
        <div style={{ background: '#312E81', overflow: 'hidden', padding: '10px 0' }} aria-hidden="true">
          <div className="rv-ticker-track">
            {[0, 1].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {["Jeans", "Jackets", "Shorts", "Dungarees", "Skirts", "Vintage", "Levi's", "Wrangler", "Lee", "Pre-loved", "Sustainable", "Size 28–40", "Men's", "Women's", "Unisex"].map((item, j) => (
                  <span key={j} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '0 22px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(199,210,254,0.85)', whiteSpace: 'nowrap', fontFamily: "'Barlow', sans-serif" }}>{item}</span>
                    <span style={{ color: 'rgba(199,210,254,0.3)', fontSize: '7px' }}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ╔══════════════════════════════════════╗
            ║  3. SHOP BY CATEGORY                 ║
            ╚══════════════════════════════════════╝ */}
        <section style={{ background: 'var(--rv-warm)', padding: '68px 0' }} className="rv-bdr-b">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div className="rv-accent">
                <p className="rv-label" style={{ color: 'var(--rv-indigo)', marginBottom: '6px' }}>Explore</p>
                <h2 className="rv-h" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--rv-ink)', margin: 0 }}>Shop by Category</h2>
              </div>
              <Link
                href="/products"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rv-indigo)', textDecoration: 'none', transition: 'color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--rv-indigo-h)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--rv-indigo)'; }}
              >
                View all <ArrowRight style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => (
                <Link
                  href={`/products?category=${cat.name}`}
                  key={cat.name}
                  className="rv-pill"
                  style={{
                    padding: '8px 20px',
                    background: 'var(--rv-white)',
                    border: '1px solid var(--rv-border)',
                    borderRadius: '50px',
                    color: 'var(--rv-ink2)',
                    fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em',
                  }}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/products?onSale=true&sortBy=discount"
                style={{
                  padding: '8px 20px', display: 'inline-block', textDecoration: 'none',
                  borderRadius: '50px',
                  background: 'var(--rv-red-soft)', border: '1px solid var(--rv-red-bd)',
                  fontSize: '13px', fontWeight: 600, color: 'var(--rv-red)', letterSpacing: '0.02em',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--rv-red-soft)'; }}
              >
                🔥 Sale
              </Link>
            </div>
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║  5. JUST LISTED                      ║
            ╚══════════════════════════════════════╝ */}
        <section style={{ background: 'var(--rv-white)', padding: '76px 0' }} className="rv-bdr-b">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
              <div className="rv-accent">
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                  <Flame style={{ width: '14px', height: '14px', color: 'var(--rv-indigo)' }} />
                  <span className="rv-label" style={{ color: 'var(--rv-indigo)' }}>Fresh Drops</span>
                </div>
                <h2 className="rv-h" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--rv-ink)', margin: 0 }}>Just Listed</h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex"
                style={{ alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rv-indigo)', textDecoration: 'none', transition: 'color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--rv-indigo-h)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--rv-indigo)'; }}
              >
                View all <ArrowRight style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 rv-no-scroll snap-x snap-mandatory">
              {newArrivals.length > 0 ? (
                newArrivals.map((item, i) => (
                  <div key={item.id} className={`w-[75vw] sm:w-auto shrink-0 snap-center rv-reveal rv-d${i + 1}`}>
                    <ProductCard item={item} />
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--rv-ink3)', fontSize: '14px', gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                  No listings yet — check back soon.
                </p>
              )}
            </div>

            <div className="mt-4 sm:hidden">
              <Link href="/products">
                <button style={{
                  width: '100%', padding: '13px', cursor: 'pointer', borderRadius: '6px',
                  border: '1.5px solid var(--rv-border)', background: 'transparent',
                  color: 'var(--rv-ink)', fontSize: '12px', fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  View all arrivals
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║  6. BEST DEALS                       ║
            ╚══════════════════════════════════════╝ */}
        <section style={{ background: 'var(--rv-warm)', padding: '76px 0' }} className="rv-bdr-b">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
              <div className="rv-accent" style={{ '--rv-accent-c': 'var(--rv-red)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                  <Tag style={{ width: '14px', height: '14px', color: 'var(--rv-red)' }} />
                  <span className="rv-label" style={{ color: 'var(--rv-red)' }}>Massive Savings</span>
                </div>
                <h2 className="rv-h" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--rv-ink)', margin: 0 }}>Best Deals</h2>
              </div>
              <Link
                href="/products?onSale=true&sortBy=discount"
                className="hidden sm:flex"
                style={{ alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rv-red)', textDecoration: 'none', transition: 'color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--rv-red)'; }}
              >
                Shop deals <ArrowRight style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 rv-no-scroll snap-x snap-mandatory">
              {bestDeals.length > 0 ? (
                bestDeals.map((item, i) => (
                  <div key={item.id} className={`w-[75vw] sm:w-auto shrink-0 snap-center rv-reveal rv-d${i + 1}`}>
                    <ProductCard item={item} />
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--rv-ink3)', fontSize: '14px', gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                  No deals yet — check back soon.
                </p>
              )}
            </div>

            <div className="mt-4 sm:hidden">
              <Link href="/products?onSale=true&sortBy=discount">
                <button style={{
                  width: '100%', padding: '13px', cursor: 'pointer', borderRadius: '6px',
                  border: '1.5px solid var(--rv-red-bd)', background: 'transparent',
                  color: 'var(--rv-red)', fontSize: '12px', fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  Shop all deals
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║  7. TRUST STRIP                      ║
            ╚══════════════════════════════════════╝ */}
        <section style={{ background: 'var(--rv-warm2)', borderTop: '1px solid var(--rv-border)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
              {/* Divider line in the middle cell */}
              <div style={{ gridColumn: 2, background: 'var(--rv-border)', margin: '28px 0' }} />

              {[
                { Icon: ShieldCheck, label: 'Verified Quality',    sub: 'Every listing is checked before it goes live.' },
                { Icon: Leaf,        label: 'Sustainable Fashion', sub: 'Giving pre-loved denim a second life.' },
              ].map(({ Icon, label, sub }, idx) => (
                <div
                  key={label}
                  style={{
                    gridColumn: idx === 0 ? 1 : 3,
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '28px 0', justifyContent: 'center',
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--rv-indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '18px', height: '18px', color: 'var(--rv-indigo)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rv-ink)', letterSpacing: '0.02em' }}>{label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--rv-ink2)', marginTop: '2px', fontWeight: 400 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║  8. FOOTER                           ║
            ╚══════════════════════════════════════╝ */}
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
                  {/* Footer logo — DR monogram in white for dark background */}
                  <svg width="38" height="26" viewBox="0 0 44 30" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      d="M 2 2 L 2 28 M 2 2 L 8 2 C 20 2 23 8 23 15 C 23 22 20 28 8 28 L 2 28"
                      stroke="rgba(255,255,255,0.85)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path
                      d="M 29 2 L 29 28 M 29 2 L 35 2 C 42 2 42 12 35 12 L 29 12 M 35 12 L 42 28"
                      stroke="rgba(255,255,255,0.85)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1 }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em', color: '#6366F1', textTransform: 'uppercase', fontFamily: "'Barlow', sans-serif" }}>Denim</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', fontFamily: "'Barlow', sans-serif" }}>Revibe</span>
                  </div>
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
    </>
  );
}

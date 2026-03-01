"use client";

import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

/**
 * HeroSection — the top of the homepage.
 *
 * Renders three visual blocks:
 *   1. The split hero (headline + AI search bar + category chips)
 *   2. The indigo ticker marquee banner
 *   3. The "Shop by Category" pill grid
 *
 * All three share the `categories` data so they live together here.
 *
 * Props:
 *   searchQuery     — controlled input value from LandingPage
 *   setSearchQuery  — setter to update the input
 *   categories      — array of category objects fetched from /api/categories
 *   handleSearch    — form submit handler (AI search logic lives in LandingPage)
 *   aiSearching     — boolean, true while the AI search API call is in flight
 */
export default function HeroSection({ searchQuery, setSearchQuery, categories, handleSearch, aiSearching }) {
  return (
    <>
      {/* ── 1. Hero split layout ── */}
      <section className="rv-hero-grid rv-bdr-b relative overflow-hidden">

        {/* Left panel: white content */}
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

            {/* Subheading */}
            <p className="rv-ha-sub" style={{
              fontWeight: 300, fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)',
              color: 'var(--rv-ink2)', maxWidth: '400px',
              lineHeight: 1.8, letterSpacing: '0.01em', marginBottom: '32px',
            }}>
              Pre-loved vintage jeans, jackets &amp; unique denim pieces — curated for South Africa.
            </p>

            {/* AI Search bar */}
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

            {/* Category chips (first 5) */}
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

        {/* Right panel: denim image */}
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

      {/* ── 2. Indigo ticker marquee ── */}
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

      {/* ── 3. Shop by Category pill grid ── */}
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
    </>
  );
}

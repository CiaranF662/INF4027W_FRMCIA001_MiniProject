"use client";

import React from 'react';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

/**
 * BestDeals — the "Best Deals" section on the homepage.
 *
 * Displays the 4 products with the highest discount percentage
 * in a horizontally scrollable row on mobile and a 4-column grid on desktop.
 *
 * Props:
 *   items — array of product objects fetched from /api/products?sortBy=discount
 */
export default function BestDeals({ items }) {
  return (
    <section style={{ background: 'var(--rv-warm)', padding: '76px 0' }} className="rv-bdr-b">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div className="rv-accent">
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
          {items.length > 0 ? (
            items.map((item, i) => (
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
  );
}

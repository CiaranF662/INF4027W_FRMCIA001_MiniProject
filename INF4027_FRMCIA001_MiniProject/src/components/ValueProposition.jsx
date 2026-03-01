import React from 'react';
import { ShieldCheck, Leaf } from 'lucide-react';

/**
 * ValueProposition — the trust strip shown at the bottom of the homepage.
 *
 * Two side-by-side trust signals separated by a thin divider:
 *   - Verified Quality  (every listing is checked before going live)
 *   - Sustainable Fashion (giving pre-loved denim a second life)
 *
 * No props — this component is purely presentational.
 */
export default function ValueProposition() {
  const TRUST_ITEMS = [
    { Icon: ShieldCheck, label: 'Verified Quality',    sub: 'Every listing is checked before it goes live.' },
    { Icon: Leaf,        label: 'Sustainable Fashion', sub: 'Giving pre-loved denim a second life.' },
  ];

  return (
    <section style={{ background: 'var(--rv-warm2)', borderTop: '1px solid var(--rv-border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>

          {/* Divider line in the middle cell */}
          <div style={{ gridColumn: 2, background: 'var(--rv-border)', margin: '28px 0' }} />

          {TRUST_ITEMS.map(({ Icon, label, sub }, idx) => (
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
  );
}

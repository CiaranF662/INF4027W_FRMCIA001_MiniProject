import React from 'react';

/**
 * Logo — the "DR" monogram + "Denim Revibe" wordmark.
 *
 * Props:
 *   variant — "dark" (default) | "light"
 *             dark  = indigo strokes on a light background (Navbar, auth pages)
 *             light = white/soft-indigo strokes on a dark background (admin sidebar, footer)
 *   size    — "md" (default) | "sm"
 *             md = 44×30 SVG, 10px / 19px text  (Navbar, auth pages, admin)
 *             sm = 38×26 SVG,  9px / 16px text  (footer)
 *   hideWordmarkOnMobile — when true, the text stack is hidden on mobile and visible from sm: up.
 *                          Used in the Navbar where mobile space is tight.
 */

const VARIANTS = {
    dark: {
        stroke: '#4F46E5',
        labelColor: '#4F46E5',
        wordmarkColor: '#111827',
    },
    light: {
        stroke: 'rgba(255,255,255,0.85)',
        labelColor: '#818CF8',
        wordmarkColor: '#ffffff',
    },
};

const SIZES = {
    md: { svgW: 44, svgH: 30, labelSize: '10px', wordmarkSize: '19px', gap: '3px' },
    sm: { svgW: 38, svgH: 26, labelSize: '9px',  wordmarkSize: '16px', gap: '2px' },
};

export default function Logo({ variant = 'dark', size = 'md', hideWordmarkOnMobile = false }) {
    const colors = VARIANTS[variant] || VARIANTS.dark;
    const dims   = SIZES[size]    || SIZES.md;

    return (
        <>
            <svg
                width={dims.svgW} height={dims.svgH} viewBox="0 0 44 30" fill="none"
                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
            >
                {/* D — vertical bar + curved arc */}
                <path
                    d="M 2 2 L 2 28 M 2 2 L 8 2 C 20 2 23 8 23 15 C 23 22 20 28 8 28 L 2 28"
                    stroke={colors.stroke} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* R — vertical bar + bowl + diagonal leg */}
                <path
                    d="M 29 2 L 29 28 M 29 2 L 35 2 C 42 2 42 12 35 12 L 29 12 M 35 12 L 42 28"
                    stroke={colors.stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                />
            </svg>

            <div
                className={`${hideWordmarkOnMobile ? 'hidden sm:flex' : 'flex'} flex-col leading-none`}
                style={{ gap: dims.gap }}
            >
                <span style={{
                    fontSize: dims.labelSize, fontWeight: 700, letterSpacing: '0.26em',
                    color: colors.labelColor, textTransform: 'uppercase',
                    fontFamily: "'Barlow', sans-serif",
                }}>
                    Denim
                </span>
                <span style={{
                    fontSize: dims.wordmarkSize, fontWeight: 800, letterSpacing: '-0.02em',
                    color: colors.wordmarkColor, lineHeight: 1,
                    fontFamily: "'Barlow', sans-serif",
                }}>
                    Revibe
                </span>
            </div>
        </>
    );
}

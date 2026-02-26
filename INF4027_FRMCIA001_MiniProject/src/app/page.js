"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Flame, Tag, ArrowRight, Heart, Truck, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProductCard from '@/components/ProductCard';

// Category chips — simple text links, no emojis
const CATEGORIES = [
  { name: "Jeans", query: "Jeans" },
  { name: "Jackets", query: "Jackets" },
  { name: "Shorts", query: "Shorts" },
  { name: "Skirts", query: "Skirts" },
  { name: "Overalls", query: "Overalls" },
  { name: "Shirts", query: "Shirts" },
  { name: "Accessories", query: "Accessories" }
];

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);

  useEffect(() => {
    fetch('/api/products?sortBy=newest')
      .then(res => res.json())
      .then(data => setNewArrivals(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setNewArrivals([]));

    fetch('/api/products?sortBy=discount')
      .then(res => res.json())
      .then(data => setBestDeals(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setBestDeals([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* 1. HERO — Dark denim-inspired background with search */}
      <section className="relative w-full overflow-hidden">

        {/* Denim photo background */}
        <img
          src="/denim-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-14 pb-16 md:pt-20 md:pb-20 flex flex-col items-center text-center">

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 max-w-3xl">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Perfect Denim</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 mb-8 max-w-xl font-medium leading-relaxed">
            South Africa's marketplace for pre-loved denim — vintage jeans, jackets, and unique pieces.
          </p>

          {/* AI Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative w-full flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-1.5 focus-within:bg-white/15 focus-within:border-white/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-indigo-300 absolute left-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe what you're looking for... e.g. relaxed fit Levi's, size 32"
                className="w-full pl-12 pr-32 h-13 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-base text-white placeholder:text-slate-400 rounded-full"
              />
              <Button
                type="submit"
                className="absolute right-1.5 h-11 rounded-full px-6 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-indigo-600/30"
              >
                <Search className="w-4 h-4 mr-1.5" />
                Search
              </Button>
            </div>
          </form>

          {/* Quick category chips below search */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Popular:</span>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.query}`}
                className="px-3 py-1 rounded-full text-xs font-semibold text-slate-300 border border-white/15 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BAR */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On all orders" },
              { icon: ShieldCheck, label: "Verified Quality", sub: "Every item checked" },
              { icon: Leaf, label: "Sustainable Fashion", sub: "Pre-loved denim" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-3 py-4 md:py-5">
                <item.icon className="w-5 h-5 text-indigo-600 shrink-0 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORY CHIPS — compact row */}
      <section className="py-8 md:py-10 bg-white container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
            View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              href={`/products?category=${cat.query}`}
              key={cat.name}
              className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/products?onSale=true&sortBy=discount"
            className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-sm font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all duration-200"
          >
            🔥 Sale
          </Link>
        </div>
      </section>

      {/* 4. JUST LISTED */}
      <section className="py-14 bg-[#FAFAFA] border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Fresh Drops</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Just Listed</h2>
            </div>
            <Link href="/products" className="hidden sm:flex text-sm font-semibold tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors items-center gap-1 group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 hide-scrollbar snap-x snap-mandatory">
            {newArrivals.length > 0 ? (
              newArrivals.map(item => (
                <div key={item.id} className="w-[75vw] sm:w-auto shrink-0 snap-center">
                  <ProductCard item={item} />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm col-span-4 py-8 text-center">No listings yet — check back soon.</p>
            )}
          </div>

          <div className="mt-2 sm:hidden flex justify-center">
            <Link href="/products" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl text-slate-700 font-medium">
                View all arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BEST DEALS */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <Tag className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Massive Savings</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Best Deals</h2>
            </div>
            <Link href="/products?onSale=true&sortBy=discount" className="hidden sm:flex text-sm font-semibold tracking-wide text-rose-500 hover:text-rose-700 transition-colors items-center gap-1 group">
              Shop all deals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 hide-scrollbar snap-x snap-mandatory">
            {bestDeals.length > 0 ? (
              bestDeals.map(item => (
                <div key={item.id} className="w-[75vw] sm:w-auto shrink-0 snap-center">
                  <ProductCard item={item} />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm col-span-4 py-8 text-center">No deals yet — check back soon.</p>
            )}
          </div>

          <div className="mt-2 sm:hidden flex justify-center">
            <Link href="/products?onSale=true&sortBy=discount" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl text-rose-500 border-rose-200 font-medium">
                Shop all deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-950 text-slate-300 py-12 md:py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg leading-none">D</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Denim Revibe</span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                Sustainable fashion, one pair at a time <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </p>
            </div>

            <div className="flex gap-6 mt-4 md:mt-0 text-sm font-medium">
              <Link href="/products" className="hover:text-white transition-colors">Browse</Link>
              <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login / Register</Link>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>Denim Revibe © 2026. Designed for South Africa.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

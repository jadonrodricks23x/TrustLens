import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Analyze', path: '/analyze' },
    { name: 'History', path: '/history' },
    { name: 'Learn', path: '/learn' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B0F17]/80 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-lens-600 via-sky-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 stroke-[2.2]" />
            <div className="absolute w-2 h-2 rounded-full bg-white top-2.5 right-2.5 shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white leading-none">
              TrustLens<span className="text-lens-400">.ai</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium mt-0.5">
              Look Closer. Trust Smarter.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'text-white bg-white/[0.12] shadow-sm font-semibold border border-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick CTA */}
          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold apple-primary-btn text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Now</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 border-b border-white/10 bg-[#0B0F17]/95 backdrop-blur-2xl space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-lens-500/20 text-white font-semibold border border-lens-500/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold apple-primary-btn text-white"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Now</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

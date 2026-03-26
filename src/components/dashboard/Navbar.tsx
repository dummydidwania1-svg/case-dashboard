'use client';

import React, { useState, useEffect } from 'react';

interface NavbarProps {
  currentPage: 'home' | 'dashboard' | 'about';
  onNavigate: (page: 'home' | 'dashboard' | 'about') => void;
}

const Navbar = ({ currentPage, onNavigate }: NavbarProps) => {
  const [scrolled, setScrolled]             = useState(false);
  const [showAuthModal, setShowAuthModal]   = useState(false);
  const [isSignedIn, setIsSignedIn]         = useState(false);
  const [authMode, setAuthMode]             = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .nav-link { position: relative; color: #57534e; }
        .nav-link.active { color: #3D5A35; font-weight: 500; }
        .nav-link.active::after {
          content: '';
          position: absolute; bottom: -4px; left: 0; right: 0;
          height: 2px; background: #3D5A35; border-radius: 1px;
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          height: '70px',
          background: scrolled ? 'rgba(255,248,240,0.6)' : 'rgba(255,248,240,0.9)',
          backdropFilter: scrolled ? 'blur(28px) saturate(1.5)' : 'blur(12px)',
          WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(1.5)' : 'blur(12px)',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : undefined,
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
        className="fixed top-0 w-full z-[100] border-b border-[#3D5A35]/10"
      >
        <div className="flex justify-between items-center w-full px-12 h-full max-w-screen-2xl mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-1">
 <img
  src="/logo.png"
  alt="Case Compendium X"
  width={56}
  height={56}
  className="w-14 h-14 object-contain"
/>
            <div style={{ fontFamily: "'Newsreader', serif" }} className="text-xl font-semibold tracking-tight">
              <span className="text-[#453a2a]">Case Compendium</span>
              <span className="text-[#3D5A35]">X</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => onNavigate('home')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
              className={`nav-link text-xs uppercase tracking-[0.2em] hover:text-[#3D5A35] transition-colors duration-300 pb-1 bg-transparent border-none cursor-pointer ${currentPage === 'home' ? 'active' : ''}`}
            >
              HOME
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
              className={`nav-link text-xs uppercase tracking-[0.2em] hover:text-[#3D5A35] transition-colors duration-300 pb-1 bg-transparent border-none cursor-pointer ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              DASHBOARD
            </button>
            <button
              onClick={() => onNavigate('about')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
              className={`nav-link text-xs uppercase tracking-[0.2em] hover:text-[#3D5A35] transition-colors duration-300 pb-1 bg-transparent border-none cursor-pointer ${currentPage === 'about' ? 'active' : ''}`}
            >
              ABOUT US
            </button>
          </div>

          {/* Auth Area */}
          <div className="flex items-center gap-6">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => setIsSignedIn(false)}
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                  className="border border-[#3D5A35] px-5 py-2 text-[#3D5A35] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#3D5A35] hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
                >
                  LOG OUT
                </button>
                <span className="material-symbols-outlined text-[#3D5A35]" style={{ fontSize: '36px' }}>account_circle</span>
              </>
            ) : (
              <button
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
                className="border border-[#3D5A35] px-5 py-2 text-[#3D5A35] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#3D5A35] hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
              >
                SIGN IN
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
        >
          <div
            className="relative"
            style={{
              background: '#fff8f0',
              border: '1px solid rgba(61,90,53,0.1)',
              padding: '40px',
              width: '400px',
              maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[#73796f] text-2xl leading-none bg-transparent border-none cursor-pointer"
            >
              &times;
            </button>

            <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: '1.75rem', color: '#453a2a', marginBottom: '24px' }}>
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h3>

            <form onSubmit={e => { e.preventDefault(); setIsSignedIn(true); setShowAuthModal(false); }}>
              {authMode === 'signup' && (
                <input
                  type="text" placeholder="Full Name"
                  style={{ width: '100%', padding: '12px 16px', marginBottom: '16px', border: '1px solid #c3c8bd', background: '#faf3e9', fontFamily: "'Work Sans', sans-serif", fontSize: '14px', color: '#1e1b15', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
              )}
              <input
                type="email" placeholder="Email" required
                style={{ display: 'block', width: '100%', padding: '12px 16px', marginBottom: '16px', border: '1px solid #c3c8bd', background: '#faf3e9', fontFamily: "'Work Sans', sans-serif", fontSize: '14px', color: '#1e1b15', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
              <input
                type="password" placeholder="Password" required
                style={{ display: 'block', width: '100%', padding: '12px 16px', marginBottom: '16px', border: '1px solid #c3c8bd', background: '#faf3e9', fontFamily: "'Work Sans', sans-serif", fontSize: '14px', color: '#1e1b15', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
              <button
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#3D5A35', color: '#fff', fontFamily: "'Work Sans', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', border: 'none', cursor: 'pointer', transition: 'background 0.2s', marginTop: '8px' }}
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center', fontFamily: "'Work Sans', sans-serif", fontSize: '13px', color: '#73796f' }}>
              {authMode === 'signin' ? (
                <>
                  Don&rsquo;t have an account?{' '}
                  <button onClick={() => setAuthMode('signup')} style={{ color: '#3D5A35', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', fontFamily: "'Work Sans', sans-serif", fontSize: '13px' }}>
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('signin')} style={{ color: '#3D5A35', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', fontFamily: "'Work Sans', sans-serif", fontSize: '13px' }}>
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

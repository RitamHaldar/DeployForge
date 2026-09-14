import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Infrastructure', href: '#infrastructure' },
    { label: 'Self-Healing', href: '#self-healing', hasDot: true },
    { label: 'CLI & DX', href: '#developer-experience' },
    { label: 'Observability', href: '#observability' },
  ];

  const handleAuthNav = (mode: 'login' | 'register') => {
    if (onNavigate) {
      onNavigate(`/auth?mode=${mode}`);
    } else {
      window.location.href = `/auth?mode=${mode}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-bg/85 backdrop-blur-md border-b border-brand-border py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-lg">
          <div className="relative w-8 h-8 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center p-1.5 shadow-inner transition-colors group-hover:border-brand-border-hover">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-brand-cyan animate-forge transition-transform group-hover:scale-105"
            >
              <path
                d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 6L7.5 8.5V13.5L12 16L16.5 13.5V8.5L12 6Z"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="12" cy="11" r="1.5" fill="#00F0FF" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-white/90">
              DeployForge
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted px-1.5 py-0.5 rounded bg-white/[0.03] border border-brand-border">
              v2.4
            </span>
          </div>
        </a>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-brand-muted" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative px-3.5 py-1.5 rounded-md hover:text-white transition-colors duration-150 group focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan"
            >
              <span className="flex items-center gap-1.5">
                {link.label}
                {link.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
                )}
              </span>
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[1.5px] bg-brand-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleAuthNav('login')}
            className="text-xs font-medium text-brand-muted hover:text-white px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded"
          >
            Sign In
          </button>
          <motion.button
            type="button"
            onClick={() => handleAuthNav('register')}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="light-sweep-btn bg-white text-black hover:bg-neutral-100 text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <span>Launch Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>
        </div>

      </div>
    </header>
  );
}

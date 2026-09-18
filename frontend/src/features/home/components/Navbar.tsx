import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Menu,
  X,
  Activity,
  Layers,
  Cpu,
  Terminal,
  Radio
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

interface NavLinkItem {
  label: string;
  href: string;
  hasDot?: boolean;
  icon: typeof Layers;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Pipeline', href: '#pipeline', icon: Layers },
  { label: 'Infrastructure', href: '#infrastructure', icon: Cpu },
  { label: 'Self-Healing', href: '#self-healing', hasDot: true, icon: Activity },
  { label: 'CLI & DX', href: '#developer-experience', icon: Terminal },
  { label: 'Observability', href: '#observability', icon: Radio },
];

export function Navbar({ onNavigate }: NavbarProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthNav = (mode: 'login' | 'register') => {
    setMobileMenuOpen(false);
    const dest = mode === 'register' ? '/register' : '/login';
    if (onNavigate) {
      onNavigate(dest);
    } else {
      window.location.href = dest;
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const topOffset = 85;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        {/* Floating Island Dock */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          className={`pointer-events-auto relative rounded-2xl transition-all duration-300 flex items-center justify-between px-3.5 sm:px-5 py-2.5 ${
            isScrolled
              ? 'bg-[#0B0D10]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(0,240,255,0.06)]'
              : 'bg-[#0B0D10]/60 backdrop-blur-md border border-white/[0.07] shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Brand Logo Hallmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-xl"
            title="DeployForge Autonomous Cloud"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#101216] border border-white/10 flex items-center justify-center p-1.5 shadow-inner transition-all duration-300 group-hover:border-accent-cyan/50 group-hover:shadow-[0_0_16px_rgba(0,240,255,0.3)]">
              {/* Animated SVG Diamond Forge Core */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-cyan animate-forge transition-transform group-hover:scale-105"
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
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#00F0FF] animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white font-sans group-hover:text-white/90">
                DeployForge
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/[0.08] group-hover:border-accent-cyan/30 group-hover:text-accent-cyan transition-colors">
                v2.4
              </span>
            </div>
          </a>

          {/* Desktop Center Navigation with Magnetic Sliding Pill */}
          <nav
            className="hidden md:flex items-center gap-0.5 relative px-1 py-1 rounded-xl bg-white/[0.02] border border-white/[0.04]"
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                onMouseEnter={() => setHoveredIndex(idx)}
                className="relative px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-neutral-400 hover:text-white transition-colors duration-150 group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan select-none"
              >
                {/* Floating Magnetic Hover Pill */}
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1] shadow-sm backdrop-blur-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  {link.hasDot && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-emerald" />
                    </span>
                  )}
                  <span>{link.label}</span>
                </span>
              </a>
            ))}
          </nav>

          {/* Right Action CTAs & Telemetry */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Operational Beacon (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_4px_#10B981] animate-pulse" />
              <span className="text-neutral-300 font-semibold">14ms</span>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={() => handleAuthNav('login')}
              className="text-xs font-mono font-medium text-neutral-300 hover:text-white px-2.5 sm:px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-lg hover:bg-white/[0.04]"
            >
              Sign In
            </button>

            {/* Launch Engine (Register) Action Button */}
            <motion.button
              type="button"
              onClick={() => handleAuthNav('register')}
              whileHover={{ y: -1.5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="btn-sweep relative bg-white text-black hover:bg-neutral-100 text-xs font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_25px_rgba(255,255,255,0.22)] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan tracking-tight font-sans group"
            >
              <span>Launch Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Mobile Animated Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto md:hidden mt-2 rounded-2xl bg-[#0B0D10]/95 backdrop-blur-2xl border border-white/[0.12] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-accent-cyan" />
                        <span>{link.label}</span>
                      </span>
                      {link.hasDot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>DeployForge Sentinel</span>
                <span className="text-accent-emerald font-semibold">● 14ms Anycast</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

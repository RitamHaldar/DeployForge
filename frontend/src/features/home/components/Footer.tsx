import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowUp,
  Check,
  Copy,
  Terminal,
  Globe,
  Lock,
  Radio,
  Disc,
  Zap
} from 'lucide-react';

function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const FOOTER_LINKS = {
  platform: [
    { label: 'Autonomous Mesh', href: '#self-healing' },
    { label: 'Edge Ingress', href: '#infrastructure' },
    { label: 'eBPF Kernel Traces', href: '#observability' },
    { label: 'Firecracker MicroVMs', href: '#pipeline' },
    { label: 'Global Anycast DNS', href: '#infrastructure' },
    { label: 'Automated Rollbacks', href: '#self-healing' }
  ],
  resources: [
    { label: 'CLI Documentation', href: '#developer-experience' },
    { label: 'API Reference', href: '#developer-experience' },
    { label: 'Helm & K8s Charts', href: '#infrastructure' },
    { label: 'Terraform Provider', href: '#infrastructure' },
    { label: 'GitHub Action', href: '#pipeline' },
    { label: 'Architecture Specs', href: '#developer-experience' }
  ],
  architecture: [
    { label: 'Zero-Trust Kernel', href: '#infrastructure' },
    { label: 'Consensus Raft', href: '#self-healing' },
    { label: 'Distroless Isolation', href: '#pipeline' },
    { label: 'SLA & 99.999% Guarantee', href: '#observability' },
    { label: 'Status Beacon (Live)', href: '#observability', badge: '100%' },
    { label: 'Security Whitepaper', href: '#' }
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Engineering Blog', href: '#' },
    { label: 'Careers', href: '#', badge: 'Hiring' },
    { label: 'Security & SOC 2', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' }
  ]
};

export function Footer() {
  const [copied, setCopied] = useState(false);
  const cliSnippet = 'curl -fsSL https://deployforge.dev/install.sh | bash';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#070809] pt-16 pb-12 relative z-10 font-mono text-xs text-neutral-400 overflow-hidden">
      {/* Background Volumetric Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-accent-cyan/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[200px] bg-accent-emerald/[0.015] rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Tech Grid Underlay */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Header Command Deck */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 border-b border-white/[0.08] mb-12">
          {/* Brand & Mission Statement */}
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center text-accent-cyan shadow-[0_0_16px_rgba(0,240,255,0.15)]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-sans font-bold text-white text-base tracking-tight">
                DeployForge
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 font-mono">
                v2.4 LTS
              </span>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Autonomous deployment and self-healing cloud infrastructure designed for modern, zero-downtime engineering teams.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0D12] border border-white/[0.08] text-xs shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
              </span>
              <span className="text-white font-semibold">Global Status:</span>
              <span className="text-accent-emerald font-medium">All 14 Edge PoPs Nominal</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400">11.4ms P99</span>
            </div>
          </div>

          {/* Quick CLI Installer Box */}
          <div className="w-full lg:w-auto">
            <div className="text-[11px] text-neutral-400 mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Instant CLI Quickstart:</span>
            </div>

            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[#090B0E] border border-white/[0.1] shadow-inner font-mono text-xs">
              <span className="text-accent-emerald select-none font-bold">$</span>
              <span className="text-neutral-200 select-all pr-2">{cliSnippet}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-accent-cyan/15 hover:text-accent-cyan text-neutral-300 border border-white/[0.08] text-xs font-mono transition-all active:scale-95 cursor-pointer"
                title="Copy installation command"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-accent-emerald flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Navigation Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/[0.08]">
          
          {/* Column 1: Platform */}
          <div>
            <div className="text-white font-semibold mb-4 font-sans text-sm flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Platform</span>
            </div>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_LINKS.platform.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-neutral-500 group-hover:text-accent-cyan transition-colors">›</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Resources & Docs */}
          <div>
            <div className="text-white font-semibold mb-4 font-sans text-sm flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Developers</span>
            </div>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_LINKS.resources.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-neutral-500 group-hover:text-sky-400 transition-colors">›</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Architecture & Security */}
          <div>
            <div className="text-white font-semibold mb-4 font-sans text-sm flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Architecture</span>
            </div>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_LINKS.architecture.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-neutral-500 group-hover:text-accent-emerald transition-colors">›</span>
                      <span>{link.label}</span>
                    </span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <div className="text-white font-semibold mb-4 font-sans text-sm flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent-purple" />
              <span>Company</span>
            </div>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_LINKS.company.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-neutral-500 group-hover:text-accent-purple transition-colors">›</span>
                      <span>{link.label}</span>
                    </span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-purple/10 border border-accent-purple/25 text-accent-purple font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Security & Compliance Trust Bar */}
        <div className="py-6 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Shield className="w-3 h-3 text-accent-cyan" />
              <span>SOC 2 Type II Certified</span>
            </span>
            <span className="text-white/10 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Lock className="w-3 h-3 text-accent-emerald" />
              <span>Zero-Trust Kernel eBPF</span>
            </span>
            <span className="text-white/10 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Radio className="w-3 h-3 text-accent-purple" />
              <span>BGP Anycast SLA 99.999%</span>
            </span>
          </div>

          <div className="text-neutral-500 text-[10px]">
            Encrypted TLS 1.3 • Ed25519 Signed
          </div>
        </div>

        {/* Bottom Copyright & Social Anchors */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-neutral-500 text-center sm:text-left">
            &copy; 2026 DeployForge Inc. Built with autonomous resiliency at kernel speed.
          </div>

          <div className="flex items-center gap-3">
            {/* Social Links */}
            <div className="flex items-center gap-2">
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-accent-cyan/40 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </motion.a>

              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-accent-cyan/40 hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </motion.a>

              <motion.a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-accent-cyan/40 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Discord"
              >
                <Disc className="w-3.5 h-3.5" />
              </motion.a>
            </div>

            {/* Back to top smooth button */}
            <motion.button
              type="button"
              onClick={scrollToTop}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
              title="Scroll to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

      </div>
    </footer>
  );
}

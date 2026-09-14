import { Shield, Disc } from 'lucide-react';

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-bg py-16 relative z-10 font-mono text-xs text-brand-muted">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-brand-border">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-brand-card border border-brand-border flex items-center justify-center text-brand-cyan">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-sans font-bold text-white text-sm">DeployForge</span>
            </div>
            
            <p className="text-xs text-brand-muted font-sans max-w-sm leading-relaxed">
              Autonomous deployment and self-healing cloud infrastructure designed for modern engineering teams.
            </p>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-brand-emerald"></span>
              <span className="text-white">Status: All systems operational</span>
            </div>
          </div>

          {/* Col 1: Product */}
          <div>
            <div className="text-white font-semibold mb-3 font-sans">Product</div>
            <ul className="space-y-2">
              <li><a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a></li>
              <li><a href="#pipeline" className="hover:text-white transition-colors">Deployments</a></li>
              <li><a href="#self-healing" className="hover:text-white transition-colors">Self-Healing Mesh</a></li>
              <li><a href="#observability" className="hover:text-white transition-colors">Monitoring</a></li>
              <li><a href="#developer-experience" className="hover:text-white transition-colors">Developer CLI</a></li>
            </ul>
          </div>

          {/* Col 2: Developers */}
          <div>
            <div className="text-white font-semibold mb-3 font-sans">Developers</div>
            <ul className="space-y-2">
              <li><a href="#developer-experience" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#developer-experience" className="hover:text-white transition-colors">CLI Reference</a></li>
              <li><a href="#developer-experience" className="hover:text-white transition-colors">API Keys</a></li>
              <li><a href="#pipeline" className="hover:text-white transition-colors">GitHub Action</a></li>
              <li><a href="#pipeline" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <div className="text-white font-semibold mb-3 font-sans">Company</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 DeployForge Inc. Built for resilient engineering teams.
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="text-brand-muted hover:text-white transition-colors" aria-label="Twitter">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="#" className="text-brand-muted hover:text-white transition-colors" aria-label="GitHub">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="#" className="text-brand-muted hover:text-white transition-colors" aria-label="Discord">
              <Disc className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

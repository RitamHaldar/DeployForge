export function AuthFooter() {
  return (
    <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 text-center space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500 font-mono">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-400 transition-colors"
        >
          Security Overview
        </a>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-400 transition-colors"
        >
          System Status
        </a>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-400 transition-colors"
        >
          Documentation
        </a>
      </div>

      <p className="text-[11px] font-mono text-neutral-600">
        DeployForge Inc. Autonomous self-healing infrastructure.
      </p>
    </footer>
  );
}

export function AuthFooter() {
  return (
    <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 text-center space-y-1.5 shrink-0">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-300 transition-colors"
        >
          Terms of Service
        </a>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-300 transition-colors"
        >
          Privacy Policy
        </a>
        <span className="text-neutral-700" aria-hidden="true">·</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-neutral-300 transition-colors"
        >
          Contact Support
        </a>
      </div>

      <p className="text-[11px] text-neutral-600">
        © {new Date().getFullYear()} DeployForge Inc. All rights reserved.
      </p>
    </footer>
  );
}

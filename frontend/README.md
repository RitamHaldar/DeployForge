# DeployForge Frontend

<div align="center">

![DeployForge Banner](https://img.shields.io/badge/DeployForge-v2.4_LTS-00F0FF?style=for-the-badge&logo=shield&logoColor=black)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.2-FF0055?style=for-the-badge&logo=framer&logoColor=white)
![Oxlint](https://img.shields.io/badge/Oxlint-Clean_0_Errors-10B981?style=for-the-badge)

**Autonomous Deployment & Self-Healing Cloud Platform Frontend**  
*Ultra-premium cybernetic developer interface with nanosecond telemetry, eBPF visualization, and fluid 60/120fps physics.*

[Features](#-key-features) • [Design System](#-design-system--tokens) • [Architecture](#-component-architecture) • [Getting Started](#-getting-started) • [Quality & Performance](#-quality--performance-guarantees)

</div>

---

## ⚡ Overview

DeployForge is a developer-centric cloud platform engineered for resilient engineering teams. The frontend delivers an ultra-sleek, dark-mode developer console featuring real-time infrastructure topology, eBPF kernel telemetry, an interactive self-healing simulator, and a zero-scroll single-viewport authentication portal.

---

## 🎨 Design System & Tokens

DeployForge features an immersive, cybernetic developer aesthetic built on pure CSS variables and Tailwind utility integration:

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Deep Carbon Base** | `#070809` | Root viewport canvas and background |
| **Obsidian Surface** | `#090B0E` / `#0B0D10` | Frosted glass cards and console containers |
| **Electric Cyan** | `#00F0FF` | Primary action accents, focus rings, telemetry rays |
| **Autonomous Emerald** | `#10B981` | Positive statuses, health checkmarks, SLA guarantees |
| **Ingress Sky** | `#38BDF8` / `#0EA5E9` | Data packets, network throughput waves |
| **Kernel Violet** | `#A855F7` | eBPF probes, syscall telemetry, SLSA signatures |
| **Anomaly Rose** | `#F43F5E` | Fault simulation, OOM event badges, circuit breakers |
| **Healing Amber** | `#F59E0B` | Node quarantine, warm-standby provisioning |

- **Typography**:
  - Primary UI: [`Inter`](https://fonts.google.com/specimen/Inter) — clean, modern, and highly legible.
  - Metrics & Telemetry: [`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono) — tabular numbers (`tabular-nums`) to completely eradicate layout shifts and number jitter.
- **Micro-Interactions**:
  - Spring physics powered by Framer Motion (`stiffness: 450, damping: 25-30`).
  - Hardware-accelerated cursor followers (`translate3d` via `requestAnimationFrame`).
  - Radial spotlight glass cards tracking mouse movement via `--mouse-x` and `--mouse-y`.
  - Multi-layer neon focus rings with custom keyframe pulse beacons.

---

## 🚀 Component Architecture

### 1. Authentication Suite (`src/features/auth`)
* **Single-Viewport Lock (Zero Scroll)**: Locked to strict `100dvh` (`h-screen h-[100dvh] max-h-screen overflow-hidden`) with zero vertical or horizontal scrollbars across desktop and mobile.
* **Infrastructure Sentinel (`InfrastructureSentinel.tsx`)**:
  - Live animated SVG topology with glowing data packets flowing between Anycast Clients, the Sentinel Core, and K8s Worker Nodes.
  - Real-time simulated telemetry: `< 15ms` detection latency, automated cluster remediation, and `99.999%` SLA target.
  - Rotating single-line kernel event stream ticker.
* **Master Auth Card (`AuthCard.tsx`)**:
  - Fluid layout height morphing (`layout="position"`) between **Sign In**, **Create Account**, and **Forgot Password**.
  - Magnetic sliding pill tab switcher (`layoutId="active-auth-tab"`).
  - Prefix icons (`Mail`, `Lock`, `User`) transitioning from neutral to glowing cyber-cyan upon focus.
  - Password strength meter with 4 segmented neon LED bars and real-time 4-point requirement chips.
  - Micro-shake error animation on invalid submissions.
* **Ambient Canvas (`AmbientParticleCanvas.tsx`)**:
  - DPR-clamped (1.5x) particle mesh with connecting distance-based filaments.
  - Automatically pauses on tab visibility loss to conserve client CPU and battery.

---

### 2. Core Platform Showcase (`src/features/home`)
* **Floating Glass Dock (`Navbar.tsx`)**:
  - Island dock with backdrop blur (`backdrop-blur-2xl`) and magnetic sliding hover pill (`layoutId="nav-hover-pill"`).
  - Live Anycast beacon (`14ms Anycast Beacon • All systems operational`).
  - Responsive mobile navigation drawer with spring entrance animations.
* **Hero Engine (`HeroSection.tsx`)**:
  - Atmospheric central cyan aurora spotlight.
  - 1-click CLI installer pill (`curl -fsSL https://deployforge.dev/install.sh | bash`) with copy feedback.
  - Dual action CTAs with light-sweep hover animations.
  - Telemetry dock displaying live edge metrics.
* **Pipeline Visualization (`PipelineVisualization.tsx`)**:
  - Cybernetic progress conduit with animated flying light packet particles.
  - 6 interactive stages (`01 Git Push`, `02 Incremental Build`, `03 MicroVM Rootfs`, `04 Mesh Dispatch`, `05 Health Check`, `06 Global Edge`).
  - Interactive **Auto-Cycle** play/pause controller.
  - Zero-shift telemetry drawer detailing verification signatures, protocols, and latencies.
* **Live Resiliency Lab (`SelfHealingSimulator.tsx`)**:
  - Interactive fault simulation loop with dynamic load selector (**Nominal**, **Peak**, **Surge**).
  - Cybernetic **"Simulate Node Crash"** button with spinning remediation gear and countdown.
  - 3 spotlight replica cards (`rep-a`, `rep-b`, `rep-c`) with animated CPU load meters and state changes (`Degraded` -> `Isolating` -> `Verifying` -> `Recovered`).
  - Real-time kernel audit stream (`$ kernel.audit >`) with log cross-fading.
* **Deep Telemetry & eBPF Section (`ObservabilitySection.tsx`)**:
  - 4 interactive metric lenses (**Edge P99 Latency**, **Ingress Volume**, **Error Budget & SLA**, **Kernel eBPF Load**).
  - Hardware-accelerated SVG waveform with sub-millisecond binary search laser scrubber (`path.getPointAtLength`) where the glowing dot glides pixel-perfect along the curve.
  - Distributed trace waterfall with permanent fixed-height status dock (**eliminating layout shifts & scroll glitches**).
  - Global edge PoP fleet health matrix (`SFO-1`, `IAD-2`, `FRA-1`, `NRT-1`, `SIN-1`, `SYD-1`).
  - Interactive autonomous remediation event modal.
* **Infrastructure Section (`InfrastructureSection.tsx`)**:
  - Live Raft consensus radar with rotating sweep beam.
  - Circular animated SVG gauges for CPU & Memory saturation.
* **Developer CLI Terminal (`CliTerminalSection.tsx`)**:
  - Frosted glass command terminal with sliding preset tabs.
  - Progressive line streaming and dynamic scenario telemetry.
* **Precision Odometer (`AnimatedCounter.tsx`)**:
  - Rolling digit reels (`DigitReel`) utilizing `tabular-nums` to eliminate horizontal jitter.
  - Completion bloom flash on value convergence.
* **Command Monolith (`CallToActionSection.tsx`)**:
  - Spotlight command center card with cybernetic corner accents.
  - 1-click CLI install snippet and 4 trust metrics cards.
  - Wired into registration flow via `onNavigate`.
* **Platform Footer (`Footer.tsx`)**:
  - Brand command deck, live operational beacon, and instant CLI snippet.
  - 4-column structured navigation and compliance trust seals (`SOC 2`, `ISO 27001`, `Zero-Trust eBPF`).
  - Smooth spring "Back to Top" glide button.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `bun`

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/RitamHaldar/DeployForge.git
cd DeployForge/frontend

# Install dependencies
npm install

# Launch high-velocity development server
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `vite` | Starts Vite HMR dev server at `http://localhost:5173/` |
| **`npm run build`** | `tsc -b && vite build` | Compiles TypeScript and builds production distribution in `dist/` |
| **`npm run lint`** | `oxlint` | Ultra-fast linter via Oxlint (0 warnings, 0 errors) |
| **`npm run preview`** | `vite preview` | Locally preview the production build output |

---

## 🛡️ Quality & Performance Guarantees

* **Zero Jitter & Zero Layout Shifts**:
  - All status docks, terminals, and inspection drawers have stable minimum dimensions to prevent height thrashing during hover or scroll.
  - All counters and numerical readouts use `tabular-nums`.
* **High-Efficiency Rendering**:
  - Heavy DOM math uses binary search algorithms (< 0.01ms execution time).
  - Mouse listeners update CSS variables (`--mouse-x`, `--mouse-y`) directly without triggering React re-renders.
  - Particles and canvas rendering auto-pause when the browser tab is inactive.
* **Zero Linter Violations**:
  - 100% compliant with Oxlint rules across all 34 source files.

---

<div align="center">
  <sub>Built with precision for mission-critical cloud infrastructure • © 2026 DeployForge Inc.</sub>
</div>

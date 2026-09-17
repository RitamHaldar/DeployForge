import { motion } from 'framer-motion';
import { Check, Shield } from 'lucide-react';
import type { PasswordStrengthInfo } from '../types';

interface PasswordStrengthBarProps {
  strength: PasswordStrengthInfo;
  password?: string;
}

export function PasswordStrengthBar({ strength, password = '' }: PasswordStrengthBarProps) {
  // Criteria validation checks
  const criteria = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const getBarColor = (index: number) => {
    if (index >= strength.activeBars) {
      return 'bg-white/[0.08]';
    }

    switch (strength.level) {
      case 'weak':
        return 'bg-accent-rose shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      case 'fair':
        return 'bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'strong':
        return 'bg-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]';
      case 'excellent':
        return 'bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      default:
        return 'bg-white/[0.08]';
    }
  };

  const getLabelBadge = () => {
    switch (strength.level) {
      case 'weak':
        return {
          text: 'Weak',
          classes: 'text-accent-rose bg-accent-rose/10 border-accent-rose/25'
        };
      case 'fair':
        return {
          text: 'Fair',
          classes: 'text-accent-amber bg-accent-amber/10 border-accent-amber/25'
        };
      case 'strong':
        return {
          text: 'Strong',
          classes: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25'
        };
      case 'excellent':
        return {
          text: 'Excellent',
          classes: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/25'
        };
      default:
        return {
          text: 'Incomplete',
          classes: 'text-neutral-500 bg-white/5 border-white/10'
        };
    }
  };

  const badge = getLabelBadge();

  return (
    <div className="space-y-1.5 pt-0.5">
      {/* Strength Header */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1 text-neutral-400">
          <Shield className="w-2.5 h-2.5 text-neutral-500" />
          <span>Security strength</span>
        </div>
        <span
          className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold transition-all duration-300 ${badge.classes}`}
        >
          {badge.text}
        </span>
      </div>

      {/* 4 Segmented Glowing Neon Bars */}
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => {
          const isActive = idx < strength.activeBars;
          return (
            <div
              key={idx}
              className="h-1 rounded-full bg-white/[0.07] overflow-hidden relative"
            >
              <motion.div
                className={`h-full rounded-full transition-colors duration-300 ${getBarColor(idx)}`}
                initial={false}
                animate={{
                  scaleX: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0.2
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ originX: 0 }}
              />
            </div>
          );
        })}
      </div>

      {/* Real-time Interactive Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1 pt-0.5">
        {criteria.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 text-[9px] font-mono py-0.5 px-1.5 rounded-md border transition-all duration-200 ${
              item.met
                ? 'bg-accent-emerald/[0.08] border-accent-emerald/30 text-accent-emerald'
                : 'bg-white/[0.02] border-white/[0.06] text-neutral-500'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                item.met ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-white/10 text-transparent'
              }`}
            >
              <Check className="w-2 h-2 stroke-[3]" />
            </div>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

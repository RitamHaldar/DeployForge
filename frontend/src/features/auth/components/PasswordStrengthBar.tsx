import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PasswordStrengthInfo } from '../types';

interface PasswordStrengthBarProps {
  strength: PasswordStrengthInfo;
  password?: string;
}

export function PasswordStrengthBar({ strength, password = '' }: PasswordStrengthBarProps) {
  // Criteria validation checks
  const criteria = [
    { label: '8+ chars', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const getBarColor = (index: number) => {
    if (index >= strength.activeBars) {
      return 'bg-white/[0.08]';
    }

    switch (strength.level) {
      case 'weak':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
      case 'fair':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
      case 'strong':
        return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]';
      case 'excellent':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]';
      default:
        return 'bg-white/[0.08]';
    }
  };

  const getLabelInfo = () => {
    switch (strength.level) {
      case 'weak':
        return { text: 'Weak', textColor: 'text-rose-400' };
      case 'fair':
        return { text: 'Fair', textColor: 'text-amber-400' };
      case 'strong':
        return { text: 'Good', textColor: 'text-cyan-400' };
      case 'excellent':
        return { text: 'Strong', textColor: 'text-emerald-400' };
      default:
        return { text: 'Too short', textColor: 'text-neutral-500' };
    }
  };

  const labelInfo = getLabelInfo();

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-1.5 pt-1">
      {/* Strength Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-400">Password strength</span>
        <span className={`font-medium transition-colors duration-200 ${labelInfo.textColor}`}>
          {labelInfo.text}
        </span>
      </div>

      {/* 4 Segmented Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => {
          const isActive = idx < strength.activeBars;
          return (
            <div key={idx} className="h-1 rounded-full bg-white/[0.07] overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full transition-colors duration-300 ${getBarColor(idx)}`}
                initial={false}
                animate={{
                  scaleX: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0.2,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ originX: 0 }}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle requirements tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {criteria.map((item) => (
          <span
            key={item.label}
            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all duration-200 ${
              item.met
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-white/[0.02] border-white/[0.06] text-neutral-500'
            }`}
          >
            <Check className={`w-3 h-3 ${item.met ? 'opacity-100' : 'opacity-30'}`} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

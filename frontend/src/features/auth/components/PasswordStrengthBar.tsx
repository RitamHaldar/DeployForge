import { motion } from 'framer-motion';
import type { PasswordStrengthInfo } from '../types';

interface PasswordStrengthBarProps {
  strength: PasswordStrengthInfo;
}

export function PasswordStrengthBar({ strength }: PasswordStrengthBarProps) {
  const getBarColorClass = (index: number) => {
    if (index >= strength.activeBars) {
      return 'bg-white/10';
    }

    switch (strength.level) {
      case 'weak':
        return 'bg-accent-rose';
      case 'fair':
        return 'bg-accent-amber';
      case 'strong':
        return 'bg-accent-cyan';
      case 'excellent':
        return 'bg-accent-emerald';
      default:
        return 'bg-white/10';
    }
  };

  const getLabelColorClass = () => {
    switch (strength.level) {
      case 'weak':
        return 'text-accent-rose';
      case 'fair':
        return 'text-accent-amber';
      case 'strong':
        return 'text-accent-cyan';
      case 'excellent':
        return 'text-accent-emerald';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-neutral-400">Security strength</span>
        <span className={`font-medium transition-colors duration-200 ${getLabelColorClass()}`}>
          {strength.label}
        </span>
      </div>

      {/* 4 individual animated bars */}
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${getBarColorClass(idx)}`}
              initial={false}
              animate={{
                opacity: idx < strength.activeBars ? 1 : 0.4,
                scaleX: idx < strength.activeBars ? 1 : 0
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0 }}
            />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-neutral-500 font-mono">
        Use 8+ characters with uppercase, numbers, and symbols.
      </p>
    </div>
  );
}

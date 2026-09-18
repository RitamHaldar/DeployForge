import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  glowOnComplete?: boolean;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitReel({
  targetDigit,
  delay = 0,
  duration = 1.4,
  isInView = true
}: {
  targetDigit: number;
  delay?: number;
  duration?: number;
  isInView?: boolean;
}) {
  return (
    <span
      className="inline-flex flex-col h-[1em] overflow-hidden select-none tabular-nums leading-none align-baseline"
      aria-hidden="true"
    >
      <motion.span
        initial={{ y: '0%' }}
        animate={{ y: isInView ? `-${targetDigit * 10}%` : '0%' }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="flex flex-col"
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="h-[1em] flex items-center justify-center font-mono leading-none select-none"
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.4,
  className = '',
  glowOnComplete = true
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20px 0px' });
  const [hasSettled, setHasSettled] = useState(false);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Format target into formatted string representation
  const formattedString = value.toFixed(decimals);

  // Mark settled state after animation completes to trigger subtle glow bloom
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setHasSettled(true);
      }, duration * 1000 + 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, duration]);

  // If reduced motion is requested, render static formatted text
  if (prefersReducedMotion) {
    return (
      <span ref={containerRef} className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
        {prefix && <span className="mr-0.5 opacity-80">{prefix}</span>}
        <span>{formattedString}</span>
        {suffix && <span className="ml-0.5 opacity-80">{suffix}</span>}
      </span>
    );
  }

  // Parse characters to separate digits from decimal points and commas
  let digitIndex = 0;
  const characters = formattedString.split('').map((char, index) => {
    const isDigit = /\d/.test(char);
    const charDigitIndex = isDigit ? digitIndex++ : -1;
    return {
      char,
      isDigit,
      digitIndex: charDigitIndex,
      key: `${index}-${char}`
    };
  });

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-baseline font-mono tabular-nums relative transition-all duration-300 ${className} ${
        glowOnComplete && hasSettled
          ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.25)]'
          : ''
      }`}
      aria-label={`${prefix}${formattedString}${suffix}`}
    >
      {/* Prefix */}
      {prefix && (
        <span className="mr-0.5 opacity-80 select-none text-[0.85em] leading-none">
          {prefix}
        </span>
      )}

      {/* Characters / Digit Reels */}
      <span className="inline-flex items-baseline leading-none">
        {characters.map((item) => {
          if (item.isDigit) {
            return (
              <DigitReel
                key={item.key}
                targetDigit={parseInt(item.char, 10)}
                delay={item.digitIndex * 0.05}
                duration={duration}
                isInView={isInView}
              />
            );
          }

          // Static symbols like decimal point or comma
          return (
            <span
              key={item.key}
              className="inline-block px-[0.05em] leading-none select-none font-mono"
            >
              {item.char}
            </span>
          );
        })}
      </span>

      {/* Suffix */}
      {suffix && (
        <motion.span
          initial={{ opacity: 0, x: -2 }}
          animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -2 }}
          transition={{ duration: 0.4, delay: duration * 0.7 }}
          className="ml-0.5 opacity-85 select-none text-[0.85em] leading-none"
        >
          {suffix}
        </motion.span>
      )}
    </span>
  );
}

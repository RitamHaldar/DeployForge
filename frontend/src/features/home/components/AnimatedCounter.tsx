import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  useEffect(() => {
    if (isInView) {
      motionVal.set(value);
    }
  }, [isInView, motionVal, value]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springVal, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{decimals > 0 ? `.${'0'.repeat(decimals)}` : ''}{suffix}
    </span>
  );
}

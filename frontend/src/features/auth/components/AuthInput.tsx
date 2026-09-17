import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle, Mail, Lock, User } from 'lucide-react';

interface AuthInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  isValid?: boolean;
  leftIcon?: React.ReactNode;
  rightLabelAction?: React.ReactNode;
  rightStaticBadge?: React.ReactNode;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export function AuthInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  isValid,
  leftIcon,
  rightLabelAction,
  rightStaticBadge,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePasswordVisibility,
  required,
  disabled,
  className = '',
  inputClassName = ''
}: AuthInputProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [isFocused, setIsFocused] = useState(false);

  const effectiveType = showPasswordToggle
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type;

  // Auto-resolve prefix icon if not explicitly provided
  const resolvedLeftIcon = leftIcon ?? (() => {
    if (name === 'email' || type === 'email') {
      return <Mail className="w-3.5 h-3.5" />;
    }
    if (name === 'password' || type === 'password') {
      return <Lock className="w-3.5 h-3.5" />;
    }
    if (name === 'username') {
      return <User className="w-3.5 h-3.5" />;
    }
    return null;
  })();

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label & Optional Right Action */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="flex items-center gap-1 text-[11px] font-mono font-medium text-neutral-300 tracking-wide select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-accent-rose text-xs" title="Required field">*</span>
          )}
        </label>
        {rightLabelAction && (
          <div className="text-[10px] text-neutral-400">
            {rightLabelAction}
          </div>
        )}
      </div>

      {/* Input Field Container with Optional Shake on Error */}
      <motion.div
        animate={error ? { x: [0, -5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="relative group"
      >
        {/* Left Prefix Icon */}
        {resolvedLeftIcon && (
          <div
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10 ${
              error
                ? 'text-accent-rose'
                : isFocused
                ? 'text-accent-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                : 'text-neutral-500 group-hover:text-neutral-400'
            }`}
          >
            {resolvedLeftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`auth-input-field w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500/70 outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed ${
            resolvedLeftIcon ? 'pl-9' : 'pl-3.5'
          } ${
            showPasswordToggle || isValid || rightStaticBadge ? 'pr-10' : 'pr-3.5'
          } ${error ? 'input-error' : ''} ${inputClassName}`}
        />

        {/* Right Accessory: Static Symbol (e.g. '@' for username) */}
        {rightStaticBadge && !error && !isValid && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono pointer-events-none select-none flex items-center justify-center">
            {rightStaticBadge}
          </div>
        )}

        {/* Right Accessory: Valid Tick (e.g. Email Validated) with Micro-Pop */}
        {isValid && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-accent-emerald flex items-center justify-center pointer-events-none drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]"
            aria-hidden="true"
          >
            <div className="w-4 h-4 rounded-full bg-accent-emerald/15 flex items-center justify-center border border-accent-emerald/30">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </motion.div>
        )}

        {/* Right Accessory: Password Visibility Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded-lg hover:bg-white/5 active:scale-95"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPasswordVisible ? (
                <motion.div
                  key="eye-off"
                  initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 15, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye-on"
                  initial={{ opacity: 0, rotate: 15, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -15, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </motion.div>

      {/* Graceful Inline Error Message with AnimatePresence */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            id={errorId}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[11px] text-accent-rose flex items-center gap-1.5 font-mono pt-1 leading-snug">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

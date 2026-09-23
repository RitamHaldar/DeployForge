import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle, Mail, Lock, User, Phone, ChevronDown } from 'lucide-react';
import { COUNTRY_CODES } from '../types';

interface AuthInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
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
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
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
  inputClassName = '',
  countryCode,
  onCountryCodeChange,
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
  const resolvedLeftIcon =
    leftIcon ??
    (() => {
      if (countryCode !== undefined) {
        return null;
      }
      if (name === 'email' || type === 'email') {
        return <Mail className="w-4 h-4" />;
      }
      if (name === 'password' || type === 'password') {
        return <Lock className="w-4 h-4" />;
      }
      if (name === 'username') {
        return <User className="w-4 h-4" />;
      }
      if (type === 'tel' || name.includes('phone') || name.includes('mobile')) {
        return <Phone className="w-4 h-4" />;
      }
      return null;
    })();

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Optional Right Action */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-neutral-300 tracking-normal select-none flex items-center gap-1"
        >
          <span>{label}</span>
          {required && (
            <span className="text-accent-rose text-xs leading-none" title="Required">
              *
            </span>
          )}
        </label>
        {rightLabelAction && (
          <div className="text-xs text-neutral-400">{rightLabelAction}</div>
        )}
      </div>

      {/* Input Field Container with Micro Shake on Error */}
      <motion.div
        animate={error ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className={`relative flex items-center h-11 w-full rounded-xl transition-all duration-200 overflow-hidden ${
          error
            ? 'bg-rose-950/20 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/30'
            : isFocused
            ? 'bg-[#0E1116] border border-cyan-400/50 ring-2 ring-cyan-400/15 shadow-[0_0_20px_rgba(0,240,255,0.06)]'
            : 'bg-[#0B0D11]/90 border border-white/[0.08] hover:border-white/[0.16]'
        }`}
      >
        {/* Country Code Dropdown (for Mobile Phone Inputs) */}
        {countryCode !== undefined && (
          <div className="flex items-center h-full pl-3 pr-2.5 border-r border-white/10 shrink-0 gap-1.5 select-none bg-white/[0.02]">
            <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={countryCode}
              onChange={(e) => onCountryCodeChange?.(e.target.value)}
              disabled={disabled}
              className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer appearance-none pr-1"
              aria-label="Country Code"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#101216] text-white">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 pointer-events-none shrink-0" />
          </div>
        )}

        {/* Left Prefix Icon (when not phone input) */}
        {resolvedLeftIcon && countryCode === undefined && (
          <div
            className={`flex items-center justify-center h-full pl-3.5 pr-1 pointer-events-none transition-colors duration-200 shrink-0 ${
              error
                ? 'text-accent-rose'
                : isFocused
                ? 'text-cyan-400'
                : 'text-neutral-500'
            }`}
          >
            {resolvedLeftIcon}
          </div>
        )}

        {/* Input Text Element */}
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
          className={`h-full flex-1 min-w-0 bg-transparent px-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500/70 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`}
        />

        {/* Right Accessory: Static Symbol (e.g. '@' for username) */}
        {rightStaticBadge && !error && !isValid && (
          <div className="flex items-center justify-center h-full pr-3.5 text-neutral-500 text-xs select-none pointer-events-none shrink-0">
            {rightStaticBadge}
          </div>
        )}

        {/* Right Accessory: Valid Tick with Micro-Pop */}
        {isValid && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center justify-center h-full pr-3.5 text-accent-emerald pointer-events-none shrink-0"
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
            className="flex items-center justify-center h-full pr-3.5 pl-1.5 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded-r-xl shrink-0"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPasswordVisible ? (
                <motion.div
                  key="eye-off"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center"
                >
                  <EyeOff className="w-4 h-4 text-neutral-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye-on"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 text-neutral-400" />
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
            <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5 leading-snug">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

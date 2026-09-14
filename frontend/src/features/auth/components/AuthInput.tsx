import React, { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

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

  const effectiveType = showPasswordToggle
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Optional Right Action / Helper */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-neutral-300 select-none"
        >
          {label} {required && <span className="text-accent-rose">*</span>}
        </label>
        {rightLabelAction && (
          <div className="text-[11px] text-neutral-400">
            {rightLabelAction}
          </div>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`auth-input-field w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'input-error' : ''
          } ${showPasswordToggle || isValid || rightStaticBadge ? 'pr-10' : ''} ${inputClassName}`}
        />

        {/* Right Accessory: Static Symbol (e.g. '@' for username) */}
        {rightStaticBadge && !error && !isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono pointer-events-none select-none">
            {rightStaticBadge}
          </div>
        )}

        {/* Right Accessory: Valid Tick (e.g. Email Validated) */}
        {isValid && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-emerald pointer-events-none"
            aria-hidden="true"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}

        {/* Right Accessory: Password Visibility Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan rounded"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {isPasswordVisible ? (
              <EyeOff className="w-4 h-4 text-neutral-300" />
            ) : (
              <Eye className="w-4 h-4 text-neutral-400" />
            )}
          </button>
        )}
      </div>

      {/* Graceful Inline Error Message with AnimatePresence */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] text-accent-rose flex items-center gap-1.5 font-mono pt-0.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const id = useId();
    const inputId = props.id || id;
    const inputClasses = [styles.input, error && styles.error, className].filter(Boolean).join(' ');

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {' '}
            {/* ← Agregar htmlFor */}
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>
        )}

        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            style={{
              paddingLeft: leftIcon ? '40px' : undefined,
              paddingRight: rightIcon ? '40px' : undefined,
            }}
            {...props}
          />

          {rightIcon && (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && <span className={styles.errorMessage}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

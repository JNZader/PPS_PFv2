import type { SelectHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import styles from './Select.module.css';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, required, placeholder, options, className = '', ...props }, ref) => {
    const id = useId();
    const selectId = props.id || id;
    const selectClasses = [styles.select, error && styles.error, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.selectWrapper}>
        {label && (
          <label className={styles.label} htmlFor={selectId}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>
        )}

        <select ref={ref} id={selectId} className={selectClasses} {...props}>
          {placeholder && (
            <option value="" disabled className={styles.placeholder}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <span className={styles.errorMessage}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

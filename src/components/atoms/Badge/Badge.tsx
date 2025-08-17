import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  outline?: boolean;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export const Badge = ({
  variant = 'default',
  size = 'medium',
  outline = false,
  dot = false,
  children,
  className = '',
}: BadgeProps) => {
  const classes = [
    styles.badge,
    styles[variant],
    styles[size],
    outline && styles.outline,
    dot && styles.dot,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
};

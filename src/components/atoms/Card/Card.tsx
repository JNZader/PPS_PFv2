import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'interactive' | 'compact';
  className?: string;
  onClick?: () => void;
}

export const Card = ({
  children,
  header,
  footer,
  title,
  subtitle,
  variant = 'default',
  className = '',
  onClick,
}: CardProps) => {
  const classes = [
    styles.card,
    variant !== 'default' && styles[variant],
    onClick && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardContent = (
    <>
      {(header || title || subtitle) && (
        <div className={styles.header}>
          {header}
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      <div className={styles.content}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-label="Tarjeta interactiva">
        {cardContent}
      </button>
    );
  }

  return <div className={classes}>{cardContent}</div>;
};

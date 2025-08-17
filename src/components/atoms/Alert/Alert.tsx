import type { ReactNode } from 'react';
import { MdCheckCircle, MdClose, MdError, MdInfo, MdWarning } from 'react-icons/md';
import styles from './Alert.module.css';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: ReactNode;
}

const icons = {
  info: MdInfo,
  success: MdCheckCircle,
  warning: MdWarning,
  error: MdError,
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  actions,
}: AlertProps) => {
  const Icon = icons[variant];

  return (
    <div className={`${styles.alert} ${styles[variant]} ${dismissible ? styles.dismissible : ''}`}>
      <div className={styles.icon}>
        <Icon size={20} />
      </div>

      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.description}>{children}</div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {dismissible && onDismiss && (
        <button
          type="button" // ← Agregar type
          className={styles.dismissButton}
          onClick={onDismiss}
        >
          <MdClose size={16} />
        </button>
      )}
    </div>
  );
};

import styles from './Loading.module.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  text?: string;
}

export const Loading = ({ size = 'medium', fullscreen = false, text }: LoadingProps) => {
  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        <div className={`${styles.spinner} ${styles.large}`} />
        {text && <div className={styles.text}>{text}</div>}
      </div>
    );
  }

  const sizeClass = size === 'large' ? styles.large : size === 'small' ? styles.small : '';

  return <div className={`${styles.spinner} ${sizeClass}`} />;
};

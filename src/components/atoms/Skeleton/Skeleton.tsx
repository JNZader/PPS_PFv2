import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'rectangle' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = ({ variant = 'text', width, height, className = '' }: SkeletonProps) => {
  const classes = [styles.skeleton, styles[variant], className].filter(Boolean).join(' ');

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={classes} style={style} />;
};

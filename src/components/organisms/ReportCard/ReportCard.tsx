import { useState } from 'react';
// ✅ CORRECCIÓN: Se eliminó MdDownload que no se estaba utilizando.
import { MdPictureAsPdf, MdTableChart, MdVisibility } from 'react-icons/md';
import type { ReportType } from '../../../types/reports';
import { Loading } from '../../atoms/Loading';
import styles from './ReportCard.module.css';

interface ReportCardProps {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  lastGenerated?: string;
  onGeneratePDF: () => Promise<void>;
  onGenerateCSV: () => Promise<void>;
  onPreview?: () => void;
}

export const ReportCard = ({
  // ✅ CORRECCIÓN: Se eliminó la prop "type" que no se usaba.
  title,
  description,
  icon,
  lastGenerated,
  onGeneratePDF,
  onGenerateCSV,
  onPreview,
}: ReportCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    try {
      setIsGenerating(true);
      await action();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`${styles.reportCard} ${isGenerating ? styles.generating : ''}`}>
      {isGenerating && (
        <div className={styles.loadingOverlay}>
          <Loading text="Generando reporte..." />
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          {lastGenerated && `Última generación: ${lastGenerated}`}
        </div>

        <div className={styles.cardActions}>
          {onPreview && (
            <button
              type="button"
              className={styles.actionButton}
              onClick={onPreview}
              disabled={isGenerating}
            >
              <MdVisibility size={16} />
              Vista Previa
            </button>
          )}

          <button
            type="button"
            className={styles.actionButton}
            onClick={() => handleAction(onGenerateCSV)}
            disabled={isGenerating}
          >
            <MdTableChart size={16} />
            CSV
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${styles.primaryAction}`}
            onClick={() => handleAction(onGeneratePDF)}
            disabled={isGenerating}
          >
            <MdPictureAsPdf size={16} />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
};

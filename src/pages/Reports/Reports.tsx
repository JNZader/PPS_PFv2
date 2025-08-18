import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdAssessment,
  MdDownload,
  MdFilterList,
  MdHelpOutline,
  MdInventory,
  MdPictureAsPdf,
  MdPreview,
  MdTrendingDown,
  MdTrendingUp,
  MdWarning,
} from 'react-icons/md';
import { Alert } from '../../components/atoms/Alert';
import { Loading } from '../../components/atoms/Loading';
import { ReportFilters } from '../../components/molecules/ReportFilters';
import { ReportCard } from '../../components/organisms/ReportCard';
import { ReportPreview } from '../../components/organisms/ReportPreview';
import { useProducts } from '../../hooks/useProducts';
import { ReportGenerator } from '../../services/reports/reportGenerator';
import type { AnyReportData, ReportFilters as IReportFilters, ReportType } from '../../types/reports';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../utils/format';
import styles from './Reports.module.css';

export const Reports = () => {
  const [filters, setFilters] = useState<IReportFilters>({
    tipoReporte: 'stock-actual',
  });
  const [reportData, setReportData] = useState<AnyReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({});

  const { data: products = [], isLoading } = useProducts();

  // Calcular estadísticas rápidas
  const stats = {
    totalProducts: products.length,
    lowStockProducts: products.filter((p) => p.stock <= p.stock_minimo).length,
    totalValue: products.reduce((sum, p) => sum + p.stock * p.precioventa, 0),
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  // Configuración de reportes disponibles
  const availableReports = [
    {
      type: 'stock' as const,
      title: 'Reporte de Stock Actual',
      description: 'Estado completo del inventario con todos los productos y sus niveles de stock.',
      icon: <MdInventory size={24} />,
      generator: () => ReportGenerator.generateStockReport(filters),
    },
    {
      type: 'low-stock' as const,
      title: 'Productos con Stock Bajo',
      description: 'Lista de productos que requieren reabastecimiento urgente.',
      icon: <MdWarning size={24} />,
      generator: () => ReportGenerator.generateLowStockReport(filters),
    },
    {
      type: 'kardex' as const,
      title: 'Reporte de Kardex',
      description: 'Historial detallado de movimientos de entrada y salida de productos.',
      icon: <MdTrendingUp size={24} />,
      generator: () => ReportGenerator.generateKardexReport(filters),
    },
    {
      type: 'inventory-value' as const,
      title: 'Inventario Valorado',
      description: 'Valoración completa del inventario con precios de compra y venta.',
      icon: <MdAssessment size={24} />,
      generator: () => ReportGenerator.generateInventoryValueReport(filters),
    },
  ];

  const handleGenerateReport = async (type: ReportType) => {
    try {
      setIsGenerating(true);
      const data = await availableReports.find((r) => r.type === type)?.generator();
      if (data) {
        setReportData(data);
        setLastGenerated((prev) => ({
          ...prev,
          [type]: formatRelativeTime(new Date()),
        }));
        toast.success('Reporte generado exitosamente');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportData) return;

    try {
      setIsGenerating(true);
      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      ReportGenerator.downloadFile(pdfBlob, `${reportData.type}-report`, 'pdf');
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el reporte PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCSV = async () => {
    if (!reportData) return;

    try {
      setIsGenerating(true);
      const csvContent = ReportGenerator.generateCSV(reportData);
      ReportGenerator.downloadFile(csvContent, `${reportData.type}-report`, 'csv');
      toast.success('Reporte CSV generado exitosamente');
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Error al generar el reporte CSV');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFiltersChange = (newFilters: IReportFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return <Loading fullscreen text="Cargando datos para reportes..." />;
  }

  return (
    <div className={styles.reportsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdAssessment size={32} />
          Sistema de Reportes
        </h1>
        <p className={styles.pageSubtitle}>
          Genera reportes detallados de inventario, stock y movimientos
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
            <MdInventory size={24} />
          </div>
          <div className={styles.statValue}>{formatNumber(stats.totalProducts)}</div>
          <div className={styles.statLabel}>Total Productos</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
            <MdWarning size={24} />
          </div>
          <div className={styles.statValue}>{formatNumber(stats.lowStockProducts)}</div>
          <div className={styles.statLabel}>Stock Bajo</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
            <MdTrendingUp size={24} />
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.totalValue)}</div>
          <div className={styles.statLabel}>Valor Total</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#ef4444' }}>
            <MdTrendingDown size={24} />
          </div>
          <div className={styles.statValue}>{formatNumber(stats.outOfStock)}</div>
          <div className={styles.statLabel}>Sin Stock</div>
        </div>
      </div>

      {/* Alertas */}
      {stats.lowStockProducts > 0 && (
        <Alert variant="warning" title={`${stats.lowStockProducts} productos con stock bajo`}>
          Te recomendamos generar el reporte de stock bajo para identificar los productos que
          necesitan reabastecimiento.
        </Alert>
      )}

      {stats.outOfStock > 0 && (
        <Alert variant="error" title={`${stats.outOfStock} productos sin stock`}>
          Hay productos completamente agotados que requieren atención inmediata.
        </Alert>
      )}

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <h2 className={styles.sectionTitle}>
          <MdFilterList size={24} />
          Filtros de Reportes
        </h2>
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onGeneratePDF={handleGeneratePDF}
          onGenerateCSV={handleGenerateCSV}
          isGenerating={isGenerating}
        />
      </div>

      {/* Grid de Reportes */}
      <div className={styles.reportsGrid}>
        {availableReports.map((report) => (
          <ReportCard
            key={report.type}
            type={report.type}
            title={report.title}
            description={report.description}
            icon={report.icon}
            lastGenerated={lastGenerated[report.type]}
            onGeneratePDF={() => handleGenerateReport(report.type)}
            onGenerateCSV={() => handleGenerateReport(report.type)}
            onPreview={() => handleGenerateReport(report.type)}
          />
        ))}
      </div>

      {/* Visor de reportes */}
      <div className={styles.previewSection}>
        <h2 className={styles.sectionTitle}>
          <MdPreview size={24} />
          Vista Previa del Reporte
        </h2>
        <ReportPreview data={reportData} isLoading={isGenerating} />
      </div>

      {/* Reportes Recientes */}
      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>
          <MdDownload size={24} />
          Reportes Recientes
        </h2>

        {Object.keys(lastGenerated).length === 0 ? (
          <div className={styles.emptyState}>
            <MdPictureAsPdf
              size={48}
              style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}
            />
            <p>No hay reportes generados recientemente</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Genera tu primer reporte usando las opciones de arriba
            </p>
          </div>
        ) : (
          <div className={styles.recentList}>
            {Object.entries(lastGenerated).map(([type, time]) => {
              const report = availableReports.find((r) => r.type === type);
              return (
                <div key={type} className={styles.recentItem}>
                  <div className={styles.recentInfo}>
                    <div className={styles.recentTitle}>{report?.title}</div>
                    <div className={styles.recentMeta}>Generado {time}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.downloadButton}
                    onClick={() => report && handleGenerateReport(type as ReportType)}
                    disabled={isGenerating}
                  >
                    <MdDownload size={16} />
                    Descargar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sección de Ayuda */}
      <div className={styles.helpSection}>
        <h3 className={styles.helpTitle}>
          <MdHelpOutline size={20} />
          Guía de Reportes
        </h3>
        <ul className={styles.helpList}>
          <li className={styles.helpItem}>
            <MdInventory className={styles.helpIcon} size={16} />
            <span>
              <strong>Reporte de Stock:</strong> Muestra el estado actual de todos los productos con
              sus niveles de inventario.
            </span>
          </li>
          <li className={styles.helpItem}>
            <MdWarning className={styles.helpIcon} size={16} />
            <span>
              <strong>Stock Bajo:</strong> Identifica productos que están por debajo del stock
              mínimo configurado.
            </span>
          </li>
          <li className={styles.helpItem}>
            <MdTrendingUp className={styles.helpIcon} size={16} />
            <span>
              <strong>Kardex:</strong> Historial completo de entradas y salidas de productos en un
              período específico.
            </span>
          </li>
          <li className={styles.helpItem}>
            <MdAssessment className={styles.helpIcon} size={16} />
            <span>
              <strong>Inventario Valorado:</strong> Análisis financiero del inventario con valores
              de compra y venta.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
import { MdFilterList, MdPictureAsPdf, MdTableChart } from 'react-icons/md';
import { useBrands, useCategories } from '../../../hooks/useProducts';
// ✅ CORRECCIÓN: Se renombró el tipo importado para evitar conflicto de nombres con el componente.
import type { ReportFilters as ReportFiltersType, ReportType } from '../../../types/reports';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import styles from './ReportFilters.module.css';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  onGeneratePDF: () => void;
  onGenerateCSV: () => void;
  isGenerating?: boolean;
}

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: 'stock-actual', label: 'Stock Actual' },
  { value: 'stock-bajo', label: 'Productos con Stock Bajo' },
  { value: 'inventario-valorado', label: 'Inventario Valorado' },
  { value: 'kardex-general', label: 'Kardex General' },
  { value: 'movimientos-periodo', label: 'Movimientos por Período' },
];

export const ReportFilters = ({
  filters,
  onFiltersChange,
  onGeneratePDF,
  onGenerateCSV,
  isGenerating = false,
}: ReportFiltersProps) => {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.descripcion })),
  ];

  const brandOptions = [
    { value: '', label: 'Todas las marcas' },
    ...brands.map((brand) => ({ value: brand.id.toString(), label: brand.descripcion })),
  ];

  // ✅ CORRECCIÓN: Se reemplazó 'any' por un tipo más específico.
  const handleFilterChange = (key: keyof ReportFiltersType, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      tipoReporte: 'stock-actual',
      fechaInicio: '',
      fechaFin: '',
      categoria: '',
      marca: '',
      incluirStockCero: false,
      soloStockBajo: false,
    });
  };

  return (
    <div className={styles.filtersContainer}>
      <h3 className={styles.filtersTitle}>
        <MdFilterList size={20} />
        Filtros del Reporte
      </h3>

      <div className={styles.filtersGrid}>
        <Select
          label="Tipo de Reporte"
          options={reportTypes}
          value={filters.tipoReporte}
          onChange={(e) => handleFilterChange('tipoReporte', e.target.value as ReportType)}
          required
        />

        <Input
          label="Fecha Inicio"
          type="date"
          value={filters.fechaInicio || ''}
          onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
        />

        <Input
          label="Fecha Fin"
          type="date"
          value={filters.fechaFin || ''}
          onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
        />

        <Select
          label="Categoría"
          options={categoryOptions}
          value={filters.categoria || ''}
          onChange={(e) => handleFilterChange('categoria', e.target.value)}
        />

        <Select
          label="Marca"
          options={brandOptions}
          value={filters.marca || ''}
          onChange={(e) => handleFilterChange('marca', e.target.value)}
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={filters.incluirStockCero || false}
              onChange={(e) => handleFilterChange('incluirStockCero', e.target.checked)}
            />
            <span className={styles.checkboxLabel}>Incluir productos sin stock</span>
          </label>

          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={filters.soloStockBajo || false}
              onChange={(e) => handleFilterChange('soloStockBajo', e.target.checked)}
            />
            <span className={styles.checkboxLabel}>Solo productos con stock bajo</span>
          </label>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.clearAction} onClick={handleClearFilters}>
          Limpiar Filtros
        </button>

        <div className={styles.generateActions}>
          <Button variant="secondary" size="sm" onClick={onGenerateCSV} disabled={isGenerating}>
            <MdTableChart size={16} />
            Exportar CSV
          </Button>

          <Button size="sm" onClick={onGeneratePDF} disabled={isGenerating} loading={isGenerating}>
            <MdPictureAsPdf size={16} />
            Generar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

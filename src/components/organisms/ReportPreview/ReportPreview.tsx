import type { KardexExtendido, ProductoExtendido } from '../../../types/database';
import type { AnyReportData, InventoryValueProduct } from '../../../types/reports';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';
import { Loading } from '../../atoms/Loading';
import styles from './ReportPreview.module.css';

interface ReportPreviewProps {
  data: AnyReportData | null;
  isLoading?: boolean;
}

export const ReportPreview = ({ data, isLoading }: ReportPreviewProps) => {
  if (isLoading) {
    return (
      <div className={styles.loadingPreview}>
        <Loading text="Generando vista previa..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.emptyPreview}>
        <p>Selecciona los filtros y genera un reporte para ver la vista previa</p>
      </div>
    );
  }

  const renderSummary = () => {
    switch (data.type) {
      case 'stock':
      case 'low-stock':
        return (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatNumber(data.summary.totalProducts)}</div>
              <div className={styles.summaryLabel}>Total Productos</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatCurrency(data.summary.totalValue)}</div>
              <div className={styles.summaryLabel}>Valor Total</div>
            </div>
            {data.type === 'low-stock' && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryValue}>
                  {formatNumber(data.summary.criticalProducts || 0)}
                </div>
                <div className={styles.summaryLabel}>Productos Críticos</div>
              </div>
            )}
          </div>
        );

      case 'kardex':
        return (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatNumber(data.summary.totalMovements)}</div>
              <div className={styles.summaryLabel}>Total Movimientos</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatNumber(data.summary.totalEntries)}</div>
              <div className={styles.summaryLabel}>Total Entradas</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatNumber(data.summary.totalExits)}</div>
              <div className={styles.summaryLabel}>Total Salidas</div>
            </div>
          </div>
        );

      case 'inventory-value':
        return (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {formatCurrency(data.summary.totalValueSale)}
              </div>
              <div className={styles.summaryLabel}>Valor Venta</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {formatCurrency(data.summary.totalValueCost)}
              </div>
              <div className={styles.summaryLabel}>Valor Compra</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {formatCurrency(data.summary.totalPotentialProfit)}
              </div>
              <div className={styles.summaryLabel}>Utilidad Potencial</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderDataTable = () => {
    if (!data.data || data.data.length === 0) {
      return <p>No hay datos para mostrar</p>;
    }

    switch (data.type) {
      case 'stock':
      case 'low-stock':
        return (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.data.slice(0, 10).map((item: ProductoExtendido) => (
                <tr key={item.id}>
                  <td>{item.descripcion}</td>
                  <td>{item.categoria}</td>
                  <td>{item.stock}</td>
                  <td>{item.stock_minimo}</td>
                  <td>{formatCurrency(item.precioventa)}</td>
                  <td>
                    <span
                      style={{
                        color:
                          item.stock <= item.stock_minimo
                            ? 'var(--color-error)'
                            : 'var(--color-success)',
                      }}
                    >
                      {item.stock <= item.stock_minimo ? 'BAJO' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'kardex':
        return (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {data.data.slice(0, 10).map((item: KardexExtendido) => (
                <tr key={item.id}>
                  <td>{formatDate(item.fecha)}</td>
                  <td>{item.descripcion}</td>
                  <td>
                    <span
                      style={{
                        color:
                          item.tipo === 'entrada' ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {item.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td>{item.cantidad}</td>
                  <td>{item.nombres}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'inventory-value':
        return (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Valor Compra</th>
                <th>Valor Venta</th>
                <th>Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {data.data.slice(0, 10).map((item: InventoryValueProduct) => (
                <tr key={item.id}>
                  <td>{item.descripcion}</td>
                  <td>{item.stock}</td>
                  <td>{formatCurrency(item.valorCompra)}</td>
                  <td>{formatCurrency(item.valorVenta)}</td>
                  <td
                    style={{
                      color:
                        item.utilidadPotencial > 0 ? 'var(--color-success)' : 'var(--color-error)',
                    }}
                  >
                    {formatCurrency(item.utilidadPotencial)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>{data.title}</h3>
        <div className={styles.previewMeta}>
          Generado el {formatDate(data.generatedAt, 'dd/MM/yyyy HH:mm')}
        </div>
      </div>

      <div className={styles.previewContent}>
        <div className={styles.summarySection}>
          <h4 className={styles.summaryTitle}>Resumen</h4>
          {renderSummary()}
        </div>

        <div>
          <h4 className={styles.summaryTitle}>
            Datos ({data.data?.length || 0} registros)
            {data.data && data.data.length > 10 && (
              <span style={{ fontWeight: 'normal', fontSize: 'var(--font-size-sm)' }}>
                {' '}
                (mostrando primeros 10)
              </span>
            )}
          </h4>
          {renderDataTable()}
        </div>
      </div>
    </div>
  );
};

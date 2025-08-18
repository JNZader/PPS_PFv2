import { useState } from 'react';
import { MdInventory, MdTrendingDown, MdTrendingUp, MdWarning } from 'react-icons/md';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Modal } from '../../components/molecules/Modal';
import { KardexTable } from '../../components/organisms/KardexTable';
import { MovementForm } from '../../components/organisms/MovementForm';
import { useKardexStats } from '../../hooks/useKardex';
import { useProducts } from '../../hooks/useProducts';
import type { Producto } from '../../types/database';
import { formatNumber } from '../../utils/format';
import styles from './Inventory.module.css';

const Inventory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: stats } = useKardexStats(30);

  const lowStockProducts = products.filter((p: Producto) => p.stock <= p.stock_minimo);
  const urgentStockProducts = products.filter(
    (p: Producto) => p.stock === 0 || p.stock < p.stock_minimo / 2
  );

  const totalProducts = products.length;

  const handleAddMovement = () => {
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const chartData = stats
    ? [
        ...stats.entradasPorDia.map((item) => ({
          fecha: item.fecha,
          entradas: item.cantidad,
          salidas: 0,
        })),
        ...stats.salidasPorDia.map((item) => {
          const existing = stats.entradasPorDia.find((e) => e.fecha === item.fecha);
          return {
            fecha: item.fecha,
            entradas: existing?.cantidad || 0,
            salidas: item.cantidad,
          };
        }),
      ]
        .reduce(
          (acc, curr) => {
            const existing = acc.find((item) => item.fecha === curr.fecha);
            if (existing) {
              existing.entradas = Math.max(existing.entradas, curr.entradas);
              existing.salidas = Math.max(existing.salidas, curr.salidas);
            } else {
              acc.push(curr);
            }
            return acc;
          },
          [] as Array<{ fecha: string; entradas: number; salidas: number }>
        )
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];

  return (
    <div className={styles.inventoryPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdInventory size={32} />
          Kardex de Inventario
        </h1>
        <p className={styles.pageSubtitle}>
          Controla entradas, salidas y movimientos de tu inventario
        </p>
      </div>

      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
              <MdInventory size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{formatNumber(totalProducts)}</div>
          <div className={styles.statLabel}>Productos en Inventario</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
              <MdTrendingUp size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{stats ? formatNumber(stats.totalEntradas) : '0'}</div>
          <div className={styles.statLabel}>Entradas (30 días)</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ backgroundColor: '#ef4444' }}>
              <MdTrendingDown size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{stats ? formatNumber(stats.totalSalidas) : '0'}</div>
          <div className={styles.statLabel}>Salidas (30 días)</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
              <MdWarning size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{formatNumber(lowStockProducts.length)}</div>
          <div className={styles.statLabel}>Productos con Stock Bajo</div>
        </div>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>
            <MdTrendingUp size={24} />
            Movimientos de los Últimos 30 Días
          </h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(fecha) =>
                    new Date(fecha).toLocaleDateString('es-AR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(fecha) => new Date(fecha).toLocaleDateString('es-AR')}
                  formatter={(value, name) => [
                    formatNumber(Number(value)),
                    name === 'entradas' ? 'Entradas' : 'Salidas',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="salidas"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>
            <MdWarning size={24} />
            Alertas de Stock ({lowStockProducts.length})
          </h2>
          <div className={styles.lowStockList}>
            {lowStockProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-2xl)',
                  color: 'var(--text-secondary)',
                }}
              >
                ✅ Todos los productos tienen stock adecuado
              </div>
            ) : (
              lowStockProducts.map((product: Producto) => (
                <div key={product.id} className={styles.lowStockItem}>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.descripcion}</div>
                    <div className={styles.productStock}>
                      Stock: {product.stock} / Mínimo: {product.stock_minimo}
                    </div>
                  </div>
                  {urgentStockProducts.some((p: Producto) => p.id === product.id) && (
                    <div className={styles.urgentBadge}>URGENTE</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <KardexTable onAddMovement={handleAddMovement} />
      </div>

      <Modal isOpen={isFormOpen} onClose={handleFormCancel} title="Nuevo Movimiento" size="medium">
        <MovementForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </Modal>
    </div>
  );
};

export default Inventory;

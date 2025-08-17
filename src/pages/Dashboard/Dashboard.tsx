import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdAssessment,
  MdCategory,
  MdInventory,
  MdRefresh,
  MdShoppingCart,
  MdTrendingUp,
  MdWarning,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert } from '../../components/atoms/Alert';
import { Badge } from '../../components/atoms/Badge';
import { Loading } from '../../components/atoms/Loading';
import { useKardexStats } from '../../hooks/useKardex';
import { useProducts } from '../../hooks/useProducts';
import { useDashboardData } from '../../services/mockData';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../utils/format';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user } = useAuthStore();
  // ⬇️ Ahora products es Producto[] gracias al hook tipado
  const { data: products = [] } = useProducts();
  const { data: kardexStats } = useKardexStats(7);
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return <Loading fullscreen text="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Alert variant="error" title="Error al cargar datos">
          No se pudieron cargar los datos del dashboard. Por favor, intenta nuevamente.
        </Alert>
      </div>
    );
  }

  // Calcular estadísticas reales
  const lowStockProducts = products.filter((p) => p.stock <= p.stock_minimo);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.precioventa, 0);

  const stats = [
    {
      label: 'Total Productos',
      value: formatNumber(products.length),
      icon: <MdInventory size={24} />,
      color: '#3b82f6',
      trend: null,
    },
    {
      label: 'Stock Bajo',
      value: formatNumber(lowStockProducts.length),
      icon: <MdWarning size={24} />,
      color: '#f59e0b',
      trend: null,
    },
    {
      label: 'Entradas (7 días)',
      value: formatNumber(kardexStats?.totalEntradas || 0),
      icon: <MdShoppingCart size={24} />,
      color: '#10b981',
      trend: null,
    },
    {
      label: 'Valor Total',
      value: formatCurrency(totalValue),
      icon: <MdTrendingUp size={24} />,
      color: '#8b5cf6',
      trend: null,
    },
  ];

  const quickActions = [
    {
      to: '/products/new',
      icon: <MdAdd size={20} />,
      title: 'Agregar Producto',
      description: 'Registrar nuevo producto',
    },
    {
      to: '/inventory',
      icon: <MdInventory size={20} />,
      title: 'Movimiento de Stock',
      description: 'Entrada o salida de inventario',
    },
    {
      to: '/reports',
      icon: <MdAssessment size={20} />,
      title: 'Ver Reportes',
      description: 'Generar reportes detallados',
    },
    {
      to: '/categories',
      icon: <MdCategory size={20} />,
      title: 'Gestionar Categorías',
      description: 'Organizar productos',
    },
  ];

  const filteredActions = quickActions.filter((action) => {
    if (action.to === '/categories' && user?.tipouser === 'empleado') return false;
    if (action.to === '/reports' && user?.tipouser === 'empleado') return false;
    return true;
  });

  // Preparar datos del gráfico con datos reales de kardex
  const chartData = kardexStats
    ? [
        ...kardexStats.entradasPorDia.map((item) => ({
          date: item.fecha,
          sales: 0,
          entries: item.cantidad,
        })),
        ...kardexStats.salidasPorDia.map((item) => {
          const existing = kardexStats.entradasPorDia.find((e) => e.fecha === item.fecha);
          return {
            date: item.fecha,
            sales: item.cantidad,
            entries: existing?.cantidad || 0,
          };
        }),
      ]
        .reduce(
          (acc, curr) => {
            const existing = acc.find((item) => item.date === curr.date);
            if (existing) {
              existing.sales = Math.max(existing.sales, curr.sales);
              existing.entries = Math.max(existing.entries, curr.entries);
            } else {
              acc.push(curr);
            }
            return acc;
          },
          [] as Array<{ date: string; sales: number; entries: number }>
        )
        .sort((a, b) => a.date.localeCompare(b.date))
    : data.salesChart;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>¡Bienvenido, {user?.nombres}!</h1>
        <div className={styles.subtitle}>
          Aquí tienes un resumen de tu inventario
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => refetch()}
            title="Actualizar datos"
          >
            <MdRefresh size={20} />
          </button>
        </div>
        <div className={styles.lastUpdate}>
          Última actualización: {formatRelativeTime(new Date())}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Alert variant="warning" title={`${lowStockProducts.length} productos con stock bajo`}>
          Algunos productos necesitan reabastecimiento.
          <Link to="/inventory" style={{ marginLeft: '8px', color: 'inherit', fontWeight: 'bold' }}>
            Ver inventario →
          </Link>
        </Alert>
      )}

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            {stat.trend !== null && (
              <div
                className={`${styles.statTrend} ${
                  stat.trend >= 0 ? styles.trendUp : styles.trendDown
                }`}
              >
                {stat.trend >= 0 ? <MdArrowUpward size={16} /> : <MdArrowDownward size={16} />}
                {Math.abs(stat.trend)}% vs ayer
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>
            <MdTrendingUp size={24} />
            Movimientos de la Semana
          </h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('es-AR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-AR')}
                  formatter={(value, name) => [
                    formatNumber(Number(value)),
                    name === 'sales' ? 'Salidas' : name === 'entries' ? 'Entradas' : 'Movimientos',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>
            <MdWarning size={24} />
            Productos con Stock Bajo
          </h2>
          {lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryName}>{product.descripcion}</div>
                <div className={styles.categoryStats}>
                  Stock: {product.stock} / Mínimo: {product.stock_minimo}
                </div>
              </div>
              <div className={styles.categoryValue}>
                {product.stock === 0 ? (
                  <Badge variant="error">SIN STOCK</Badge>
                ) : product.stock < product.stock_minimo / 2 ? (
                  <Badge variant="warning">CRÍTICO</Badge>
                ) : (
                  <Badge variant="warning">BAJO</Badge>
                )}
              </div>
            </div>
          ))}
          {lowStockProducts.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: 'var(--spacing-lg)',
              }}
            >
              ✅ Todos los productos tienen stock adecuado
            </div>
          )}
        </div>
      </div>

      <div className={styles.movementsSection}>
        <h2 className={styles.sectionTitle}>
          <MdInventory size={24} />
          Movimientos Recientes
        </h2>
        {data.recentMovements.length > 0 ? (
          data.recentMovements.map((movement) => (
            <div key={movement.id} className={styles.movementItem}>
              <div
                className={`${styles.movementIcon} ${
                  movement.type === 'entry' ? styles.entryIcon : styles.exitIcon
                }`}
              >
                {movement.type === 'entry' ? (
                  <MdArrowDownward size={20} />
                ) : (
                  <MdArrowUpward size={20} />
                )}
              </div>
              <div className={styles.movementInfo}>
                <div className={styles.movementProduct}>{movement.productName}</div>
                <div className={styles.movementDetails}>
                  <Badge variant={movement.type === 'entry' ? 'success' : 'error'} size="small">
                    {movement.type === 'entry' ? 'Entrada' : 'Salida'}
                  </Badge>{' '}
                  {movement.quantity} unidades • {movement.user}
                </div>
              </div>
              <div className={styles.movementTime}>{formatRelativeTime(movement.date)}</div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No hay movimientos recientes</div>
        )}
      </div>

      <section>
        <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
        <div className={styles.quickActions}>
          {filteredActions.map((action) => (
            <Link key={action.to} to={action.to} className={styles.actionCard}>
              <div className={styles.actionIcon}>{action.icon}</div>
              <div className={styles.actionContent}>
                <div className={styles.actionTitle}>{action.title}</div>
                <div className={styles.actionDescription}>{action.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

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
import { useDashboardData } from '../../services/mockData';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../utils/format';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user } = useAuthStore();
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

  const stats = [
    {
      label: 'Total Productos',
      value: formatNumber(data.totalProducts),
      icon: <MdInventory size={24} />,
      color: '#3b82f6',
      trend: null,
    },
    {
      label: 'Stock Bajo',
      value: formatNumber(data.lowStockProducts),
      icon: <MdWarning size={24} />,
      color: '#f59e0b',
      trend: null,
    },
    {
      label: 'Ventas Hoy',
      value: formatNumber(data.todaySales),
      icon: <MdShoppingCart size={24} />,
      color: '#10b981',
      trend: data.salesTrend,
    },
    {
      label: 'Valor Total',
      value: formatCurrency(data.totalValue),
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
      to: '/inventory/new',
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
                className={`${styles.statTrend} ${stat.trend >= 0 ? styles.trendUp : styles.trendDown}`}
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
            Ventas de la Semana
          </h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesChart}>
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
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-AR')}
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'Ventas' : 'Órdenes',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>
            <MdCategory size={24} />
            Top Categorías
          </h2>
          {data.topCategories.map((category) => (
            <div key={category.name} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryName}>{category.name}</div>
                <div className={styles.categoryStats}>{formatNumber(category.count)} productos</div>
              </div>
              <div className={styles.categoryValue}>
                <div className={styles.categoryAmount}>{formatCurrency(category.value)}</div>
                <div className={styles.categoryPercentage}>{category.percentage}%</div>
              </div>
            </div>
          ))}
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

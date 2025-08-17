import { useState } from 'react';
import {
  MdAdd,
  MdDelete,
  MdFilterList,
  MdHistory,
  MdRemove,
  MdTrendingDown,
  MdTrendingUp,
} from 'react-icons/md';
import { useDeleteMovement, useKardexMovements, useKardexStats } from '../../../hooks/useKardex';
import { useAuthStore } from '../../../store/authStore';
import type { KardexExtendido, KardexFilters } from '../../../types/database';
import { formatDate, formatNumber } from '../../../utils/format';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import styles from './KardexTable.module.css';

interface KardexTableProps {
  onAddMovement: () => void;
}

export const KardexTable = ({ onAddMovement }: KardexTableProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<KardexFilters>({
    fechaInicio: '',
    fechaFin: '',
    tipo: '',
    producto: '',
  });

  const { user } = useAuthStore();
  const { data: movements = [], isLoading } = useKardexMovements();
  const { data: stats } = useKardexStats(30);
  const deleteMovementMutation = useDeleteMovement();

  const handleFilterChange = (key: keyof KardexFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        '¿Estás seguro de que deseas eliminar este movimiento? Esto afectará el stock del producto.'
      )
    ) {
      await deleteMovementMutation.mutateAsync(id);
    }
  };

  // Filtrar movimientos en el frontend
  const filteredMovements = movements.filter((movement: KardexExtendido) => {
    if (filters.fechaInicio && movement.fecha < filters.fechaInicio) return false;
    if (filters.fechaFin && movement.fecha > filters.fechaFin) return false;
    if (filters.tipo && filters.tipo !== '' && movement.tipo !== filters.tipo) return false;
    if (
      filters.producto &&
      !movement.descripcion.toLowerCase().includes(filters.producto.toLowerCase())
    )
      return false;
    return true;
  });

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'entrada', label: 'Entradas' },
    { value: 'salida', label: 'Salidas' },
  ];

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
          Cargando movimientos...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Estadísticas */}
      {stats && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: 'var(--color-success)' }}>
              <MdTrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {formatNumber(stats.totalEntradas)}
            </div>
            <div className={styles.statLabel}>Entradas (30 días)</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: 'var(--color-error)' }}>
              <MdTrendingDown size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {formatNumber(stats.totalSalidas)}
            </div>
            <div className={styles.statLabel}>Salidas (30 días)</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatNumber(stats.movimientosRecientes)}</div>
            <div className={styles.statLabel}>Movimientos Totales</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>
          <MdHistory size={24} />
          Kardex de Inventario ({filteredMovements.length})
        </h2>

        <div className={styles.tableActions}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <MdFilterList size={16} />
            Filtros
          </button>

          <Button onClick={onAddMovement} size="sm">
            <MdAdd size={16} />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            <Input
              label="Fecha Inicio"
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            />

            <Input
              label="Fecha Fin"
              type="date"
              value={filters.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            />

            <Select
              label="Tipo de Movimiento"
              options={typeOptions}
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
            />

            <Input
              label="Buscar Producto"
              placeholder="Nombre del producto..."
              value={filters.producto}
              onChange={(e) => handleFilterChange('producto', e.target.value)}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setFilters({
                  fechaInicio: '',
                  fechaFin: '',
                  tipo: '',
                  producto: '',
                })
              }
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.headerCell}>Producto</th>
              <th className={styles.headerCell}>Tipo</th>
              <th className={styles.headerCell}>Cantidad</th>
              <th className={styles.headerCell}>Usuario</th>
              <th className={styles.headerCell}>Fecha</th>
              {user?.tipouser === 'superadmin' && <th className={styles.headerCell}>Acciones</th>}
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={user?.tipouser === 'superadmin' ? 6 : 5} className={styles.tableCell}>
                  <div className={styles.emptyState}>
                    <MdHistory size={48} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No se encontraron movimientos</h3>
                    <p className={styles.emptyDescription}>
                      {Object.values(filters).some((f) => f !== '')
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Comienza registrando tu primer movimiento de inventario'}
                    </p>
                    {Object.values(filters).every((f) => f === '') && (
                      <Button onClick={onAddMovement}>
                        <MdAdd size={16} />
                        Registrar Movimiento
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredMovements.map((movement: KardexExtendido) => (
                <tr key={movement.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.movementInfo}>
                      <div className={styles.productName}>{movement.descripcion}</div>
                      <div className={styles.movementDetail}>{movement.detalle}</div>
                    </div>
                  </td>

                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.movementType} ${
                        movement.tipo === 'entrada' ? styles.typeEntry : styles.typeExit
                      }`}
                    >
                      {movement.tipo === 'entrada' ? <MdAdd size={16} /> : <MdRemove size={16} />}
                      {movement.tipo}
                    </span>
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.quantityCell}>
                      <span
                        className={`${styles.quantity} ${
                          movement.tipo === 'entrada' ? styles.quantityEntry : styles.quantityExit
                        }`}
                      >
                        {movement.tipo === 'entrada' ? '+' : '-'}
                        {movement.cantidad}
                      </span>
                    </div>
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{movement.nombres}</div>
                    </div>
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.dateTime}>{formatDate(movement.fecha)}</div>
                  </td>

                  {user?.tipouser === 'superadmin' && (
                    <td className={styles.tableCell}>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(movement.id)}
                          title="Eliminar movimiento"
                          disabled={deleteMovementMutation.isPending}
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

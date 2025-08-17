import { useState } from 'react';
import {
  MdAdd,
  MdAdminPanelSettings,
  MdDelete,
  MdEdit,
  MdEmail,
  MdFilterList,
  MdLockReset,
  MdPeople,
  MdPerson,
  MdSearch,
  MdSupervisorAccount,
  MdToggleOff,
  MdToggleOn,
} from 'react-icons/md';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  useDeleteUser,
  useResetPassword,
  useToggleUserStatus,
  useUsers,
  useUsersStats,
} from '../../../hooks/useUsers';
import { useAuthStore } from '../../../store/authStore';
import type { UserFilters, UserWithStats } from '../../../types/auth';
import { formatRelativeTime } from '../../../utils/format'; // ✅ Solo importamos la función que usamos
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import { Modal } from '../../molecules/Modal';
import { UserInviteForm } from '../UserInviteForm';
import styles from './UserTable.module.css';

interface UserTableProps {
  onEdit: (user: UserWithStats) => void;
  onAdd: () => void;
}

export const UserTable = ({ onEdit, onAdd }: UserTableProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    tipouser: '',
    estado: '',
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { user: currentUser } = useAuthStore();

  const { data: users = [], isLoading } = useUsers();
  const { data: stats } = useUsersStats();
  const toggleUserStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useResetPassword();

  // Filtrar usuarios localmente
  const filteredUsers = users.filter((user) => {
    const matchesSearch = debouncedSearchTerm
      ? user.nombres.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      : true;

    const matchesRole = filters.tipouser ? user.tipouser === filters.tipouser : true;
    const matchesStatus = filters.estado ? user.estado === filters.estado : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas cambiar el estado de este usuario?')) {
      await toggleUserStatusMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      await deleteUserMutation.mutateAsync(id);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (window.confirm('¿Enviar email de recuperación de contraseña?')) {
      await resetPasswordMutation.mutateAsync(email);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
  };

  const handleInviteCancel = () => {
    setShowInviteModal(false);
  };

  const getUserInitials = (nombres: string) => {
    return nombres
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <MdAdminPanelSettings size={16} />;
      case 'admin':
        return <MdSupervisorAccount size={16} />;
      default:
        return <MdPerson size={16} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      default:
        return 'Empleado';
    }
  };

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Administrador' },
    { value: 'empleado', label: 'Empleado' },
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' },
  ];

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
          Cargando usuarios...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        {/* Estadísticas */}
        {stats && (
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.activos}</div>
              <div className={styles.statLabel}>Activos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.admins}</div>
              <div className={styles.statLabel}>Admins</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.empleados}</div>
              <div className={styles.statLabel}>Empleados</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.registradosEsteMes}</div>
              <div className={styles.statLabel}>Este Mes</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            <MdPeople size={24} />
            Personal ({filteredUsers.length})
          </h2>

          <div className={styles.tableActions}>
            <div className={styles.searchContainer}>
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                leftIcon={<MdSearch size={20} className={styles.searchIcon} />}
              />
            </div>

            <button
              type="button"
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              <MdFilterList size={16} />
              Filtros
            </button>

            {currentUser?.tipouser === 'superadmin' && (
              <>
                <Button onClick={() => setShowInviteModal(true)} size="sm" variant="secondary">
                  <MdEmail size={16} />
                  Invitar
                </Button>

                <Button onClick={onAdd} size="sm">
                  <MdAdd size={16} />
                  Nuevo Usuario
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
              <Select
                label="Rol"
                options={roleOptions}
                value={filters.tipouser}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    tipouser: e.target.value as 'superadmin' | 'admin' | 'empleado' | '', // ✅ Tipado explícito
                  }))
                }
              />

              <Select
                label="Estado"
                options={statusOptions}
                value={filters.estado}
                onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
              />

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilters({ search: '', tipouser: '', estado: '' });
                  setSearchTerm('');
                }}
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
                <th className={styles.headerCell}>Usuario</th>
                <th className={styles.headerCell}>Rol</th>
                <th className={styles.headerCell}>Estado</th>
                <th className={styles.headerCell}>Estadísticas</th>
                <th className={styles.headerCell}>Último Acceso</th>
                {currentUser?.tipouser === 'superadmin' && (
                  <th className={styles.headerCell}>Acciones</th>
                )}
              </tr>
            </thead>

            <tbody className={styles.tableBody}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentUser?.tipouser === 'superadmin' ? 6 : 5}
                    className={styles.tableCell}
                  >
                    <div className={styles.emptyState}>
                      <MdPeople size={48} className={styles.emptyIcon} />
                      <h3 className={styles.emptyTitle}>No se encontraron usuarios</h3>
                      <p className={styles.emptyDescription}>
                        {searchTerm || Object.values(filters).some((f) => f !== '')
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza agregando tu primer usuario'}
                      </p>
                      {currentUser?.tipouser === 'superadmin' &&
                        !searchTerm &&
                        Object.values(filters).every((f) => f === '') && (
                          <div
                            style={{
                              display: 'flex',
                              gap: 'var(--spacing-md)',
                              justifyContent: 'center',
                              marginTop: 'var(--spacing-lg)',
                            }}
                          >
                            <Button onClick={() => setShowInviteModal(true)} variant="secondary">
                              <MdEmail size={16} />
                              Invitar Usuario
                            </Button>
                            <Button onClick={onAdd}>
                              <MdAdd size={16} />
                              Agregar Usuario
                            </Button>
                          </div>
                        )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{getUserInitials(user.nombres)}</div>
                        <div className={styles.userDetails}>
                          <div className={styles.userName}>{user.nombres}</div>
                          <div className={styles.userEmail}>{user.correo}</div>
                        </div>
                      </div>
                    </td>

                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.userRole} ${
                          styles[
                            `role${user.tipouser.charAt(0).toUpperCase() + user.tipouser.slice(1)}`
                          ]
                        }`}
                      >
                        {getRoleIcon(user.tipouser)}
                        {getRoleLabel(user.tipouser)}
                      </span>
                    </td>

                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.userStatus} ${
                          user.estado === 'activo' ? styles.statusActivo : styles.statusInactivo
                        }`}
                      >
                        {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className={styles.tableCell}>
                      <div className={styles.userStats}>
                        <div className={styles.statItem}>
                          Movimientos: {user.movimientosRealizados || 0}
                        </div>
                        <div className={styles.statItem}>
                          Productos: {user.productosCreados || 0}
                        </div>
                      </div>
                    </td>

                    <td className={styles.tableCell}>
                      <div
                        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}
                      >
                        {user.ultimaConexion ? formatRelativeTime(user.ultimaConexion) : 'Nunca'}
                      </div>
                    </td>

                    {currentUser?.tipouser === 'superadmin' && (
                      <td className={styles.tableCell}>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => onEdit(user)}
                            title="Editar usuario"
                          >
                            <MdEdit size={16} />
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.toggleButton}`}
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                            disabled={toggleUserStatusMutation.isPending}
                          >
                            {user.estado === 'activo' ? (
                              <MdToggleOn size={16} />
                            ) : (
                              <MdToggleOff size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.resetButton}`}
                            onClick={() => handleResetPassword(user.correo)}
                            title="Resetear contraseña"
                            disabled={resetPasswordMutation.isPending}
                          >
                            <MdLockReset size={16} />
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(user.id)}
                            title="Eliminar usuario"
                            disabled={deleteUserMutation.isPending}
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

      {/* Modal de invitación */}
      <Modal
        isOpen={showInviteModal}
        onClose={handleInviteCancel}
        title="Invitar Usuario"
        size="medium"
      >
        <UserInviteForm onSuccess={handleInviteSuccess} onCancel={handleInviteCancel} />
      </Modal>
    </>
  );
};

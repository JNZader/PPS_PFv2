import { MdAdd, MdDelete, MdEdit, MdHistory, MdLogin, MdMoreHoriz } from 'react-icons/md';
import { useUserActivities } from '../../../hooks/useUsers';
import type { UserActivity } from '../../../types/auth';
import { formatRelativeTime } from '../../../utils/format';
import { Loading } from '../../atoms/Loading';
import styles from './UserActivities.module.css';

interface UserActivitiesProps {
  userId: number;
}

export const UserActivities = ({ userId }: UserActivitiesProps) => {
  const { data: activities = [], isLoading } = useUserActivities(userId);

  const getActivityIcon = (accion: string) => {
    if (accion.includes('CREAR') || accion.includes('CREATE')) {
      return { icon: <MdAdd size={16} />, className: styles.iconCreate };
    }
    if (accion.includes('ACTUALIZAR') || accion.includes('UPDATE')) {
      return { icon: <MdEdit size={16} />, className: styles.iconUpdate };
    }
    if (accion.includes('ELIMINAR') || accion.includes('DELETE')) {
      return { icon: <MdDelete size={16} />, className: styles.iconDelete };
    }
    if (accion.includes('LOGIN') || accion.includes('INICIAR_SESION')) {
      return { icon: <MdLogin size={16} />, className: styles.iconLogin };
    }
    return { icon: <MdMoreHoriz size={16} />, className: styles.iconOther };
  };

  const formatAction = (accion: string) => {
    const actionMap: Record<string, string> = {
      CREAR_PRODUCTO: 'Producto creado',
      ACTUALIZAR_PRODUCTO: 'Producto actualizado',
      ELIMINAR_PRODUCTO: 'Producto eliminado',
      CREAR_MOVIMIENTO: 'Movimiento registrado',
      ELIMINAR_MOVIMIENTO: 'Movimiento eliminado',
      LOGIN: 'Inicio de sesión',
      LOGOUT: 'Cierre de sesión',
      INVITACION_ENVIADA: 'Invitación enviada',
      USUARIO_CREADO: 'Usuario creado',
      USUARIO_ACTUALIZADO: 'Usuario actualizado',
    };

    return actionMap[accion] || accion.replace(/_/g, ' ').toLowerCase();
  };

  if (isLoading) {
    return (
      <div className={styles.activitiesContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <MdHistory size={20} />
            Actividad Reciente
          </h3>
        </div>
        <div className={styles.loadingState}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activitiesContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <MdHistory size={20} />
          Actividad Reciente ({activities.length})
        </h3>
      </div>

      <div className={styles.activitiesList}>
        {activities.length === 0 ? (
          <div className={styles.emptyState}>
            <MdHistory size={48} className={styles.emptyIcon} />
            <p>No hay actividades registradas</p>
          </div>
        ) : (
          activities.map((activity: UserActivity) => {
            const { icon, className } = getActivityIcon(activity.accion);

            return (
              <div key={activity.id} className={styles.activityItem}>
                <div className={`${styles.activityIcon} ${className}`}>{icon}</div>

                <div className={styles.activityContent}>
                  <div className={styles.activityAction}>{formatAction(activity.accion)}</div>
                  <div className={styles.activityDetails}>{activity.detalles}</div>
                  <div className={styles.activityTime}>{formatRelativeTime(activity.fecha)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

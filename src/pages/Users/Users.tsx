import { useState } from 'react';
import { MdPeople } from 'react-icons/md';
import { Modal } from '../../components/molecules/Modal';
import { UserForm } from '../../components/organisms/UserForm';
import { UserTable } from '../../components/organisms/UserTable';
import type { UserWithStats } from '../../types/auth';
import styles from './Users.module.css';

export const Users = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: UserWithStats) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className={styles.usersPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdPeople size={32} />
          Gestión de Personal
        </h1>
        <p className={styles.pageSubtitle}>Administra usuarios, roles y permisos del sistema</p>
      </div>

      {/* Tabla de usuarios */}
      <div className={styles.tableContainer}>
        <UserTable onAdd={handleAddUser} onEdit={handleEditUser} />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="large"
      >
        <UserForm user={editingUser} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </Modal>
    </div>
  );
};

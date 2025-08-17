import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form'; // ✅ Eliminamos Controller y setValue que no se usan
import {
  MdAdminPanelSettings,
  MdInfo,
  MdLock,
  MdPerson,
  MdSupervisorAccount,
} from 'react-icons/md';
import { z } from 'zod';
import { useCreateUser, useUpdateUser } from '../../../hooks/useUsers';
import type { UserRole, UserWithStats } from '../../../types/auth';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import styles from './UserForm.module.css';

// Schema de validación - ✅ Simplificamos para evitar conflictos de tipos
const userSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Email inválido'),
  tipouser: z.enum(['superadmin', 'admin', 'empleado']),
  nro_doc: z.string().min(1, 'Número de documento requerido'),
  telefono: z.string(), // ✅ Requerido como string, manejo en defaultValues
  direccion: z.string(), // ✅ Requerido como string, manejo en defaultValues
  tipodoc: z.enum(['DNI', 'CUIT', 'PASAPORTE']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: UserWithStats;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const isEditing = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    // ✅ Eliminamos setValue ya que no se usa en este componente
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nombres: '',
      correo: '',
      tipouser: 'empleado',
      nro_doc: '',
      telefono: '', // ✅ String vacío por defecto
      direccion: '', // ✅ String vacío por defecto
      tipodoc: 'DNI',
      password: '',
    },
  });

  const watchedTipouser = watch('tipouser');

  // Cargar datos del usuario al editar
  useEffect(() => {
    if (isEditing && user) {
      reset({
        nombres: user.nombres,
        correo: user.correo,
        tipouser: user.tipouser,
        nro_doc: user.nro_doc || '',
        telefono: user.telefono || '', // ✅ Asegurar que sea string
        direccion: user.direccion || '', // ✅ Asegurar que sea string
        tipodoc: (user.tipodoc as 'DNI' | 'CUIT' | 'PASAPORTE') || 'DNI',
      });
    }
  }, [isEditing, user, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user) {
        // Eliminar password del payload si está vacío al editar
        const { password, ...updateData } = data;
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: password ? data : updateData,
        });
      } else {
        await createUserMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const documentTypes = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CUIT', label: 'CUIT' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
  ];

  const roles = [
    {
      value: 'empleado' as UserRole,
      label: 'Empleado',
      description: 'Acceso básico',
      icon: <MdPerson size={24} />,
    },
    {
      value: 'admin' as UserRole,
      label: 'Administrador',
      description: 'Gestión completa',
      icon: <MdSupervisorAccount size={24} />,
    },
    {
      value: 'superadmin' as UserRole,
      label: 'Super Admin',
      description: 'Control total',
      icon: <MdAdminPanelSettings size={24} />,
    },
  ];

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          <MdPerson size={24} />
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <p className={styles.formSubtitle}>
          {isEditing
            ? 'Modifica la información del usuario'
            : 'Ingresa los datos del nuevo usuario'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Información Personal */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdPerson size={20} />
            Información Personal
          </h3>

          <Input
            label="Nombre completo"
            placeholder="Ej: Juan Carlos Pérez"
            error={errors.nombres?.message}
            required
            {...register('nombres')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="juan@empresa.com"
            error={errors.correo?.message}
            required
            {...register('correo')}
          />

          <div className={styles.documentInputs}>
            <Select
              label="Tipo de documento"
              options={documentTypes}
              error={errors.tipodoc?.message}
              required
              {...register('tipodoc')}
            />

            <Input
              label="Número de documento"
              placeholder="12345678"
              error={errors.nro_doc?.message}
              required
              {...register('nro_doc')}
            />
          </div>

          {/* ✅ Cerrar correctamente el div */}
          <div className={styles.formGrid}>
            <Input
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              error={errors.telefono?.message}
              {...register('telefono')}
            />

            <Input
              label="Dirección"
              placeholder="Av. Corrientes 1234"
              error={errors.direccion?.message}
              {...register('direccion')}
            />
          </div>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Rol del Usuario */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdAdminPanelSettings size={20} />
            Rol y Permisos
          </h3>

          <div className={styles.roleSelector}>
            {roles.map((role) => (
              <label
                key={role.value}
                className={`${styles.roleOption} ${
                  watchedTipouser === role.value ? styles.roleOptionSelected : ''
                }`}
              >
                <input
                  type="radio"
                  value={role.value}
                  {...register('tipouser')}
                  className="sr-only"
                />
                <div className={styles.roleIcon}>{role.icon}</div>
                <div className={styles.roleLabel}>{role.label}</div>
                <div className={styles.roleDescription}>{role.description}</div>
              </label>
            ))}
          </div>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Contraseña */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <MdLock size={20} />
            Credenciales de Acceso
          </h3>

          <div className={styles.passwordSection}>
            <div className={styles.passwordNote}>
              <MdInfo size={16} />
              {isEditing
                ? 'Deja en blanco para mantener la contraseña actual'
                : 'La contraseña debe tener al menos 6 caracteres'}
            </div>

            <Input
              label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              required={!isEditing}
              {...register('password')}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" loading={isSubmitting} className={styles.submitButton}>
            {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};

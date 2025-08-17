import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  MdAdminPanelSettings,
  MdEmail,
  MdInfo,
  MdPerson,
  MdSupervisorAccount,
} from 'react-icons/md';
import { z } from 'zod';
import { useInviteUser } from '../../../hooks/useUsers';
import type { UserRole } from '../../../types/auth';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import styles from './UserInviteForm.module.css';

// Schema de validación
const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipouser: z.enum(['superadmin', 'admin', 'empleado']),
  mensaje: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface UserInviteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserInviteForm = ({ onSuccess, onCancel }: UserInviteFormProps) => {
  const inviteUserMutation = useInviteUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      tipouser: 'empleado',
      mensaje: '',
    },
  });

  const watchedTipouser = watch('tipouser');

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteUserMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const roles = [
    {
      value: 'empleado' as UserRole,
      label: 'Empleado',
      icon: <MdPerson size={20} />,
    },
    {
      value: 'admin' as UserRole,
      label: 'Admin',
      icon: <MdSupervisorAccount size={20} />,
    },
    {
      value: 'superadmin' as UserRole,
      label: 'Super Admin',
      icon: <MdAdminPanelSettings size={20} />,
    },
  ];

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          <MdEmail size={24} />
          Invitar Usuario
        </h2>
        <p className={styles.formSubtitle}>Envía una invitación por email para unirse al sistema</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Email"
          type="email"
          placeholder="usuario@empresa.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Nombre completo"
          placeholder="Juan Carlos Pérez"
          error={errors.nombres?.message}
          required
          {...register('nombres')}
        />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend
            style={{
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: 500,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-primary)',
              padding: 0,
            }}
          >
            Rol del usuario *
          </legend>
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
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          label="Mensaje personalizado (opcional)"
          placeholder="Mensaje de bienvenida..."
          helperText="Será incluido en el email de invitación"
          {...register('mensaje')}
        />

        <div className={styles.infoBox}>
          <div className={styles.infoTitle}>
            <MdInfo size={16} />
            ¿Qué sucede después?
          </div>
          <div className={styles.infoText}>
            El usuario recibirá un email con instrucciones para activar su cuenta y crear una
            contraseña. La invitación expira en 7 días.
          </div>
        </div>

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
            Enviar Invitación
          </Button>
        </div>
      </form>
    </div>
  );
};

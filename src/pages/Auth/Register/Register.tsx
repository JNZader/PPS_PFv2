import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../../components/atoms/Button/Button';
import { Input } from '../../../components/atoms/Input';
import { useAuthStore } from '../../../store/authStore';
import styles from '../Login/Login.module.css'; // Reutilizar estilos

const registerSchema = z
  .object({
    nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido').min(1, 'Email es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = Omit<z.infer<typeof registerSchema>, 'name'> & { nombres: string };

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const registerUser = useAuthStore((state) => state.register); // ← CAMBIO: Renombrar para evitar conflicto
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError('');
      await registerUser(data); // ← CAMBIO: Usar el nombre renombrado
      navigate('/auth/login');
    } catch (error) {
      // ← CAMBIO: Tipar el error correctamente
      const errorMessage = error instanceof Error ? error.message : 'Error al crear cuenta';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>FiveStock</h1>
          <p className={styles.subtitle}>Crea tu cuenta</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre"
            leftIcon={<MdPerson size={20} />}
            error={errors.nombres?.message}
            required
            {...registerField('nombres')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<MdEmail size={20} />}
            error={errors.email?.message}
            required
            {...registerField('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            leftIcon={<MdLock size={20} />}
            error={errors.password?.message}
            required
            {...registerField('password')}
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            leftIcon={<MdLock size={20} />}
            error={errors.confirmPassword?.message}
            required
            {...registerField('confirmPassword')}
          />

          <Button type="submit" loading={isLoading} className={styles.submitButton}>
            Crear Cuenta
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/auth/login" className={styles.footerLink}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../../components/atoms/Button/Button';
import { Input } from '../../../components/atoms/Input';
import { useAuthStore } from '../../../store/authStore';
import styles from './Login.module.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError('');
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      // ← CAMBIO: Tipar el error correctamente
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
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
          <p className={styles.subtitle}>Ingresa a tu cuenta</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<MdEmail size={20} />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            leftIcon={<MdLock size={20} />}
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <Button type="submit" loading={isLoading} className={styles.submitButton}>
            Iniciar Sesión
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes una cuenta?{' '}
            <Link to="/auth/register" className={styles.footerLink}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

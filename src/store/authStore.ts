import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, login, logout, onAuthStateChange, register } from '../supabase/auth';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // El estado inicial es 'cargando'

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });

          const { profile } = await login(credentials);

          if (profile) {
            const user: User = {
              id: profile.id,
              idauth: profile.idauth,
              nombres: profile.nombres,
              correo: profile.correo,
              tipouser: profile.tipouser as 'superadmin' | 'admin' | 'empleado',
              estado: profile.estado,
              nro_doc: profile.nro_doc,
              telefono: profile.telefono,
              direccion: profile.direccion,
              tipodoc: profile.tipodoc,
            };

            set({ user, isAuthenticated: true });
            toast.success(`¡Bienvenido, ${user.nombres}!`);
          }
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true });

          await register(credentials);
          toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
        } catch (error) {
          console.error('Register error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error al crear cuenta';
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await logout();
          set({ user: null, isAuthenticated: false });
          toast.success('Sesión cerrada correctamente');
        } catch (error) {
          console.error('Logout error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
          toast.error(errorMessage);
        }
      },

      checkAuth: async () => {
        try {
          const user = await getCurrentUser();
          if (user) {
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        // Al recibir un usuario del listener, nos aseguramos de que isLoading pase a false.
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// --- INICIALIZACIÓN AUTOMÁTICA ---
// 1. Inicia la verificación de la sesión tan pronto como se carga la app.
useAuthStore.getState().checkAuth();

// 2. Escucha cambios de autenticación de Supabase para mantener el store sincronizado.
onAuthStateChange((user) => {
  useAuthStore.getState().setUser(user);
});

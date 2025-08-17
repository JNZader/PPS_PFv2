import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import {
  createUser,
  deleteUser,
  getUserActivities,
  getUsers,
  getUsersStats,
  inviteUser,
  resetUserPassword,
  searchUsers,
  toggleUserStatus,
  updateUser,
} from '../supabase/users';
import type { UserFilters, UserFormData, UserInvitation } from '../types/auth';

// ID de empresa temporal
const EMPRESA_ID = 1;

// Hook para obtener todos los usuarios
export const useUsers = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['users', user?.id],
    queryFn: () => getUsers(EMPRESA_ID),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar usuarios con filtros
export const useSearchUsers = (filters: UserFilters) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['users', 'search', filters, user?.id],
    queryFn: () => searchUsers(EMPRESA_ID, filters),
    enabled: !!user && Object.values(filters).some((v) => v !== '' && v !== undefined),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para crear usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserFormData) => createUser({ ...userData, id_empresa: EMPRESA_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
      toast.error(errorMessage);
    },
  });
};

// Hook para actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    },
  });
};

// Hook para cambiar estado de usuario
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const estado = data.estado === 'activo' ? 'activado' : 'desactivado';
      toast.success(`Usuario ${estado} exitosamente`);
    },
    onError: (error) => {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar estado del usuario');
    },
  });
};

// Hook para eliminar usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    },
  });
};

// Hook para obtener actividades de usuario
export const useUserActivities = (userId: number) => {
  return useQuery({
    queryKey: ['users', 'activities', userId],
    queryFn: () => getUserActivities(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

// Hook para estadísticas de usuarios
export const useUsersStats = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['users', 'stats', user?.id],
    queryFn: () => getUsersStats(EMPRESA_ID),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para invitar usuario
export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Invitación enviada exitosamente');
    },
    onError: (error) => {
      console.error('Error inviting user:', error);
      toast.error('Error al enviar invitación');
    },
  });
};

// Hook para resetear contraseña
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      toast.success('Email de recuperación enviado');
    },
    onError: (error) => {
      console.error('Error resetting password:', error);
      toast.error('Error al enviar email de recuperación');
    },
  });
};

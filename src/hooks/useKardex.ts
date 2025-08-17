import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { KardexService } from '../supabase/kardex';
import type { KardexFilters, MovementFormData } from '../types/database';

// Hook para obtener movimientos de kardex
export const useKardexMovements = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['kardex', 'movements', user?.id],
    queryFn: () => KardexService.getMovements(1), // Temporal: empresa ID 1
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar movimientos con filtros
export const useSearchMovements = (filters: KardexFilters) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['kardex', 'search', filters, user?.id],
    queryFn: () => KardexService.searchMovements(1, filters),
    enabled: !!user && Object.values(filters).some((v) => v !== '' && v !== undefined),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para crear movimiento
export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (movementData: MovementFormData) =>
      KardexService.createMovement({
        ...movementData,
        id_empresa: 1,
        id_usuario: user?.id || 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Movimiento registrado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating movement:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar el movimiento';
      toast.error(errorMessage);
    },
  });
};

// Hook para estadísticas de kardex
export const useKardexStats = (days: number = 30) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['kardex', 'stats', days, user?.id],
    queryFn: () => KardexService.getKardexStats(1, days),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para eliminar movimiento
export const useDeleteMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: KardexService.deleteMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Movimiento eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting movement:', error);
      toast.error('Error al eliminar el movimiento');
    },
  });
};

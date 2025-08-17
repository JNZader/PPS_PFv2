import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useKardexMovements } from './useKardex';
import { useProducts } from './useProducts';

/**
 * Hook para mantener sincronizados los datos de productos y kardex
 */
export const useInventorySync = () => {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const { data: movements } = useKardexMovements();

  // Efecto para sincronizar datos cuando hay cambios
  useEffect(() => {
    // Invalidar queries relacionadas para mantener datos frescos
    const interval = setInterval(
      () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['kardex'] });
      },
      5 * 60 * 1000
    ); // 5 minutos

    return () => clearInterval(interval);
  }, [queryClient]);

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
    },
  };
};

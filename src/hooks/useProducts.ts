import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { BrandService, CategoryService } from '../supabase/categories';
import { ProductService } from '../supabase/products';
import type { ProductoFormData } from '../types/database';

// Hook para obtener productos
export const useProducts = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['products', user?.id],
    queryFn: () => ProductService.getProducts(1), // Temporal: usar empresa ID 1
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar productos
export const useProductSearch = (query: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['products', 'search', query, user?.id],
    queryFn: () => ProductService.searchProducts(1, query),
    enabled: !!user && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener un producto específico
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id,
  });
};

// Hook para crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductoFormData) =>
      ProductService.createProduct({ ...productData, id_empresa: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    },
  });
};

// Hook para actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductoFormData> }) =>
      ProductService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    },
  });
};

// Hook para eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    },
  });
};

// Hook para categorías
export const useCategories = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => CategoryService.getCategories(1),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para marcas
export const useBrands = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['brands', user?.id],
    queryFn: () => BrandService.getBrands(1),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// src/hooks/useProducts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { BrandService, CategoryService } from '../supabase/categories';
import { ProductService } from '../supabase/products';
import type { Producto, ProductoFormData } from '../types/database';

// ⚙️ ID de empresa (temporal)
const EMPRESA_ID = 1;

/* ================================
 * Productos
 * ================================ */

// Lista de productos -> Producto[]
export const useProducts = () => {
  const { user } = useAuthStore();

  return useQuery<Producto[]>({
    queryKey: ['products', user?.id],
    // Si ProductService.getProducts ya devuelve Promise<Producto[]>, el `as` no hace falta.
    queryFn: () => ProductService.getProducts(EMPRESA_ID) as Promise<Producto[]>,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Búsqueda de productos -> Producto[]
export const useProductSearch = (query: string) => {
  const { user } = useAuthStore();

  return useQuery<Producto[]>({
    queryKey: ['products', 'search', query, user?.id],
    queryFn: () => ProductService.searchProducts(EMPRESA_ID, query) as Promise<Producto[]>,
    enabled: !!user && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Detalle de producto -> Producto
export const useProduct = (id: number) => {
  return useQuery<Producto>({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id) as Promise<Producto>,
    enabled: !!id,
  });
};

// Crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductoFormData) =>
      ProductService.createProduct({ ...productData, id_empresa: EMPRESA_ID }),
    onSuccess: () => {
      // invalidar lista y cualquier búsqueda
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    },
  });
};

// Actualizar producto
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

// Eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ProductService.deleteProduct(id),
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

/* ================================
 * Categorías y Marcas
 * ================================ */

// Categorías -> tipá el retorno si tenés tipo Category
export const useCategories = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => CategoryService.getCategories(EMPRESA_ID),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Marcas -> tipá el retorno si tenés tipo Brand
export const useBrands = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['brands', user?.id],
    queryFn: () => BrandService.getBrands(EMPRESA_ID),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

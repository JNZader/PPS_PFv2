// src/hooks/useProducts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { BrandService, CategoryService } from '../supabase/categories';
import { ProductService } from '../supabase/products';
import type {
  BrandFormData,
  CategoryFormData,
  Producto,
  ProductoExtendido,
  ProductoFormData,
} from '../types/database';

// ⚙️ ID de empresa (temporal)
const EMPRESA_ID = 1;

/* ================================
 * Productos
 * ================================ */

export const useProducts = () => {
  const { user } = useAuthStore();

  return useQuery<ProductoExtendido[]>({
    queryKey: ['products', user?.id],
    queryFn: () => ProductService.getProducts(EMPRESA_ID) as Promise<ProductoExtendido[]>,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductSearch = (query: string) => {
  const { user } = useAuthStore();

  return useQuery<ProductoExtendido[]>({
    queryKey: ['products', 'search', query, user?.id],
    queryFn: () => ProductService.searchProducts(EMPRESA_ID, query) as Promise<ProductoExtendido[]>,
    enabled: !!user && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProduct = (id: number) => {
  return useQuery<Producto>({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id) as Promise<Producto>,
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductoFormData) =>
      ProductService.createProduct({ ...productData, id_empresa: EMPRESA_ID }),
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

export const useCategories = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => CategoryService.getCategories(EMPRESA_ID),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (categoryData: CategoryFormData) =>
      CategoryService.createCategory({ ...categoryData, id_empresa: user?.id_empresa ?? 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al crear la categoría: ${error.message}`);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      CategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al actualizar la categoría: ${error.message}`);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar la categoría: ${error.message}`);
    },
  });
};

export const useBrands = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['brands', user?.id],
    queryFn: () => BrandService.getBrands(EMPRESA_ID),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (brandData: BrandFormData) =>
      BrandService.createBrand({ ...brandData, id_empresa: user?.id_empresa ?? 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca creada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al crear la marca: ${error.message}`);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BrandFormData> }) =>
      BrandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al actualizar la marca: ${error.message}`);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => BrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marca eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar la marca: ${error.message}`);
    },
  });
};

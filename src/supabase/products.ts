import type { ProductoExtendido, ProductoFormData } from '../types/database';
import { supabase } from './client';

export class ProductService {
  // Obtener todos los productos con información extendida
  static async getProducts(idEmpresa: number): Promise<ProductoExtendido[]> {
    const { data, error } = await supabase.rpc('mostrarproductos', {
      _id_empresa: idEmpresa,
    });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  }

  // Buscar productos
  static async searchProducts(idEmpresa: number, query: string): Promise<ProductoExtendido[]> {
    const { data, error } = await supabase.rpc('buscarproductos', {
      _id_empresa: idEmpresa,
      buscador: query,
    });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data || [];
  }

  // Crear producto
  static async createProduct(productData: ProductoFormData & { id_empresa: number }) {
    const { data, error } = await supabase.from('productos').insert(productData).select().single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
  }

  // Actualizar producto
  static async updateProduct(id: number, productData: Partial<ProductoFormData>) {
    const { data, error } = await supabase
      .from('productos')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data;
  }

  // Eliminar producto
  static async deleteProduct(id: number) {
    const { error } = await supabase.from('productos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Obtener producto por ID
  static async getProductById(id: number): Promise<ProductoExtendido | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        marca:idmarca(descripcion),
        categoria:id_categoria(descripcion, color)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    // Transformar los datos al formato esperado
    return {
      ...data,
      marca: data.marca?.descripcion || '',
      categoria: data.categoria?.descripcion || '',
      color: data.categoria?.color || '#3b82f6',
    } as ProductoExtendido;
  }
}

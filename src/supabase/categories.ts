// src/supabase/categories.ts

import type { Categoria, Marca } from '../types/database';
import { supabase } from './client';

// Mantener la estructura de clase pero eliminar la palabra clave "static"
// biome-ignore lint/complexity/noStaticOnlyClass: Mantener compatibilidad con código existente
export class CategoryService {
  // Obtener categorías
  static async getCategories(idEmpresa: number) {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id_empresa', idEmpresa)
      .order('descripcion');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  // Crear categoría
  static async createCategory(categoryData: Omit<Categoria, 'id'>) {
    const { data, error } = await supabase
      .from('categorias')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  }

  // Actualizar categoría
  static async updateCategory(id: number, categoryData: Partial<Omit<Categoria, 'id'>>) {
    const { data, error } = await supabase
      .from('categorias')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  }

  // Eliminar categoría
  static async deleteCategory(id: number) {
    const { error } = await supabase.from('categorias').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: Mantener compatibilidad con código existente
export class BrandService {
  // Obtener marcas
  static async getBrands(idEmpresa: number) {
    const { data, error } = await supabase
      .from('marca')
      .select('*')
      .eq('id_empresa', idEmpresa)
      .order('descripcion');

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    return data || [];
  }

  // Crear marca
  static async createBrand(brandData: Omit<Marca, 'id'>) {
    const { data, error } = await supabase.from('marca').insert(brandData).select().single();

    if (error) {
      console.error('Error creating brand:', error);
      throw error;
    }

    return data;
  }

  // Actualizar marca
  static async updateBrand(id: number, brandData: Partial<Omit<Marca, 'id'>>) {
    const { data, error } = await supabase
      .from('marca')
      .update(brandData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      throw error;
    }

    return data;
  }

  // Eliminar marca
  static async deleteBrand(id: number) {
    const { error } = await supabase.from('marca').delete().eq('id', id);

    if (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }
}

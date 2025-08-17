import type { KardexExtendido, KardexFilters, MovementFormData } from '../types/database';
import { supabase } from './client';

export class KardexService {
  // Obtener todos los movimientos con información extendida usando la función existente
  static async getMovements(idEmpresa: number): Promise<KardexExtendido[]> {
    console.log('Llamando a mostrarkardexempresa', idEmpresa);
    try {
      const { data, error } = await supabase.rpc('mostrarkardexempresa', {
        _id_empresa: idEmpresa,
      });

      if (error) {
        console.error('Error fetching kardex movements:', error);
        throw error;
      }

      console.log('Movimientos obtenidos:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Error completo en getMovements:', err);
      throw err;
    }
  }

  // Buscar movimientos con filtros (usando query manual ya que no hay función específica)
  static async searchMovements(
    idEmpresa: number,
    filters: KardexFilters
  ): Promise<KardexExtendido[]> {
    try {
      let query = supabase
        .from('kardex')
        .select(`
          id,
          fecha,
          tipo,
          cantidad,
          detalle,
          estado,
          productos!inner(descripcion),
          usuarios!inner(nombres)
        `)
        .eq('id_empresa', idEmpresa)
        .eq('estado', 1) // Solo movimientos activos
        .order('fecha', { ascending: false });

      if (filters.fechaInicio) {
        query = query.gte('fecha', filters.fechaInicio);
      }

      if (filters.fechaFin) {
        query = query.lte('fecha', filters.fechaFin);
      }

      if (filters.tipo && filters.tipo !== '') {
        query = query.eq('tipo', filters.tipo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching movements:', error);
        throw error;
      }

      // Transformar datos al formato esperado
      return (data || []).map((movement) => ({
        id: movement.id,
        fecha: movement.fecha,
        tipo: movement.tipo,
        cantidad: movement.cantidad,
        detalle: movement.detalle || '',
        estado: movement.estado,
        descripcion: movement.productos?.descripcion || '',
        nombres: movement.usuarios?.nombres || '',
        stock: 0, // Se calculará en el frontend si es necesario
      })) as KardexExtendido[];
    } catch (err) {
      console.error('Error en searchMovements:', err);
      throw err;
    }
  }

  // Crear movimiento de inventario
  static async createMovement(
    movementData: MovementFormData & { id_empresa: number; id_usuario: number }
  ) {
    try {
      // Primero verificar stock actual si es salida
      if (movementData.tipo === 'salida') {
        const { data: product, error: productError } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', movementData.id_producto)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          throw productError;
        }

        if (product && product.stock < movementData.cantidad) {
          throw new Error(`Stock insuficiente. Stock actual: ${product.stock}`);
        }
      }

      // Crear el movimiento
      const kardexData = {
        id_producto: movementData.id_producto,
        tipo: movementData.tipo,
        cantidad: movementData.cantidad,
        detalle: movementData.detalle,
        id_empresa: movementData.id_empresa,
        id_usuario: movementData.id_usuario,
        fecha: new Date().toISOString().split('T')[0],
        estado: 1,
      };

      const { data, error } = await supabase.from('kardex').insert(kardexData).select().single();

      if (error) {
        console.error('Error creating movement:', error);
        throw error;
      }

      // Actualizar stock del producto
      await KardexService.updateProductStock(
        movementData.id_producto,
        movementData.tipo,
        movementData.cantidad
      );

      return data;
    } catch (err) {
      console.error('Error en createMovement:', err);
      throw err;
    }
  }

  // Actualizar stock del producto
  private static async updateProductStock(
    productId: number,
    tipo: 'entrada' | 'salida',
    cantidad: number
  ) {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Error fetching product:', fetchError);
        throw fetchError;
      }

      const newStock = tipo === 'entrada' ? product.stock + cantidad : product.stock - cantidad;

      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      const { error: updateError } = await supabase
        .from('productos')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) {
        console.error('Error updating product stock:', updateError);
        throw updateError;
      }
    } catch (err) {
      console.error('Error en updateProductStock:', err);
      throw err;
    }
  }

  // Obtener estadísticas de kardex
  static async getKardexStats(idEmpresa: number, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('kardex')
        .select('tipo, cantidad, fecha')
        .eq('id_empresa', idEmpresa)
        .eq('estado', 1)
        .gte('fecha', startDate.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching kardex stats:', error);
        throw error;
      }

      const entradas = data?.filter((m) => m.tipo === 'entrada') || [];
      const salidas = data?.filter((m) => m.tipo === 'salida') || [];

      return {
        totalEntradas: entradas.reduce((sum, m) => sum + m.cantidad, 0),
        totalSalidas: salidas.reduce((sum, m) => sum + m.cantidad, 0),
        movimientosRecientes: data?.length || 0,
        entradasPorDia: KardexService.groupByDate(entradas),
        salidasPorDia: KardexService.groupByDate(salidas),
      };
    } catch (err) {
      console.error('Error en getKardexStats:', err);
      throw err;
    }
  }

  // Agrupar movimientos por fecha
  private static groupByDate(movements: Array<{ fecha: string; cantidad: number }>) {
    const grouped = movements.reduce(
      (acc, movement) => {
        const date = movement.fecha;
        acc[date] = (acc[date] || 0) + movement.cantidad;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(grouped).map(([date, cantidad]) => ({
      fecha: date,
      cantidad,
    }));
  }

  // Eliminar movimiento (solo para administradores)
  static async deleteMovement(id: number) {
    try {
      // Primero obtener datos del movimiento para revertir stock
      const { data: movement, error: fetchError } = await supabase
        .from('kardex')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching movement:', fetchError);
        throw fetchError;
      }

      // Revertir el stock
      const revertType = movement.tipo === 'entrada' ? 'salida' : 'entrada';
      await KardexService.updateProductStock(movement.id_producto, revertType, movement.cantidad);

      // Marcar como eliminado en lugar de eliminar físicamente
      const { error } = await supabase.from('kardex').update({ estado: 0 }).eq('id', id);

      if (error) {
        console.error('Error deleting movement:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error en deleteMovement:', err);
      throw err;
    }
  }
}

import type { ProductoExtendido } from './database';

export interface ProductFilters {
  search: string;
  categoria: string;
  marca: string;
  stockBajo: boolean;
  precioMin: number | null;
  precioMax: number | null;
}

export interface ProductSort {
  field: keyof ProductoExtendido;
  direction: 'asc' | 'desc';
}

export interface ProductTableState {
  filters: ProductFilters;
  sort: ProductSort;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

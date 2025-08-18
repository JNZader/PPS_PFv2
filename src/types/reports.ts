import type { KardexExtendido, ProductoExtendido } from './database';

export interface ReportFilters {
  search?: string;
  categoria?: string;
  marca?: string;
  lowStockOnly?: boolean;
  startDate?: string;
  endDate?: string;
  movementType?: 'all' | 'entrada' | 'salida';
  productId?: string;
  tipoReporte: ReportType;
  fechaInicio?: string;
  fechaFin?: string;
  incluirStockCero?: boolean;
  soloStockBajo?: boolean;
}

export type ReportType =
  | 'stock'
  | 'low-stock'
  | 'kardex'
  | 'inventory-value'
  | 'stock-actual'
  | 'stock-bajo'
  | 'inventario-valorado'
  | 'kardex-general'
  | 'movimientos-periodo';

export interface StockReportData {
  type: 'stock' | 'low-stock';
  title: string;
  generatedAt: string;
  filters: ReportFilters;
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockProducts: number;
    criticalProducts?: number;
    averageStock?: number;
  };
  data: ProductoExtendido[];
}

interface KardexStats {
  totalEntradas: number;
  totalSalidas: number;
  movimientosRecientes: number;
  entradasPorDia: { fecha: string; cantidad: number }[];
  salidasPorDia: { fecha: string; cantidad: number }[];
}

export interface KardexReportData {
  type: 'kardex';
  title: string;
  generatedAt: string;
  filters: ReportFilters;
  summary: {
    totalMovements: number;
    totalEntries: number;
    totalExits: number;
    period: { start: string; end: string };
  };
  data: KardexExtendido[];
  stats: KardexStats;
}

export type InventoryValueProduct = ProductoExtendido & {
  valorCompra: number;
  valorVenta: number;
  utilidadPotencial: number;
};

// ✅ CORRECCIÓN: Se añade 'export' para que pueda ser importada.
export interface CategoryBreakdownItem {
  name: string;
  products: InventoryValueProduct[];
  totalValue: number;
  totalCost: number;
  count: number;
}

export interface InventoryValueData {
  type: 'inventory-value';
  title: string;
  generatedAt: string;
  filters: ReportFilters;
  summary: {
    totalProducts: number;
    totalValueCost: number;
    totalValueSale: number;
    totalPotentialProfit: number;
    averageValue: number;
  };
  data: InventoryValueProduct[];
  categoryBreakdown: CategoryBreakdownItem[];
}

export type AnyReportData = StockReportData | KardexReportData | InventoryValueData;

export type ReportData = AnyReportData;

// ✅ CORRECCIÓN: Se exportan los tipos individuales para usarlos en otros archivos.
export type { ProductoExtendido, KardexExtendido };

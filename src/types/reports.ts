import type { ProductoExtendido, KardexExtendido } from './database';

export interface ReportFilters {
    fechaInicio?: string;
    fechaFin?: string;
    categoria?: string;
    marca?: string;
    tipoReporte: ReportType;
    incluirStockCero?: boolean;
    soloStockBajo?: boolean;
}

export type ReportType =
    | 'stock-actual'
    | 'stock-bajo'
    | 'kardex-producto'
    | 'kardex-general'
    | 'inventario-valorado'
    | 'movimientos-periodo';

export interface ReportData {
    titulo: string;
    subtitulo?: string;
    fechaGeneracion: string;
    filtros: ReportFilters;
    productos?: ProductoExtendido[];
    movimientos?: KardexExtendido[];
    estadisticas?: ReportStats;
}

export interface ReportStats {
    totalProductos: number;
    totalValor: number;
    stockBajo: number;
    stockCero: number;
    entradas: number;
    salidas: number;
    valorEntradas: number;
    valorSalidas: number;
}

export interface ExportOptions {
    formato: 'pdf' | 'csv' | 'excel';
    incluirGraficos?: boolean;
    orientacion?: 'portrait' | 'landscape';
}
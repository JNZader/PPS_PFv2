import { pdf } from '@react-pdf/renderer';
import Papa from 'papaparse';
import { getKardexStats, getMovements } from '../../supabase/kardex';
import { ProductService } from '../../supabase/products';
import type { 
  ReportData, 
  ReportFilters, 
  StockReportData, 
  KardexReportData,
  InventoryValueData,
  ReportType 
} from '../../types/reports';
import { 
  StockReportPDF, 
  KardexReportPDF, 
  InventoryValueReportPDF,
  LowStockReportPDF 
} from './pdfTemplates';

export class ReportGenerator {
  private static readonly EMPRESA_ID = 1;

  // Generar reporte de stock
  static async generateStockReport(filters: ReportFilters): Promise<StockReportData> {
    try {
      const products = await ProductService.getProducts(this.EMPRESA_ID);
      
      let filteredProducts = products;

      // Aplicar filtros
      if (filters.categoria) {
        filteredProducts = filteredProducts.filter(p => p.id_categoria === Number(filters.categoria));
      }

      if (filters.lowStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.stock <= p.stock_minimo);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.descripcion.toLowerCase().includes(searchTerm) ||
          p.categoria.toLowerCase().includes(searchTerm) ||
          p.marca.toLowerCase().includes(searchTerm)
        );
      }

      const totalValue = filteredProducts.reduce((sum, p) => sum + (p.stock * p.precioventa), 0);
      const lowStockCount = filteredProducts.filter(p => p.stock <= p.stock_minimo).length;

      return {
        type: 'stock',
        title: 'Reporte de Stock Actual',
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalProducts: filteredProducts.length,
          totalValue,
          lowStockProducts: lowStockCount,
          averageStock: filteredProducts.length > 0 
            ? filteredProducts.reduce((sum, p) => sum + p.stock, 0) / filteredProducts.length 
            : 0,
        },
        data: filteredProducts,
      };
    } catch (error) {
      console.error('Error generating stock report:', error);
      throw error;
    }
  }

  // Generar reporte de productos con stock bajo
  static async generateLowStockReport(filters: ReportFilters): Promise<StockReportData> {
    try {
      const products = await ProductService.getProducts(this.EMPRESA_ID);
      
      let lowStockProducts = products.filter(p => p.stock <= p.stock_minimo);

      // Aplicar filtros adicionales
      if (filters.categoria) {
        lowStockProducts = lowStockProducts.filter(p => p.id_categoria === Number(filters.categoria));
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        lowStockProducts = lowStockProducts.filter(p => 
          p.descripcion.toLowerCase().includes(searchTerm)
        );
      }

      // Ordenar por criticidad (productos sin stock primero, luego por porcentaje)
      lowStockProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return -1;
        if (b.stock === 0 && a.stock > 0) return 1;
        
        const aPercentage = a.stock / a.stock_minimo;
        const bPercentage = b.stock / b.stock_minimo;
        return aPercentage - bPercentage;
      });

      const criticalProducts = lowStockProducts.filter(p => p.stock === 0);
      const totalValue = lowStockProducts.reduce((sum, p) => sum + (p.stock * p.precioventa), 0);

      return {
        type: 'low-stock',
        title: 'Reporte de Stock Bajo',
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalProducts: lowStockProducts.length,
          totalValue,
          lowStockProducts: lowStockProducts.length,
          criticalProducts: criticalProducts.length,
        },
        data: lowStockProducts,
      };
    } catch (error) {
      console.error('Error generating low stock report:', error);
      throw error;
    }
  }

  // Generar reporte de kardex
  static async generateKardexReport(filters: ReportFilters): Promise<KardexReportData> {
    try {
      const movements = await getMovements(this.EMPRESA_ID);
      const stats = await getKardexStats(this.EMPRESA_ID, 30);
      
      let filteredMovements = movements;

      // Aplicar filtros de fecha
      if (filters.startDate) {
        filteredMovements = filteredMovements.filter(m => m.fecha >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredMovements = filteredMovements.filter(m => m.fecha <= filters.endDate!);
      }

      // Filtro por tipo de movimiento
      if (filters.movementType && filters.movementType !== 'all') {
        filteredMovements = filteredMovements.filter(m => m.tipo === filters.movementType);
      }

      // Filtro por producto
      if (filters.productId) {
        filteredMovements = filteredMovements.filter(m => m.id_producto === Number(filters.productId));
      }

      const entradas = filteredMovements.filter(m => m.tipo === 'entrada');
      const salidas = filteredMovements.filter(m => m.tipo === 'salida');

      return {
        type: 'kardex',
        title: 'Reporte de Kardex',
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalMovements: filteredMovements.length,
          totalEntries: entradas.reduce((sum, m) => sum + m.cantidad, 0),
          totalExits: salidas.reduce((sum, m) => sum + m.cantidad, 0),
          period: {
            start: filters.startDate || '',
            end: filters.endDate || '',
          },
        },
        data: filteredMovements,
        stats,
      };
    } catch (error) {
      console.error('Error generating kardex report:', error);
      throw error;
    }
  }

  // Generar reporte de inventario valorado
  static async generateInventoryValueReport(filters: ReportFilters): Promise<InventoryValueData> {
    try {
      const products = await ProductService.getProducts(this.EMPRESA_ID);
      
      let filteredProducts = products;

      if (filters.categoria) {
        filteredProducts = filteredProducts.filter(p => p.id_categoria === Number(filters.categoria));
      }

      // Calcular valores
      const productsWithValue = filteredProducts.map(product => ({
        ...product,
        valorCompra: product.stock * product.preciocompra,
        valorVenta: product.stock * product.precioventa,
        utilidadPotencial: (product.stock * product.precioventa) - (product.stock * product.preciocompra),
      }));

      const totalValueCost = productsWithValue.reduce((sum, p) => sum + p.valorCompra, 0);
      const totalValueSale = productsWithValue.reduce((sum, p) => sum + p.valorVenta, 0);
      const totalPotentialProfit = totalValueSale - totalValueCost;

      // Agrupar por categorías
      const categoryGroups = productsWithValue.reduce((acc, product) => {
        const category = product.categoria;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            products: [],
            totalValue: 0,
            totalCost: 0,
            count: 0,
          };
        }
        acc[category].products.push(product);
        acc[category].totalValue += product.valorVenta;
        acc[category].totalCost += product.valorCompra;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, any>);

      return {
        type: 'inventory-value',
        title: 'Reporte de Inventario Valorado',
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalProducts: filteredProducts.length,
          totalValueCost,
          totalValueSale,
          totalPotentialProfit,
          averageValue: filteredProducts.length > 0 ? totalValueSale / filteredProducts.length : 0,
        },
        data: productsWithValue,
        categoryBreakdown: Object.values(categoryGroups),
      };
    } catch (error) {
      console.error('Error generating inventory value report:', error);
      throw error;
    }
  }

  // Generar PDF
  static async generatePDF(reportData: ReportData): Promise<Blob> {
    try {
      let PDFComponent;

      switch (reportData.type) {
        case 'stock':
          PDFComponent = StockReportPDF;
          break;
        case 'low-stock':
          PDFComponent = LowStockReportPDF;
          break;
        case 'kardex':
          PDFComponent = KardexReportPDF;
          break;
        case 'inventory-value':
          PDFComponent = InventoryValueReportPDF;
          break;
        default:
          throw new Error(`Tipo de reporte no soportado: ${reportData.type}`);
      }

      const blob = await pdf(<PDFComponent data={reportData} />).toBlob();
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Generar CSV
  static generateCSV(reportData: ReportData): string {
    try {
      let csvData: any[] = [];
      let filename = '';

      switch (reportData.type) {
        case 'stock':
        case 'low-stock':
          const stockData = reportData as StockReportData;
          csvData = stockData.data.map(product => ({
            'Código': product.codigointerno || '',
            'Producto': product.descripcion,
            'Categoría': product.categoria,
            'Marca': product.marca,
            'Stock Actual': product.stock,
            'Stock Mínimo': product.stock_minimo,
            'Precio Compra': product.preciocompra,
            'Precio Venta': product.precioventa,
            'Valor Total': product.stock * product.precioventa,
            'Estado Stock': product.stock <= product.stock_minimo ? 'BAJO' : 'OK',
          }));
          filename = reportData.type === 'stock' ? 'reporte-stock' : 'reporte-stock-bajo';
          break;

        case 'kardex':
          const kardexData = reportData as KardexReportData;
          csvData = kardexData.data.map(movement => ({
            'Fecha': movement.fecha,
            'Producto': movement.descripcion,
            'Tipo': movement.tipo.toUpperCase(),
            'Cantidad': movement.cantidad,
            'Usuario': movement.nombres,
            'Detalle': movement.detalle,
          }));
          filename = 'reporte-kardex';
          break;

        case 'inventory-value':
          const valueData = reportData as InventoryValueData;
          csvData = valueData.data.map(product => ({
            'Producto': product.descripcion,
            'Categoría': product.categoria,
            'Stock': product.stock,
            'Precio Compra': product.preciocompra,
            'Precio Venta': product.precioventa,
            'Valor Compra Total': product.valorCompra,
            'Valor Venta Total': product.valorVenta,
            'Utilidad Potencial': product.utilidadPotencial,
          }));
          filename = 'reporte-inventario-valorado';
          break;

        default:
          throw new Error(`Tipo de reporte no soportado para CSV: ${reportData.type}`);
      }

      return Papa.unparse(csvData);
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw error;
    }
  }

  // Descargar archivo
  static downloadFile(content: string | Blob, filename: string, type: 'csv' | 'pdf'): void {
    try {
      const blob = typeof content === 'string' 
        ? new Blob([content], { type: 'text/csv;charset=utf-8;' })
        : content;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}
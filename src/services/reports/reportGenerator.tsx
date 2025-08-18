import { pdf } from '@react-pdf/renderer';
import Papa from 'papaparse';
import type React from 'react';
import { getKardexStats, getMovements } from '../../supabase/kardex';
import { ProductService } from '../../supabase/products';
import type {
  AnyReportData,
  CategoryBreakdownItem,
  InventoryValueData,
  InventoryValueProduct,
  KardexExtendido,
  KardexReportData,
  ProductoExtendido,
  ReportFilters,
  StockReportData,
} from '../../types/reports';
import {
  InventoryValueReportPDF,
  KardexReportPDF,
  LowStockReportPDF,
  StockReportPDF,
} from './pdfTemplates';

const EMPRESA_ID = 1;

// Generar reporte de stock
async function generateStockReport(filters: ReportFilters): Promise<StockReportData> {
  try {
    const products = await ProductService.getProducts(EMPRESA_ID);

    let filteredProducts: ProductoExtendido[] = products;

    if (filters.categoria) {
      filteredProducts = filteredProducts.filter(
        (p) => p.id_categoria === Number(filters.categoria)
      );
    }

    if (filters.soloStockBajo) {
      filteredProducts = filteredProducts.filter((p) => p.stock <= p.stock_minimo);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.descripcion.toLowerCase().includes(searchTerm) ||
          p.categoria.toLowerCase().includes(searchTerm) ||
          p.marca.toLowerCase().includes(searchTerm)
      );
    }

    const totalValue = filteredProducts.reduce((sum, p) => sum + p.stock * p.precioventa, 0);
    const lowStockCount = filteredProducts.filter((p) => p.stock <= p.stock_minimo).length;

    return {
      type: 'stock',
      title: 'Reporte de Stock Actual',
      generatedAt: new Date().toISOString(),
      filters,
      summary: {
        totalProducts: filteredProducts.length,
        totalValue,
        lowStockProducts: lowStockCount,
        averageStock:
          filteredProducts.length > 0
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
async function generateLowStockReport(filters: ReportFilters): Promise<StockReportData> {
  try {
    const products = await ProductService.getProducts(EMPRESA_ID);

    let lowStockProducts: ProductoExtendido[] = products.filter(
      (p: { stock: number; stock_minimo: number }) => p.stock <= p.stock_minimo
    );

    if (filters.categoria) {
      lowStockProducts = lowStockProducts.filter(
        (p) => p.id_categoria === Number(filters.categoria)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      lowStockProducts = lowStockProducts.filter((p) =>
        p.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    lowStockProducts.sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return -1;
      if (b.stock === 0 && a.stock > 0) return 1;

      const aPercentage = a.stock_minimo > 0 ? a.stock / a.stock_minimo : 1;
      const bPercentage = b.stock_minimo > 0 ? b.stock / b.stock_minimo : 1;
      return aPercentage - bPercentage;
    });

    const criticalProducts = lowStockProducts.filter((p) => p.stock === 0);
    const totalValue = lowStockProducts.reduce((sum, p) => sum + p.stock * p.precioventa, 0);

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
async function generateKardexReport(filters: ReportFilters): Promise<KardexReportData> {
  try {
    const movements = await getMovements(EMPRESA_ID);
    const stats = await getKardexStats(EMPRESA_ID, 30);

    let filteredMovements: KardexExtendido[] = movements;

    // Capturamos en variables locales para ayudar al narrowing del callback
    const { startDate, endDate, movementType, productId } = filters;

    if (startDate) {
      const s = startDate;
      filteredMovements = filteredMovements.filter((m) => m.fecha >= s);
    }
    if (endDate) {
      const e = endDate;
      filteredMovements = filteredMovements.filter((m) => m.fecha <= e);
    }

    if (movementType && movementType !== 'all') {
      filteredMovements = filteredMovements.filter((m) => m.tipo === movementType);
    }

    if (productId) {
      const pid = Number(productId);
      filteredMovements = filteredMovements.filter((m) => m.id_producto === pid);
    }

    const entradas = filteredMovements.filter((m) => m.tipo === 'entrada');
    const salidas = filteredMovements.filter((m) => m.tipo === 'salida');

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
          start: startDate || '',
          end: endDate || '',
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
async function generateInventoryValueReport(filters: ReportFilters): Promise<InventoryValueData> {
  try {
    const products = await ProductService.getProducts(EMPRESA_ID);

    let filteredProducts: ProductoExtendido[] = products;

    if (filters.categoria) {
      filteredProducts = filteredProducts.filter(
        (p) => p.id_categoria === Number(filters.categoria)
      );
    }

    const productsWithValue: InventoryValueProduct[] = filteredProducts.map((product) => ({
      ...product,
      valorCompra: product.stock * product.preciocompra,
      valorVenta: product.stock * product.precioventa,
      utilidadPotencial: product.stock * product.precioventa - product.stock * product.preciocompra,
    }));

    const totalValueCost = productsWithValue.reduce((sum, p) => sum + p.valorCompra, 0);
    const totalValueSale = productsWithValue.reduce((sum, p) => sum + p.valorVenta, 0);
    const totalPotentialProfit = totalValueSale - totalValueCost;

    const categoryGroups = productsWithValue.reduce(
      (acc, product) => {
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
      },
      {} as Record<string, CategoryBreakdownItem>
    );

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
async function generatePDF(reportData: AnyReportData): Promise<Blob> {
  try {
    let PDFComponent: React.ComponentType<{ data: AnyReportData }>;

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
        throw new Error('Tipo de reporte no soportado');
    }

    const blob = await pdf(<PDFComponent data={reportData} />).toBlob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Generar CSV
function generateCSV(reportData: AnyReportData): string {
  try {
    let csvData: Record<string, string | number>[] = [];

    switch (reportData.type) {
      case 'stock':
      case 'low-stock':
        csvData = reportData.data.map((product) => ({
          Código: product.codigointerno || '',
          Producto: product.descripcion,
          Categoría: product.categoria,
          Marca: product.marca,
          'Stock Actual': product.stock,
          'Stock Mínimo': product.stock_minimo,
          'Precio Compra': product.preciocompra,
          'Precio Venta': product.precioventa,
          'Valor Total': product.stock * product.precioventa,
          'Estado Stock': product.stock <= product.stock_minimo ? 'BAJO' : 'OK',
        }));
        break;

      case 'kardex':
        csvData = reportData.data.map((movement) => ({
          Fecha: movement.fecha,
          Producto: movement.descripcion,
          Tipo: movement.tipo.toUpperCase(),
          Cantidad: movement.cantidad,
          Usuario: movement.nombres,
          Detalle: movement.detalle,
        }));
        break;

      case 'inventory-value':
        csvData = reportData.data.map((product) => ({
          Producto: product.descripcion,
          Categoría: product.categoria,
          Stock: product.stock,
          'Precio Compra': product.preciocompra,
          'Precio Venta': product.precioventa,
          'Valor Compra Total': product.valorCompra,
          'Valor Venta Total': product.valorVenta,
          'Utilidad Potencial': product.utilidadPotencial,
        }));
        break;

      default:
        throw new Error('Tipo de reporte no soportado para CSV');
    }

    return Papa.unparse(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
}

// Descargar archivo
function downloadFile(content: string | Blob, filename: string, type: 'csv' | 'pdf'): void {
  try {
    const blob =
      typeof content === 'string'
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

export const ReportGenerator = {
  generateStockReport,
  generateLowStockReport,
  generateKardexReport,
  generateInventoryValueReport,
  generatePDF,
  generateCSV,
  downloadFile,
} as const;

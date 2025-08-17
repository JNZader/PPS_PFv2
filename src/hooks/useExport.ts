import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import Papa from 'papaparse';
import type { ReportData, ExportOptions } from '../types/reports';
import { ReportPDFTemplate } from '../services/reports/pdfTemplates';

export const useExport = () => {
  const exportPDF = useMutation({
    mutationFn: async ({ data, options }: { data: ReportData; options: ExportOptions }) => {
      const doc = <ReportPDFTemplate data={data} options={options} />;
      const blob = await pdf(doc).toBlob();
      
      // Descargar archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.titulo.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast.success('PDF generado exitosamente');
    },
    onError: () => {
      toast.error('Error al generar PDF');
    },
  });

  const exportCSV = useMutation({
    mutationFn: async ({ data }: { data: ReportData }) => {
      if (!data.productos?.length && !data.movimientos?.length) {
        throw new Error('No hay datos para exportar');
      }

      let csvData: any[] = [];
      let filename = '';

      if (data.productos?.length) {
        csvData = data.productos.map(product => ({
          'Descripción': product.descripcion,
          'SKU': product.codigointerno || '',
          'Categoría': product.categoria,
          'Marca': product.marca,
          'Stock': product.stock,
          'Stock Mínimo': product.stock_minimo,
          'Precio Compra': product.preciocompra,
          'Precio Venta': product.precioventa,
          'Valor Stock': product.stock * product.precioventa,
        }));
        filename = `productos-${Date.now()}.csv`;
      } else if (data.movimientos?.length) {
        csvData = data.movimientos.map(movement => ({
          'Fecha': movement.fecha,
          'Producto': movement.descripcion,
          'Tipo': movement.tipo,
          'Cantidad': movement.cantidad,
          'Detalle': movement.detalle,
          'Usuario': movement.nombres,
        }));
        filename = `movimientos-${Date.now()}.csv`;
      }

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Descargar archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast.success('CSV generado exitosamente');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al generar CSV');
    },
  });

  return {
    exportPDF,
    exportCSV,
    isExporting: exportPDF.isPending || exportCSV.isPending,
  };
};
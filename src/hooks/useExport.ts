import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ReportGenerator } from '../services/reports/reportGenerator';
// ✅ CORRECCIÓN: Se utiliza un tipo de dato que une todos los posibles reportes.
// Asegúrate de que este tipo esté bien definido en tu archivo de tipos.
import type { AnyReportData } from '../types/reports';

export const useExportReport = () => {
  // Mutación para exportar a PDF
  const exportPDF = useMutation({
    mutationFn: async (data: AnyReportData) => {
      if (!data) {
        throw new Error('No se proporcionaron datos para exportar.');
      }
      const pdfBlob = await ReportGenerator.generatePDF(data);
      // Usar la función de descarga del propio ReportGenerator 
      ReportGenerator.downloadFile(pdfBlob, `${data.type}-report`, 'pdf');
      return pdfBlob;
    },
    onSuccess: () => {
      toast.success('PDF exportado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al exportar PDF: ${error.message}`);
    },
  });

  // Mutación para exportar a CSV
  const exportCSV = useMutation({
    mutationFn: async (data: AnyReportData) => {
      if (!data) {
        throw new Error('No se proporcionaron datos para exportar.');
      }
      const csvContent = ReportGenerator.generateCSV(data);
      // Usar la función de descarga del propio ReportGenerator
      ReportGenerator.downloadFile(csvContent, `${data.type}-report`, 'csv');
      return csvContent;
    },
    onSuccess: () => {
      toast.success('CSV exportado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al exportar CSV: ${error.message}`);
    },
  });

  return {
    exportPDF: exportPDF.mutateAsync,
    exportCSV: exportCSV.mutateAsync,
    isExporting: exportPDF.isPending || exportCSV.isPending,
  };
};
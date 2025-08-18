import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ReportGenerator } from '../services/reports/reportGenerator';
// ✅ CORRECCIÓN: Se utiliza un tipo de dato que une todos los posibles reportes.
// Asegúrate de que este tipo esté bien definido en tu archivo de tipos.
import type { AnyReportData } from '../types/reports';

/**
 * NOTA IMPORTANTE:
 * Para que este hook funcione, necesitas instalar 'papaparse' y sus tipos.
 * Ejecuta los siguientes comandos en tu terminal:
 * bun add papaparse
 * bun add -d @types/papaparse
 */

/**
 * Hook para exportar datos de reporte ya generados a PDF o CSV.
 * Si necesitas generar los datos del reporte primero, usa el hook `useGenerateReport` de `useReports.ts`.
 */
export const useExportReport = () => {
  // Mutación para exportar a PDF
  const exportPDF = useMutation({
    mutationFn: async (data: AnyReportData) => {
      if (!data) {
        throw new Error('No se proporcionaron datos para exportar.');
      }
      const pdfBlob = await ReportGenerator.generatePDF(data);
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

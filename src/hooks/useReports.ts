import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ReportGenerator } from '../services/reports/reportGenerator';
import type { ReportFilters, ReportType } from '../types/reports';

// Hook para generar reportes
export const useGenerateReport = () => {
    return useMutation({
        mutationFn: async ({
            type,
            filters
        }: {
            type: ReportType;
            filters: ReportFilters
        }) => {
            switch (type) {
                case 'stock':
                    return ReportGenerator.generateStockReport(filters);
                case 'low-stock':
                    return ReportGenerator.generateLowStockReport(filters);
                case 'kardex':
                    return ReportGenerator.generateKardexReport(filters);
                case 'inventory-value':
                    return ReportGenerator.generateInventoryValueReport(filters);
                default:
                    throw new Error(`Tipo de reporte no soportado: ${type}`);
            }
        },
        onError: (error) => {
            console.error('Error generating report:', error);
            toast.error('Error al generar el reporte');
        },
    });
};

// Hook para generar PDF
export const useGeneratePDF = () => {
    return useMutation({
        mutationFn: async (reportData: any) => {
            const pdfBlob = await ReportGenerator.generatePDF(reportData);
            return pdfBlob;
        },
        onSuccess: () => {
            toast.success('PDF generado exitosamente');
        },
        onError: (error) => {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF');
        },
    });
};

// Hook para generar CSV
export const useGenerateCSV = () => {
    return useMutation({
        mutationFn: (reportData: any) => {
            return ReportGenerator.generateCSV(reportData);
        },
        onSuccess: () => {
            toast.success('CSV generado exitosamente');
        },
        onError: (error) => {
            console.error('Error generating CSV:', error);
            toast.error('Error al generar el CSV');
        },
    });
};

// Hook para obtener estadísticas de reportes
export const useReportStats = () => {
    return useQuery({
        queryKey: ['report-stats'],
        queryFn: async () => {
            // Aquí podrías implementar estadísticas específicas de reportes
            // Por ahora retornamos un objeto vacío
            return {
                totalReportsGenerated: 0,
                lastReportDate: null,
                mostUsedReportType: null,
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};
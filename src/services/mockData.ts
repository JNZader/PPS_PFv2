import type { DashboardStats } from '../types/dashboard';

// Simular datos del dashboard
export const mockDashboardStats: DashboardStats = {
  totalProducts: 1234,
  lowStockProducts: 23,
  todaySales: 89,
  salesTrend: 12.5,
  totalValue: 2480000,
  topCategories: [
    { name: 'Electrónicos', count: 450, value: 1200000, percentage: 36.5 },
    { name: 'Ropa', count: 320, value: 580000, percentage: 25.9 },
    { name: 'Hogar', count: 280, value: 420000, percentage: 22.7 },
    { name: 'Deportes', count: 184, value: 280000, percentage: 14.9 },
  ],
  recentMovements: [
    {
      id: '1',
      type: 'exit',
      productName: 'iPhone 15 Pro',
      quantity: 2,
      user: 'Juan Pérez',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'entry',
      productName: 'Samsung Galaxy S24',
      quantity: 10,
      user: 'María García',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '3',
      type: 'exit',
      productName: 'MacBook Air M3',
      quantity: 1,
      user: 'Carlos López',
      date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '4',
      type: 'entry',
      productName: 'AirPods Pro',
      quantity: 15,
      user: 'Ana Martín',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  salesChart: [
    { date: '2024-01-01', sales: 45000, orders: 23 },
    { date: '2024-01-02', sales: 52000, orders: 31 },
    { date: '2024-01-03', sales: 48000, orders: 28 },
    { date: '2024-01-04', sales: 61000, orders: 35 },
    { date: '2024-01-05', sales: 55000, orders: 29 },
    { date: '2024-01-06', sales: 67000, orders: 42 },
    { date: '2024-01-07', sales: 58000, orders: 33 },
  ],
};

// Hook simulado para obtener datos del dashboard
export const useDashboardData = () => {
  return {
    data: mockDashboardStats,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

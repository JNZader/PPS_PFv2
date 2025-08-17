export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  salesTrend: number;
  totalValue: number;
  topCategories: CategoryStat[];
  recentMovements: RecentMovement[];
  salesChart: SalesChartData[];
}

export interface CategoryStat {
  name: string;
  count: number;
  value: number;
  percentage: number;
}

export interface RecentMovement {
  id: string;
  type: 'entry' | 'exit';
  productName: string;
  quantity: number;
  user: string;
  date: string;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
}

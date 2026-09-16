import { apiClient, getErrorMessage } from './api';
import { Product } from '../types';

// ============================================================================
// TypeScript Interfaces (Strictly aligned with .NET 9 API & DashboardController)
// ============================================================================

export interface CurrentUser {
  id: string;
  name: string;
  firstName?: string;
  role: string;
  avatarUrl?: string;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  quantityOnHand: number;
  reorderLevel: number;
}

export interface RecentSaleItem {
  id: string;
  invoiceNo: string;
  customerName: string;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'Draft' | 'Completed' | 'Voided';
  saleDate: string;
}

export interface SalesTrendItem {
  date: string;
  formattedDate: string;
  amount: number;
}

export interface DashboardSummaryResponse {
  todaySales: number;
  todaySalesCount: number;
  todayGrossProfit: number;
  monthSales: number;
  monthSalesCount: number;
  monthGrossProfit: number;
  monthGrossMarginPercent: number;
  totalInventoryValuation: number;
  totalProductsCount: number;
  lowStockCount: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  outstandingReceivables: number;
  receivablesCount: number;
  topSellingProducts: TopSellingProduct[];
  recentSales: RecentSaleItem[];
  salesTrend: SalesTrendItem[];
}

export interface BackendSaleItemDto {
  productId: string;
  productSKU?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface BackendSaleDto {
  id: string;
  customerId?: string;
  customerName?: string;
  invoiceNo: string;
  saleDate: string;
  status: string | number;
  total: number;
  paidAmount?: number;
  balance?: number;
  items?: BackendSaleItemDto[];
  payments?: { amount: number; method: string | number; paymentDate: string }[];
}

export interface BackendDashboardMetrics {
  todaySales: number;
  todaySalesCount: number;
  todayGrossProfit: number;
  monthSales: number;
  monthSalesCount: number;
  monthGrossProfit: number;
  monthGrossMarginPercent: number;
  totalInventoryValuation: number;
  totalProductsCount: number;
  lowStockCount: number;
  recentSales?: BackendSaleDto[];
  lowStockProducts?: any[];
}

export interface BackendDailyTrendDto {
  date: string;
  salesCount: number;
  revenue: number;
  profit: number;
}

export interface BackendSalesReportDto {
  summary?: any;
  dailyTrends?: BackendDailyTrendDto[];
}

// ============================================================================
// Auth & User Context Helper
// ============================================================================

export const getCurrentUser = (): CurrentUser | null => {
  try {
    const raw = localStorage.getItem('swiftsale_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const fullName = (u.fullName || u.name || u.username || 'User').trim();
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] || 'User';
    return {
      id: u.userId || u.id || '1',
      name: fullName,
      firstName,
      role: u.role || 'Admin',
      avatarUrl: u.avatarUrl,
    };
  } catch {
    return null;
  }
};

// ============================================================================
// Status Converter Helper
// ============================================================================

const normalizeSaleStatus = (status: string | number): 'Draft' | 'Completed' | 'Voided' => {
  if (status === 2 || status === 'Completed' || status === 'completed') return 'Completed';
  if (status === 3 || status === 'Voided' || status === 'voided') return 'Voided';
  return 'Draft';
};

// ============================================================================
// Dashboard Service API
// ============================================================================

export const dashboardApiService = {
  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    try {
      // Query backend endpoints in parallel
      const [dashboardRes, salesRes, productsRes, reportsRes] = await Promise.allSettled([
        apiClient.get<BackendDashboardMetrics>('/dashboard'),
        apiClient.get<BackendSaleDto[]>('/sales'),
        apiClient.get<Product[]>('/products'),
        apiClient.get<BackendSalesReportDto>('/reports/sales'),
      ]);

      const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data : null;
      const salesList: BackendSaleDto[] =
        salesRes.status === 'fulfilled' && Array.isArray(salesRes.value.data) ? salesRes.value.data : [];
      const productsList: Product[] =
        productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
      const reportsData: BackendSalesReportDto | null =
        reportsRes.status === 'fulfilled' ? reportsRes.value.data : null;

      // 1. Live values directly from DashboardController.GetDashboardMetrics()
      const todaySales = Number(dashboardData?.todaySales ?? 0);
      const todaySalesCount = Number(dashboardData?.todaySalesCount ?? 0);
      const todayGrossProfit = Number(dashboardData?.todayGrossProfit ?? 0);
      const monthSales = Number(dashboardData?.monthSales ?? 0);
      const monthSalesCount = Number(dashboardData?.monthSalesCount ?? 0);
      const monthGrossProfit = Number(dashboardData?.monthGrossProfit ?? 0);
      const monthGrossMarginPercent = Number(dashboardData?.monthGrossMarginPercent ?? 0);
      const totalInventoryValuation = Number(dashboardData?.totalInventoryValuation ?? 0);
      const totalProductsCount = Number(dashboardData?.totalProductsCount ?? productsList.length ?? 0);
      const lowStockCount = Number(dashboardData?.lowStockCount ?? 0);

      // Helper to compute sale balance
      const getSaleBalance = (s: BackendSaleDto): number => {
        if (typeof s.balance === 'number') return s.balance;
        const totalPaid = s.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ?? 0;
        return Math.max(0, Number(s.total || 0) - totalPaid);
      };

      const getSalePaidAmount = (s: BackendSaleDto): number => {
        if (typeof s.paidAmount === 'number') return s.paidAmount;
        return s.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ?? Number(s.total || 0);
      };

      // Completed / Paid / Receivables Breakdown
      const completedSales = salesList.filter((s) => normalizeSaleStatus(s.status) === 'Completed');
      const totalOrdersCount = monthSalesCount > 0 ? monthSalesCount : completedSales.length;

      const completedFullyPaid = completedSales.filter((s) => getSaleBalance(s) <= 0);
      const completedOrdersCount = completedFullyPaid.length;

      const partialSales = completedSales.filter((s) => getSaleBalance(s) > 0);
      const receivablesCount = partialSales.length;
      const outstandingReceivables = partialSales.reduce((acc, s) => acc + getSaleBalance(s), 0);

      // 2. Recent Sales Mapping directly from live backend
      let recentSales: RecentSaleItem[] = [];
      const rawSales = salesList.length > 0 ? salesList : (dashboardData?.recentSales || []);
      if (rawSales.length > 0) {
        recentSales = rawSales.slice(0, 5).map((s) => ({
          id: s.id,
          invoiceNo: s.invoiceNo,
          customerName: s.customerName || 'Walk-in Customer',
          total: Number(s.total),
          paidAmount: getSalePaidAmount(s),
          balance: getSaleBalance(s),
          status: normalizeSaleStatus(s.status),
          saleDate: s.saleDate,
        }));
      }

      // 3. Top Selling Products Calculation from live products & sales line items
      const productSalesMap = new Map<string, { quantitySold: number; totalRevenue: number }>();
      salesList.forEach((s) => {
        if (s.items && Array.isArray(s.items)) {
          s.items.forEach((item) => {
            const pid = item.productId;
            const existing = productSalesMap.get(pid) || { quantitySold: 0, totalRevenue: 0 };
            existing.quantitySold += Number(item.quantity || 0);
            existing.totalRevenue += Number(item.total || 0);
            productSalesMap.set(pid, existing);
          });
        }
      });

      let topSellingProducts: TopSellingProduct[] = [];
      if (productsList.length > 0) {
        topSellingProducts = productsList.map((product) => {
          const stat = productSalesMap.get(product.id) || { quantitySold: 0, totalRevenue: 0 };
          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            categoryName: product.categoryName || 'General',
            quantitySold: stat.quantitySold,
            totalRevenue: stat.totalRevenue,
            quantityOnHand: Number(product.quantityOnHand ?? 0),
            reorderLevel: Number(product.reorderLevel ?? 10),
          };
        });

        // Sort by quantitySold desc, then by name
        topSellingProducts.sort((a, b) => {
          if (b.quantitySold !== a.quantitySold) {
            return b.quantitySold - a.quantitySold;
          }
          return b.quantityOnHand - a.quantityOnHand;
        });
      }

      // 4. Sales Trend Calculation (Last 7 Days)
      const last7Days: SalesTrendItem[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Check if reportsData has matching trend
        const trendMatch = reportsData?.dailyTrends?.find((t) => t.date.startsWith(isoDate));
        if (trendMatch) {
          last7Days.push({
            date: isoDate,
            formattedDate: formatted,
            amount: Number(trendMatch.revenue || 0),
          });
        } else {
          // Calculate from salesList for this day
          const daySales = salesList
            .filter((s) => s.saleDate?.startsWith(isoDate) && normalizeSaleStatus(s.status) === 'Completed')
            .reduce((acc, s) => acc + Number(s.total || 0), 0);
          last7Days.push({
            date: isoDate,
            formattedDate: formatted,
            amount: daySales,
          });
        }
      }

      return {
        todaySales,
        todaySalesCount,
        todayGrossProfit,
        monthSales,
        monthSalesCount,
        monthGrossProfit,
        monthGrossMarginPercent,
        totalInventoryValuation,
        totalProductsCount,
        lowStockCount,
        totalOrdersCount,
        completedOrdersCount,
        outstandingReceivables,
        receivablesCount,
        topSellingProducts,
        recentSales,
        salesTrend: last7Days,
      };
    } catch (err) {
      console.warn('Could not fetch live dashboard metrics:', getErrorMessage(err));
      // In case of complete network failure, return empty live state matching backend initial store
      return {
        todaySales: 0,
        todaySalesCount: 0,
        todayGrossProfit: 0,
        monthSales: 0,
        monthSalesCount: 0,
        monthGrossProfit: 0,
        monthGrossMarginPercent: 0,
        totalInventoryValuation: 0,
        totalProductsCount: 0,
        lowStockCount: 0,
        totalOrdersCount: 0,
        completedOrdersCount: 0,
        outstandingReceivables: 0,
        receivablesCount: 0,
        topSellingProducts: [],
        recentSales: [],
        salesTrend: [],
      };
    }
  },
};

export default dashboardApiService;

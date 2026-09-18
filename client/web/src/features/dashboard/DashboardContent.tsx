import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  ClipboardList,
  UserPlus,
  Box,
  BarChart2,
  CloudSun,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  Package,
  Layers,
  Sparkles,
  Shield,
  CircleDot,
  RefreshCw,
  AlertCircle,
  Tag,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  dashboardApiService,
  CurrentUser,
  DashboardSummaryResponse,
  TopSellingProduct,
  RecentSaleItem,
  SalesTrendItem,
  getCurrentUser,
} from '../../services/dashboardService';

// Re-export interfaces per contract requirements
export type { CurrentUser, DashboardSummaryResponse, TopSellingProduct, RecentSaleItem, SalesTrendItem };

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  dotColor: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    text: 'Order SO-2025-1042 has been marked as completed.',
    time: '2h ago',
    dotColor: '#10B981', // green
  },
  {
    id: 'n-2',
    text: 'Order SO-2025-1041 is partially paid (₱ 5,200 remaining).',
    time: '4h ago',
    dotColor: '#F59E0B', // orange
  },
  {
    id: 'n-3',
    text: 'New customer registered: Best Emballasje.',
    time: '6h ago',
    dotColor: '#0EA5E9', // blue
  },
  {
    id: 'n-4',
    text: 'Stock level for Stretch Film is low (6 units).',
    time: '8h ago',
    dotColor: '#10B981', // green
  },
];

// Helper to format currency
const formatCurrency = (val: number, minimumFractionDigits = 0) =>
  '₱ ' +
  val.toLocaleString('en-PH', {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  });

// Custom Tooltip for Area Chart
const CustomChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 text-xs">
        <p className="text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-slate-800 font-bold font-mono text-sm">
          ₱ {Number(val).toLocaleString('en-PH')}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Dashboard Component
// ============================================================================

export interface DashboardContentProps {
  className?: string;
  userOverride?: CurrentUser | null;
  onNewOrder?: () => void;
  onAddCustomer?: () => void;
  onAddProduct?: () => void;
  onViewReports?: () => void;
  onViewSalesHistory?: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  className = '',
  userOverride,
  onNewOrder,
  onAddCustomer,
  onAddProduct,
  onViewReports,
  onViewSalesHistory,
}) => {
  const auth = useAuth();
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Top Products pagination & filters
  const [topProductsPage, setTopProductsPage] = useState(1);
  const [topProductsNameFilter, setTopProductsNameFilter] = useState('');
  const [topProductsStatusFilter, setTopProductsStatusFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const TOP_PRODUCTS_PAGE_SIZE = 5;

  // Derive dynamic user
  const currentUser: CurrentUser | null =
    userOverride ||
    (auth?.user
      ? {
          id: auth.user.userId || '1',
          name: auth.user.fullName || auth.user.username || 'User',
          firstName: (auth.user.fullName || auth.user.username || 'User').trim().split(/\s+/)[0],
          role: auth.user.role || 'Admin',
        }
      : getCurrentUser());

  const greetingName = currentUser?.firstName || currentUser?.name || 'User';

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const summary = await dashboardApiService.getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to fetch dashboard summary', err);
      setError('Unable to reach live backend. Displaying cached metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Product Icon helper based on category/name
  const renderProductIcon = (item: TopSellingProduct) => {
    const text = (item.productName + ' ' + item.categoryName + ' ' + item.sku).toLowerCase();
    if (text.includes('mouse') || text.includes('electronic')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0097A7] flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-[#0097A7]" />
        </div>
      );
    }
    if (text.includes('keyboard') || text.includes('rgb')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
      );
    }
    if (text.includes('espresso') || text.includes('coffee') || text.includes('beverage')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    if (text.includes('box') || text.includes('pack')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    if (text.includes('wrap') || text.includes('bubble')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-sky-600" />
        </div>
      );
    }
    if (text.includes('tape') || text.includes('adhesive')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <CircleDot className="w-4 h-4 text-indigo-600" />
        </div>
      );
    }
    if (text.includes('bag') || text.includes('mail') || text.includes('envelope')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-rose-600" />
        </div>
      );
    }
    if (text.includes('film') || text.includes('stretch') || text.includes('pallet')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-teal-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
        <Box className="w-4 h-4" />
      </div>
    );
  };

  // Stock status pill calculator
  const renderStockBadge = (qoh: number, reorder: number) => {
    if (qoh <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
          Out of Stock
        </span>
      );
    }
    if (qoh <= reorder) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200/60">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#10B981] border border-emerald-200/60">
        In Stock
      </span>
    );
  };

  // Order status badge calculator per spec
  const renderOrderStatusBadge = (sale: RecentSaleItem) => {
    if (sale.status === 'Voided') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
          Voided
        </span>
      );
    }
    if (sale.balance > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200/60">
          Partial (₱{sale.balance.toLocaleString('en-PH')})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#10B981] border border-emerald-200/60">
        Completed
      </span>
    );
  };

  return (
    <div
      className={`dashboard-canvas w-full bg-[#F3F7F8] rounded-2xl p-4 sm:p-6 lg:p-7 space-y-6 ${className}`}
      style={{ backgroundColor: '#F3F7F8' }}
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP GREETING & STATUS BAR                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Column: Dynamic greeting */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Good morning, {greetingName}</span>
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ${
                refreshing ? 'animate-spin text-cyan-600' : ''
              }`}
              title="Refresh live data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening with your sales today.
          </p>
        </div>

        {/* Right Column: Date & Weather */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white border border-slate-100/90 rounded-2xl px-3.5 py-2 shadow-xs">
          <span className="text-xs font-medium text-slate-400 border-r border-slate-100 pr-3">
            Mon, Aug 18, 2026
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <CloudSun className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>23°C Partly cloudy</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CONTENT GRID LAYOUT                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* MAIN WORKSPACE (Cols 1 to 9 in 12-col grid)                       */}
        {/* ================================================================= */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Section A: Top Stat Cards (4 Cards Grid)                        */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Total Sales */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Sales</span>
                <div className="w-8 h-8 rounded-lg bg-[#E0F7FA] text-[#0097A7] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#0097A7]" />
                </div>
              </div>
              <div className="mt-2">
                {loading ? (
                  <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                    {formatCurrency(data?.monthSales ?? data?.todaySales ?? 0, 2)}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                {(data?.monthSales ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#10B981] border border-emerald-100/60">
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 12%
                  </span>
                ) : null}
                <span className="text-slate-400 font-normal">
                  {(data?.todaySales ?? 0) > 0
                    ? `₱ ${data?.todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })} today`
                    : (data?.monthSales ?? 0) > 0
                    ? 'vs. last week'
                    : '₱ 0.00 today'}
                </span>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Orders</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-teal-600" />
                </div>
              </div>
              <div className="mt-2">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                    {data?.totalOrdersCount ?? 0}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                {(data?.totalOrdersCount ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#10B981] border border-emerald-100/60">
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 8%
                  </span>
                ) : null}
                <span className="text-slate-400 font-normal">
                  {(data?.totalOrdersCount ?? 0) > 0 ? 'vs. last week' : '0 completed orders'}
                </span>
              </div>
            </div>

            {/* Card 3: Paid / Completed */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Paid / Completed</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                </div>
              </div>
              <div className="mt-2">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                    {data?.completedOrdersCount ?? 0}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-normal">
                  {data?.totalOrdersCount
                    ? Math.round(((data.completedOrdersCount ?? 0) / data.totalOrdersCount) * 100)
                    : 0}
                  % of total
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#10B981] border border-emerald-100/60">
                  Completed
                </span>
              </div>
            </div>

            {/* Card 4: Partial / Receivables */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Partial / Receivables</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-[#F59E0B]" />
                </div>
              </div>
              <div className="mt-2">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                    {data?.receivablesCount ?? 0}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-normal">
                  {formatCurrency(data?.outstandingReceivables ?? 0, 2)}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-[#F59E0B] border border-amber-100/60">
                  Partial
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Section B: Middle Row (Sales Line Chart + Recent Orders Table)   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview AreaChart */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Sales Overview</h2>
                {/* Time Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>{timeRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-20 text-xs">
                      {['Last 7 days', 'Last 30 days', 'This Month'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setTimeRange(opt);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition ${
                            timeRange === opt ? 'text-cyan-600 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart container */}
              <div className="w-full h-64">
                {loading ? (
                  <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse flex items-center justify-center">
                    <span className="text-xs text-slate-400">Loading sales trend...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data?.salesTrend ?? []}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesCyanGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A3BF" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#00A3BF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="formattedDate"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        dy={5}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={[0, (dataMax: number) => Math.max(10000, Math.ceil((dataMax || 0) * 1.25))]}
                        tickFormatter={(val) => (val === 0 ? '₱ 0' : val >= 1000 ? `₱ ${Math.round(val / 1000)}k` : `₱ ${val}`)}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        dx={-2}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#00A3BF"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#salesCyanGradient)"
                        dot={{ r: 3.5, fill: '#00A3BF', stroke: '#FFFFFF', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#00A3BF', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Orders Compact Table */}
            <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
                  <a
                    href="#recent-orders"
                    onClick={(e) => {
                      e.preventDefault();
                      onViewSalesHistory?.();
                    }}
                    className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <th className="pb-2.5 font-medium">#</th>
                        <th className="pb-2.5 font-medium text-right">Amount</th>
                        <th className="pb-2.5 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="py-3"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /></td>
                            <td className="py-3"><div className="h-3 w-16 bg-slate-100 rounded ml-auto animate-pulse" /></td>
                            <td className="py-3"><div className="h-4 w-16 bg-slate-100 rounded-full ml-auto animate-pulse" /></td>
                          </tr>
                        ))
                      ) : (data?.recentSales ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <ShoppingCart className="w-5 h-5 text-slate-300" />
                              <p className="text-xs font-semibold text-slate-600">No recent sales</p>
                              <p className="text-[11px] text-slate-400">Transactions processed in POS will show here</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (data?.recentSales ?? []).map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 font-mono text-slate-600 font-medium whitespace-nowrap">
                              {sale.invoiceNo}
                            </td>
                            <td className="py-2.5 font-mono font-semibold text-slate-800 text-right whitespace-nowrap">
                              ₱ {sale.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 text-right whitespace-nowrap">
                              {renderOrderStatusBadge(sale)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Section C: EXPANDED TOP PRODUCTS TABLE (Full Workspace Width)   */}
          {/* Replaces Market Donut & Sustainable Packaging cards             */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="w-full bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Top Products</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Performance velocity, revenue generated, and live inventory balance · ₱ {(data?.totalInventoryValuation ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} valuation ({data?.totalProductsCount ?? 0} active products, {data?.lowStockCount ?? 0} low stock)
                </p>
              </div>
              <a
                href="#top-products"
                onClick={(e) => {
                  e.preventDefault();
                  onAddProduct?.();
                }}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition"
              >
                View all inventory <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Top Products Filters */}
            {!loading && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={topProductsNameFilter}
                    onChange={(e) => { setTopProductsNameFilter(e.target.value); setTopProductsPage(1); }}
                    placeholder="Filter by product name..."
                    className="w-full pl-3 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <select
                  value={topProductsStatusFilter}
                  onChange={(e) => { setTopProductsStatusFilter(e.target.value as typeof topProductsStatusFilter); setTopProductsPage(1); }}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="inStock">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
            )}

            <div className="overflow-x-auto">
              {(() => {
                const allProds = data?.topSellingProducts ?? [];
                const filteredProds = allProds.filter((prod) => {
                  const nameMatch = !topProductsNameFilter || prod.productName.toLowerCase().includes(topProductsNameFilter.toLowerCase());
                  let statusMatch = true;
                  if (topProductsStatusFilter === 'outOfStock') statusMatch = prod.quantityOnHand <= 0;
                  else if (topProductsStatusFilter === 'lowStock') statusMatch = prod.quantityOnHand > 0 && prod.quantityOnHand <= prod.reorderLevel;
                  else if (topProductsStatusFilter === 'inStock') statusMatch = prod.quantityOnHand > prod.reorderLevel;
                  return nameMatch && statusMatch;
                });
                const totalPages = Math.max(1, Math.ceil(filteredProds.length / TOP_PRODUCTS_PAGE_SIZE));
                const safePage = Math.min(topProductsPage, totalPages);
                const pagedProds = filteredProds.slice((safePage - 1) * TOP_PRODUCTS_PAGE_SIZE, safePage * TOP_PRODUCTS_PAGE_SIZE);

                return (
                  <>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium">
                          <th className="pb-3 font-medium">Product</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium text-center">Units Sold</th>
                          <th className="pb-3 font-medium text-right">Revenue</th>
                          <th className="pb-3 font-medium text-right">Stock</th>
                          <th className="pb-3 font-medium text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80">
                        {loading ? (
                          Array.from({ length: TOP_PRODUCTS_PAGE_SIZE }).map((_, i) => (
                            <tr key={i}>
                              <td className="py-3"><div className="h-4 w-40 bg-slate-100 rounded animate-pulse" /></td>
                              <td className="py-3"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                              <td className="py-3"><div className="h-4 w-12 bg-slate-100 rounded mx-auto animate-pulse" /></td>
                              <td className="py-3"><div className="h-4 w-16 bg-slate-100 rounded ml-auto animate-pulse" /></td>
                              <td className="py-3"><div className="h-4 w-12 bg-slate-100 rounded ml-auto animate-pulse" /></td>
                              <td className="py-3"><div className="h-4 w-16 bg-slate-100 rounded-full ml-auto animate-pulse" /></td>
                            </tr>
                          ))
                        ) : pagedProds.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                              No products match the current filter.
                            </td>
                          </tr>
                        ) : (
                          pagedProds.map((prod) => (
                            <tr key={prod.productId} className="hover:bg-slate-50/60 transition-colors">
                              {/* 1. Product (Icon + Name + SKU) */}
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  {renderProductIcon(prod)}
                                  <div>
                                    <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                                      {prod.productName}
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-400">
                                      {prod.sku}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Category */}
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/60"
                                  style={{ backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' }}
                                >
                                  <Tag className="w-3 h-3 text-slate-400" />
                                  {prod.categoryName || 'General'}
                                </span>
                              </td>

                              {/* 3. Units Sold - centered */}
                              <td className="py-3 font-mono font-semibold text-slate-700 text-center whitespace-nowrap">
                                {prod.quantitySold.toLocaleString()}
                              </td>

                              {/* 4. Revenue */}
                              <td className="py-3 font-mono font-bold text-slate-800 text-right whitespace-nowrap">
                                ₱ {prod.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* 5. Stock */}
                              <td className="py-3 font-mono text-slate-600 text-right whitespace-nowrap">
                                {prod.quantityOnHand.toLocaleString()}
                              </td>

                              {/* 6. Dynamic Status Badge */}
                              <td className="py-3 text-right whitespace-nowrap">
                                {renderStockBadge(prod.quantityOnHand, prod.reorderLevel)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {!loading && filteredProds.length > TOP_PRODUCTS_PAGE_SIZE && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">
                          Showing {((safePage - 1) * TOP_PRODUCTS_PAGE_SIZE) + 1}–{Math.min(safePage * TOP_PRODUCTS_PAGE_SIZE, filteredProds.length)} of {filteredProds.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setTopProductsPage((p) => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            ‹ Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setTopProductsPage(pg)}
                              className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${
                                pg === safePage
                                  ? 'bg-cyan-600 text-white'
                                  : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setTopProductsPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Next ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT RAIL (Quick Actions & Notifications - Cols 10 to 12)        */}
        {/* ================================================================= */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">Quick Actions</h2>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onNewOrder}
              className="w-full bg-[#0097A7] hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              style={{
                backgroundColor: '#0097A7',
                color: '#FFFFFF',
              }}
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" style={{ color: '#FFFFFF' }} />
              <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                Create New Order
              </span>
            </button>

            {/* Secondary Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onAddCustomer}
                className="w-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl p-3 flex items-center gap-3 transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-cyan-50 border border-slate-200/70 group-hover:border-cyan-200/70 text-slate-600 group-hover:text-cyan-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-900 transition-colors">
                    Add Customer
                  </div>
                  <div className="text-[11px] text-slate-400">Register a new client</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onAddProduct}
                className="w-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl p-3 flex items-center gap-3 transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-cyan-50 border border-slate-200/70 group-hover:border-cyan-200/70 text-slate-600 group-hover:text-cyan-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-900 transition-colors">
                    Add Product
                  </div>
                  <div className="text-[11px] text-slate-400">Update stock inventory</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onViewReports}
                className="w-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl p-3 flex items-center gap-3 transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-cyan-50 border border-slate-200/70 group-hover:border-cyan-200/70 text-slate-600 group-hover:text-cyan-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-900 transition-colors">
                    View Reports
                  </div>
                  <div className="text-[11px] text-slate-400">Analyze performance</div>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Notifications</h2>
              <a
                href="#notifications"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition"
              >
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3.5">
              {NOTIFICATIONS.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs group">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: item.dotColor }}
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-700 font-medium leading-snug">{item.text}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

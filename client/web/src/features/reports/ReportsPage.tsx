import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  RefreshCw,
  Loader2,
  FileDown,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Percent,
  ShoppingBag,
  Ban,
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
import { reportsService, categoriesService, getErrorMessage } from '../../services/api';
import {
  ReportOverview,
  SalesTrendItem,
  TopProductReportItem,
  SlowMovingProductReportItem,
  VoidedSaleDetail,
  ReportFilterParams,
  Category,
} from '../../types';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | 'custom';

export const ReportsPage: React.FC = () => {
  // Filters State
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Reports Data State
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [trend, setTrend] = useState<SalesTrendItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductReportItem[]>([]);
  const [slowMoving, setSlowMoving] = useState<SlowMovingProductReportItem[]>([]);
  const [voidedSales, setVoidedSales] = useState<VoidedSaleDetail[]>([]);

  // UI State
  const [activeVelocityTab, setActiveVelocityTab] = useState<'top' | 'slow'>('top');
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Report Table Pagination
  const REPORT_PAGE_SIZE = 10;
  const [voidedPage, setVoidedPage] = useState(1);
  const [topProductsReportPage, setTopProductsReportPage] = useState(1);
  const [slowMovingPage, setSlowMovingPage] = useState(1);

  // Calculate Start & End Date strings based on current preset
  const getDateRange = useCallback((): { startDate?: string; endDate?: string } => {
    const now = new Date();
    const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

    if (datePreset === 'today') {
      const todayStr = toIsoDate(now);
      return {
        startDate: `${todayStr}T00:00:00Z`,
        endDate: `${todayStr}T23:59:59Z`,
      };
    }

    if (datePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = toIsoDate(y);
      return {
        startDate: `${yStr}T00:00:00Z`,
        endDate: `${yStr}T23:59:59Z`,
      };
    }

    if (datePreset === 'last7') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return {
        startDate: `${toIsoDate(start)}T00:00:00Z`,
        endDate: `${toIsoDate(now)}T23:59:59Z`,
      };
    }

    if (datePreset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: `${toIsoDate(start)}T00:00:00Z`,
        endDate: `${toIsoDate(now)}T23:59:59Z`,
      };
    }

    if (datePreset === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: `${toIsoDate(start)}T00:00:00Z`,
        endDate: `${toIsoDate(end)}T23:59:59Z`,
      };
    }

    if (datePreset === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: `${customStartDate}T00:00:00Z`,
        endDate: `${customEndDate}T23:59:59Z`,
      };
    }

    return {};
  }, [datePreset, customStartDate, customEndDate]);

  // Build current filter parameters object
  const buildFilterParams = useCallback((): ReportFilterParams => {
    const { startDate, endDate } = getDateRange();
    const params: ReportFilterParams = {};

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedPaymentMethod) params.paymentMethod = selectedPaymentMethod;

    return params;
  }, [getDateRange, selectedCategory, selectedPaymentMethod]);

  // Load Categories on mount
  useEffect(() => {
    categoriesService.getAll().then(setCategories).catch(console.error);
  }, []);

  // Fetch report data whenever filters change
  useEffect(() => {
    loadReportsData();
  }, [datePreset, customStartDate, customEndDate, selectedCategory, selectedPaymentMethod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setBannerMessage(null);
      const filters = buildFilterParams();

      const [ovData, trData, topData, slowData, voidedData] = await Promise.all([
        reportsService.getOverview(filters),
        reportsService.getSalesTrend(filters),
        reportsService.getTopProducts(filters, 20),
        reportsService.getSlowMoving(filters),
        reportsService.getVoidedSales(filters),
      ]);

      setOverview(ovData);
      setTrend(trData);
      setTopProducts(topData);
      setSlowMoving(slowData);
      setVoidedSales(voidedData);
    } catch (err) {
      console.error('Failed to load reports data', err);
      setBannerMessage({
        text: getErrorMessage(err) || 'Failed to load reports data.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export 3-Page PDF Action
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const filters = buildFilterParams();
      await reportsService.downloadPdf(filters);
      setBannerMessage({
        text: 'Operational 3-page PDF Report generated and downloaded successfully.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to export PDF', err);
      setBannerMessage({
        text: getErrorMessage(err) || 'Failed to generate printable PDF report.',
        type: 'error',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₱${(val ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0D7A5F]" />
            Financial & Operational Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Realized revenue, COGS, gross margin performance, and capital inventory velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadReportsData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0D7A5F]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf || loading}
            className="px-4 py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#0D7A5F]/20"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Print / Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner Alert Message */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-150 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            {(
              [
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: 'last7', label: 'Last 7 Days' },
                { key: 'thisMonth', label: 'This Month' },
                { key: 'lastMonth', label: 'Last Month' },
                { key: 'custom', label: 'Custom' },
              ] as { key: DatePreset; label: string }[]
            ).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setDatePreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  datePreset === p.key
                    ? 'bg-[#0D7A5F] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Category & Payment Method Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-[#0D7A5F]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full sm:w-40 py-2 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-[#0D7A5F]"
            >
              <option value="">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="BankTransfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers (Visible when 'custom' selected) */}
        {datePreset === 'custom' && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-[#0D7A5F]" />
              <span>Start Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>End Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
          </div>
        )}
      </div>

      {loading && !overview ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D7A5F]" />
          <p className="text-sm">Calculating operational intelligence...</p>
        </div>
      ) : (
        <>
          {/* Row 1: 5 KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Sales */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Sales (Revenue)
                </span>
                <div className="p-2 rounded-xl bg-[#0D7A5F]/15 text-[#0D7A5F]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(overview?.totalSales ?? 0)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>{overview?.totalOrders ?? 0} completed orders</span>
              </div>
            </div>

            {/* Card 2: Gross Profit & Margin */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Gross Profit
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#0D7A5F]/15 text-[#0D7A5F] border border-[#0D7A5F]/30">
                  {(overview?.grossMarginPercent ?? 0).toFixed(1)}% Margin
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                {formatCurrency(overview?.grossProfit ?? 0)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Percent className="w-3.5 h-3.5 text-[#0D7A5F]" />
                <span>Net margin realized over period</span>
              </div>
            </div>

            {/* Card 3: COGS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cost of Goods Sold (COGS)
                </span>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-200 tracking-tight">
                {formatCurrency(overview?.costOfGoodsSold ?? 0)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Weighted moving average cost</span>
              </div>
            </div>

            {/* Card 4: Inventory Health */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Inventory Asset Value
                </span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(overview?.inventoryValue ?? 0)}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">{overview?.activeSkus ?? 0} Active SKUs</span>
                <span className="text-slate-600">•</span>
                <span
                  className={
                    (overview?.lowStockCount ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }
                >
                  {overview?.lowStockCount ?? 0} Low Stock
                </span>
              </div>
            </div>

            {/* Card 5: Voided Orders */}
            <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-5 shadow-lg space-y-2 hover:border-rose-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                  Voided Orders
                </span>
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                  <Ban className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-300 tracking-tight">
                {formatCurrency(overview?.voidedSalesAmount ?? 0)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-rose-400/80">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{overview?.voidedOrdersCount ?? 0} voided orders in period</span>
              </div>
            </div>
          </div>

          {/* Row 2: Sales & Profit Trend (2/3) + Inventory Status (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales & Profit Trend Area Chart */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0D7A5F]" />
                    Revenue & Profit Trajectory
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daily commercial sales revenue vs. realized gross profit.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#0D7A5F]" />
                    <span className="text-slate-300">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Gross Profit</span>
                  </div>
                </div>
              </div>

              {trend.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                  No sales recorded in the selected period.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D7A5F" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0D7A5F" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(str: string) => str.slice(5)}
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val: number) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        }}
                        formatter={(val: any, name: any) => [
                          formatCurrency(Number(val) || 0),
                          name === 'revenue' ? 'Revenue' : 'Gross Profit',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0D7A5F"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="grossProfit"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProfit)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Inventory Status Mini-Dashboard */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  Inventory Health Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Stock levels, capital allocation, and reorder alerts.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Total Units */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300">Total Stock On Hand</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {overview?.totalUnitsOnHand ?? 0} units
                  </span>
                </div>

                {/* Active Catalog SKUs */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#0D7A5F]" />
                    <span className="text-xs font-semibold text-slate-300">Active Catalog Items</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {overview?.activeSkus ?? 0} SKUs
                  </span>
                </div>

                {/* Low Stock Reorder Alerts */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-slate-300">Reorder Threshold Alerts</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (overview?.lowStockCount ?? 0) > 0
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400'
                    }`}
                  >
                    {overview?.lowStockCount ?? 0} items
                  </span>
                </div>

                {/* Out of Stock Items */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-xs font-semibold text-slate-300">Zero Balance (Depleted)</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (overview?.outOfStockCount ?? 0) > 0
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'text-slate-400'
                    }`}
                  >
                    {overview?.outOfStockCount ?? 0} items
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2.5: Voided Sales & Check Reversals Section (Placed directly below Daily Sales & Margin Breakdown) */}
          <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  Voided Sales & Check Reversals
                </h3>
                <p className="text-xs text-slate-400">
                  Record of voided transactions, dishonored bounced checks, and stock return entries in the selected period.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {voidedSales.length} Voided
              </span>
            </div>

            {voidedSales.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No voided sales or bounced checks recorded in the selected timeframe.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/60">
                      <th className="py-2.5 px-3">Invoice # / DR #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Check & Bank Details</th>
                      <th className="py-2.5 px-3">Void / Bounced Reason</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {voidedSales.map((v) => (
                      <tr key={v.saleId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-semibold text-rose-400">{v.invoiceNo}</div>
                          {v.deliveryReceiptNo && (
                            <div className="text-[10px] text-teal-400">DR: {v.deliveryReceiptNo}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(v.saleDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">
                          {v.customerName}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {v.checkNumber ? (
                            <div>
                              <span className="font-bold text-amber-300">CHK: {v.checkNumber}</span>
                              {v.bankName && <div className="text-[10px] text-slate-400">{v.bankName}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-rose-300 font-medium">
                          {v.reason}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          ₱{v.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Voided Sales Pagination */}
            {voidedSales.length > REPORT_PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-rose-900/30">
                <span className="text-xs text-slate-400">
                  Showing {((Math.min(voidedPage, Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE))) - 1) * REPORT_PAGE_SIZE) + 1}–{Math.min(Math.min(voidedPage, Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE))) * REPORT_PAGE_SIZE, voidedSales.length)} of {voidedSales.length}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setVoidedPage((p) => Math.max(1, p - 1))} disabled={voidedPage <= 1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
                  {Array.from({ length: Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE)) }, (_, i) => i + 1).map((pg) => (
                    <button key={pg} type="button" onClick={() => setVoidedPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pg === Math.min(voidedPage, Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE))) ? 'bg-rose-600 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>{pg}</button>
                  ))}
                  <button type="button" onClick={() => setVoidedPage((p) => Math.min(Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE)), p + 1))} disabled={voidedPage >= Math.max(1, Math.ceil(voidedSales.length / REPORT_PAGE_SIZE))} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">Next ›</button>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Product Velocity Tables (Tabs for Top Selling & Slow Moving) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header & Tabs */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveVelocityTab('top'); setTopProductsReportPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeVelocityTab === 'top'
                      ? 'bg-[#0D7A5F] text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <span>Top Selling Products</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeVelocityTab === 'top'
                        ? 'bg-[#0b654e] text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {topProducts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveVelocityTab('slow'); setSlowMovingPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeVelocityTab === 'slow'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <span>Slow Moving Inventory</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeVelocityTab === 'slow'
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {slowMoving.length}
                  </span>
                </button>
              </div>

              <span className="text-xs text-slate-500">
                {activeVelocityTab === 'top'
                  ? 'Ranked by gross sales volume and margin'
                  : 'Products with capital tied up and low velocity'}
              </span>
            </div>

            {/* Tab 1: Top Selling Table */}
            {activeVelocityTab === 'top' && (
              <div className="overflow-x-auto">
                {topProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No product sales recorded in the selected period.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Sold Qty</th>
                        <th className="py-3 px-4 text-right">Gross Revenue</th>
                        <th className="py-3 px-4 text-right">COGS</th>
                        <th className="py-3 px-4 text-right">Gross Profit</th>
                        <th className="py-3 px-4 text-right">Realized Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {topProducts.slice((Math.min(topProductsReportPage, Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))) - 1) * REPORT_PAGE_SIZE, Math.min(topProductsReportPage, Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))) * REPORT_PAGE_SIZE).map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-indigo-300 text-xs">
                            {p.sku}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {p.name}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {p.quantitySold}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {formatCurrency(p.revenue)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 text-xs font-mono">
                            {formatCurrency(p.cogs)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {formatCurrency(p.grossProfit)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                p.marginPercent >= 30
                                  ? 'bg-[#0D7A5F]/15 text-[#0D7A5F] border border-[#0D7A5F]/30'
                                  : p.marginPercent > 0
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {p.marginPercent.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* Top Products Pagination */}
                {topProducts.length > REPORT_PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Showing {((Math.min(topProductsReportPage, Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))) - 1) * REPORT_PAGE_SIZE) + 1}–{Math.min(Math.min(topProductsReportPage, Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))) * REPORT_PAGE_SIZE, topProducts.length)} of {topProducts.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setTopProductsReportPage((p) => Math.max(1, p - 1))} disabled={topProductsReportPage <= 1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
                      {Array.from({ length: Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE)) }, (_, i) => i + 1).map((pg) => (
                        <button key={pg} type="button" onClick={() => setTopProductsReportPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pg === Math.min(topProductsReportPage, Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))) ? 'bg-[#0D7A5F] text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>{pg}</button>
                      ))}
                      <button type="button" onClick={() => setTopProductsReportPage((p) => Math.min(Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE)), p + 1))} disabled={topProductsReportPage >= Math.max(1, Math.ceil(topProducts.length / REPORT_PAGE_SIZE))} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">Next ›</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Slow Moving Table */}
            {activeVelocityTab === 'slow' && (
              <div className="overflow-x-auto">
                {slowMoving.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No slow-moving inventory detected; product turnover is healthy.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Current Stock</th>
                        <th className="py-3 px-4 text-right">Capital Tied Up</th>
                        <th className="py-3 px-4 text-right">Sold In Range</th>
                        <th className="py-3 px-4 text-center">Inactivity Period</th>
                        <th className="py-3 px-4 text-right">Last Sale Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {slowMoving.slice((Math.min(slowMovingPage, Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))) - 1) * REPORT_PAGE_SIZE, Math.min(slowMovingPage, Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))) * REPORT_PAGE_SIZE).map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-indigo-300 text-xs">
                            {p.sku}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {p.name}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {p.currentStock}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-amber-400">
                            {formatCurrency(p.inventoryCost)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-300">
                            {p.quantitySold}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                p.daysSinceLastSale === null
                                  ? 'bg-slate-800 text-slate-400'
                                  : p.daysSinceLastSale > 60
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {p.daysSinceLastSale !== null ? `${p.daysSinceLastSale} days` : 'No sales recorded'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-slate-400">
                            {p.lastSaleDate ? p.lastSaleDate.slice(0, 10) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* Slow Moving Pagination */}
                {slowMoving.length > REPORT_PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Showing {((Math.min(slowMovingPage, Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))) - 1) * REPORT_PAGE_SIZE) + 1}–{Math.min(Math.min(slowMovingPage, Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))) * REPORT_PAGE_SIZE, slowMoving.length)} of {slowMoving.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setSlowMovingPage((p) => Math.max(1, p - 1))} disabled={slowMovingPage <= 1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">&#8249; Prev</button>
                      {Array.from({ length: Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE)) }, (_, i) => i + 1).map((pg) => (
                        <button key={pg} type="button" onClick={() => setSlowMovingPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pg === Math.min(slowMovingPage, Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))) ? 'bg-amber-600 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>{pg}</button>
                      ))}
                      <button type="button" onClick={() => setSlowMovingPage((p) => Math.min(Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE)), p + 1))} disabled={slowMovingPage >= Math.max(1, Math.ceil(slowMoving.length / REPORT_PAGE_SIZE))} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">Next &#8250;</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

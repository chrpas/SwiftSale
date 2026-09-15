import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, RefreshCw, Loader2 } from 'lucide-react';
import { reportsService } from '../../services/api';
import { SalesReport, InventoryReport, ProfitReport } from '../../types';

export const ReportsPage: React.FC = () => {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [invReport, setInvReport] = useState<InventoryReport | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [sales, inv, profit] = await Promise.all([
        reportsService.getSalesReport(),
        reportsService.getInventoryReport(),
        reportsService.getProfitReport(),
      ]);
      setSalesReport(sales);
      setInvReport(inv);
      setProfitReport(profit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Financial & Operations Reports
          </h1>
          <p className="text-sm text-slate-400">
            Automated metrics on sales revenue, cost of goods sold, gross margin, and stock valuation.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Compiling financial reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Performance Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sales Performance</h3>
                <span className="text-xs text-slate-500">Revenue & Order Volume</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Revenue:</span>
                <span className="font-bold text-emerald-400">
                  ₱{(salesReport?.totalRevenue ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orders Processed:</span>
                <span className="font-semibold text-white">
                  {salesReport?.totalOrders ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average Order Value:</span>
                <span className="font-semibold text-slate-200">
                  ₱{(salesReport?.averageOrderValue ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Profit & Margin Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Profit & Margin</h3>
                <span className="text-xs text-slate-500">Gross Margin Analysis</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Revenue:</span>
                <span className="font-semibold text-slate-200">
                  ₱{(profitReport?.revenue ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cost of Goods Sold (COGS):</span>
                <span className="font-semibold text-rose-400">
                  ₱{(profitReport?.costOfGoodsSold ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400 font-semibold">Gross Profit:</span>
                <span className="font-black text-cyan-400">
                  ₱{(profitReport?.grossProfit ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Margin %:</span>
                <span className="font-bold text-white">
                  {(profitReport?.grossMarginPercentage ?? 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Valuation Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Inventory Valuation</h3>
                <span className="text-xs text-slate-500">Asset & Stock Health</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Active SKUs:</span>
                <span className="font-semibold text-white">
                  {invReport?.totalItems ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Asset Value:</span>
                <span className="font-black text-purple-400">
                  ₱{(invReport?.totalInventoryValue ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Low Stock SKUs:</span>
                <span
                  className={`font-semibold ${
                    (invReport?.lowStockItemsCount ?? 0) > 0 ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {invReport?.lowStockItemsCount ?? 0} items
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

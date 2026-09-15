import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Loader2,
  Clock,
  PhilippinePeso,
  Calendar,
} from 'lucide-react';
import { dashboardService } from '../../services/api';
import { DashboardMetrics, SaleStatus } from '../../types';

const formatPHP = (v: number) =>
  '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError('Unable to reach SwiftSale API. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4" style={{ color: '#6B8F7A' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#0D7A5F' }} />
        <p className="text-sm font-medium">Loading store analytics &amp; metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#1D3530' }}>
            <LayoutDashboard className="w-6 h-6" style={{ color: '#0D7A5F' }} />
            Executive Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B8F7A' }}>
            Real-time financial performance, inventory valuation, and POS alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDashboard}
            className="p-2.5 rounded-xl transition-colors"
            style={{ border: '1px solid #C5DDD0', background: '#FFFFFF', color: '#6B8F7A' }}
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/sales/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #0D7A5F 0%, #059669 100%)',
              boxShadow: '0 3px 12px rgba(13,122,95,0.28)',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm font-medium" style={{
          border: '1px solid #FECDD3',
          background: '#FFE4E6',
          color: '#9F1239',
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Sales */}
        <KpiCard
          label="Today's Sales"
          value={formatPHP(metrics?.todaySales ?? 0)}
          sub={`${metrics?.todaySalesCount ?? 0} orders completed`}
          icon={<PhilippinePeso className="w-4 h-4" />}
          iconBg="#D1FAE5"
          iconColor="#065F46"
        />
        {/* Month's Sales */}
        <KpiCard
          label="Month's Sales"
          value={formatPHP(metrics?.monthSales ?? 0)}
          sub={`${metrics?.monthSalesCount ?? 0} total orders`}
          icon={<Calendar className="w-4 h-4" />}
          iconBg="#ECFDF5"
          iconColor="#0D7A5F"
        />
        {/* Gross Profit */}
        <KpiCard
          label="Gross Profit"
          value={formatPHP(metrics?.todayGrossProfit ?? 0)}
          sub={`Margin: ${metrics?.monthGrossMarginPercent ?? 0}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="#F0FDF4"
          iconColor="#059669"
        />
        {/* Stock Valuation */}
        <KpiCard
          label="Stock Valuation"
          value={formatPHP(metrics?.totalInventoryValuation ?? 0)}
          sub={`${metrics?.totalProductsCount ?? 0} active catalog items`}
          icon={<Boxes className="w-4 h-4" />}
          iconBg="#ECFDF5"
          iconColor="#0B654E"
        />
        {/* Low Stock Alert */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden transition-colors"
          style={{
            background: (metrics?.lowStockCount ?? 0) > 0 ? '#FEF3C7' : '#FFFFFF',
            border: `1px solid ${(metrics?.lowStockCount ?? 0) > 0 ? '#FDE68A' : '#E1ECE5'}`,
            boxShadow: '0 1px 4px rgba(13,122,95,0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: (metrics?.lowStockCount ?? 0) > 0 ? '#92400E' : '#6B8F7A' }}>
              Low Stock Alerts
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: (metrics?.lowStockCount ?? 0) > 0 ? 'rgba(245,158,11,0.2)' : '#E1ECE5',
                color: (metrics?.lowStockCount ?? 0) > 0 ? '#D97706' : '#8AAF9B',
              }}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black" style={{ color: (metrics?.lowStockCount ?? 0) > 0 ? '#92400E' : '#1D3530' }}>
              {metrics?.lowStockCount ?? 0}
            </div>
            <div className="text-xs mt-1" style={{ color: (metrics?.lowStockCount ?? 0) > 0 ? '#92400E' : '#6B8F7A' }}>
              {(metrics?.lowStockCount ?? 0) > 0 ? (
                <Link to="/inventory" className="underline font-semibold hover:opacity-80">
                  Needs replenishment &rarr;
                </Link>
              ) : (
                'All inventory optimal'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Watchlist */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden flex flex-col" style={{ background: '#FFFFFF', border: '1px solid #E1ECE5', boxShadow: '0 1px 4px rgba(13,122,95,0.06)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E1ECE5', background: '#F2F7F4' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#D97706' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#1D3530' }}>Low-Stock Watchlist</h2>
            </div>
            <Link to="/inventory" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0D7A5F' }}>
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!metrics?.lowStockProducts || metrics.lowStockProducts.length === 0) ? (
              <div className="p-8 text-center text-sm" style={{ color: '#8AAF9B' }}>
                No items are currently below reorder levels.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E1ECE5', background: '#F2F7F4' }}>
                    <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#6B8F7A' }}>Item &amp; SKU</th>
                    <th className="py-2.5 px-4 text-right text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#6B8F7A' }}>On Hand</th>
                    <th className="py-2.5 px-4 text-right text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#6B8F7A' }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.lowStockProducts.map((p) => (
                    <tr key={p.productId} className="transition-colors" style={{ borderBottom: '1px solid #E1ECE5' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = '#F2F7F4'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-semibold" style={{ color: '#1D3530' }}>{p.name}</div>
                        <div className="font-mono text-[11px]" style={{ color: '#8AAF9B' }}>{p.sku}</div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold" style={{ color: '#D97706' }}>{p.quantityOnHand}</td>
                      <td className="py-2.5 px-4 text-right" style={{ color: '#6B8F7A' }}>{p.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden flex flex-col" style={{ background: '#FFFFFF', border: '1px solid #E1ECE5', boxShadow: '0 1px 4px rgba(13,122,95,0.06)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E1ECE5', background: '#F2F7F4' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#0D7A5F' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#1D3530' }}>Recent POS Invoices</h2>
            </div>
            <Link to="/sales" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0D7A5F' }}>
              <span>Full History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!metrics?.recentSales || metrics.recentSales.length === 0) ? (
              <div className="p-8 text-center text-sm" style={{ color: '#8AAF9B' }}>
                No recent sales recorded yet. Use the POS to complete your first order.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E1ECE5', background: '#F2F7F4' }}>
                    {['Invoice #', 'Customer', 'Date / Time', 'Amount', 'Status'].map((h, i) => (
                      <th key={h} className={`py-2.5 px-4 text-[10px] uppercase tracking-wider font-semibold ${i >= 3 ? 'text-right' : ''}`} style={{ color: '#6B8F7A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentSales.slice(0, 6).map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #E1ECE5' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = '#F2F7F4'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td className="py-2.5 px-4 font-mono font-semibold" style={{ color: '#0D7A5F' }}>{sale.invoiceNo}</td>
                      <td className="py-2.5 px-4 font-medium" style={{ color: '#3D5A50' }}>{sale.customerName || 'Walk-in'}</td>
                      <td className="py-2.5 px-4" style={{ color: '#6B8F7A' }}>
                        {new Date(sale.saleDate).toLocaleDateString()}{' '}
                        {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold" style={{ color: '#065F46' }}>
                        {formatPHP(sale.total)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={
                          sale.status === SaleStatus.Completed
                            ? { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' }
                            : sale.status === SaleStatus.Voided
                            ? { background: '#FFE4E6', color: '#9F1239', border: '1px solid #FECDD3' }
                            : { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }
                        }>
                          {SaleStatus[sale.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── KPI Card helper ── */
const KpiCard: React.FC<{
  label: string; value: string; sub: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}> = ({ label, value, sub, icon, iconBg, iconColor }) => (
  <div
    className="rounded-2xl p-5 relative overflow-hidden transition-all hover:shadow-md"
    style={{ background: '#FFFFFF', border: '1px solid #E1ECE5', boxShadow: '0 1px 4px rgba(13,122,95,0.06)' }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B8F7A' }}>{label}</span>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
    <div className="mt-3">
      <div className="text-2xl font-black" style={{ color: '#1D3530' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: '#6B8F7A' }}>{sub}</div>
    </div>
  </div>
);

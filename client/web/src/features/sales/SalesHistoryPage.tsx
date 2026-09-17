import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  RefreshCw,
  Loader2,
  Ban,
  Eye,
  X,
  CheckCircle,
} from 'lucide-react';
import { salesService, getErrorMessage } from '../../services/api';
import {
  Sale,
  getPaymentMethodName,
  getSaleStatusName,
  getPaymentStatusName,
  isSaleCompleted,
  isSalePendingClearance,
  isSaleVoided,
  isPaymentCleared,
  isPaymentPending,
  isCheckPayment,
  Payment,
} from '../../types';

export const SalesHistoryPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Void & Check Clearance State
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidSubmitting, setVoidSubmitting] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [clearCheckSubmitting, setClearCheckSubmitting] = useState(false);
  const [pullBackTarget, setPullBackTarget] = useState<{ sale: Sale; payment: Payment } | null>(null);
  const [pullBackReason, setPullBackReason] = useState('Insufficient funds - Items retrieved');
  const [pullBackSubmitting, setPullBackSubmitting] = useState(false);
  const [pullBackError, setPullBackError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesService.getAll();
      setSales(data);
    } catch (err) {
      console.error('Failed to load sales history', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.deliveryReceiptNo && s.deliveryReceiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidTarget) return;

    if (!voidReason.trim() || voidReason.trim().length < 3) {
      setVoidError('Void reason must be at least 3 characters.');
      return;
    }

    try {
      setVoidSubmitting(true);
      setVoidError(null);
      await salesService.voidSale(voidTarget.id, voidReason.trim());
      setBanner(`Invoice ${voidTarget.invoiceNo} has been voided and inventory stock restored.`);
      setVoidTarget(null);
      await loadSales();
    } catch (err) {
      setVoidError(getErrorMessage(err));
    } finally {
      setVoidSubmitting(false);
    }
  };

  const handleClearCheck = async (paymentId: string) => {
    try {
      setClearCheckSubmitting(true);
      const updatedSale = await salesService.clearCheck(paymentId);
      setSelectedSale(updatedSale);
      setBanner(`Check payment cleared successfully for invoice ${updatedSale.invoiceNo}.`);
      await loadSales();
    } catch (err) {
      console.error('Failed to clear check', err);
      alert(getErrorMessage(err));
    } finally {
      setClearCheckSubmitting(false);
    }
  };

  const handlePullBackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pullBackTarget) return;

    if (!pullBackReason.trim()) {
      setPullBackError('Reason is required.');
      return;
    }

    try {
      setPullBackSubmitting(true);
      setPullBackError(null);
      const updatedSale = await salesService.dishonorCheckAndReturn(
        pullBackTarget.sale.id,
        pullBackTarget.payment.id,
        pullBackReason.trim()
      );
      setBanner(`Invoice ${updatedSale.invoiceNo} voided, check marked Dishonored, and stock items returned to inventory.`);
      setPullBackTarget(null);
      setSelectedSale(null);
      await loadSales();
    } catch (err) {
      setPullBackError(getErrorMessage(err));
    } finally {
      setPullBackSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            Sales & Invoice Ledger
          </h1>
          <p className="text-sm text-slate-400">
            View completed transactions, inspect itemized line items, or process void returns.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSales}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh sales"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {banner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <span>{banner}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by invoice number (INV-...) or customer name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading sales ledger...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No sales records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items Count</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-indigo-300">{sale.invoiceNo}</div>
                      {sale.deliveryReceiptNo && (
                        <div className="text-[11px] text-teal-600 font-medium">DR: {sale.deliveryReceiptNo}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(sale.saleDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {sale.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {sale.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      ₱{sale.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isSaleCompleted(sale.status)
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isSalePendingClearance(sale.status)
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : isSaleVoided(sale.status)
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {getSaleStatusName(sale.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(sale)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isSaleCompleted(sale.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setVoidTarget(sale);
                              setVoidReason('');
                              setVoidError(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Void Sale & Restore Stock"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Invoice Details</h3>
                <span className="font-mono text-xs text-indigo-400">{selectedSale.invoiceNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold">{selectedSale.customerName || 'Walk-in'}</span>
              </div>
              {selectedSale.deliveryReceiptNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Receipt No (DR #):</span>
                  <span className="font-semibold text-teal-400 font-mono">{selectedSale.deliveryReceiptNo}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{new Date(selectedSale.saleDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-white">{getSaleStatusName(selectedSale.status)}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedSale.items.map((i) => (
                    <tr key={i.id}>
                      <td className="p-2 text-white font-medium">{i.productName}</td>
                      <td className="p-2 text-center">{i.quantity}</td>
                      <td className="p-2 text-right">₱{i.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-semibold text-emerald-400">
                        ₱{i.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Details & Clearance Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Payment & Clearance Details
              </div>
              <div className="space-y-2">
                {selectedSale.payments && selectedSale.payments.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>₱{p.amount.toFixed(2)}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({getPaymentMethodName(p.method)})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaymentCleared(p.status)
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isPaymentPending(p.status)
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {getPaymentStatusName(p.status)}
                      </span>
                    </div>

                    {(p.bankName || p.checkNumber || p.checkDate) && (
                      <div className="text-slate-300 font-mono text-[11px] space-y-0.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <div>Bank: <span className="font-bold text-white">{p.bankName || 'N/A'}</span></div>
                        <div>Check #: <span className="font-bold text-amber-300">{p.checkNumber || p.transactionRef || 'N/A'}</span></div>
                        <div>Check/Maturity Date: <span className="text-slate-300">{p.checkDate ? new Date(p.checkDate).toLocaleDateString() : 'N/A'}</span></div>
                        {p.dishonorReason && (
                          <div className="text-rose-400 font-semibold mt-1">Reason: {p.dishonorReason}</div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {isPaymentPending(p.status) && (
                        <button
                          type="button"
                          onClick={() => handleClearCheck(p.id)}
                          disabled={clearCheckSubmitting}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                        >
                          {clearCheckSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          <span>Mark Check Cleared</span>
                        </button>
                      )}
                      {isCheckPayment(p.method) && !isSaleVoided(selectedSale.status) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPullBackTarget({ sale: selectedSale, payment: p });
                            setPullBackReason('Insufficient funds - Items retrieved');
                            setPullBackError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Pull Back Items & Void (Bounced Check)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold">
              <span className="text-white">Total Amount</span>
              <span className="text-emerald-400">₱{selectedSale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
              <Ban className="w-5 h-5" />
              <span>Void Sale & Return Stock</span>
            </div>
            <p className="text-xs text-slate-400">
              Voiding invoice <span className="font-mono text-white">{voidTarget.invoiceNo}</span>{' '}
              will cancel the sale and restore item quantities back to inventory via a{' '}
              <span className="text-indigo-400 font-mono">SaleVoidReturn</span> audit movement.
            </p>

            {voidError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {voidError}
              </div>
            )}

            <form onSubmit={handleVoidSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason for Void *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer returned items, cashier error"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVoidTarget(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={voidSubmitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {voidSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Void</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Pull-Back Confirmation Modal */}
      {pullBackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
              <Ban className="w-5 h-5" />
              <span>Pull Back Items & Void (Bounced Check)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will void Invoice <span className="font-mono font-bold text-white">#{pullBackTarget.sale.invoiceNo}</span>, flag Check <span className="font-mono font-bold text-amber-300">#{pullBackTarget.payment.checkNumber || pullBackTarget.payment.transactionRef || 'N/A'}</span> as <span className="text-rose-400 font-bold">Dishonored</span>, and return all <span className="font-bold text-white">{pullBackTarget.sale.items.reduce((s, i) => s + i.quantity, 0)} items</span> back to inventory via an automated <span className="text-indigo-400 font-mono font-semibold">SaleVoidReturn</span> movement.
            </p>

            {pullBackError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
                {pullBackError}
              </div>
            )}

            <form onSubmit={handlePullBackSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason for Pull-Back / Bounced Check *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Insufficient funds - NSF, account closed"
                  value={pullBackReason}
                  onChange={(e) => setPullBackReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPullBackTarget(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pullBackSubmitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-colors"
                >
                  {pullBackSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm Pull-Back & Void</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

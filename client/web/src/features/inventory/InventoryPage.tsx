import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  inventoryService,
  productsService,
  categoriesService,
  getErrorMessage,
} from '../../services/api';
import {
  InventoryBalance,
  StockMovementType,
  Category,
  CreateStockAdjustmentRequest,
  CreateProductRequest,
} from '../../types';

export const InventoryPage: React.FC = () => {
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lowStock' | 'inStock'>('all');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Adjust Stock Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryBalance | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<string>('1');
  const [adjustType, setAdjustType] = useState<StockMovementType>(StockMovementType.AdjustmentIn);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newUnitId, setNewUnitId] = useState('PCS');
  const [newCostPrice, setNewCostPrice] = useState('10.00');
  const [newSellingPrice, setNewSellingPrice] = useState('20.00');
  const [newReorderLevel, setNewReorderLevel] = useState('5');
  const [newInitialStock, setNewInitialStock] = useState('10');
  const [addProductSubmitting, setAddProductSubmitting] = useState(false);
  const [addProductError, setAddProductError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invBalances, catList] = await Promise.all([
        inventoryService.getBalances(),
        categoriesService.getAll().catch(() => []),
      ]);
      setBalances(invBalances);
      setCategories(catList);
      if (catList.length > 0 && !newCategoryId) {
        setNewCategoryId(catList[0].id);
      }
    } catch (err) {
      console.error('Failed to load inventory data', err);
      setBannerMessage({
        text: 'Failed to load inventory balances. Please check API connection.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter balances based on search query and status filter
  const filteredBalances = balances.filter((item) => {
    const matchesSearch =
      item.productSKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'lowStock') {
      return item.quantityOnHand <= (item.reorderLevel ?? 0);
    }
    if (statusFilter === 'inStock') {
      return item.quantityOnHand > 0;
    }
    return true;
  });

  // Open adjustment modal for a specific row
  const openAdjustModal = (balance: InventoryBalance) => {
    setAdjustTarget(balance);
    setAdjustQuantity('1');
    setAdjustType(StockMovementType.AdjustmentIn);
    setAdjustReason('');
    setAdjustError(null);
    setIsAdjustModalOpen(true);
  };

  // Submit stock adjustment
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty <= 0) {
      setAdjustError('Please enter a valid positive adjustment quantity.');
      return;
    }

    if (!adjustReason.trim() || adjustReason.trim().length < 3) {
      setAdjustError('Adjustment reason is mandatory and must be at least 3 characters.');
      return;
    }

    try {
      setAdjustSubmitting(true);
      setAdjustError(null);

      const request: CreateStockAdjustmentRequest = {
        productId: adjustTarget.productId,
        quantity: qty,
        type: adjustType,
        reason: adjustReason.trim(),
      };

      await inventoryService.adjustStock(request);

      setBannerMessage({
        text: `Successfully adjusted stock for ${adjustTarget.productSKU}.`,
        type: 'success',
      });
      setIsAdjustModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = getErrorMessage(err);
      setAdjustError(msg);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Submit new product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSku.trim() || !newName.trim()) {
      setAddProductError('SKU and Product Name are required.');
      return;
    }

    try {
      setAddProductSubmitting(true);
      setAddProductError(null);

      const payload: CreateProductRequest = {
        sku: newSku.trim().toUpperCase(),
        name: newName.trim(),
        categoryId: newCategoryId || categories[0]?.id || '11111111-1111-1111-1111-111111111111',
        unitId: newUnitId.trim().toUpperCase(),
        costPrice: parseFloat(newCostPrice) || 0,
        sellingPrice: parseFloat(newSellingPrice) || 0,
        reorderLevel: parseInt(newReorderLevel, 10) || 0,
        initialStock: parseFloat(newInitialStock) || 0,
      };

      await productsService.create(payload);

      setBannerMessage({
        text: `Product "${payload.name}" (${payload.sku}) created with ${payload.initialStock} initial stock.`,
        type: 'success',
      });
      setIsAddProductModalOpen(false);
      // Reset fields
      setNewSku('');
      setNewName('');
      await loadData();
    } catch (err) {
      const msg = getErrorMessage(err);
      setAddProductError(msg);
    } finally {
      setAddProductSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-400" />
            Inventory Balances & Management
          </h1>
          <p className="text-sm text-slate-400">
            Monitor real-time dual-ledger quantities, reorder levels, and post stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {bannerMessage && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 text-sm font-medium border ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span className="flex-1">{bannerMessage.text}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU or item name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items ({balances.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('lowStock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'lowStock'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock ({balances.filter((b) => b.isLowStock).length})</span>
          </button>
        </div>
      </div>

      {/* Inventory Balances Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading inventory balances...</p>
          </div>
        ) : filteredBalances.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-300">No inventory matches</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No products match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">On Hand</th>
                  <th className="py-3.5 px-4 text-right">Reorder Level</th>
                  <th className="py-3.5 px-4 text-right">Avg Cost</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredBalances.map((item) => {
                  const isOutOfStock = item.quantityOnHand <= 0;
                  const isLowStock = item.quantityOnHand <= item.reorderLevel;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                        {item.productSKU}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{item.productName}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {item.categoryName || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {item.quantityOnHand}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {item.reorderLevel ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {item.averageCost != null ? `₱${item.averageCost.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                        {item.sellingPrice != null ? `₱${item.sellingPrice.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openAdjustModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-medium transition-all"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <span>Adjust Stock</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item summary */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <div className="font-semibold text-white text-sm">{adjustTarget.productName}</div>
              <div className="text-slate-400 font-mono">SKU: {adjustTarget.productSKU}</div>
              <div className="text-slate-300">
                Current On-Hand: <span className="font-bold text-white">{adjustTarget.quantityOnHand}</span>
              </div>
            </div>

            {adjustError && (
              <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Type toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType(StockMovementType.AdjustmentIn)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      adjustType === StockMovementType.AdjustmentIn
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Increase (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType(StockMovementType.AdjustmentOut)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      adjustType === StockMovementType.AdjustmentOut
                        ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Decrease (-)</span>
                  </button>
                </div>
              </div>

              {/* Quantity input */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason <span className="text-rose-400">* (Mandatory audit note)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical inventory count discrepancy, damaged item"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {adjustSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Adjustment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Add New Product</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addProductError && (
              <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{addProductError}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ELEC-001"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Mouse"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Unit Identifier
                  </label>
                  <input
                    type="text"
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    placeholder="PCS, BOX, KG"
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Cost Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Selling Price (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-emerald-400 font-semibold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newReorderLevel}
                    onChange={(e) => setNewReorderLevel(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Initial Stock In
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-indigo-300 font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addProductSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {addProductSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Product</span>
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

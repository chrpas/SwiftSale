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
  Pencil,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
import { AddProductModal } from '../products/AddProductModal';
import { EditProductModal, EditProductData } from '../products/EditProductModal';

export const InventoryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<'active' | 'discontinued'>('active');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lowStock' | 'outOfStock' | 'inStock'>('all');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Adjust Stock Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryBalance | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<string>('1');
  const [adjustType, setAdjustType] = useState<StockMovementType>(StockMovementType.AdjustmentIn);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Edit Product Modal State (Admin only)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState<EditProductData | null>(null);

  // Discontinue / Reactivate Modal State (Admin only)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<InventoryBalance | null>(null);
  const [statusAction, setStatusAction] = useState<'discontinue' | 'activate'>('discontinue');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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
  const activeBalances = balances.filter((b) => b.isActive !== false);
  const discontinuedBalances = balances.filter((b) => b.isActive === false);
  const currentLifecycleBalances = lifecycleFilter === 'active' ? activeBalances : discontinuedBalances;

  const lowStockBalances = currentLifecycleBalances.filter(
    (b) => b.quantityOnHand > 0 && (b.isLowStock || b.quantityOnHand <= (b.reorderLevel ?? 0))
  );
  const outOfStockBalances = currentLifecycleBalances.filter(
    (b) => b.quantityOnHand <= 0
  );

  const filteredBalances = currentLifecycleBalances.filter((item) => {
    const matchesSearch =
      item.productSKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'lowStock') {
      return item.quantityOnHand > 0 && (item.isLowStock || item.quantityOnHand <= (item.reorderLevel ?? 0));
    }
    if (statusFilter === 'outOfStock') {
      return item.quantityOnHand <= 0;
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

  // Open edit modal for Admin
  const openEditModal = async (balance: InventoryBalance) => {
    if (!isAdmin) return;
    try {
      const fullProduct = await productsService.getById(balance.productId);
      setEditProductData({
        id: fullProduct.id,
        sku: fullProduct.sku,
        name: fullProduct.name,
        categoryId: fullProduct.categoryId,
        categoryName: fullProduct.categoryName,
        unitIdentifier: fullProduct.unitIdentifier,
        unitId: fullProduct.unitId,
        piecesPerBox: fullProduct.piecesPerBox,
        costPrice: fullProduct.costPrice,
        sellingPrice: fullProduct.sellingPrice,
        reorderLevel: fullProduct.reorderLevel,
        quantityOnHand: fullProduct.quantityOnHand ?? balance.quantityOnHand,
        description: fullProduct.description,
      });
    } catch {
      setEditProductData({
        id: balance.productId,
        sku: balance.productSKU,
        name: balance.productName,
        categoryId: balance.categoryId || '',
        categoryName: balance.categoryName,
        unitIdentifier: balance.unitIdentifier || 'PCS',
        piecesPerBox: balance.piecesPerBox || 1,
        costPrice: balance.averageCost,
        sellingPrice: balance.sellingPrice,
        reorderLevel: balance.reorderLevel,
        quantityOnHand: balance.quantityOnHand,
      });
    }
    setIsEditModalOpen(true);
  };

  // Submit edit product
  const handleEditSubmit = async (id: string, data: Partial<CreateProductRequest>) => {
    await productsService.update(id, data);
    setBannerMessage({
      text: `Product specifications updated successfully for "${data.name || 'Product'}".`,
      type: 'success',
    });
    await loadData();
  };

  // Open status modal (Discontinue or Reactivate)
  const openStatusModal = (balance: InventoryBalance, action: 'discontinue' | 'activate') => {
    if (!isAdmin) return;
    setStatusTarget(balance);
    setStatusAction(action);
    setStatusError(null);
    setIsStatusModalOpen(true);
  };

  // Submit status change
  const handleStatusSubmit = async () => {
    if (!statusTarget) return;

    try {
      setStatusSubmitting(true);
      setStatusError(null);

      if (statusAction === 'discontinue') {
        await productsService.discontinue(statusTarget.productId);
        setBannerMessage({
          text: `Product "${statusTarget.productName}" (${statusTarget.productSKU}) has been discontinued.`,
          type: 'success',
        });
      } else {
        await productsService.activate(statusTarget.productId);
        setBannerMessage({
          text: `Product "${statusTarget.productName}" (${statusTarget.productSKU}) has been reactivated.`,
          type: 'success',
        });
      }

      setIsStatusModalOpen(false);
      await loadData();
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setStatusSubmitting(false);
    }
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
  const handleAddProductSubmit = async (payload: CreateProductRequest) => {
    await productsService.create(payload);
    setBannerMessage({
      text: `Product "${payload.name}" (${payload.sku}) created with ${payload.initialStock} initial stock.`,
      type: 'success',
    });
    await loadData();
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
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lifecycle Toggle: Active vs Discontinued */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              type="button"
              id="toggle-active-products"
              onClick={() => setLifecycleFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                lifecycleFilter === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Active</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                lifecycleFilter === 'active' ? 'bg-indigo-500/50 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeBalances.length}
              </span>
            </button>
            <button
              type="button"
              id="toggle-discontinued-products"
              onClick={() => setLifecycleFilter('discontinued')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                lifecycleFilter === 'discontinued'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Discontinued</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                lifecycleFilter === 'discontinued' ? 'bg-amber-500/50 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {discontinuedBalances.length}
              </span>
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({currentLifecycleBalances.length})
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
              <span>Low Stock ({lowStockBalances.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('outOfStock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === 'outOfStock'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock ({outOfStockBalances.length})</span>
            </button>
          </div>
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
            <h3 className="text-base font-semibold text-slate-300">
              {lifecycleFilter === 'discontinued' ? 'No discontinued products' : 'No inventory matches'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {lifecycleFilter === 'discontinued'
                ? 'There are currently no products marked as discontinued.'
                : 'No active products match your current search and filter criteria.'}
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
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                            {item.quantityOnHand} PCS
                          </span>
                        </div>
                        {((item.piecesPerBox && item.piecesPerBox > 1) || false) && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            {Math.floor(item.quantityOnHand / (item.piecesPerBox || 1))} {Math.floor(item.quantityOnHand / (item.piecesPerBox || 1)) === 1 ? 'box' : 'boxes'}{item.quantityOnHand % (item.piecesPerBox || 1) > 0 ? `, ${item.quantityOnHand % (item.piecesPerBox || 1)} pcs` : ''}
                          </div>
                        )}
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
                        {item.isActive === false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Discontinued
                          </span>
                        ) : isOutOfStock ? (
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
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAdjustModal(item)}
                            className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 hover:text-white transition-all shadow-sm"
                            title="Adjust Stock Quantity"
                            aria-label="Adjust Stock Quantity"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                id={`btn-edit-product-${item.productId}`}
                                onClick={() => openEditModal(item)}
                                className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-teal-600 hover:border-teal-500 text-teal-400 hover:text-white transition-all shadow-sm"
                                title="Edit Product Details"
                                aria-label="Edit Product Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {item.isActive !== false ? (
                                <button
                                  type="button"
                                  id={`btn-discontinue-${item.productId}`}
                                  onClick={() => openStatusModal(item, 'discontinue')}
                                  className="p-2 rounded-lg border border-rose-900/40 bg-rose-950/40 hover:bg-rose-600 hover:border-rose-500 text-rose-400 hover:text-white transition-all shadow-sm"
                                  title="Discontinue Product"
                                  aria-label="Discontinue Product"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  id={`btn-activate-${item.productId}`}
                                  onClick={() => openStatusModal(item, 'activate')}
                                  className="p-2 rounded-lg border border-emerald-900/40 bg-emerald-950/40 hover:bg-emerald-600 hover:border-emerald-500 text-emerald-400 hover:text-white transition-all shadow-sm"
                                  title="Reactivate Product"
                                  aria-label="Reactivate Product"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed non-scrolling */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6 pb-4 flex-none">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <span>Adjust Stock</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">

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
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        categories={categories}
        onSubmit={handleAddProductSubmit}
      />

      {/* Edit Product Modal (Admin Only) */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        categories={categories}
        product={editProductData}
        onSubmit={handleEditSubmit}
      />

      {/* Discontinue / Reactivate Modal (Admin Only) */}
      {isStatusModalOpen && statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                {statusAction === 'discontinue' ? (
                  <>
                    <Archive className="w-5 h-5 text-rose-400" />
                    <span>Discontinue Product</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5 text-emerald-400" />
                    <span>Reactivate Product</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusError && (
              <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-300">
              {statusAction === 'discontinue' ? (
                <>
                  <p>
                    Are you sure you want to discontinue{' '}
                    <span className="font-semibold text-white">"{statusTarget.productName}"</span> (
                    <code className="text-indigo-300 font-mono text-xs">{statusTarget.productSKU}</code>)?
                  </p>
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    The product will be marked as discontinued and moved to the Discontinued tab. It will no longer appear in POS sales, but its historical transactions and inventory levels will be preserved.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to reactivate{' '}
                    <span className="font-semibold text-white">"{statusTarget.productName}"</span> (
                    <code className="text-indigo-300 font-mono text-xs">{statusTarget.productSKU}</code>)?
                  </p>
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    This product will be restored to active inventory, becoming available once again for sales, reordering, and stock management.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSubmit}
                disabled={statusSubmitting}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg ${
                  statusAction === 'discontinue'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
              >
                {statusSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{statusAction === 'discontinue' ? 'Confirm Discontinue' : 'Confirm Reactivate'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

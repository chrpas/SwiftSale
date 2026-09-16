import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Pencil,
  Archive,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  productsService,
  categoriesService,
  getErrorMessage,
} from '../../services/api';
import {
  Product,
  Category,
  CreateProductRequest,
} from '../../types';

export const ProductsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<'active' | 'discontinued'>('active');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Product Modal State (Admin only)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status Modal State (Discontinue or Reactivate, Admin only)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Product | null>(null);
  const [statusAction, setStatusAction] = useState<'discontinue' | 'activate'>('discontinue');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Add Product Modal State (Admin only)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newUnitId, setNewUnitId] = useState('PCS');
  const [newCostPrice, setNewCostPrice] = useState('0');
  const [newSellingPrice, setNewSellingPrice] = useState('0');
  const [newReorderLevel, setNewReorderLevel] = useState('10');
  const [newInitialStock, setNewInitialStock] = useState('0');
  const [addProductSubmitting, setAddProductSubmitting] = useState(false);
  const [addProductError, setAddProductError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll().catch(() => []),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !newCategoryId) {
        setNewCategoryId(cats[0].id);
      }
    } catch (err) {
      setBannerMessage({
        text: getErrorMessage(err),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Split products into active and discontinued
  const activeProducts = products.filter((p) => p.isActive !== false);
  const discontinuedProducts = products.filter((p) => p.isActive === false);
  const currentLifecycleProducts = lifecycleFilter === 'active' ? activeProducts : discontinuedProducts;

  const filtered = currentLifecycleProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    if (!isAdmin) return;
    setEditTarget(product);
    setEditName(product.name);
    setEditCategoryId(product.categoryId || categories[0]?.id || '');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    if (!editName.trim()) {
      setEditError('Product name is required.');
      return;
    }
    if (!editCategoryId) {
      setEditError('Please select a valid category.');
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError(null);

      await productsService.update(editTarget.id, {
        name: editName.trim(),
        categoryId: editCategoryId,
      });

      setBannerMessage({
        text: `Product specifications updated for "${editName.trim()}".`,
        type: 'success',
      });
      setIsEditModalOpen(false);
      await loadProducts();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Status Modal (Discontinue or Reactivate)
  const openStatusModal = (product: Product, action: 'discontinue' | 'activate') => {
    if (!isAdmin) return;
    setStatusTarget(product);
    setStatusAction(action);
    setStatusError(null);
    setIsStatusModalOpen(true);
  };

  // Submit Status Change
  const handleStatusSubmit = async () => {
    if (!statusTarget) return;

    try {
      setStatusSubmitting(true);
      setStatusError(null);

      if (statusAction === 'discontinue') {
        await productsService.discontinue(statusTarget.id);
        setBannerMessage({
          text: `Product "${statusTarget.name}" (${statusTarget.sku}) has been discontinued.`,
          type: 'success',
        });
      } else {
        await productsService.activate(statusTarget.id);
        setBannerMessage({
          text: `Product "${statusTarget.name}" (${statusTarget.sku}) has been reactivated.`,
          type: 'success',
        });
      }

      setIsStatusModalOpen(false);
      await loadProducts();
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Open Add Product Modal
  const openAddProductModal = () => {
    setNewSku('');
    setNewName('');
    setNewCategoryId(categories[0]?.id || '');
    setNewUnitId('PCS');
    setNewCostPrice('0');
    setNewSellingPrice('0');
    setNewReorderLevel('10');
    setNewInitialStock('0');
    setAddProductError(null);
    setIsAddProductModalOpen(true);
  };

  // Submit Add Product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSku.trim()) {
      setAddProductError('SKU code is required.');
      return;
    }
    if (!newName.trim()) {
      setAddProductError('Product name is required.');
      return;
    }
    if (!newCategoryId) {
      setAddProductError('Please select a category.');
      return;
    }

    const cost = parseFloat(newCostPrice);
    const sell = parseFloat(newSellingPrice);
    const reorder = parseFloat(newReorderLevel);
    const initial = parseFloat(newInitialStock);

    if (isNaN(cost) || cost < 0) {
      setAddProductError('Cost price must be a non-negative number.');
      return;
    }
    if (isNaN(sell) || sell < 0) {
      setAddProductError('Selling price must be a non-negative number.');
      return;
    }

    try {
      setAddProductSubmitting(true);
      setAddProductError(null);

      const request: CreateProductRequest = {
        sku: newSku.trim().toUpperCase(),
        name: newName.trim(),
        categoryId: newCategoryId,
        unitId: newUnitId.trim().toUpperCase() || 'PCS',
        costPrice: cost,
        sellingPrice: sell,
        reorderLevel: isNaN(reorder) ? 10 : reorder,
        initialStock: isNaN(initial) ? 0 : initial,
      };

      await productsService.create(request);

      setBannerMessage({
        text: `New product "${request.name}" created successfully.`,
        type: 'success',
      });
      setIsAddProductModalOpen(false);
      await loadProducts();
    } catch (err) {
      setAddProductError(getErrorMessage(err));
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
            <Package className="w-6 h-6 text-indigo-400" />
            Product Master Catalog
          </h1>
          <p className="text-sm text-slate-400">
            View product specifications, active catalog lifecycle, and inventory status.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadProducts}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={openAddProductModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Message */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar: Lifecycle Tabs + Search + Category */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Lifecycle Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setLifecycleFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              lifecycleFilter === 'active'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Active Products</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                lifecycleFilter === 'active'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeProducts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setLifecycleFilter('discontinued')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              lifecycleFilter === 'discontinued'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Discontinued</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                lifecycleFilter === 'discontinued'
                  ? 'bg-rose-700/80 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {discontinuedProducts.length}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-xl">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {lifecycleFilter === 'discontinued'
              ? 'No discontinued products found.'
              : 'No active products found matching your filter criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Stock On Hand</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-300">{p.sku}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{p.name}</div>
                      {!p.isActive && (
                        <span className="text-[11px] text-rose-400/90 block mt-0.5">
                          Discontinued from active operations
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {p.categoryName || 'General'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{p.unitId}</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-medium">
                      ₱{p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      ₱{p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {p.quantityOnHand}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          p.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Discontinued'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            title="Edit product specifications"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {p.isActive ? (
                            <button
                              type="button"
                              onClick={() => openStatusModal(p, 'discontinue')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Discontinue product"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openStatusModal(p, 'activate')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="Reactivate product"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal (Admin Only) */}
      {isEditModalOpen && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Pencil className="w-5 h-5 text-indigo-400" />
                <span>Edit Product</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Meta Pill */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SKU Code</p>
                <p className="text-sm font-mono font-bold text-white mt-0.5">{editTarget.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Stock</p>
                <p className="text-sm font-bold text-indigo-300 mt-0.5">
                  {editTarget.quantityOnHand} <span className="text-xs font-normal text-slate-400">{editTarget.unitId || 'units'}</span>
                </p>
              </div>
            </div>

            {editError && (
              <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter product title"
                  className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Category *
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discontinue / Reactivate Confirmation Modal (Admin Only) */}
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
                    <span className="font-semibold text-white">"{statusTarget.name}"</span> (
                    <code className="text-indigo-300 font-mono text-xs">{statusTarget.sku}</code>)?
                  </p>
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    The product will be marked as discontinued and moved to the Discontinued tab. It will no longer appear in POS sales, but its historical transactions and inventory levels will be preserved.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to reactivate{' '}
                    <span className="font-semibold text-white">"{statusTarget.name}"</span> (
                    <code className="text-indigo-300 font-mono text-xs">{statusTarget.sku}</code>)?
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

      {/* Add Product Modal (Admin Only) */}
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

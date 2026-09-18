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
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';

export const ProductsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<'active' | 'discontinued'>('active');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const PRODUCTS_PAGE_SIZE = 10;

  // Edit Product Modal State (Admin only)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  // Status Modal State (Discontinue or Reactivate, Admin only)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Product | null>(null);
  const [statusAction, setStatusAction] = useState<'discontinue' | 'activate'>('discontinue');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Add Product Modal State (Admin only)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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

  const productsTotalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PAGE_SIZE));
  const productsSafePage = Math.min(productsPage, productsTotalPages);
  const pagedProducts = filtered.slice((productsSafePage - 1) * PRODUCTS_PAGE_SIZE, productsSafePage * PRODUCTS_PAGE_SIZE);

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    if (!isAdmin) return;
    setEditTarget(product);
    setIsEditModalOpen(true);
  };

  // Submit Edit Product
  const handleEditSubmit = async (id: string, data: Partial<CreateProductRequest>) => {
    await productsService.update(id, data);
    setBannerMessage({
      text: `Product specifications updated successfully for "${data.name || 'Product'}".`,
      type: 'success',
    });
    await loadProducts();
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
    setIsAddProductModalOpen(true);
  };

  // Submit Add Product
  const handleAddProductSubmit = async (data: CreateProductRequest) => {
    await productsService.create(data);
    setBannerMessage({
      text: `New product "${data.name}" created successfully.`,
      type: 'success',
    });
    await loadProducts();
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
            onClick={() => { setLifecycleFilter('active'); setProductsPage(1); }}
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
                  ? 'bg-[#14A380] text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeProducts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setLifecycleFilter('discontinued'); setProductsPage(1); }}
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
                {pagedProducts.map((p) => (
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
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {p.quantityOnHand} PCS
                        </span>
                      </div>
                      {((p.piecesPerBox && p.piecesPerBox > 1) || false) && (
                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          {Math.floor(p.quantityOnHand / (p.piecesPerBox || 1))} {Math.floor(p.quantityOnHand / (p.piecesPerBox || 1)) === 1 ? 'box' : 'boxes'}{p.quantityOnHand % (p.piecesPerBox || 1) > 0 ? `, ${p.quantityOnHand % (p.piecesPerBox || 1)} pcs` : ''}
                        </div>
                      )}
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

      {/* Products Pagination */}
      {!loading && filtered.length > PRODUCTS_PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">
            Showing {((productsSafePage - 1) * PRODUCTS_PAGE_SIZE) + 1}–{Math.min(productsSafePage * PRODUCTS_PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
              disabled={productsSafePage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Prev
            </button>
            {Array.from({ length: productsTotalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setProductsPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  pg === productsSafePage
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setProductsPage((p) => Math.min(productsTotalPages, p + 1))}
              disabled={productsSafePage >= productsTotalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal (Admin Only) */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        categories={categories}
        product={editTarget}
        onSubmit={handleEditSubmit}
      />

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
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        categories={categories}
        onSubmit={handleAddProductSubmit}
      />
    </div>
  );
};

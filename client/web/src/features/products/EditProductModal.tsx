import React, { useState, useEffect } from 'react';
import { Pencil, X, AlertCircle, Loader2 } from 'lucide-react';
import { Category, CreateProductRequest } from '../../types';

export interface EditProductData {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unitIdentifier?: string;
  unitId?: string;
  piecesPerBox?: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  quantityOnHand?: number;
  description?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  product: EditProductData | null;
  onSubmit: (id: string, data: Partial<CreateProductRequest>) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  product,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitIdentifier: 'PCS',
    costPrice: '0.00',
    sellingPrice: '0.00',
    piecesPerBox: 1,
    reorderLevel: '5',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : ''),
        unitIdentifier: product.unitIdentifier || product.unitId || 'PCS',
        costPrice: product.costPrice != null ? product.costPrice.toFixed(2) : '0.00',
        sellingPrice: product.sellingPrice != null ? product.sellingPrice.toFixed(2) : '0.00',
        piecesPerBox: product.piecesPerBox && product.piecesPerBox > 0 ? product.piecesPerBox : 1,
        reorderLevel: product.reorderLevel != null ? String(product.reorderLevel) : '5',
        description: product.description || '',
      });
      setError(null);
    }
  }, [isOpen, product, categories]);

  if (!isOpen || !product) return null;

  const stock = product.quantityOnHand ?? 0;
  const currentPiecesPerBox = product.piecesPerBox && product.piecesPerBox > 0 ? product.piecesPerBox : 1;
  const boxes = Math.floor(stock / currentPiecesPerBox);
  const remainder = stock % currentPiecesPerBox;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category.');
      return;
    }

    const cost = parseFloat(formData.costPrice);
    const sell = parseFloat(formData.sellingPrice);
    const reorder = parseFloat(formData.reorderLevel);
    const pieces = parseInt(String(formData.piecesPerBox), 10);

    if (isNaN(cost) || cost < 0) {
      setError('Cost price must be a non-negative number.');
      return;
    }
    if (isNaN(sell) || sell < 0) {
      setError('Selling price must be a non-negative number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSubmit(product.id, {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        unitId: formData.unitIdentifier,
        unitIdentifier: formData.unitIdentifier,
        piecesPerBox: isNaN(pieces) || pieces < 1 ? 1 : pieces,
        costPrice: cost,
        sellingPrice: sell,
        reorderLevel: isNaN(reorder) ? 5 : reorder,
        description: formData.description.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-[#E1ECE5] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E1ECE5] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-[#1D3530] dark:text-white font-bold text-lg">
            <Pencil className="w-5 h-5 text-[#0D7A5F]" />
            <span>Edit Product</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-[#E1ECE5]/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Info Box (Checkout style) */}
        <div className="rounded-xl p-4 bg-[#F2F7F4] dark:bg-slate-950/70 border border-[#C5DDD0] dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0D7A5F] flex items-center gap-1.5 pb-1 border-b border-[#E1ECE5] dark:border-slate-800">
            <span>Product Master Details (Read-Only)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#6B8F7A] dark:text-slate-400 font-semibold">SKU:</span>
            <span className="font-mono font-bold text-[#0D7A5F] dark:text-indigo-300 text-sm">{product.sku}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B8F7A] dark:text-slate-400 font-semibold">Pieces per box:</span>
            <span className="font-semibold text-[#1D3530] dark:text-white">
              {currentPiecesPerBox > 1 ? `${currentPiecesPerBox} pcs/box` : '1 pc/box'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#E1ECE5] dark:border-slate-800">
            <span className="text-[#6B8F7A] dark:text-slate-400 font-semibold">Current Total Stocks:</span>
            <span className="font-bold text-[#1D3530] dark:text-emerald-400">
              {stock} PCS {currentPiecesPerBox > 1 ? `(${boxes} boxes, ${remainder} pcs)` : ''}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. LED A Bulb 12W 6500K"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                id="edit-product-category-dropdown"
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Unit Identifier *
              </label>
              <select
                id="edit-product-unit-identifier-dropdown"
                value={formData.unitIdentifier}
                onChange={(e) => setFormData((prev) => ({ ...prev, unitIdentifier: e.target.value }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
              >
                <option value="PCS">PCS (Pieces - default for bulbs, battens, downlights)</option>
                <option value="BOX">BOX (Boxes / Master Cartons)</option>
                <option value="ROLL">ROLL (Rolls - for LED Soft Strip lights)</option>
                <option value="SET">SET (Sets / Kits - for installation clips & accessories)</option>
                <option value="MTR">MTR (Meters)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Cost Price (₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: e.target.value }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] font-semibold text-sm focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Selling Price (SRP ₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: e.target.value }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#0D7A5F] font-bold text-sm focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Pieces Per Box (Packaging)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.piecesPerBox}
                onChange={(e) => setFormData((prev) => ({ ...prev, piecesPerBox: parseInt(e.target.value, 10) || 1 }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Reorder Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, reorderLevel: e.target.value }))}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Technical Specifications / Description
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Wattage: 12W, CCT: 6500K Daylight, Lumen: 1055 lm, Base: E27"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full py-2.5 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1ECE5] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#095743] text-white text-sm font-semibold shadow-lg shadow-[#0D7A5F]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

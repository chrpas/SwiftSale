import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  Loader2,
  User,
  FileText,
  X,
  Calendar,
} from 'lucide-react';
import {
  productsService,
  customersService,
  salesService,
  getErrorMessage,
} from '../../services/api';
import {
  Product,
  Customer,
  PaymentMethod,
  PaymentStatus,
  getPaymentMethodName,
  CreateSaleRequest,
  Sale,
} from '../../types';

interface CartLineItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  unitSold: 'PCS' | 'BOX';
}

export const PosPage: React.FC = () => {
  // Data loading states
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Search & autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart state
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState<boolean>(false);
  const customerSearchRef = useRef<HTMLDivElement>(null);
  const [deliveryReceiptNo, setDeliveryReceiptNo] = useState<string>('');
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [checkBankName, setCheckBankName] = useState<string>('');
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [checkDate, setCheckDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Success dialog state
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase().trim()) ||
      (c.phone && c.phone.includes(customerSearchQuery.trim()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerSearchRef.current &&
        !customerSearchRef.current.contains(event.target as Node)
      ) {
        setIsCustomerSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [prodData, custData] = await Promise.all([
        productsService.getAll(true), // active products
        customersService.getAll(),
      ]);
      setProducts(prodData);
      setCustomers(custData);
    } catch (err) {
      console.error('Failed to load POS data', err);
      setErrorBanner('Failed to load product catalog. Please refresh.');
    } finally {
      setLoadingInitial(false);
    }
  };

  // Search filter logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = products.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );

    setSearchResults(matches.slice(0, 10)); // Top 10 matches
    setSelectedResultIndex(0);
    setIsSearchOpen(matches.length > 0);
  }, [searchQuery, products]);

  // Add item to cart
  const addToCart = (product: Product) => {
    setErrorBanner(null);

    // Check available stock
    if (product.quantityOnHand <= 0) {
      setErrorBanner(`Warning: "${product.name}" has 0 stock on hand.`);
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prevCart];
        const item = updated[existingIdx];
        const piecesPerBox = item.product.piecesPerBox && item.product.piecesPerBox > 0 ? item.product.piecesPerBox : 1;
        const maxQty = item.unitSold === 'BOX' 
          ? Math.floor(item.product.quantityOnHand / piecesPerBox) 
          : item.product.quantityOnHand;

        let newQty = item.quantity + 1;
        if (maxQty > 0 && newQty > maxQty) {
          newQty = maxQty;
          setErrorBanner(`Notice: Max available reached (${maxQty} ${item.unitSold}) for ${product.sku}.`);
        }
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discountPercent: 0,
            unitSold: 'PCS',
          },
        ];
      }
    });

    // Reset search
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  // Keyboard navigation on search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        // Try exact SKU match
        const exact = products.find(
          (p) => p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exact) {
          addToCart(exact);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedResultIndex];
      if (selected) {
        addToCart(selected);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const updateUnitSold = (productId: string, unit: 'PCS' | 'BOX') => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const piecesPerBox = item.product.piecesPerBox && item.product.piecesPerBox > 0 ? item.product.piecesPerBox : 1;
        const newUnitPrice = unit === 'BOX' ? item.product.sellingPrice * piecesPerBox : item.product.sellingPrice;
        
        const maxQty = unit === 'BOX' 
          ? Math.floor(item.product.quantityOnHand / piecesPerBox) 
          : item.product.quantityOnHand;

        let adjustedQty = item.quantity;
        if (maxQty > 0 && adjustedQty > maxQty) {
          adjustedQty = maxQty;
        }

        return {
          ...item,
          unitSold: unit,
          unitPrice: newUnitPrice,
          quantity: Math.max(1, adjustedQty),
        };
      })
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const piecesPerBox = item.product.piecesPerBox && item.product.piecesPerBox > 0 ? item.product.piecesPerBox : 1;
        const maxQty = item.unitSold === 'BOX'
          ? Math.floor(item.product.quantityOnHand / piecesPerBox)
          : item.product.quantityOnHand;

        const clampedQty = maxQty > 0 ? Math.min(newQuantity, maxQty) : newQuantity;
        return { ...item, quantity: clampedQty };
      })
    );
  };

  const updateDiscount = (productId: string, discountPercent: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discountPercent: Math.min(100, Math.max(0, discountPercent)) } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscountPercent(0);
    setAmountPaid('');
    setDeliveryReceiptNo('');
    setCheckBankName('');
    setCheckNumber('');
    setCheckDate(new Date().toISOString().split('T')[0]);
    setErrorBanner(null);
    searchInputRef.current?.focus();
  };

  // Stock violation check
  const hasStockViolation = cart.some((item) => {
    const stock = item.product.quantityOnHand;
    const piecesPerBox = item.product.piecesPerBox && item.product.piecesPerBox > 0 ? item.product.piecesPerBox : 1;
    const maxQty = item.unitSold === 'BOX' ? Math.floor(stock / piecesPerBox) : stock;
    return maxQty <= 0 || item.quantity > maxQty;
  });

  // Financial calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineDiscountAmount = lineSubtotal * ((item.discountPercent || 0) / 100);
    return sum + (lineSubtotal - lineDiscountAmount);
  }, 0);

  const orderDiscountAmount = cartSubtotal * ((orderDiscountPercent || 0) / 100);
  const cartTotal = Math.max(0, cartSubtotal - orderDiscountAmount);

  const numericAmountPaid = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, numericAmountPaid - cartTotal);
  const balanceRemaining = Math.max(0, cartTotal - numericAmountPaid);

  // Auto-fill exact amount paid if empty or when requested
  const fillExactAmount = () => {
    setAmountPaid(cartTotal.toFixed(2));
  };

  // Submit checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorBanner('Cart is empty. Scan or search items to add.');
      return;
    }

    if (hasStockViolation) {
      setErrorBanner('Cannot complete sale: Cart contains out-of-stock items or quantity exceeds available stock.');
      return;
    }

    if (paymentMethod === PaymentMethod.Check || paymentMethod === PaymentMethod.PostDatedCheck) {
      if (!checkBankName.trim() || !checkNumber.trim() || !checkDate) {
        setErrorBanner('Bank Name, Check Number, and Check/Maturity Date are required for Check / PDC payments.');
        return;
      }
    }

    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      setErrorBanner(null);

      const payload: CreateSaleRequest = {
        customerId: selectedCustomerId || null,
        deliveryReceiptNo: deliveryReceiptNo.trim() || undefined,
        items: cart.map((item) => {
          const lineSubtotal = item.quantity * item.unitPrice;
          const lineDiscountAmount = lineSubtotal * ((item.discountPercent || 0) / 100);
          const lineAfterLineDiscount = lineSubtotal - lineDiscountAmount;
          
          let totalItemDiscount = lineDiscountAmount;
          if (cartSubtotal > 0 && orderDiscountAmount > 0) {
            const itemShareOfOrderDiscount = (lineAfterLineDiscount / cartSubtotal) * orderDiscountAmount;
            totalItemDiscount += itemShareOfOrderDiscount;
          }

          return {
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: Math.round(totalItemDiscount * 100) / 100,
            unitSold: item.unitSold,
          };
        }),
        payments: [
          {
            amount: numericAmountPaid > 0 ? numericAmountPaid : cartTotal,
            method: paymentMethod,
            bankName: (paymentMethod === PaymentMethod.Check || paymentMethod === PaymentMethod.PostDatedCheck) ? checkBankName.trim() : undefined,
            checkNumber: (paymentMethod === PaymentMethod.Check || paymentMethod === PaymentMethod.PostDatedCheck) ? checkNumber.trim() : undefined,
            checkDate: (paymentMethod === PaymentMethod.Check || paymentMethod === PaymentMethod.PostDatedCheck) ? checkDate : undefined,
            status: paymentMethod === PaymentMethod.PostDatedCheck ? PaymentStatus.Pending : PaymentStatus.Cleared,
          },
        ],
      };

      const result = await salesService.checkout(payload);
      setCompletedSale(result);

      // Refresh product list in background to sync current on-hand stock
      productsService.getAll(true).then(setProducts).catch(console.error);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startNewSale = () => {
    setCompletedSale(null);
    clearCart();
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{color:'#1D3530'}}>
            <ShoppingCart className="w-6 h-6" style={{color:'#0D7A5F'}} />
            POS Terminal / Checkout
          </h1>
          <p className="text-sm" style={{color:'#6B8F7A'}}>
            Rapid barcode & SKU checkout with instant inventory deduction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{border:'1px solid #C5DDD0', background:'#FFFFFF', color:'#3D5A50'}}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Error / Invariant Banner */}
      {errorBanner && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{border:'1px solid #FECDD3', background:'#FFE4E6', color:'#9F1239'}}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:'#9F1239'}} />
          <div className="text-sm font-medium flex-1">{errorBanner}</div>
          <button type="button" onClick={() => setErrorBanner(null)} className="text-xs font-semibold" style={{color:'#9F1239'}}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Cart Area (2/3), Right Checkout Card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SKU Search & Cart Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Fast SKU Search Bar with Keyboard Navigation */}
          <div className="relative">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  loadingInitial
                    ? 'Loading product catalog...'
                    : 'Scan barcode or type SKU / item name (Press Enter to add)...'
                }
                disabled={loadingInitial}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm sm:text-base shadow-sm disabled:opacity-50"
                style={{border:'1.5px solid #C5DDD0', background:'#FFFFFF', color:'#1D3530', outline:'none'}}
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                style={{background:'#FFFFFF', border:'1px solid #C5DDD0', boxShadow:'0 8px 24px rgba(13,122,95,0.15)'}}>
                {searchResults.map((prod, index) => (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="px-4 py-3 cursor-pointer flex items-center justify-between transition-colors"
                    style={{
                      background: index === selectedResultIndex ? '#ECFDF5' : 'transparent',
                      borderBottom: '1px solid #E1ECE5',
                      color: '#1D3530',
                    }}
                  >
                    <div>
                      <div className="font-semibold text-sm" style={{color: index === selectedResultIndex ? '#0D7A5F' : '#1D3530'}}>{prod.name}</div>
                      <div className="text-xs" style={{color:'#6B8F7A'}}>
                        SKU: <span className="font-mono" style={{color:'#0D7A5F'}}>{prod.sku}</span>{prod.piecesPerBox && prod.piecesPerBox > 1 ? ` · ${prod.piecesPerBox} pcs/box` : ''} |{' '}
                        Category: {prod.categoryName || 'General'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{color:'#065F46'}}>
                        ₱{prod.sellingPrice.toFixed(2)}
                      </div>
                      <div className="text-xs" style={{color: prod.quantityOnHand <= prod.reorderLevel ? '#D97706' : '#8AAF9B', fontWeight: prod.quantityOnHand <= prod.reorderLevel ? 600 : 400}}>
                        Stock: {prod.quantityOnHand} {prod.unitId} {prod.piecesPerBox && prod.piecesPerBox > 1 ? `(${Math.floor(prod.quantityOnHand / prod.piecesPerBox)} boxes)` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Table Container */}
          <div className="rounded-2xl overflow-hidden" style={{background:'#FFFFFF', border:'1px solid #E1ECE5', boxShadow:'0 1px 6px rgba(13,122,95,0.08)'}}>
            <div className="p-4 flex items-center justify-between" style={{borderBottom:'1px solid #E1ECE5', background:'#F2F7F4'}}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" style={{color:'#0D7A5F'}} />
                <h2 className="text-base font-semibold" style={{color:'#1D3530'}}>Current Cart Items</h2>
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full" style={{background:'#ECFDF5', color:'#0D7A5F', border:'1px solid #A7F3D0'}}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{background:'#E1ECE5', color:'#8AAF9B'}}>
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold" style={{color:'#3D5A50'}}>Cart is empty</h3>
                <p className="text-sm max-w-sm mx-auto" style={{color:'#8AAF9B'}}>
                  Type a SKU or product name above to quickly add items to this sale.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1ECE5] bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-[#3D5A50] font-semibold">
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4 text-center">Unit</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4">Discount (%)</th>
                      <th className="py-3 px-4 text-right">Line Total</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1ECE5] text-sm">
                    {cart.map((item) => {
                      const stock = item.product.quantityOnHand;
                      const piecesPerBox = item.product.piecesPerBox && item.product.piecesPerBox > 0 ? item.product.piecesPerBox : 1;
                      const availableBoxes = Math.floor(stock / piecesPerBox);
                      const maxQty = item.unitSold === 'BOX' ? availableBoxes : stock;
                      const isExceedingStock = maxQty > 0 ? item.quantity > maxQty : stock <= 0;
                      const lineDiscountAmount = (item.quantity * item.unitPrice) * ((item.discountPercent || 0) / 100);
                      const lineTotal = item.quantity * item.unitPrice - lineDiscountAmount;

                      return (
                        <tr key={item.product.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#1D3530]">{item.product.name}</div>
                            <div className="text-xs text-[#6B8F7A] font-mono">
                              SKU: {item.product.sku} {piecesPerBox > 1 ? `· ${piecesPerBox} pcs/box` : ''}
                            </div>
                            <div className="text-[11px] text-[#0D7A5F] mt-0.5 font-medium">
                              Available: <strong className="text-[#1D3530]">{availableBoxes} boxes</strong> ({stock} pcs)
                            </div>
                            {isExceedingStock && (
                              <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                                Exceeds stock ({maxQty} {item.unitSold} max)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <select
                              value={item.unitSold}
                              onChange={(e) => updateUnitSold(item.product.id, e.target.value as 'PCS' | 'BOX')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[#C5DDD0] bg-white text-[#1D3530] focus:ring-1 focus:ring-[#0D7A5F] focus:border-[#0D7A5F] cursor-pointer shadow-sm hover:border-[#0D7A5F] transition-colors"
                            >
                              <option value="PCS">PCS</option>
                              <option value="BOX">BOX {piecesPerBox > 1 ? `(${piecesPerBox} pcs)` : ''}</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-[#1D3530] font-medium">
                            <div className="font-semibold">₱{item.unitPrice.toFixed(2)}</div>
                            <div className="text-[10px] text-[#6B8F7A]">/{item.unitSold}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={maxQty > 0 ? maxQty : undefined}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.product.id,
                                    parseFloat(e.target.value) || 1
                                  )
                                }
                                className="w-14 text-center py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#1D3530] font-semibold text-sm focus:outline-none focus:border-[#0D7A5F]"
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={maxQty > 0 && item.quantity >= maxQty}
                                className="w-7 h-7 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative w-20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={item.discountPercent || ''}
                                onChange={(e) =>
                                  updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-full pl-2 pr-6 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#1D3530] text-xs font-semibold focus:outline-none focus:border-[#0D7A5F]"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] text-xs font-bold pointer-events-none">
                                %
                              </span>
                            </div>
                            {(item.discountPercent || 0) > 0 && (
                              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                -₱{lineDiscountAmount.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#1D3530]">
                            ₱{lineTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>

        {/* RIGHT: Customer Selector & Checkout Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Customer & DR Number Card */}
          <div className="bg-[#FFFFFF] border border-[#E1ECE5] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#3D5A50] font-semibold text-sm">
              <User className="w-4 h-4 text-[#0D7A5F]" />
              <span>Customer & Receipt Reference</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#3D5A50] font-medium block mb-1">Customer</label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#0D7A5F]/30 bg-[#ECFDF5]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#0D7A5F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#1D3530] truncate">{selectedCustomer.name}</div>
                        {selectedCustomer.phone && (
                          <div className="text-[10px] text-[#6B8F7A]">{selectedCustomer.phone}</div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerId('')}
                      className="p-1 text-[#6B8F7A] hover:text-[#9F1239] hover:bg-[#FFE4E6] rounded-lg transition-colors"
                      title="Change Customer (Revert to Walk-in)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={customerSearchRef}>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8AAF9B]" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerSearchOpen(true);
                        }}
                        onFocus={() => setIsCustomerSearchOpen(true)}
                        placeholder="Search customer name or phone..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm focus:outline-none focus:border-[#0D7A5F]"
                      />
                    </div>

                    {isCustomerSearchOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E1ECE5] rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-[#E1ECE5]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomerId('');
                            setIsCustomerSearchOpen(false);
                            setCustomerSearchQuery('');
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-[#ECFDF5] text-xs font-semibold text-[#0D7A5F] flex items-center justify-between"
                        >
                          <span>Walk-in Customer</span>
                          <span className="text-[10px] text-[#6B8F7A] font-normal">(Default)</span>
                        </button>
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedCustomerId(c.id);
                                setIsCustomerSearchOpen(false);
                                setCustomerSearchQuery('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-[#F2F7F4] transition-colors flex items-center justify-between"
                            >
                              <div>
                                <div className="text-xs font-medium text-[#1D3530]">{c.name}</div>
                                {c.phone && <div className="text-[10px] text-[#6B8F7A]">{c.phone}</div>}
                              </div>
                              <User className="w-3.5 h-3.5 text-[#8AAF9B]" />
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-[#6B8F7A]">
                            No customer matched "{customerSearchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-[#3D5A50] font-medium flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#0D7A5F]" />
                  <span>Delivery Receipt No. (DR #)</span>
                </label>
                <input
                  type="text"
                  value={deliveryReceiptNo}
                  onChange={(e) => setDeliveryReceiptNo(e.target.value)}
                  placeholder="e.g. DR-2026-00123"
                  className="w-full py-2 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] text-sm font-mono focus:outline-none focus:border-[#0D7A5F]"
                />
              </div>
            </div>
          </div>

          {/* Checkout Totals & Payment Method Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3">
              Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-200">₱{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Order Discount (%)</span>
                <div className="flex items-center gap-1 w-24 relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={orderDiscountPercent || ''}
                    onChange={(e) => setOrderDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    placeholder="0"
                    className="w-full pl-2 pr-6 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs text-right font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">
                    %
                  </span>
                </div>
              </div>
              {orderDiscountAmount > 0 && (
                <div className="flex justify-end text-[11px] text-emerald-400 font-medium">
                  Saved -₱{orderDiscountAmount.toFixed(2)} ({orderDiscountPercent}%)
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Grand Total</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₱{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === PaymentMethod.Cash
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentMethod.GCash)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === PaymentMethod.GCash
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span>GCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentMethod.BankTransfer)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === PaymentMethod.BankTransfer
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod(PaymentMethod.Check);
                    if (!checkDate) setCheckDate(new Date().toISOString().split('T')[0]);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === PaymentMethod.Check
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 mb-1" />
                  <span>Check</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod(PaymentMethod.PostDatedCheck);
                    if (!checkDate) setCheckDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === PaymentMethod.PostDatedCheck
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4 mb-1" />
                  <span>PDC</span>
                </button>
              </div>

              {/* Conditional Check & PDC Details Input */}
              {(paymentMethod === PaymentMethod.Check || paymentMethod === PaymentMethod.PostDatedCheck) && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                    <span>Check / PDC Details</span>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {paymentMethod === PaymentMethod.PostDatedCheck ? 'Post-Dated' : 'Standard Check'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BDO, BPI, Metrobank"
                        value={checkBankName}
                        onChange={(e) => setCheckBankName(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Check Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 0001234567"
                          value={checkNumber}
                          onChange={(e) => setCheckNumber(e.target.value)}
                          className="w-full py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          {paymentMethod === PaymentMethod.PostDatedCheck ? 'Maturity Date *' : 'Check Date *'}
                        </label>
                        <input
                          type="date"
                          required
                          value={checkDate}
                          onChange={(e) => setCheckDate(e.target.value)}
                          className="w-full py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                  {paymentMethod === PaymentMethod.PostDatedCheck && (
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>PDC payments will remain pending until marked cleared on maturity.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount Paid & Change Calculation */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount Received
                  </label>
                  <button
                    type="button"
                    onClick={fillExactAmount}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Exact Amount
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={cartTotal.toFixed(2)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Change / Balance Due */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Change to Return:</span>
                  <span
                    className={`font-bold ${
                      changeDue > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    ₱{changeDue.toFixed(2)}
                  </span>
                </div>
                {balanceRemaining > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Remaining Balance:</span>
                    <span className="font-bold">₱{balanceRemaining.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Checkout Button */}
            <div className="pt-2">
              {hasStockViolation && (
                <div className="p-2.5 mb-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Cannot complete sale: Cart contains zero-stock or exceeding items.</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || submitting || hasStockViolation}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-emerald-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Sale...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Sale (₱{cartTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Completed Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Sale Completed!</h3>
              <p className="text-xs text-slate-400 font-mono">
                Invoice No: <span className="text-emerald-400 font-semibold">{completedSale.invoiceNo}</span>
              </p>
              {completedSale.deliveryReceiptNo && (
                <p className="text-xs text-slate-400 font-mono">
                  DR No: <span className="text-cyan-400 font-semibold">{completedSale.deliveryReceiptNo}</span>
                </p>
              )}
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Sold:</span>
                <span className="font-semibold text-white">
                  {completedSale.items.reduce((s, i) => s + i.quantity, 0)} pcs
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-bold text-emerald-400">
                  ₱{completedSale.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="text-white font-medium">
                  {getPaymentMethodName(completedSale.payments[0]?.method)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Change Given:</span>
                <span className="font-semibold text-white">
                  ₱{changeDue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={startNewSale}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

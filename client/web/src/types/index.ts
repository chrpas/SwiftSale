export enum StockMovementType {
  PurchaseIn = 1,
  SaleOut = 2,
  AdjustmentIn = 3,
  AdjustmentOut = 4,
  SaleVoidReturn = 5,
}

export enum PaymentMethod {
  Cash = 1,
  BankTransfer = 2,
  GCash = 3,
  Check = 4,
  PostDatedCheck = 5,
  Other = 6,
}

export function getPaymentMethodName(method?: PaymentMethod | string | number): string {
  if (method === undefined || method === null) return 'N/A';
  if (typeof method === 'string' && isNaN(Number(method))) {
    switch (method) {
      case 'PostDatedCheck':
        return 'Post-Dated Check (PDC)';
      case 'Check':
        return 'Check';
      case 'BankTransfer':
        return 'Bank Transfer';
      case 'GCash':
        return 'GCash';
      case 'Cash':
        return 'Cash';
      case 'Other':
        return 'Other';
      default:
        return method;
    }
  }

  const num = Number(method);
  switch (num) {
    case PaymentMethod.Cash:
      return 'Cash';
    case PaymentMethod.BankTransfer:
      return 'Bank Transfer';
    case PaymentMethod.GCash:
      return 'GCash';
    case PaymentMethod.Check:
      return 'Check';
    case PaymentMethod.PostDatedCheck:
      return 'Post-Dated Check (PDC)';
    case PaymentMethod.Other:
      return 'Other';
    default:
      return String(method);
  }
}

export enum PaymentStatus {
  Cleared = 1,
  Pending = 2,
  Dishonored = 3,
  Cancelled = 4,
}

export function getPaymentStatusName(status?: PaymentStatus | string | number): string {
  if (status === undefined || status === null) return 'Cleared';
  if (typeof status === 'string' && isNaN(Number(status))) {
    switch (status) {
      case 'Cleared': return 'Cleared';
      case 'Pending': return 'Pending';
      case 'Dishonored': return 'Dishonored';
      case 'Cancelled': return 'Cancelled';
      default: return status;
    }
  }
  const num = Number(status);
  switch (num) {
    case PaymentStatus.Cleared: return 'Cleared';
    case PaymentStatus.Pending: return 'Pending';
    case PaymentStatus.Dishonored: return 'Dishonored';
    case PaymentStatus.Cancelled: return 'Cancelled';
    default: return String(status);
  }
}

export function isPaymentPending(status?: PaymentStatus | string | number): boolean {
  return status === PaymentStatus.Pending || status === 'Pending' || status === 2 || status === '2';
}

export function isPaymentCleared(status?: PaymentStatus | string | number): boolean {
  return status === PaymentStatus.Cleared || status === 'Cleared' || status === 1 || status === '1';
}

export enum SaleStatus {
  Draft = 1,
  Completed = 2,
  Voided = 3,
  PendingClearance = 4,
}

export function getSaleStatusName(status?: SaleStatus | string | number): string {
  if (status === undefined || status === null) return 'Unknown';
  if (typeof status === 'string' && isNaN(Number(status))) {
    switch (status) {
      case 'Draft': return 'Draft';
      case 'Completed': return 'Completed';
      case 'Voided': return 'Voided';
      case 'PendingClearance': return 'Pending Clearance';
      default: return status;
    }
  }
  const num = Number(status);
  switch (num) {
    case SaleStatus.Draft: return 'Draft';
    case SaleStatus.Completed: return 'Completed';
    case SaleStatus.Voided: return 'Voided';
    case SaleStatus.PendingClearance: return 'Pending Clearance';
    default: return String(status);
  }
}

export function isSaleCompleted(status?: SaleStatus | string | number): boolean {
  return status === SaleStatus.Completed || status === 'Completed' || status === 2 || status === '2';
}

export function isSalePendingClearance(status?: SaleStatus | string | number): boolean {
  return status === SaleStatus.PendingClearance || status === 'PendingClearance' || status === 4 || status === '4';
}

export function isSaleVoided(status?: SaleStatus | string | number): boolean {
  return status === SaleStatus.Voided || status === 'Voided' || status === 3 || status === '3';
}

export function isCheckPayment(method?: PaymentMethod | string | number): boolean {
  return (
    method === PaymentMethod.Check ||
    method === PaymentMethod.PostDatedCheck ||
    method === 'Check' ||
    method === 'PostDatedCheck' ||
    method === 4 ||
    method === 5 ||
    method === '4' ||
    method === '5'
  );
}

export enum PurchaseStatus {
  Draft = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unitId: string;
  unitIdentifier?: string;
  piecesPerBox?: number;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  isActive: boolean;
  quantityOnHand: number;
  averageCost: number;
  createdAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  categoryId: string;
  unitId?: string;
  unitIdentifier?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  initialStock: number;
  piecesPerBox?: number;
  description?: string;
}

export interface InventoryBalance {
  productId: string;
  productSKU: string;
  productName: string;
  categoryId?: string;
  categoryName?: string;
  quantityOnHand: number;
  reservedQuantity: number;
  quantityAvailable: number;
  averageCost: number;
  sellingPrice: number;
  reorderLevel: number;
  totalValuation: number;
  isActive?: boolean;
  isLowStock?: boolean;
  piecesPerBox?: number;
  unitIdentifier?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productSKU?: string;
  productName?: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  createdAt: string;
}

export interface CreateStockAdjustmentRequest {
  productId: string;
  quantity: number;
  type: StockMovementType;
  reason: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productSKU: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  unitSold?: 'PCS' | 'BOX' | string;
  quantitySold?: number;
  baseQuantityDeducted?: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  transactionRef?: string;
  bankName?: string;
  checkNumber?: string;
  checkDate?: string;
  clearedDate?: string;
  dishonorReason?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  invoiceNo: string;
  deliveryReceiptNo?: string;
  saleDate: string;
  status: SaleStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount?: number;
  balance?: number;
  items: SaleItem[];
  payments: Payment[];
}

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  unitSold?: 'PCS' | 'BOX' | string;
}

export interface CreatePaymentRequest {
  amount: number;
  method: PaymentMethod;
  transactionRef?: string;
  bankName?: string;
  checkNumber?: string;
  checkDate?: string;
  status?: PaymentStatus;
}

export interface CreateSaleRequest {
  customerId?: string | null;
  deliveryReceiptNo?: string;
  items: CreateSaleItemRequest[];
  payments?: CreatePaymentRequest[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface LowStockProduct {
  productId: string;
  sku: string;
  name: string;
  quantityOnHand: number;
  reorderLevel: number;
}

export interface DashboardMetrics {
  todaySales: number;
  todaySalesCount: number;
  todayGrossProfit: number;
  monthSales: number;
  monthSalesCount: number;
  monthGrossProfit: number;
  monthGrossMarginPercent: number;
  totalInventoryValuation: number;
  totalProductsCount: number;
  lowStockCount: number;
  recentSales?: Sale[];
  lowStockProducts?: LowStockProduct[];
}

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  productId?: string;
  paymentMethod?: PaymentMethod | string;
  inactivityThresholdDays?: number;
}

export interface ReportOverview {
  totalSales: number;
  totalOrders: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  inventoryValue: number;
  activeSkus: number;
  lowStockCount: number;
  totalUnitsOnHand: number;
  outOfStockCount: number;
  voidedOrdersCount?: number;
  voidedSalesAmount?: number;
}

export interface SalesTrendItem {
  date: string;
  revenue: number;
  grossProfit: number;
  orderCount: number;
}

export interface TopProductReportItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
}

export interface SlowMovingProductReportItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  inventoryCost: number;
  quantitySold: number;
  daysSinceLastSale: number | null;
  lastSaleDate: string | null;
}

export interface VoidedSaleDetail {
  saleId: string;
  invoiceNo: string;
  deliveryReceiptNo?: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  checkNumber?: string;
  bankName?: string;
  reason: string;
}

export interface SalesReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface InventoryReport {
  totalItems: number;
  totalInventoryValue: number;
  lowStockItemsCount: number;
}

export interface ProfitReport {
  startDate: string;
  endDate: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercentage: number;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export enum RemoteAccessStatusState {
  Disabled = 'Disabled',
  Starting = 'Starting',
  Running = 'Running',
  Stopped = 'Stopped',
  Error = 'Error',
  NgrokNotFound = 'NgrokNotFound',
}

export interface RemoteAccessStatus {
  state: RemoteAccessStatusState;
  publicUrl?: string;
  localAddress?: string;
  startedAt?: string;
  errorMessage?: string;
}

export interface RemoteAccessSettings {
  enabled: boolean;
  ngrokPath: string;
  hasAuthtoken: boolean;
  autoStart: boolean;
  ngrokVersion?: string;
  isNgrokDetected: boolean;
}

export interface UpdateRemoteAccessSettingsRequest {
  ngrokPath?: string;
  authtoken?: string;
  autoStart?: boolean;
}

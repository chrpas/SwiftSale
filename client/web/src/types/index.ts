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
  Other = 4,
}

export enum SaleStatus {
  Draft = 1,
  Completed = 2,
  Voided = 3,
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
  paymentDate: string;
  transactionRef?: string;
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

import axios, { AxiosError } from 'axios';
import {
  Product,
  CreateProductRequest,
  InventoryBalance,
  StockMovement,
  CreateStockAdjustmentRequest,
  Sale,
  CreateSaleRequest,
  Customer,
  CreateCustomerRequest,
  DashboardMetrics,
  SalesReport,
  InventoryReport,
  ProfitReport,
  ReportOverview,
  SalesTrendItem,
  TopProductReportItem,
  SlowMovingProductReportItem,
  ReportFilterParams,
  Category,
  RemoteAccessStatus,
  RemoteAccessSettings,
  UpdateRemoteAccessSettingsRequest,
} from '../types';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('swiftsale_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('swiftsale_token');
      localStorage.removeItem('swiftsale_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to extract human-readable error from ProblemDetails or Axios error
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.detail) return data.detail;
      if (data.title) return data.title;
      if (data.errors) {
        const firstField = Object.keys(data.errors)[0];
        if (firstField && data.errors[firstField]?.length) {
          return `${firstField}: ${data.errors[firstField][0]}`;
        }
      }
    }
    if (err.message) return err.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export const productsService = {
  getAll: async (activeOnly?: boolean, categoryId?: string): Promise<Product[]> => {
    const params: Record<string, string | boolean> = {};
    if (activeOnly !== undefined) params.activeOnly = activeOnly;
    if (categoryId) params.categoryId = categoryId;
    const response = await apiClient.get<Product[]>('/products', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
  getBySku: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/sku/${encodeURIComponent(sku)}`);
    return response.data;
  },
  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },
  discontinue: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
  activate: async (id: string): Promise<void> => {
    await apiClient.post(`/products/${id}/activate`);
  },
};

export const inventoryService = {
  getBalances: async (lowStockOnly?: boolean, activeOnly?: boolean): Promise<InventoryBalance[]> => {
    const params: Record<string, boolean> = {};
    if (lowStockOnly) params.lowStockOnly = true;
    if (activeOnly !== undefined) params.activeOnly = activeOnly;
    const response = await apiClient.get<InventoryBalance[] | { value: InventoryBalance[] }>('/inventory', { params });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray((response.data as { value?: InventoryBalance[] }).value)) {
      return (response.data as { value: InventoryBalance[] }).value;
    }
    return [];
  },
  getLowStock: async (): Promise<InventoryBalance[]> => {
    const response = await apiClient.get<InventoryBalance[] | { value: InventoryBalance[] }>('/inventory/low-stock');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray((response.data as { value?: InventoryBalance[] }).value)) {
      return (response.data as { value: InventoryBalance[] }).value;
    }
    return [];
  },
  adjustStock: async (data: CreateStockAdjustmentRequest): Promise<void> => {
    await apiClient.post('/inventory/adjustments', data);
  },
  getStockMovements: async (productId?: string): Promise<StockMovement[]> => {
    const params = productId ? { productId } : undefined;
    const response = await apiClient.get<StockMovement[]>('/stock-movements', { params });
    return response.data;
  },
};

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    const response = await apiClient.get<Sale[]>('/sales');
    return response.data;
  },
  getById: async (id: string): Promise<Sale> => {
    const response = await apiClient.get<Sale>(`/sales/${id}`);
    return response.data;
  },
  checkout: async (data: CreateSaleRequest): Promise<Sale> => {
    const response = await apiClient.post<Sale>('/sales', data);
    return response.data;
  },
  voidSale: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/sales/${id}/void`, { reason });
  },
  clearCheck: async (paymentId: string): Promise<Sale> => {
    const response = await apiClient.post<Sale>(`/sales/payments/${paymentId}/clear`);
    return response.data;
  },
  dishonorCheckAndReturn: async (saleId: string, paymentId: string, reason: string): Promise<Sale> => {
    const response = await apiClient.post<Sale>(`/sales/${saleId}/payments/${paymentId}/dishonor-return`, { reason });
    return response.data;
  },
};

export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers');
    return response.data;
  },
  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers', data);
    return response.data;
  },
};

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[] | { value: Category[] }>('/categories');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray((response.data as { value?: Category[] }).value)) {
      return (response.data as { value: Category[] }).value;
    }
    return [];
  },
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: string, data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>('/dashboard');
    return response.data;
  },
};

export const reportsService = {
  getOverview: async (filters?: ReportFilterParams): Promise<ReportOverview> => {
    const response = await apiClient.get<ReportOverview>('/reports/overview', { params: filters });
    return response.data;
  },
  getSalesTrend: async (filters?: ReportFilterParams): Promise<SalesTrendItem[]> => {
    const response = await apiClient.get<SalesTrendItem[]>('/reports/sales-trend', { params: filters });
    return response.data;
  },
  getTopProducts: async (filters?: ReportFilterParams, limit: number = 20): Promise<TopProductReportItem[]> => {
    const response = await apiClient.get<TopProductReportItem[]>('/reports/top-products', {
      params: { ...filters, limit },
    });
    return response.data;
  },
  getSlowMoving: async (filters?: ReportFilterParams): Promise<SlowMovingProductReportItem[]> => {
    const response = await apiClient.get<SlowMovingProductReportItem[]>('/reports/slow-moving-products', { params: filters });
    return response.data;
  },
  getVoidedSales: async (filters?: ReportFilterParams): Promise<import('../types').VoidedSaleDetail[]> => {
    const response = await apiClient.get<import('../types').VoidedSaleDetail[]>('/reports/voided', { params: filters });
    return response.data;
  },
  downloadPdf: async (filters?: ReportFilterParams): Promise<void> => {
    const response = await apiClient.get('/reports/export/pdf', {
      params: filters,
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const nowStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `SwiftSale_Report_${nowStr}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  getSalesReport: async (startDate?: string, endDate?: string): Promise<SalesReport> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<SalesReport>('/reports/sales', { params });
    return response.data;
  },
  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await apiClient.get<InventoryReport>('/reports/inventory');
    return response.data;
  },
  getProfitReport: async (startDate?: string, endDate?: string): Promise<ProfitReport> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<ProfitReport>('/reports/profit', { params });
    return response.data;
  },
};

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },
};

export const usersService = {
  getAll: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/users');
    return response.data;
  },
  create: async (data: { username: string; fullName: string; password: string; role: string }): Promise<UserDto> => {
    const response = await apiClient.post<UserDto>('/users', data);
    return response.data;
  },
  update: async (id: string, data: { fullName?: string; role?: string; isActive?: boolean }): Promise<UserDto> => {
    const response = await apiClient.put<UserDto>(`/users/${id}`, data);
    return response.data;
  },
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/users/${id}/reset-password`, { newPassword });
  },
};

export const unitsService = {
  getAll: async (): Promise<UnitOfMeasure[]> => {
    const response = await apiClient.get<UnitOfMeasure[] | { value: UnitOfMeasure[] }>('/units');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray((response.data as { value?: UnitOfMeasure[] }).value)) {
      return (response.data as { value: UnitOfMeasure[] }).value;
    }
    return [];
  },
  create: async (data: { name: string; abbreviation: string }): Promise<UnitOfMeasure> => {
    const response = await apiClient.post<UnitOfMeasure>('/units', data);
    return response.data;
  },
  update: async (id: string, data: { name: string; abbreviation: string }): Promise<UnitOfMeasure> => {
    const response = await apiClient.put<UnitOfMeasure>(`/units/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/units/${id}`);
  },
};

export const remoteAccessService = {
  getStatus: async (): Promise<RemoteAccessStatus> => {
    const response = await apiClient.get<RemoteAccessStatus>('/remote-access/status');
    return response.data;
  },
  getSettings: async (): Promise<RemoteAccessSettings> => {
    const response = await apiClient.get<RemoteAccessSettings>('/remote-access/settings');
    return response.data;
  },
  updateSettings: async (data: UpdateRemoteAccessSettingsRequest): Promise<RemoteAccessSettings> => {
    const response = await apiClient.put<RemoteAccessSettings>('/remote-access/settings', data);
    return response.data;
  },
  start: async (): Promise<RemoteAccessStatus> => {
    const response = await apiClient.post<RemoteAccessStatus>('/remote-access/start');
    return response.data;
  },
  stop: async (): Promise<RemoteAccessStatus> => {
    const response = await apiClient.post<RemoteAccessStatus>('/remote-access/stop');
    return response.data;
  },
};

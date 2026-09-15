import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PosPage } from '../features/pos/PosPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { ProductsPage } from '../features/products/ProductsPage';
import { SalesHistoryPage } from '../features/sales/SalesHistoryPage';
import { CustomersPage } from '../features/customers/CustomersPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { LoginPage } from '../features/auth/LoginPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/sales/new" element={<PosPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/sales" element={<SalesHistoryPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

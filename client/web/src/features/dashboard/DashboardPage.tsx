import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from './DashboardContent';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardContent
      onNewOrder={() => navigate('/sales/new')}
      onAddCustomer={() => navigate('/customers')}
      onAddProduct={() => navigate('/products')}
      onViewReports={() => navigate('/reports')}
      onViewSalesHistory={() => navigate('/sales')}
    />
  );
};

export default DashboardPage;

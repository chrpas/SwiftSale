import React, { useState } from 'react';
import { BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AppRoutes } from './routes';
import { Menu, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated (except on /login itself)
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Full-screen login page (no sidebar)
  if (location.pathname === '/login') {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-[#F2F7F4] flex font-sans text-[#1D3530] selection:bg-[#0D7A5F] selection:text-white">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white/90 border-b border-[#E1ECE5] backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#6B8F7A] hover:text-[#1D3530] hover:bg-[#E1ECE5] focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0D7A5F] flex items-center justify-center shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[#1D3530] tracking-tight">SwiftSale</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Receipt,
  Users,
  BarChart3,
  X,
  Zap,
  Settings,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'POS Terminal', to: '/sales/new', icon: ShoppingCart },
    { label: 'Inventory', to: '/inventory', icon: Boxes },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Sales History', to: '/sales', icon: Receipt },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid #E1ECE5',
        }}
      >
        {/* Brand Header */}
        <div
          className="h-16 flex items-center justify-between px-5"
          style={{ borderBottom: '1px solid #E1ECE5' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #0D7A5F 0%, #2DD4BF 100%)' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight" style={{ color: '#1D3530' }}>
                SwiftSale
              </span>
              <span
                className="text-[10px] block font-semibold -mt-0.5 tracking-wider uppercase"
                style={{ color: '#6B8F7A' }}
              >
                Inventory &amp; POS
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: '#8AAF9B' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick POS Action */}
        <div className="px-4 pt-4 pb-2">
          <NavLink
            to="/sales/new"
            onClick={() => onClose()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #0D7A5F 0%, #059669 100%)',
              boxShadow: '0 3px 12px rgba(13,122,95,0.3)',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={true}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'nav-active' : 'nav-inactive'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: '#ECFDF5',
                        color: '#0D7A5F',
                        borderLeft: '3px solid #0D7A5F',
                        fontWeight: 600,
                      }
                    : {
                        color: '#6B8F7A',
                        borderLeft: '3px solid transparent',
                      }
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? '#0D7A5F' : '#8AAF9B' }}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout Footer */}
        <div className="p-4" style={{ borderTop: '1px solid #E1ECE5', background: '#F2F7F4' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D7A5F, #2DD4BF)' }}
            >
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1D3530' }}>
                {user?.fullName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3 h-3" style={{ color: '#0D7A5F' }} />
                    <span className="text-xs font-medium" style={{ color: '#0D7A5F' }}>Admin</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-3 h-3" style={{ color: '#059669' }} />
                    <span className="text-xs font-medium" style={{ color: '#059669' }}>Cashier</span>
                  </>
                )}
              </div>
            </div>
            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#8AAF9B' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#9F1239';
                (e.currentTarget as HTMLButtonElement).style.background = '#FFE4E6';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#8AAF9B';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Brand footer */}
          <div className="flex items-center gap-2 text-xs" style={{ color: '#8AAF9B' }}>
            <Leaf className="w-3 h-3" style={{ color: '#0D7A5F' }} />
            <span>.NET 9 · Clean Architecture</span>
          </div>
        </div>
      </aside>
    </>
  );
};

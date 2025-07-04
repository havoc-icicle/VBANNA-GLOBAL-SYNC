import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Upload,
  TrendingUp,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  Shield,
  Globe,
  Building,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const navigation: NavItem[] = [
    {
      name: t('nav.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.services'),
      href: '/services',
      icon: Package,
    },
    {
      name: t('nav.orders'),
      href: '/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: Upload,
    },
    {
      name: 'Trade Leads',
      href: '/trade-leads',
      icon: TrendingUp,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
    },
    {
      name: t('nav.reports'),
      href: '/reports',
      icon: BarChart3,
    },
  ];

  const adminNavigation: NavItem[] = [
    {
      name: t('nav.admin'),
      href: '/admin',
      icon: Shield,
      roles: ['Admin'],
    },
    {
      name: 'Service Management',
      href: '/admin/services',
      icon: Settings,
      roles: ['Admin'],
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      roles: ['Admin'],
    },
    {
      name: 'Country Management',
      href: '/admin/countries',
      icon: Globe,
      roles: ['Admin'],
    },
    {
      name: 'Industry Management',
      href: '/admin/industries',
      icon: Building,
      roles: ['Admin'],
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/dashboard' && location.pathname.startsWith(href));
  };

  const canAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5',
                  isActive(item.href)
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Admin Section */}
        {user?.role === 'Admin' && (
          <div className="mt-8">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => 
                canAccess(item) ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 h-5 w-5',
                        isActive(item.href)
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                ) : null
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
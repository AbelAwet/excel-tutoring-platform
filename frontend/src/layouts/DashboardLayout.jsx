import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiMessageSquare, FiUser, FiLogOut, 
  FiMenu, FiX, FiUsers, FiDollarSign, FiStar, FiBell,
  FiMoon, FiSun
} from 'react-icons/fi';
import { useUnreadCount } from '../hooks/useNotifications';
import useAuthStore from '../stores/authStore';
import useThemeStore from '../stores/themeStore';
import { authService } from '../services/authService';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isStudent, isTutor, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: unreadData } = useUnreadCount();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      logout();
      navigate('/login');
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    if (isAdmin()) {
      return [
        { name: 'Dashboard', path: '/admin', icon: FiHome },
        { name: 'Users', path: '/admin/users', icon: FiUsers },
        { name: 'Tutors', path: '/admin/tutors', icon: FiUser },
        { name: 'Bookings', path: '/admin/bookings', icon: FiCalendar },
        { name: 'Payments', path: '/admin/payments', icon: FiDollarSign },
        { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
        { name: 'Notifications', path: '/admin/notifications', icon: FiBell },
      ];
    } else if (isTutor()) {
      return [
        { name: 'Dashboard', path: '/tutor', icon: FiHome },
        { name: 'Bookings', path: '/tutor/bookings', icon: FiCalendar },
        { name: 'Messages', path: '/tutor/messages', icon: FiMessageSquare },
        { name: 'Notifications', path: '/tutor/notifications', icon: FiBell },
        { name: 'Profile', path: '/tutor/profile', icon: FiUser },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/student', icon: FiHome },
        { name: 'Bookings', path: '/student/bookings', icon: FiCalendar },
        { name: 'Messages', path: '/student/messages', icon: FiMessageSquare },
        { name: 'Notifications', path: '/student/notifications', icon: FiBell },
        { name: 'Profile', path: '/student/profile', icon: FiUser },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo/logo.png" 
                alt="EXCEL Tutoring" 
                className="h-10 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 animate-fade-in-right animate-delay-200">
              <img
                key={user?.avatar?.url || 'default-avatar'}
                src={getImageUrl(user?.avatar?.url, 'https://via.placeholder.com/40')}
                alt={user?.firstName}
                className="w-10 h-10 rounded-full object-cover hover-scale transition-all-smooth"
                onError={(e) => handleImageError(e, 'https://via.placeholder.com/40')}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all-smooth hover-lift ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 animate-scale-in'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } animate-fade-in-left`}
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              <span className="font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiMenu size={24} />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                onClick={() => {
                  if (isAdmin()) navigate('/admin/notifications');
                  else if (isTutor()) navigate('/tutor/notifications');
                  else navigate('/student/notifications');
                }}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiBell size={20} />
                {unreadData?.data?.count > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* User Menu - Mobile */}
              <div className="lg:hidden">
                <img
                  key={user?.avatar?.url || 'default-avatar-mobile'}
                  src={getImageUrl(user?.avatar?.url, 'https://via.placeholder.com/32')}
                  alt={user?.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => handleImageError(e, 'https://via.placeholder.com/32')}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, userType, signOut, loading } = useAuth();

  // Debug logging - Always log the current state
  console.log('Navigation render check:', {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    userType,
    pathname,
    willRender: !loading && !!user && !!userType
  });

  // Don't render navigation if no user/userType (only on initial load or logged out)
  if (loading || !user || !userType) {
    // Log for debugging when navigation doesn't render
    if (!loading && user && !userType) {
      console.warn('⚠️ Navigation hidden: user exists but userType is missing', { user: user.email, userType });
    }
    if (!loading && !user) {
      console.log('ℹ️ Navigation hidden: No user logged in');
    }
    if (loading) {
      console.log('ℹ️ Navigation hidden: Still loading auth state');
    }
    return null;
  }

  console.log('✅ Navigation WILL RENDER for:', userType);

  const userEmail = user?.email || 'Loading...';

  const workerMenuItems = [
    { name: 'Home', path: '/worker/home', icon: '🏠' },
    { name: 'Profile', path: '/worker/profile', icon: '👤' },
    { name: 'Discover Shifts', path: '/discover', icon: '🔍' },
  ];

  const restaurantMenuItems = [
    { name: 'Home', path: '/restaurant/home', icon: '🏠' },
    { name: 'Profile', path: '/restaurant/profile', icon: '👤' },
    { name: 'Shift Posting', path: '/restaurant/dashboard', icon: '📋' },
  ];

  const menuItems = userType === 'worker' ? workerMenuItems : restaurantMenuItems;

  return (
    <>
      {/* Header with Hamburger and Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
          <div className="ml-4 flex items-center">
            <img
              src="/corner_logo.png"
              alt="ShiftServe Logo"
              className="h-20 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/corner_logo.png"
              alt="ShiftServe Logo"
              className="h-20 w-auto"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userType}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out Button */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={signOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

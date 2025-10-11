'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function RestaurantHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?type=restaurant');
        return;
      }

      if (user.user_metadata?.user_type !== 'restaurant') {
        router.push('/worker/home');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const featuredRestaurants = [
    {
      name: 'The Blue Table',
      type: 'Fine Dining',
      location: 'New York, NY',
      rating: 4.8,
      shiftsPosted: 156,
      icon: '🍽️'
    },
    {
      name: 'Harbor Grill',
      type: 'Seafood Restaurant',
      location: 'Boston, MA',
      rating: 4.9,
      shiftsPosted: 203,
      icon: '🦞'
    },
    {
      name: 'Maple Street Cafe',
      type: 'Casual Dining',
      location: 'Portland, OR',
      rating: 4.7,
      shiftsPosted: 89,
      icon: '☕'
    },
    {
      name: 'Golden Wok',
      type: 'Asian Cuisine',
      location: 'San Francisco, CA',
      rating: 4.9,
      shiftsPosted: 175,
      icon: '🥢'
    },
    {
      name: 'Riverside Tavern',
      type: 'Gastropub',
      location: 'Chicago, IL',
      rating: 4.6,
      shiftsPosted: 142,
      icon: '🍺'
    },
    {
      name: 'Ocean View Restaurant',
      type: 'Coastal Dining',
      location: 'Miami, FL',
      rating: 4.8,
      shiftsPosted: 198,
      icon: '🌊'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userType="restaurant" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to ShiftServe.ai
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with qualified workers and manage your staffing needs
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Shifts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <span className="text-3xl">📝</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shifts Filled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        {/* Restaurants Using ShiftServe */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Restaurants Using ShiftServe.ai
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of restaurants streamlining their staffing with ShiftServe.ai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredRestaurants.map((restaurant, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-3xl flex-shrink-0">{restaurant.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {restaurant.type}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>📍 {restaurant.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-yellow-600 dark:text-yellow-400">
                        ⭐ {restaurant.rating}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {restaurant.shiftsPosted} shifts posted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Why Restaurants Choose ShiftServe.ai
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Access to pre-screened, qualified workers instantly</li>
                  <li>• Fill last-minute shifts in minutes, not hours</li>
                  <li>• Pay only for shifts filled, no monthly fees</li>
                  <li>• Built-in communication and scheduling tools</li>
                  <li>• Worker ratings and reviews for quality assurance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/restaurant/dashboard')}
              className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📋</span>
                <span className="font-medium text-gray-900 dark:text-white">Post a Shift</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/restaurant/profile')}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👤</span>
                <span className="font-medium text-gray-900 dark:text-white">Edit Profile</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

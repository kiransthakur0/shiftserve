'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function RestaurantProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Mock profile data - in production this would come from a database
  const [profile, setProfile] = useState({
    restaurantName: 'The Blue Table',
    email: '',
    phone: '(555) 987-6543',
    description: 'A fine dining establishment serving contemporary American cuisine',
    cuisineType: 'American',
    restaurantType: 'Fine Dining',
    address: '123 Main Street, New York, NY 10001',
    operatingHours: {
      monday: { open: '17:00', close: '22:00', closed: false },
      tuesday: { open: '17:00', close: '22:00', closed: false },
      wednesday: { open: '17:00', close: '22:00', closed: false },
      thursday: { open: '17:00', close: '22:00', closed: false },
      friday: { open: '17:00', close: '23:00', closed: false },
      saturday: { open: '17:00', close: '23:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    payRange: { min: 18, max: 28 },
    commonRoles: ['Server', 'Bartender', 'Line Cook', 'Dishwasher'],
    benefits: ['Flexible Schedule', 'Employee Meals', 'Tips']
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?type=restaurant');
        return;
      }

      if (user.user_metadata?.user_type !== 'restaurant') {
        router.push('/worker/profile');
        return;
      }

      setProfile(prev => ({ ...prev, email: user.email || '' }));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your restaurant information and preferences
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={profile.restaurantName}
                onChange={(e) => setProfile({ ...profile, restaurantName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Restaurant Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurant Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuisine Type
              </label>
              <div className="text-gray-900 dark:text-white">
                {profile.cuisineType}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restaurant Type
              </label>
              <div className="text-gray-900 dark:text-white">
                {profile.restaurantType}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Operating Hours
          </h2>
          <div className="space-y-3">
            {Object.entries(profile.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="font-medium text-gray-900 dark:text-white capitalize w-24">
                  {day}
                </span>
                <div className="text-gray-600 dark:text-gray-400">
                  {hours.closed ? (
                    <span className="text-red-600 dark:text-red-400">Closed</span>
                  ) : (
                    <span>{hours.open} - {hours.close}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Range */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pay Range
          </h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${profile.payRange.min}/hr
              </div>
            </div>
            <span className="text-gray-400 mt-6">-</span>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${profile.payRange.max}/hr
              </div>
            </div>
          </div>
        </div>

        {/* Common Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Common Roles
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.commonRoles.map((role, index) => (
              <span
                key={index}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Benefits
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.benefits.map((benefit, index) => (
              <span
                key={index}
                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/onboarding/restaurant')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => router.push('/restaurant/dashboard')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

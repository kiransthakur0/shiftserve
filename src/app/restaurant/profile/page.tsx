'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const cuisineTypes = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian',
  'French', 'Mediterranean', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Other'
];

const restaurantTypes = [
  'Fine Dining', 'Casual Dining', 'Fast Casual', 'Fast Food', 'Cafe',
  'Bar/Pub', 'Food Truck', 'Catering', 'Other'
];

const commonRolesOptions = [
  'Server', 'Bartender', 'Host/Hostess', 'Busser', 'Line Cook',
  'Prep Cook', 'Dishwasher', 'Barback', 'Food Runner', 'Kitchen Manager',
  'Sous Chef', 'Head Chef'
];

const benefitsOptions = [
  'Flexible Schedule', 'Employee Meals', 'Tips', 'Health Insurance',
  'Paid Time Off', 'Retirement Plan', 'Training Provided', 'Career Growth',
  'Employee Discounts', 'Bonus Opportunities'
];

export default function RestaurantProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    description: '',
    cuisineType: 'American',
    restaurantType: 'Casual Dining',
    address: '',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    payRange: { min: 15, max: 25 },
    commonRoles: [] as string[],
    benefits: [] as string[]
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Auth error:', authError);
          // Set loading to false before redirect so user can see what's happening
          setLoading(false);
          setTimeout(() => {
            router.push('/auth/login?type=restaurant');
          }, 100);
          return;
        }

        // Don't enforce user_type check - allow any authenticated user to view this page
        // This prevents the loading loop if user_type isn't set in metadata

        setUserId(user.id);
        setProfile(prev => ({ ...prev, email: user.email || '' }));

        // Try to load existing profile from database
        const { data: existingProfile, error: profileError } = await supabase
          .from('restaurant_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Don't treat "no profile found" as an error - just means it's a new profile
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError);
        }

        if (existingProfile) {
          setProfileId(existingProfile.id);
          setProfile({
            restaurantName: existingProfile.restaurant_name || '',
            email: user.email || '',
            phone: existingProfile.phone || '',
            description: existingProfile.description || '',
            cuisineType: existingProfile.cuisine_type || 'American',
            restaurantType: existingProfile.restaurant_type || 'Casual Dining',
            address: existingProfile.address || '',
            operatingHours: existingProfile.operating_hours || profile.operatingHours,
            payRange: existingProfile.pay_range || { min: 15, max: 25 },
            commonRoles: existingProfile.common_roles || [],
            benefits: existingProfile.benefits || []
          });
        }
      } catch (err) {
        console.error('Unexpected error loading profile:', err);
        setError('Failed to load profile. Please refresh the page.');
      } finally {
        // Always set loading to false, even if there's an error
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    // Validation
    if (!profile.restaurantName || !profile.phone || !profile.address) {
      setError('Please fill in all required fields (Restaurant Name, Phone, Address)');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const profileData = {
        user_id: userId,
        restaurant_name: profile.restaurantName,
        phone: profile.phone,
        description: profile.description,
        cuisine_type: profile.cuisineType,
        restaurant_type: profile.restaurantType,
        address: profile.address,
        operating_hours: profile.operatingHours,
        pay_range: profile.payRange,
        common_roles: profile.commonRoles,
        benefits: profile.benefits,
        updated_at: new Date().toISOString()
      };

      if (profileId) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('restaurant_profiles')
          .update(profileData)
          .eq('id', profileId);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('restaurant_profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newProfile) setProfileId(newProfile.id);
      }

      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setProfile(prev => ({
      ...prev,
      commonRoles: prev.commonRoles.includes(role)
        ? prev.commonRoles.filter(r => r !== role)
        : [...prev.commonRoles, role]
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setProfile(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const updateOperatingHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

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

      <main className="max-w-4xl mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profileId ? 'Edit your restaurant information and preferences' : 'Complete your restaurant profile to start posting shifts'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={profile.restaurantName}
                onChange={(e) => setProfile({ ...profile, restaurantName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter restaurant name"
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
                Phone *
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="123 Main Street, City, State ZIP"
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
                placeholder="Describe your restaurant..."
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
              <select
                value={profile.cuisineType}
                onChange={(e) => setProfile({ ...profile, cuisineType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {cuisineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restaurant Type
              </label>
              <select
                value={profile.restaurantType}
                onChange={(e) => setProfile({ ...profile, restaurantType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {restaurantTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
              <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="font-medium text-gray-900 dark:text-white capitalize w-24">
                  {day}
                </span>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => updateOperatingHours(day, 'closed', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
                </label>
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pay Range */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pay Range
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum ($/hr)
              </label>
              <input
                type="number"
                value={profile.payRange.min}
                onChange={(e) => setProfile({ ...profile, payRange: { ...profile.payRange, min: parseInt(e.target.value) || 15 }})}
                min="10"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum ($/hr)
              </label>
              <input
                type="number"
                value={profile.payRange.max}
                onChange={(e) => setProfile({ ...profile, payRange: { ...profile.payRange, max: parseInt(e.target.value) || 25 }})}
                min="10"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Common Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Common Roles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonRolesOptions.map(role => (
              <label key={role} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.commonRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Benefits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {benefitsOptions.map(benefit => (
              <label key={benefit} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.benefits.includes(benefit)}
                  onChange={() => toggleBenefit(benefit)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
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

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const certificationsOptions = [
  'Food Safety Certification', 'ServSafe', 'Alcohol Service (TIPS/ABC)',
  'First Aid/CPR', 'Allergen Awareness', 'Other'
];

const skillsOptions = [
  'Customer Service', 'POS Systems', 'Cash Handling', 'Cocktail Making',
  'Wine Knowledge', 'Food Preparation', 'Multi-tasking', 'Team Leadership',
  'Communication', 'Problem Solving', 'Time Management'
];

const rolesOptions = [
  'Server', 'Bartender', 'Host/Hostess', 'Busser', 'Line Cook',
  'Prep Cook', 'Dishwasher', 'Barback', 'Food Runner', 'Kitchen Manager'
];

const experienceLevels = {
  entry: 'Entry Level (0-1 years)',
  intermediate: 'Intermediate (1-3 years)',
  experienced: 'Experienced (3-5 years)',
  expert: 'Expert (5+ years)'
};

export default function WorkerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    certifications: [] as string[],
    skills: [] as string[],
    roles: [] as string[],
    serviceRadius: 25,
    experience: 'entry' as keyof typeof experienceLevels,
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Auth error:', authError);
          setLoading(false);
          router.push('/auth/login?type=worker');
          return;
        }

        // Check if user has a restaurant profile instead
        const { data: restaurantProfile } = await supabase
          .from('restaurant_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // If user has a restaurant profile, redirect to restaurant profile page
        if (restaurantProfile) {
          console.log('User is a restaurant, redirecting to restaurant profile');
          setLoading(false);
          router.push('/restaurant/profile');
          return;
        }

        setUserId(user.id);
        setProfile(prev => ({ ...prev, email: user.email || '' }));

        // Try to load existing worker profile from database
        const { data: existingProfile, error: profileError } = await supabase
          .from('worker_profiles')
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
            name: existingProfile.name || '',
            email: user.email || '',
            phone: existingProfile.phone || '',
            certifications: existingProfile.certifications || [],
            skills: existingProfile.skills || [],
            roles: existingProfile.roles || [],
            serviceRadius: existingProfile.service_radius || 25,
            experience: existingProfile.experience || 'entry',
            availability: existingProfile.availability || profile.availability
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error loading profile:', err);
        setError('Failed to load profile. Please refresh the page.');
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
    if (!profile.name || !profile.phone) {
      setError('Please fill in all required fields (Name, Phone)');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const profileData = {
        user_id: userId,
        name: profile.name,
        phone: profile.phone,
        certifications: profile.certifications,
        skills: profile.skills,
        roles: profile.roles,
        service_radius: profile.serviceRadius,
        experience: profile.experience,
        availability: profile.availability,
        updated_at: new Date().toISOString()
      };

      if (profileId) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('worker_profiles')
          .update(profileData)
          .eq('id', profileId);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('worker_profiles')
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

  const toggleCertification = (cert: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const toggleSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleRole = (role: string) => {
    setProfile(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleAvailability = (day: string) => {
    setProfile(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day as keyof typeof prev.availability]
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
            Worker Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profileId ? 'Edit your profile information and preferences' : 'Complete your worker profile to start finding shifts'}
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
                Name *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
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
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Certifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {certificationsOptions.map(cert => (
              <label key={cert} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.certifications.includes(cert)}
                  onChange={() => toggleCertification(cert)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Skills
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skillsOptions.map(skill => (
              <label key={skill} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Preferred Roles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rolesOptions.map(role => (
              <label key={role} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience & Service Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Work Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value as keyof typeof experienceLevels })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(experienceLevels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Radius (miles)
              </label>
              <input
                type="number"
                value={profile.serviceRadius}
                onChange={(e) => setProfile({ ...profile, serviceRadius: parseInt(e.target.value) || 25 })}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Availability
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(profile.availability).map(([day, available]) => (
              <label
                key={day}
                className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                  available
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={available}
                  onChange={() => toggleAvailability(day)}
                  className="hidden"
                />
                <div className="font-medium capitalize">{day}</div>
                <div className="text-xs mt-1">{available ? 'Available' : 'Not Available'}</div>
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
            onClick={() => router.push('/discover')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Discover
          </button>
        </div>
      </main>
    </div>
  );
}

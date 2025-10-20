'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function WorkerHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Auth error:', authError);
          router.push('/auth/login?type=worker');
          return;
        }
      } catch (err) {
        console.error('Unexpected error checking auth:', err);
      } finally {
        setLoading(false);
      }
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

  const nraTrainings = [
    {
      title: 'ServSafe Food Handler',
      description: 'Essential food safety training for restaurant workers',
      link: 'https://www.servsafe.com/access/ss/Catalog/ProductDetails/FSOH',
      icon: '🍽️'
    },
    {
      title: 'ServSafe Alcohol',
      description: 'Responsible alcohol service training',
      link: 'https://www.servsafe.com/access/ss/Catalog/ProductDetails/SAON',
      icon: '🍷'
    },
    {
      title: 'ServSafe Manager',
      description: 'Comprehensive food safety management certification',
      link: 'https://www.servsafe.com/access/ss/Catalog/ProductDetails/FSOM',
      icon: '📋'
    },
    {
      title: 'ServSafe Allergens',
      description: 'Training on food allergen safety',
      link: 'https://www.servsafe.com/access/ss/Catalog/ProductDetails/ASON',
      icon: '⚠️'
    },
    {
      title: 'Restaurant Ready',
      description: 'Foundational skills for restaurant careers',
      link: 'https://restaurant.org/education-and-resources/training/',
      icon: '👨‍🍳'
    },
    {
      title: 'ManageFirst Program',
      description: 'Management and leadership training',
      link: 'https://restaurant.org/education-and-resources/managefirst/',
      icon: '🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to ShiftServe.ai
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advance your career with professional training and certifications
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shifts Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$0</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">5.0</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </div>
        </div>

        {/* National Restaurant Association Trainings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Professional Training & Certifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enhance your skills with National Restaurant Association training programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nraTrainings.map((training, index) => (
              <a
                key={index}
                href={training.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-3xl flex-shrink-0">{training.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {training.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {training.description}
                    </p>
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block">
                      Learn more →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/discover')}
              className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔍</span>
                <span className="font-medium text-gray-900 dark:text-white">Find Shifts</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/worker/profile')}
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

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-16">
          <img
            src="/loginpage_logo.png"
            alt="ShiftServe Logo"
            className="mx-auto h-64 sm:h-80 lg:h-96 w-auto mb-8"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white max-w-3xl mx-auto">
            <p className="mb-2">Shifts Happen.</p>
            <p>Find your next shift today.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">For Workers</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Find last-minute shifts that fit your schedule
              </p>
            </div>
            <Link href="/auth/signup?type=worker">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm">
                Get Started
              </button>
            </Link>
            <Link href="/auth/login?type=worker">
              <button className="w-full mt-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 border border-blue-600 dark:border-blue-400 text-sm">
                Log In
              </button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">For Restaurants</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Fill urgent shifts quickly with qualified workers
              </p>
            </div>
            <Link href="/auth/signup?type=restaurant">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm">
                Get Started
              </button>
            </Link>
            <Link href="/auth/login?type=restaurant">
              <button className="w-full mt-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-orange-600 dark:text-orange-400 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 border border-orange-600 dark:border-orange-400 text-sm">
                Log In
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of restaurants and workers already using ShiftServe
          </p>
        </div>
      </div>
    </div>
  );
}

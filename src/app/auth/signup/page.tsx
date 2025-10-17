'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignUpForm() {
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') || 'worker'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      console.log('Starting signup process...')
      const supabase = createClient()

      console.log('Setting up auth state listener...')
      // Use auth state listener approach (same as login fix)
      let authResolved = false
      const sessionPromise = new Promise<{ userType: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!authResolved) {
            reject(new Error('Signup request timed out after 15 seconds'))
          }
        }, 15000)

        // Listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, !!session)
          if (event === 'SIGNED_IN' && session?.user && !authResolved) {
            authResolved = true
            clearTimeout(timeout)
            subscription.unsubscribe()
            const userTypeFromMetadata = session.user.user_metadata?.user_type || userType
            resolve({ userType: userTypeFromMetadata })
          }
        })
      })

      // Now call signUp
      console.log('Calling signUp...')
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      }).then(({ error }) => {
        if (error) {
          console.error('signUp error:', error)
          setError(error.message)
          setLoading(false)
        }
      }).catch(err => {
        console.error('signUp exception:', err)
        setError('Account creation failed')
        setLoading(false)
      })

      console.log('Waiting for session...')
      const { userType: confirmedUserType } = await sessionPromise

      console.log('User signed up successfully, redirecting...')
      // Redirect to appropriate onboarding
      if (confirmedUserType === 'worker') {
        console.log('Redirecting to /onboarding/worker')
        window.location.href = '/onboarding/worker'
      } else {
        console.log('Redirecting to /onboarding/restaurant')
        window.location.href = '/onboarding/restaurant'
      }
    } catch (err: unknown) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign up as a {userType === 'worker' ? 'Worker' : 'Restaurant'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href={`/auth/login?type=${userType}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

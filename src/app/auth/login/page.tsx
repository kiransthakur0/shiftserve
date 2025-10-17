'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

function LoginForm() {
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') || 'worker'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user on login page:', user)
      setCurrentUser(user)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setCurrentUser(null)
    console.log('Logged out successfully')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('Starting login process...')
      const supabase = createClient()

      console.log('Calling signInWithPassword...')

      // Use a different approach: set up session listener BEFORE calling signInWithPassword
      let authResolved = false
      const sessionPromise = new Promise<User>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!authResolved) {
            reject(new Error('Login request timed out after 15 seconds'))
          }
        }, 15000)

        // Listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, !!session)
          if (event === 'SIGNED_IN' && session?.user && !authResolved) {
            authResolved = true
            clearTimeout(timeout)
            subscription.unsubscribe()
            resolve(session.user)
          }
        })
      })

      // Now call signInWithPassword
      supabase.auth.signInWithPassword({
        email,
        password,
      }).then(({ error }) => {
        if (error) {
          console.error('signInWithPassword error:', error)
          setError(error.message)
          setLoading(false)
        }
      }).catch(err => {
        console.error('signInWithPassword exception:', err)
        setError('Authentication failed')
        setLoading(false)
      })

      console.log('Waiting for session...')
      const user = await sessionPromise

      console.log('User authenticated:', user.id)
      console.log('User metadata:', user.user_metadata)

      // Try to get user_type from metadata first (set during signup)
      const metadataUserType = user.user_metadata?.user_type
      console.log('User type from metadata:', metadataUserType)

      if (metadataUserType) {
        // Use metadata user_type for immediate redirect
        console.log('Using metadata user_type for redirect')
        if (metadataUserType === 'worker') {
          console.log('Redirecting to /discover')
          window.location.href = '/discover'
          return
        } else if (metadataUserType === 'restaurant') {
          console.log('Redirecting to /restaurant/dashboard')
          window.location.href = '/restaurant/dashboard'
          return
        }
      }

      // Fallback: Fetch user type from profiles table
      console.log('Fetching user type from profiles table...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      console.log('Profile fetch response:', {
        hasProfile: !!profile,
        userType: profile?.user_type,
        hasError: !!profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message
      })

      if (profileError) {
        console.error('Error fetching profile:', profileError)

        // Check if it's a "not found" error vs other errors
        if (profileError.code === 'PGRST116') {
          throw new Error(
            'Profile not found. The database trigger may not be set up correctly. ' +
            'Please run the supabase-schema.sql file in your Supabase SQL Editor.'
          )
        }

        throw new Error(`Unable to fetch user profile: ${profileError.message}`)
      }

      const userTypeFromProfile = profile?.user_type
      console.log('User type from profile:', userTypeFromProfile)

      if (userTypeFromProfile === 'worker') {
        console.log('Redirecting to /discover')
        window.location.href = '/discover'
      } else if (userTypeFromProfile === 'restaurant') {
        console.log('Redirecting to /restaurant/dashboard')
        window.location.href = '/restaurant/dashboard'
      } else {
        throw new Error('Invalid user type. Please contact support.')
      }
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Log in as a {userType === 'worker' ? 'Worker' : 'Restaurant'}
          </p>
        </div>

        {currentUser && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
            You are already logged in as {currentUser.email}.{' '}
            <button onClick={handleLogout} className="underline font-medium">
              Log out
            </button>{' '}
            to sign in with a different account.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup?type=${userType}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

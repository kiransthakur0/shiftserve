import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Debug: Log what we're seeing (will show in browser console)
  console.log('Creating Supabase client...')
  console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables!')
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')))
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file or Vercel environment variables.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'See VERCEL_SETUP.md for deployment instructions.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

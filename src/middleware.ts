import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Missing Supabase environment variables in middleware.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'See VERCEL_SETUP.md for deployment instructions.'
    )
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If not logged in and trying to access protected route, redirect to home
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If logged in, enforce user type separation
  if (user) {
    // Fetch user type from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const userType = profile?.user_type

    if (userType) {
      const isWorkerRoute = pathname.startsWith('/worker') || pathname === '/discover'
      const isRestaurantRoute = pathname.startsWith('/restaurant')
      const isOnboardingRoute = pathname.startsWith('/onboarding')

      // Prevent workers from accessing restaurant routes
      if (userType === 'worker' && isRestaurantRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/discover'
        return NextResponse.redirect(url)
      }

      // Prevent restaurants from accessing worker routes
      if (userType === 'restaurant' && isWorkerRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/restaurant/dashboard'
        return NextResponse.redirect(url)
      }

      // Prevent accessing wrong onboarding
      if (isOnboardingRoute) {
        if (userType === 'worker' && pathname.includes('/restaurant')) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding/worker'
          return NextResponse.redirect(url)
        }
        if (userType === 'restaurant' && pathname.includes('/worker')) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding/restaurant'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

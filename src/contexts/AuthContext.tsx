'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

type UserType = 'worker' | 'restaurant' | null;

interface AuthContextType {
  user: User | null;
  userType: UserType;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserType: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserType = async (userId: string, userMetadata?: Record<string, unknown>): Promise<UserType> => {
    try {
      console.log('🔍 Fetching user type for user:', userId);
      console.log('📦 User metadata:', userMetadata);

      const supabase = createClient();

      // Add a timeout to the query
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('⏱️ Database query timeout - using metadata fallback');
          resolve(null);
        }, 3000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result === null) {
        // Timeout occurred, use metadata
        const metadataType = userMetadata?.user_type as UserType;
        console.log('⚠️ Using user_type from metadata:', metadataType);
        return metadataType || null;
      }

      const { data, error } = result;

      if (error) {
        console.error('❌ Error fetching user type from profiles:', error);
        console.error('Error code:', error.code, 'Error message:', error.message);

        // Fallback to user metadata
        const metadataType = userMetadata?.user_type as UserType;
        console.log('🔄 Falling back to metadata user_type:', metadataType);
        return metadataType || null;
      }

      console.log('✅ User type fetched successfully from database:', data?.user_type);
      return data?.user_type as UserType;
    } catch (err) {
      console.error('❌ Exception in fetchUserType:', err);
      // Last resort: use metadata
      const metadataType = userMetadata?.user_type as UserType;
      console.log('🔄 Exception - falling back to metadata:', metadataType);
      return metadataType || null;
    }
  };

  const refreshUserType = async () => {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (currentUser) {
      const type = await fetchUserType(currentUser.id);
      setUserType(type);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.error('⏱️ Auth loading timeout - forcing loading to false after 10 seconds');
        setLoading(false);
      }
    }, 10000);

    // Get initial session
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('📝 Current user:', currentUser ? currentUser.email : 'none');

        if (currentUser) {
          setUser(currentUser);
          // Fetch user type from database profiles table (with metadata fallback)
          const type = await fetchUserType(currentUser.id, currentUser.user_metadata);
          console.log('📋 User type result:', type);
          setUserType(type);
        } else {
          console.log('ℹ️ No user found, setting state to null');
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setUser(null);
        setUserType(null);
      } finally {
        console.log('✅ Auth initialization complete, setting loading to false');
        if (isMounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (session?.user) {
        setUser(session.user);
        const type = await fetchUserType(session.user.id, session.user.user_metadata);
        setUserType(type);
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Route protection effect
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/auth/login', '/auth/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not logged in and trying to access protected route
    if (!user && !isPublicRoute) {
      router.push('/');
      return;
    }

    // If logged in and on login/signup page, redirect to appropriate dashboard
    if (user && userType && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      console.log('User already logged in, redirecting from auth pages...');
      if (userType === 'worker') {
        router.push('/discover');
      } else if (userType === 'restaurant') {
        router.push('/restaurant/dashboard');
      }
      return;
    }

    // If logged in, check user type matches route
    if (user && userType) {
      const isWorkerRoute = pathname.startsWith('/worker') || pathname === '/discover';
      const isRestaurantRoute = pathname.startsWith('/restaurant');
      const isOnboardingRoute = pathname.startsWith('/onboarding');

      // Prevent workers from accessing restaurant routes
      if (userType === 'worker' && isRestaurantRoute) {
        console.warn('Worker attempting to access restaurant route, redirecting...');
        router.push('/discover');
        return;
      }

      // Prevent restaurants from accessing worker routes
      if (userType === 'restaurant' && isWorkerRoute) {
        console.warn('Restaurant attempting to access worker route, redirecting...');
        router.push('/restaurant/dashboard');
        return;
      }

      // Prevent accessing wrong onboarding
      if (isOnboardingRoute) {
        if (userType === 'worker' && pathname.includes('/restaurant')) {
          router.push('/onboarding/worker');
          return;
        }
        if (userType === 'restaurant' && pathname.includes('/worker')) {
          router.push('/onboarding/restaurant');
          return;
        }
      }
    }
  }, [user, userType, loading, pathname, router]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, userType, loading, signOut, refreshUserType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

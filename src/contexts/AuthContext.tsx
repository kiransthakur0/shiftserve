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

  const fetchUserType = async (userId: string): Promise<UserType> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user type from profiles:', error);
        return null;
      }

      return data?.user_type as UserType;
    } catch (err) {
      console.error('Error in fetchUserType:', err);
      return null;
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

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          // Fetch user type from database profiles table
          const type = await fetchUserType(currentUser.id);
          setUserType(type);
        } else {
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const type = await fetchUserType(session.user.id);
        setUserType(type);
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => {
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

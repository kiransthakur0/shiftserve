-- ====================================================
-- COMPLETE FIX: Profiles table, RLS policies, and auth trigger
-- ====================================================
-- This is a comprehensive fix that includes the missing INSERT policy
-- and ensures profiles are created properly for all users.
--
-- Run this in Supabase SQL Editor
-- ====================================================

-- Step 1: Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  user_type TEXT CHECK (user_type IN ('worker', 'restaurant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;

-- Step 4: Create RLS policies (including INSERT which was missing!)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 5: Create or replace the trigger function
-- This function will be called automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'worker'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 6: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Backfill profiles for ALL existing users
-- This will create profiles for any users that don't have one yet
INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'user_type', 'worker') as user_type,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
  updated_at = NOW();

-- Step 8: Verify the setup
SELECT
  'Profiles created: ' || COUNT(*)::TEXT as status
FROM public.profiles;

-- Step 9: Show all profiles (for debugging)
SELECT
  id,
  email,
  user_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Step 10: Verify trigger exists
SELECT
  'Trigger status: ' ||
  CASE
    WHEN COUNT(*) > 0 THEN 'INSTALLED'
    ELSE 'MISSING'
  END as trigger_status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 11: Verify RLS policies
SELECT
  'RLS Policies: ' || COUNT(*)::TEXT || ' policies found'
FROM pg_policies
WHERE tablename = 'profiles';

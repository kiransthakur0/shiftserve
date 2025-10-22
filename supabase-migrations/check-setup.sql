-- ====================================================
-- DIAGNOSTIC QUERY - Check Database Setup
-- ====================================================
-- Run this in Supabase SQL Editor to see what's happening
-- ====================================================

-- 1. Check if profiles table exists
SELECT 'Profiles table: ' ||
  CASE
    WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public')
    THEN 'EXISTS ✓'
    ELSE 'MISSING ✗'
  END as status;

-- 2. Check how many auth users exist
SELECT 'Auth users: ' || COUNT(*)::TEXT as count FROM auth.users;

-- 3. List all auth users (without showing sensitive data)
SELECT
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type_in_metadata,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 4. Check how many profiles exist
SELECT 'Profiles: ' || COUNT(*)::TEXT as count FROM public.profiles;

-- 5. List all profiles
SELECT
  id,
  email,
  user_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 6. Check if trigger exists
SELECT
  'Trigger: ' ||
  CASE
    WHEN COUNT(*) > 0 THEN 'INSTALLED ✓'
    ELSE 'MISSING ✗'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 7. Check RLS policies
SELECT
  'RLS Policies: ' || COUNT(*)::TEXT || ' found'
FROM pg_policies
WHERE tablename = 'profiles';

-- 8. List RLS policies
SELECT
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'profiles';

-- 9. Check if RLS is enabled
SELECT
  'RLS Status: ' ||
  CASE
    WHEN relrowsecurity THEN 'ENABLED ✓'
    ELSE 'DISABLED ✗'
  END as status
FROM pg_class
WHERE relname = 'profiles' AND relnamespace = 'public'::regnamespace;

-- 10. Find users WITHOUT profiles (the problem!)
SELECT
  'Users without profiles: ' || COUNT(*)::TEXT as missing_profiles
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 11. Show which users are missing profiles
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'user_type' as should_be_type,
  'MISSING PROFILE!' as status
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

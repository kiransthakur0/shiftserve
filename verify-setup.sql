-- Verification Script for ShiftServe Database Setup
-- Run this in your Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. Check if trigger function exists
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'handle_new_user'
) AS trigger_function_exists;

-- 3. Check if trigger exists on auth.users
SELECT EXISTS (
  SELECT FROM pg_trigger
  WHERE tgname = 'on_auth_user_created'
) AS trigger_exists;

-- 4. List all profiles (to see if any exist)
SELECT id, email, user_type, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Count profiles by user type
SELECT user_type, COUNT(*) as count
FROM profiles
GROUP BY user_type;

-- ====================================
-- If the above shows missing items, you need to run supabase-schema.sql
-- ====================================

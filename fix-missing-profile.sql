-- Fix Missing Profile for Existing User
-- If you already created an account but the trigger didn't create a profile,
-- this script will manually create one for you.

-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE' with your actual email address
-- 2. Replace 'restaurant' with 'worker' if you're a worker account
-- 3. Run this in your Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Check if profile already exists
SELECT id, email, user_type
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 3: If user exists but profile doesn't, create it
-- Change 'restaurant' to 'worker' if needed
INSERT INTO profiles (id, email, user_type)
SELECT id, email, 'restaurant'
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
  )
RETURNING *;

-- Step 4: Verify the profile was created
SELECT id, email, user_type, created_at
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE';

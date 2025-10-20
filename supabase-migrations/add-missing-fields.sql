-- Add missing fields to existing tables
-- Run this in your Supabase SQL Editor

-- Add phone field to restaurant_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE restaurant_profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add name field to worker_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'worker_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE worker_profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Add phone field to worker_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'worker_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE worker_profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add email field to restaurant_profiles if it doesn't exist (for convenience)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE restaurant_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add email field to worker_profiles if it doesn't exist (for convenience)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'worker_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE worker_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

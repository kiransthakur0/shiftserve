-- ShiftServe Database Schema
-- Run this in your Supabase SQL Editor
--
-- IMPORTANT: Choose one of the following options:
--
-- Option 1: FRESH INSTALL (drops all existing data)
--   Uncomment the "DROP" statements below if you want to start fresh
--
-- Option 2: UPDATE EXISTING (preserves data)
--   Keep the "DROP" statements commented out

-- ============================================
-- UNCOMMENT BELOW FOR FRESH INSTALL ONLY
-- ============================================
-- DROP TABLE IF EXISTS shift_applications CASCADE;
-- DROP TABLE IF EXISTS shifts CASCADE;
-- DROP TABLE IF EXISTS restaurant_profiles CASCADE;
-- DROP TABLE IF EXISTS worker_profiles CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('worker', 'restaurant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker profiles table
CREATE TABLE IF NOT EXISTS worker_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  certifications TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  service_radius INTEGER DEFAULT 10,
  experience TEXT CHECK (experience IN ('entry', 'intermediate', 'experienced', 'expert')),
  availability JSONB DEFAULT '{}',
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant profiles table
CREATE TABLE IF NOT EXISTS restaurant_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  restaurant_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  description TEXT,
  cuisine_type TEXT,
  restaurant_type TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  operating_hours JSONB DEFAULT '{}',
  pay_range JSONB DEFAULT '{"min": 0, "max": 0}',
  common_roles TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  manager_name TEXT,
  manager_phone TEXT,
  manager_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_name TEXT NOT NULL,
  role TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  duration TEXT NOT NULL,
  start_time TIME NOT NULL,
  shift_date DATE NOT NULL,
  urgent BOOLEAN DEFAULT FALSE,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  bonus_percentage INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published', 'filled', 'cancelled')) DEFAULT 'draft',
  filled_by UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift applications table
CREATE TABLE IF NOT EXISTS shift_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, worker_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_user_id ON restaurant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant_id ON shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_applications_shift_id ON shift_applications(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_worker_id ON shift_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_status ON shift_applications(status);

-- Create spatial indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_worker_profiles_location ON worker_profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_location ON restaurant_profiles USING GIST(location);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Workers can view their own profile" ON worker_profiles;
  DROP POLICY IF EXISTS "Workers can update their own profile" ON worker_profiles;
  DROP POLICY IF EXISTS "Workers can insert their own profile" ON worker_profiles;
  DROP POLICY IF EXISTS "Restaurants can view worker profiles" ON worker_profiles;
  DROP POLICY IF EXISTS "Restaurants can view their own profile" ON restaurant_profiles;
  DROP POLICY IF EXISTS "Restaurants can update their own profile" ON restaurant_profiles;
  DROP POLICY IF EXISTS "Restaurants can insert their own profile" ON restaurant_profiles;
  DROP POLICY IF EXISTS "Workers can view restaurant profiles" ON restaurant_profiles;
  DROP POLICY IF EXISTS "Anyone authenticated can view published shifts" ON shifts;
  DROP POLICY IF EXISTS "Restaurants can view their own shifts" ON shifts;
  DROP POLICY IF EXISTS "Restaurants can insert their own shifts" ON shifts;
  DROP POLICY IF EXISTS "Restaurants can update their own shifts" ON shifts;
  DROP POLICY IF EXISTS "Restaurants can delete their own shifts" ON shifts;
  DROP POLICY IF EXISTS "Workers can view their own applications" ON shift_applications;
  DROP POLICY IF EXISTS "Restaurants can view applications for their shifts" ON shift_applications;
  DROP POLICY IF EXISTS "Workers can insert their own applications" ON shift_applications;
  DROP POLICY IF EXISTS "Workers can update their own applications" ON shift_applications;
  DROP POLICY IF EXISTS "Restaurants can update applications for their shifts" ON shift_applications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Worker profiles policies
CREATE POLICY "Workers can view their own profile" ON worker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workers can update their own profile" ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Workers can insert their own profile" ON worker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurants can view worker profiles" ON worker_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'restaurant'
    )
  );

-- Restaurant profiles policies
CREATE POLICY "Restaurants can view their own profile" ON restaurant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can update their own profile" ON restaurant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can insert their own profile" ON restaurant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workers can view restaurant profiles" ON restaurant_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'worker'
    )
  );

-- Shifts policies
CREATE POLICY "Anyone authenticated can view published shifts" ON shifts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Restaurants can view their own shifts" ON shifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurant_profiles
      WHERE restaurant_profiles.id = shifts.restaurant_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can insert their own shifts" ON shifts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_profiles
      WHERE restaurant_profiles.id = shifts.restaurant_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can update their own shifts" ON shifts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurant_profiles
      WHERE restaurant_profiles.id = shifts.restaurant_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can delete their own shifts" ON shifts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurant_profiles
      WHERE restaurant_profiles.id = shifts.restaurant_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

-- Shift applications policies
CREATE POLICY "Workers can view their own applications" ON shift_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM worker_profiles
      WHERE worker_profiles.id = shift_applications.worker_id
      AND worker_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can view applications for their shifts" ON shift_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shifts
      JOIN restaurant_profiles ON restaurant_profiles.id = shifts.restaurant_id
      WHERE shifts.id = shift_applications.shift_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert their own applications" ON shift_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM worker_profiles
      WHERE worker_profiles.id = shift_applications.worker_id
      AND worker_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update their own applications" ON shift_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM worker_profiles
      WHERE worker_profiles.id = shift_applications.worker_id
      AND worker_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can update applications for their shifts" ON shift_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shifts
      JOIN restaurant_profiles ON restaurant_profiles.id = shifts.restaurant_id
      WHERE shifts.id = shift_applications.shift_id
      AND restaurant_profiles.user_id = auth.uid()
    )
  );

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_profiles_updated_at ON worker_profiles;
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurant_profiles_updated_at ON restaurant_profiles;
CREATE TRIGGER update_restaurant_profiles_updated_at BEFORE UPDATE ON restaurant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_applications_updated_at ON shift_applications;
CREATE TRIGGER update_shift_applications_updated_at BEFORE UPDATE ON shift_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'user_type');
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip insertion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

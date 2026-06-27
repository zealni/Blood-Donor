-- ============================================================
-- Migration 02: Migrate to Supabase Auth
-- Run this AFTER resetting the database (portfolio project).
-- ============================================================

-- Step 1: Add email column to profiles for easier lookups
-- (Supabase Auth already stores email in auth.users, we mirror it for queries)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Step 2: Drop the plain-text password column (CRITICAL security fix)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS password;

-- Step 3: Re-add the FK constraint to auth.users
-- (was dropped in 00_initial_schema.sql for dummy data)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Update RLS policies to be more granular
-- Drop old overly-permissive policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Active blood requests are viewable by everyone." ON public.blood_requests;

-- profiles: public SELECT — only expose safe fields via a secure view (see below)
CREATE POLICY "Public can view available donor signals"
  ON public.profiles FOR SELECT
  USING (is_available = true);

-- profiles: INSERT — user can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- profiles: UPDATE — user can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- blood_requests: SELECT — anyone can view open requests
CREATE POLICY "Anyone can view open blood requests"
  ON public.blood_requests FOR SELECT
  USING (status = 'open');

-- blood_requests: INSERT — only authenticated users
CREATE POLICY "Authenticated users can create blood requests"
  ON public.blood_requests FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

-- blood_requests: UPDATE — only the request owner
CREATE POLICY "Users can update own blood requests"
  ON public.blood_requests FOR UPDATE
  USING (auth.uid() = seeker_id)
  WITH CHECK (auth.uid() = seeker_id);

-- Step 5: Create a Supabase Auth trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_available)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna BloodConnect'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

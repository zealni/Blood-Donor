-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  blood_type text CHECK (blood_type IN ('A', 'B', 'AB', 'O')),
  rhesus text CHECK (rhesus IN ('+', '-')),
  last_donation date,
  location geography(POINT),
  is_available boolean DEFAULT true
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create blood_requests table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_name text NOT NULL,
  hospital_coord geography(POINT),
  blood_type text CHECK (blood_type IN ('A', 'B', 'AB', 'O')),
  rhesus text CHECK (rhesus IN ('+', '-')),
  bags_needed integer NOT NULL DEFAULT 1,
  urgency text CHECK (urgency IN ('Kritis', 'Tinggi', 'Sedang')),
  status text CHECK (status IN ('open', 'fulfilled', 'expired')) DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for blood_requests
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_requests (public can read for now, for homepage display)
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Active blood requests are viewable by everyone."
  ON public.blood_requests FOR SELECT
  USING ( status = 'open' );

-- Spatial Views for Frontend Map

-- 1. View for Seekers (Blood Requests)
CREATE OR REPLACE VIEW public.vw_seeker_signals AS
SELECT 
    id,
    'seeker' as type,
    hospital_name as location,
    blood_type,
    urgency,
    rhesus,
    bags_needed,
    created_at as time_ago, -- we will handle time in JS
    st_y(hospital_coord::geometry) as lat,
    st_x(hospital_coord::geometry) as lng
FROM public.blood_requests
WHERE status = 'open' AND hospital_coord IS NOT NULL;

-- 2. View for Donors (Available Profiles)
CREATE OR REPLACE VIEW public.vw_donor_signals AS
SELECT 
    id,
    'donor' as type,
    'Pendonor Siaga' as location,
    blood_type,
    'Sedia' as urgency,
    rhesus,
    1 as bags_needed,
    last_donation as time_ago,
    st_y(location::geometry) as lat,
    st_x(location::geometry) as lng
FROM public.profiles
WHERE is_available = true AND location IS NOT NULL;

-- Temporarily drop the FK constraint on profiles to allow dummy data without auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert spatial dummy data (Ensure to Truncate first if needed)
-- Using Jogja coordinates (longitude, latitude)
INSERT INTO public.blood_requests (hospital_name, hospital_coord, blood_type, rhesus, bags_needed, urgency, status, created_at)
VALUES 
    ('RSUP Dr. Sardjito', extensions.st_point(110.373, -7.768), 'A', '+', 2, 'Kritis', 'open', now() - interval '5 minutes'),
    ('RS Panti Rapih', extensions.st_point(110.378, -7.783), 'AB', '+', 3, 'Tinggi', 'open', now() - interval '34 minutes'),
    ('RS Bethesda', extensions.st_point(110.370, -7.785), 'O', '-', 1, 'Sedang', 'open', now() - interval '60 minutes'),
    ('RS JIH', extensions.st_point(110.404, -7.758), 'B', '+', 2, 'Kritis', 'open', now() - interval '55 minutes');

-- Insert spatial dummy donors
INSERT INTO public.profiles (id, full_name, blood_type, rhesus, is_available, location)
VALUES 
    (gen_random_uuid(), 'Pendonor 1', 'O', '+', true, extensions.st_point(110.368, -7.772)),
    (gen_random_uuid(), 'Pendonor 2', 'B', '+', true, extensions.st_point(110.383, -7.787)),
    (gen_random_uuid(), 'Pendonor 3', 'A', '-', true, extensions.st_point(110.365, -7.782)),
    (gen_random_uuid(), 'Pendonor 4', 'A', '+', true, extensions.st_point(110.410, -7.760));

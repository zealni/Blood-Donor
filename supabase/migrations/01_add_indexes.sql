-- Spatial GIST indexes for coordinate search optimizations
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING gist (location);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_coord ON public.blood_requests USING gist (hospital_coord);

-- B-Tree indexes for status and availability filter optimizations
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests (status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_available ON public.profiles (is_available);

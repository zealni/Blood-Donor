-- ============================================================
-- Migration 03: Re-insert safe dummy data (no password, no email)
-- Run this after 02_auth_migration.sql
-- ============================================================

-- Clean up any old plain-text profiles from the old auth system
-- (for portfolio reset - safe to truncate)
TRUNCATE public.blood_requests RESTART IDENTITY CASCADE;
TRUNCATE public.profiles RESTART IDENTITY CASCADE;

-- Re-insert spatial dummy blood requests (no user auth needed for seeker_id)
INSERT INTO public.blood_requests (hospital_name, hospital_coord, blood_type, rhesus, bags_needed, urgency, status, created_at)
VALUES
    ('RSUP Dr. Sardjito', extensions.st_point(110.373, -7.768), 'A', '+', 2, 'Kritis', 'open', now() - interval '5 minutes'),
    ('RS Panti Rapih', extensions.st_point(110.378, -7.783), 'AB', '+', 3, 'Tinggi', 'open', now() - interval '34 minutes'),
    ('RS Bethesda', extensions.st_point(110.370, -7.785), 'O', '-', 1, 'Sedang', 'open', now() - interval '60 minutes'),
    ('RS JIH', extensions.st_point(110.404, -7.758), 'B', '+', 2, 'Kritis', 'open', now() - interval '55 minutes');

-- Re-insert dummy donor profiles (no password, no email — these are display-only signals)
-- Note: These don't link to auth.users, they are used only for map visualization
INSERT INTO public.profiles (id, full_name, blood_type, rhesus, is_available, location)
VALUES
    (gen_random_uuid(), 'Pendonor 1', 'O', '+', true, extensions.st_point(110.368, -7.772)),
    (gen_random_uuid(), 'Pendonor 2', 'B', '+', true, extensions.st_point(110.383, -7.787)),
    (gen_random_uuid(), 'Pendonor 3', 'A', '-', true, extensions.st_point(110.365, -7.782)),
    (gen_random_uuid(), 'Pendonor 4', 'A', '+', true, extensions.st_point(110.410, -7.760));

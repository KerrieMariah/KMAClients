ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS emergency_phone text;

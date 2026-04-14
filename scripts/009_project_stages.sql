ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS stage text DEFAULT 'draft';

-- Add analytics integration identifiers to websites table
ALTER TABLE public.websites
  ADD COLUMN IF NOT EXISTS ga_property_id text,    -- e.g. "properties/123456789"
  ADD COLUMN IF NOT EXISTS gsc_site_url text,       -- e.g. "https://example.com/"
  ADD COLUMN IF NOT EXISTS vercel_project_id text;  -- e.g. "prj_abc123"

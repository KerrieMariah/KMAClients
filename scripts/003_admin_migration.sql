-- Add is_admin flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Admin full access policies for every table
-- Profiles
CREATE POLICY "admin_full_access_profiles" ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Projects
CREATE POLICY "admin_full_access_projects" ON public.projects FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Websites
CREATE POLICY "admin_full_access_websites" ON public.websites FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Subscriptions
CREATE POLICY "admin_full_access_subscriptions" ON public.subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Documents
CREATE POLICY "admin_full_access_documents" ON public.documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Bookings
CREATE POLICY "admin_full_access_bookings" ON public.bookings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Time slots - admin full access
CREATE POLICY "admin_full_access_time_slots" ON public.time_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

-- Storage policies for project-images (public read, admin write)
CREATE POLICY "public_read_project_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');
CREATE POLICY "admin_write_project_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin_delete_project_images" ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Storage policies for documents (owner read via documents table lookup, admin write)
CREATE POLICY "owner_read_documents" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.file_url LIKE '%' || storage.objects.name
          AND d.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
      )
    )
  );
CREATE POLICY "admin_write_documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin_delete_documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

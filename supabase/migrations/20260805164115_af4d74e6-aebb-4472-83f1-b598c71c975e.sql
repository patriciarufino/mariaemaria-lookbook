
CREATE POLICY "admins read lookbook objects" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lookbook' AND public.is_admin(auth.uid()));
CREATE POLICY "admins insert lookbook objects" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lookbook' AND public.is_admin(auth.uid()));
CREATE POLICY "admins update lookbook objects" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lookbook' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'lookbook' AND public.is_admin(auth.uid()));
CREATE POLICY "admins delete lookbook objects" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lookbook' AND public.is_admin(auth.uid()));

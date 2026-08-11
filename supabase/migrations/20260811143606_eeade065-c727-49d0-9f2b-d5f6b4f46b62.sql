CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role IN ('admin'::app_role, 'principal'::app_role)
      AND p.is_active = true
  )
$$;

DROP POLICY IF EXISTS "auth reads gallery images" ON public.gallery_images;
CREATE POLICY "auth reads gallery images"
ON public.gallery_images
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.galleries g
    WHERE g.id = gallery_images.gallery_id AND g.status = 'published'
  )
);

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_look_publish() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_admin_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
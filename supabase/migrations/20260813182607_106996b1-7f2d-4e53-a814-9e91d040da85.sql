CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '/',
  referrer text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  visitor_key text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.site_visits TO anon, authenticated;
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can log a visit" ON public.site_visits
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read visits" ON public.site_visits
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE INDEX site_visits_created_at_idx ON public.site_visits (created_at DESC);
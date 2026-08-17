CREATE TABLE public.consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL DEFAULT '',
  photo text,
  custom_message text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.consultants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultants TO authenticated;
GRANT ALL ON public.consultants TO service_role;
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active consultants" ON public.consultants FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth reads consultants" ON public.consultants FOR SELECT TO authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage consultants" ON public.consultants FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_consultants_touch BEFORE UPDATE ON public.consultants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.look_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'click',
  look_id uuid REFERENCES public.looks(id) ON DELETE SET NULL,
  look_reference text NOT NULL DEFAULT '',
  consultant_id uuid REFERENCES public.consultants(id) ON DELETE SET NULL,
  consultant_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.look_contacts TO anon;
GRANT SELECT, INSERT ON public.look_contacts TO authenticated;
GRANT ALL ON public.look_contacts TO service_role;
ALTER TABLE public.look_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log an interaction" ON public.look_contacts FOR INSERT TO anon, authenticated WITH CHECK (event_type IN ('click','contact'));
CREATE POLICY "admins read interactions" ON public.look_contacts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX idx_look_contacts_created_at ON public.look_contacts (created_at DESC);
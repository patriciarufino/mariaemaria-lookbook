
-- ========== ROLES / PROFILES ==========
CREATE TYPE public.app_role AS ENUM ('principal', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id AND p.is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_principal(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id AND ur.role = 'principal' AND p.is_active = true
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_principal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_principal(uuid) TO authenticated, anon, service_role;

CREATE POLICY "admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "self read profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "self update profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "principal manages profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.is_principal(auth.uid())) WITH CHECK (public.is_principal(auth.uid()));

CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

-- limite de 3 administradores (backend)
CREATE OR REPLACE FUNCTION public.enforce_admin_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE total int;
BEGIN
  SELECT count(DISTINCT user_id) INTO total FROM public.user_roles;
  IF total > 3 THEN
    RAISE EXCEPTION 'Limite de 3 administradores atingido';
  END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER trg_admin_limit AFTER INSERT ON public.user_roles
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_limit();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== LOOKS ==========
CREATE TABLE public.looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  full_look_image text,
  detail_image text,
  status text NOT NULL DEFAULT 'draft',
  display_order int NOT NULL DEFAULT 0,
  whatsapp_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.looks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.looks TO authenticated;
GRANT ALL ON public.looks TO service_role;
ALTER TABLE public.looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published looks" ON public.looks FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "admins read all looks" ON public.looks FOR SELECT TO authenticated USING (status = 'published' OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage looks" ON public.looks FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_looks_touch BEFORE UPDATE ON public.looks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.check_look_publish()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND (NEW.full_look_image IS NULL OR NEW.full_look_image = '' OR NEW.detail_image IS NULL OR NEW.detail_image = '') THEN
    RAISE EXCEPTION 'Este look precisa de duas imagens: uma foto do look completo e uma foto de detalhe.';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_look_publish BEFORE INSERT OR UPDATE ON public.looks FOR EACH ROW EXECUTE FUNCTION public.check_look_publish();

-- ========== FOTOS (biblioteca) ==========
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  label text NOT NULL DEFAULT '',
  look_id uuid REFERENCES public.looks(id) ON DELETE SET NULL,
  image_role text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active photos" ON public.photos FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth reads photos" ON public.photos FOR SELECT TO authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage photos" ON public.photos FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_photos_touch BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========== GALERIAS ==========
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.galleries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.galleries TO authenticated;
GRANT ALL ON public.galleries TO service_role;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published galleries" ON public.galleries FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "auth reads galleries" ON public.galleries FOR SELECT TO authenticated USING (status = 'published' OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage galleries" ON public.galleries FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_galleries_touch BEFORE UPDATE ON public.galleries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads gallery images" ON public.gallery_images FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.galleries g WHERE g.id = gallery_id AND g.status = 'published'));
CREATE POLICY "auth reads gallery images" ON public.gallery_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage gallery images" ON public.gallery_images FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ========== TEXTOS ==========
CREATE TABLE public.site_texts (
  key text PRIMARY KEY,
  label text NOT NULL,
  value text NOT NULL DEFAULT '',
  group_name text NOT NULL DEFAULT 'geral',
  display_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_texts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_texts TO authenticated;
GRANT ALL ON public.site_texts TO service_role;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads texts" ON public.site_texts FOR SELECT TO anon USING (true);
CREATE POLICY "auth reads texts" ON public.site_texts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage texts" ON public.site_texts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ========== SEÇÕES ==========
CREATE TABLE public.site_sections (
  key text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads sections" ON public.site_sections FOR SELECT TO anon USING (true);
CREATE POLICY "auth reads sections" ON public.site_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage sections" ON public.site_sections FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ========== CONFIGURAÇÕES (WhatsApp etc) ==========
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "auth reads settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ========== SEED DE CONTEÚDO ==========
INSERT INTO public.site_texts (key, label, value, group_name, display_order) VALUES
('topbar_eyebrow','Faixa superior — etiqueta','Lookbook — Edição 2026','hero',1),
('brand_name','Marca','MARIA e MARIA','hero',2),
('topbar_quote','Faixa superior — frase','“A moda passa, o estilo permanece — e cada cliente merece uma peça que conte a sua história.”','hero',3),
('topbar_subtitle','Faixa superior — apresentação','Uma coleção autoral onde moda e cliente se encontram — vestidos, conjuntos e macacões escolhidos peça a peça.','hero',4),
('nav_link_1','Menu — item 1','Coleção Atual','hero',5),
('nav_link_2','Menu — item 2','Novidades','hero',6),
('hero_eyebrow','Hero — etiqueta','Lookbook — Curadoria 2026','hero',7),
('hero_title','Hero — título','Vestir uma ocasião, como quem escreve uma memória.','hero',8),
('hero_subtitle','Hero — descrição','Peças únicas, cuidadosamente selecionadas para mulheres que valorizam elegância, exclusividade e sofisticação em cada detalhe.','hero',9),
('hero_cta','Hero — botão','Ver coleção atual','hero',10),
('collection_eyebrow','Coleção — etiqueta','Lookbook','colecao',11),
('collection_title','Coleção — título','Coleção Atual','colecao',12),
('collection_description','Coleção — descrição','Bem-vindo ao nosso Lookbook! Aqui você acompanha as principais novidades da loja, com novos looks, tendências e peças selecionadas especialmente para você. Esta página é atualizada frequentemente, por isso salve este link e volte sempre para conferir os últimos lançamentos.','colecao',13),
('look_button','Card — botão','Quero este look','colecao',14),
('lookbook_eyebrow','Lookbook completo — etiqueta','Lookbook completo','lookbook',15),
('lookbook_title','Lookbook completo — título','Toda a coleção, em uma só tela.','lookbook',16),
('lookbook_description','Lookbook completo — texto','Abra o lookbook unificado e percorra as peças da coleção com setas, teclado ou swipe.','lookbook',17),
('lookbook_cta','Lookbook completo — botão','Ver lookbook completo','lookbook',18),
('new_eyebrow','Sempre novo — etiqueta','Sempre novo','sempre_novo',19),
('new_title','Sempre novo — título','Novidades a cada estação.','sempre_novo',20),
('new_description','Sempre novo — texto','Nosso Lookbook é atualizado constantemente com novos produtos, tendências e inspirações. Acompanhe as novidades e volte sempre para descobrir as próximas coleções.','sempre_novo',21),
('footer_message','Rodapé — mensagem','Obrigado pela sua visita! Esperamos você novamente em breve para conferir as próximas novidades da nossa coleção.','rodape',22),
('footer_copyright','Rodapé — direitos','© 2026 Maria e Maria — Lookbook. Todos os direitos reservados.','rodape',23);

INSERT INTO public.site_sections (key, name, is_active, display_order) VALUES
('hero','Hero',true,1),
('colecao','Coleção Atual',true,2),
('lookbook','Lookbook',true,3),
('sempre_novo','Sempre Novo',true,4),
('rodape','Rodapé',true,5);

INSERT INTO public.site_settings (key, value) VALUES
('whatsapp_number','5567999999999'),
('whatsapp_default_message','Olá! Gostaria de saber mais informações sobre a coleção Maria e Maria.'),
('whatsapp_button_text','Quero este look');

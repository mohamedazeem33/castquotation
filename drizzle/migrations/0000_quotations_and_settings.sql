CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL DEFAULT '',
  quote_date text NOT NULL DEFAULT '',
  client_company text NOT NULL DEFAULT '',
  client_address text NOT NULL DEFAULT '',
  attn text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  project_title text NOT NULL DEFAULT '',
  intro_line text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  facilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount text NOT NULL DEFAULT '',
  gst_percent text NOT NULL DEFAULT '',
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  saved_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  saved_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users insert quotations" ON public.quotations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in users update quotations" ON public.quotations FOR UPDATE TO authenticated USING (true) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in users delete quotations" ON public.quotations FOR DELETE TO authenticated USING (true);
CREATE INDEX quotations_saved_at_idx ON public.quotations (saved_at DESC);

CREATE TABLE public.app_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in users update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (auth.uid() IS NOT NULL);
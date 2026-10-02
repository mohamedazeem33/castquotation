import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, totalsOf, type LineItem, type Quote, type Settings } from "./quote-types";

export async function loadSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("app_settings").select("data").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(data.data as Partial<Settings>) } as Settings;
}

export async function saveSettings(s: Settings) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("app_settings").upsert({
    id: 1,
    data: s as never,
    updated_at: new Date().toISOString(),
    updated_by: u.user?.id ?? null,
  });
  if (error) throw error;
}

type Row = {
  id: string;
  ref: string;
  quote_date: string;
  client_company: string;
  client_address: string;
  attn: string;
  client_email: string;
  client_phone: string;
  project_title: string;
  intro_line: string;
  items: unknown;
  facilities: unknown;
  discount: string;
  gst_percent: string;
  saved_at: string;
};

const fromRow = (r: Row): Quote => ({
  id: r.id,
  ref: r.ref,
  date: r.quote_date,
  clientCompany: r.client_company,
  clientAddress: r.client_address,
  attn: r.attn,
  clientEmail: r.client_email,
  clientPhone: r.client_phone,
  projectTitle: r.project_title,
  introLine: r.intro_line,
  items: (r.items as LineItem[]) ?? [],
  facilities: (r.facilities as string[]) ?? [],
  discount: r.discount,
  gstPercent: r.gst_percent,
  savedAt: r.saved_at,
});

export async function loadQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("saved_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => fromRow(r as Row));
}

export async function saveQuote(q: Quote): Promise<Quote> {
  const { data: u } = await supabase.auth.getUser();
  const t = totalsOf(q);
  const { data, error } = await supabase
    .from("quotations")
    .upsert({
      id: q.id,
      ref: q.ref,
      quote_date: q.date,
      client_company: q.clientCompany,
      client_address: q.clientAddress,
      attn: q.attn,
      client_email: q.clientEmail,
      client_phone: q.clientPhone,
      project_title: q.projectTitle,
      intro_line: q.introLine,
      items: q.items as never,
      facilities: q.facilities as never,
      discount: q.discount ?? "",
      gst_percent: q.gstPercent ?? "",
      subtotal: t.subtotal,
      total: t.total,
      saved_at: q.savedAt,
      saved_by: u.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function deleteQuote(id: string) {
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) throw error;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

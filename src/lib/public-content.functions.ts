import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicLook = {
  id: string;
  reference: string;
  full_look_image: string | null;
  detail_image: string | null;
  display_order: number;
  whatsapp_message: string | null;
};

export type SiteContent = {
  texts: Record<string, string>;
  sections: Record<string, boolean>;
  settings: Record<string, string>;
  looks: PublicLook[];
};

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const url = process.env["SUPABASE_URL"]!;
    const client = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const [textsRes, sectionsRes, settingsRes, looksRes] = await Promise.all([
      client.from("site_texts").select("key, value"),
      client.from("site_sections").select("key, is_active"),
      client.from("site_settings").select("key, value"),
      client
        .from("looks")
        .select("id, reference, full_look_image, detail_image, display_order, whatsapp_message")
        .eq("status", "published")
        // Looks mais recentes (maior ordem) aparecem primeiro.
        .order("display_order", { ascending: false }),
    ]);

    const texts: Record<string, string> = {};
    for (const row of textsRes.data ?? []) texts[row.key] = row.value;
    const sections: Record<string, boolean> = {};
    for (const row of sectionsRes.data ?? []) sections[row.key] = row.is_active;
    const settings: Record<string, string> = {};
    for (const row of settingsRes.data ?? []) settings[row.key] = row.value;

    return { texts, sections, settings, looks: (looksRes.data ?? []) as PublicLook[] };
  },
);

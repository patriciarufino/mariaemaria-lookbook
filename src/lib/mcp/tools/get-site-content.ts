import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_site_content",
  title: "Ler conteúdo do site",
  description: "Retorna os textos, as seções e as configurações (WhatsApp) do site.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const [texts, sections, settings] = await Promise.all([
      supabase.from("site_texts").select("key, label, value, group_name").order("display_order"),
      supabase.from("site_sections").select("key, name, is_active").order("display_order"),
      supabase.from("site_settings").select("key, value"),
    ]);
    const error = texts.error ?? sections.error ?? settings.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = {
      texts: texts.data ?? [],
      sections: sections.data ?? [],
      settings: settings.data ?? [],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});

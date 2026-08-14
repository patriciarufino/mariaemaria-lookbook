import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "visit_stats",
  title: "Acessos ao site",
  description:
    "Resumo dos acessos ao site nos últimos dias (total, visitantes diferentes e páginas mais vistas). Requer permissão de administrador.",
  inputSchema: {
    days: z.number().int().min(1).max(90).default(7).describe("Período em dias."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("site_visits")
      .select("path, device, visitor_key, created_at")
      .gte("created_at", since)
      .limit(5000);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = data ?? [];
    const byPath: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const visitors = new Set<string>();
    for (const row of rows) {
      byPath[row.path] = (byPath[row.path] ?? 0) + 1;
      const device = row.device || "desconhecido";
      byDevice[device] = (byDevice[device] ?? 0) + 1;
      if (row.visitor_key) visitors.add(row.visitor_key);
    }
    const payload = { days, visits: rows.length, unique_visitors: visitors.size, byPath, byDevice };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});

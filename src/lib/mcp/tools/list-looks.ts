import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_looks",
  title: "Listar looks",
  description:
    "Lista os looks do lookbook (referência, fotos, ordem e situação), do mais recente para o mais antigo.",
  inputSchema: {
    status: z
      .enum(["published", "draft", "all"])
      .default("all")
      .describe("Filtrar por situação do look."),
    limit: z.number().int().min(1).max(100).default(50).describe("Quantidade máxima de looks."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("looks")
      .select("id, reference, full_look_image, detail_image, status, display_order, whatsapp_message")
      .order("display_order", { ascending: false })
      .limit(limit);
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { looks: data ?? [] },
        };
  },
});

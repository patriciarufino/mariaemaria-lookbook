import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_site_text",
  title: "Atualizar texto do site",
  description:
    "Altera o valor de um texto do site pela sua chave (ex.: hero_title). Requer permissão de administrador.",
  inputSchema: {
    key: z.string().trim().min(1).describe("Chave do texto, como aparece em get_site_content."),
    value: z.string().describe("Novo conteúdo do texto."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ key, value }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("site_texts")
      .update({ value })
      .eq("key", key)
      .select();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return {
        content: [{ type: "text", text: "Texto não encontrado ou sem permissão." }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { text: data[0] },
    };
  },
});

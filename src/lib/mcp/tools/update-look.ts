import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_look",
  title: "Atualizar look",
  description:
    "Atualiza a referência, a situação ou a mensagem de WhatsApp de um look. Requer permissão de administrador.",
  inputSchema: {
    id: z.string().uuid().describe("ID do look."),
    reference: z.string().trim().min(1).optional().describe("Nova referência, ex.: REF 012."),
    status: z.enum(["draft", "published"]).optional().describe("Situação do look."),
    whatsapp_message: z.string().optional().describe("Mensagem enviada no WhatsApp deste look."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, reference, status, whatsapp_message }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    const patch: Record<string, unknown> = {};
    if (reference !== undefined) patch["reference"] = reference;
    if (status !== undefined) patch["status"] = status;
    if (whatsapp_message !== undefined) patch["whatsapp_message"] = whatsapp_message;
    if (!Object.keys(patch).length)
      return { content: [{ type: "text", text: "Nada para atualizar." }], isError: true };

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("looks").update(patch).eq("id", id).select();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return {
        content: [{ type: "text", text: "Look não encontrado ou sem permissão." }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { look: data[0] },
    };
  },
});

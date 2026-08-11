import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Envia uma imagem (base64) para o acervo e devolve a URL pública servida pelo proxy. */
export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        fileName: z.string().min(1).max(160),
        contentType: z.string().min(3).max(80),
        base64: z.string().min(10),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!allowed) throw new Error("Acesso negado.");
    if (!data.contentType.startsWith("image/")) throw new Error("Envie um arquivo de imagem.");

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 15 * 1024 * 1024) throw new Error("Imagem maior que 15MB.");

    const safeName = data.fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    // Sufixo aleatório evita colisão/duplicação quando dois envios acontecem no mesmo ms.
    const path = `looks/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("lookbook")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);

    return { url: `/api/public/img/${path}` };
  });

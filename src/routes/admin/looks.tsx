import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/upload.functions";
import {
  Card,
  PageTitle,
  buttonClass,
  ghostButtonClass,
  inputClass,
  labelClass,
} from "@/components/admin-ui";

export const Route = createFileRoute("/admin/looks")({
  head: () => ({
    meta: [
      { title: "Looks — Maria e Maria" },
      { name: "description", content: "Cadastro e edição dos looks do lookbook Maria e Maria." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Looks — Maria e Maria" },
      { property: "og:description", content: "Cadastro e edição dos looks do lookbook." },
    ],
  }),
  component: LooksAdmin,
});

type Look = {
  id: string;
  reference: string;
  full_look_image: string | null;
  detail_image: string | null;
  display_order: number;
  status: string;
  whatsapp_message: string | null;
};

async function fileToBase64(file: File) {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function LooksAdmin() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data: looks = [] } = useQuery({
    queryKey: ["admin", "looks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("looks")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Look[];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["site-content"] });
  };

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Look> }) => {
      const { error } = await supabase.from("looks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: async () => {
      const next = (looks.at(-1)?.display_order ?? 0) + 1;
      const { error } = await supabase.from("looks").insert({
        reference: `REF ${String(next).padStart(3, "0")}`,
        display_order: next,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Look criado como rascunho.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("looks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Look removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function swap(index: number, direction: -1 | 1) {
    const a = looks[index];
    const b = looks[index + direction];
    if (!a || !b) return;
    await update.mutateAsync({ id: a.id, patch: { display_order: b.display_order } });
    await update.mutateAsync({ id: b.id, patch: { display_order: a.display_order } });
  }

  async function handleUpload(look: Look, field: "full_look_image" | "detail_image", file: File) {
    setBusy(`${look.id}-${field}`);
    try {
      const { url } = await uploadImage({
        data: {
          fileName: file.name,
          contentType: file.type,
          base64: await fileToBase64(file),
        },
      });
      await update.mutateAsync({ id: look.id, patch: { [field]: url } });
      toast.success("Imagem atualizada.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageTitle
        title="Looks"
        description="Cada look tem duas imagens: o look completo e o detalhe. Publique quando estiver pronto."
      />

      <button className={buttonClass} onClick={() => create.mutate()} disabled={create.isPending}>
        Novo look
      </button>

      <div className="mt-8 space-y-6">
        {looks.map((look, index) => (
          <Card key={look.id}>
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="grid grid-cols-2 gap-3">
                {(["full_look_image", "detail_image"] as const).map((field) => (
                  <label key={field} className="cursor-pointer">
                    <span className={labelClass}>
                      {field === "full_look_image" ? "Look completo" : "Detalhe"}
                    </span>
                    <div className="mt-2 flex aspect-[3/4] items-center justify-center overflow-hidden border border-dashed border-border bg-surface-alt text-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {look[field] ? (
                        <img src={look[field]!} alt="" className="h-full w-full object-cover" />
                      ) : busy === `${look.id}-${field}` ? (
                        "Enviando..."
                      ) : (
                        "Enviar"
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(look, field, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>Referência</span>
                    <input
                      className={`${inputClass} mt-2`}
                      defaultValue={look.reference}
                      onBlur={(e) =>
                        e.target.value !== look.reference &&
                        update.mutate({ id: look.id, patch: { reference: e.target.value } })
                      }
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Situação</span>
                    <select
                      className={`${inputClass} mt-2`}
                      value={look.status}
                      onChange={(e) =>
                        update.mutate({ id: look.id, patch: { status: e.target.value } })
                      }
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className={labelClass}>Mensagem do WhatsApp</span>
                  <textarea
                    rows={2}
                    className={`${inputClass} mt-2`}
                    defaultValue={look.whatsapp_message ?? ""}
                    onBlur={(e) =>
                      e.target.value !== (look.whatsapp_message ?? "") &&
                      update.mutate({ id: look.id, patch: { whatsapp_message: e.target.value } })
                    }
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={ghostButtonClass}
                    onClick={() => void swap(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="mr-2 h-3 w-3" /> Subir
                  </button>
                  <button
                    className={ghostButtonClass}
                    onClick={() => void swap(index, 1)}
                    disabled={index === looks.length - 1}
                  >
                    <ArrowDown className="mr-2 h-3 w-3" /> Descer
                  </button>
                  <button
                    className={ghostButtonClass}
                    onClick={() => {
                      if (confirm(`Remover ${look.reference}?`)) remove.mutate(look.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-3 w-3" /> Remover
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

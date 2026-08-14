import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { uploadPhoto } from "@/lib/image-upload";
import { PhotoSlot } from "@/components/photo-slot";
import { BulkLookForm, NewLookForm } from "@/components/look-uploader";
import {
  Card,
  PageTitle,
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


function LooksAdmin() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data: looks = [] } = useQuery({
    queryKey: ["admin", "looks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("looks")
        .select("*")
        .order("display_order", { ascending: false });
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

  /** Substitui apenas uma das fotos, sem tocar no restante do look. */
  async function handleUpload(look: Look, field: "full_look_image" | "detail_image", file: File) {
    setBusy(`${look.id}-${field}`);
    try {
      const url = await uploadPhoto(file);
      const other = field === "full_look_image" ? look.detail_image : look.full_look_image;
      await update.mutateAsync({
        id: look.id,
        patch: { [field]: url, ...(other ? { status: "published" } : {}) },
      });
      toast.success("Foto atualizada.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  /** Remove a foto do look (o look continua existindo, como rascunho). */
  async function handleClear(look: Look, field: "full_look_image" | "detail_image") {
    setBusy(`${look.id}-${field}`);
    try {
      await update.mutateAsync({
        id: look.id,
        patch: { [field]: null, ...(look.status === "published" ? { status: "draft" } : {}) },
      });
      toast.success("Foto removida. Envie outra para publicar o look novamente.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  // Lista em ordem decrescente: o primeiro item é o de maior ordem.
  const nextOrder = (looks[0]?.display_order ?? 0) + 1;

  return (
    <div>
      <PageTitle
        title="Looks"
        description="Cada look tem duas imagens: o look completo e o detalhe. Publique quando estiver pronto."
      />

      <div className="space-y-6">
        <NewLookForm nextOrder={nextOrder} onSaved={refresh} />
        <BulkLookForm nextOrder={nextOrder} onSaved={refresh} />
      </div>

      <div className="mt-8 space-y-6">
        {looks.map((look, index) => (
          <Card key={look.id}>
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="grid grid-cols-2 gap-3">
                {(["full_look_image", "detail_image"] as const).map((field) => (
                  <PhotoSlot
                    key={field}
                    label={field === "full_look_image" ? "Foto principal" : "Foto detalhe"}
                    url={look[field]}
                    busy={busy === `${look.id}-${field}`}
                    onSelect={(file) => void handleUpload(look, field, file)}
                    onClear={() => void handleClear(look, field)}
                    onError={toast.error}
                  />
                ))}
              </div>


              <div className="space-y-4">
                <label className="block sm:max-w-xs">
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

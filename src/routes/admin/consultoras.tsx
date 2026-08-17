import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { uploadPhoto } from "@/lib/image-upload";
import { PhotoSlot } from "@/components/photo-slot";
import {
  Card,
  PageTitle,
  buttonClass,
  ghostButtonClass,
  inputClass,
  labelClass,
} from "@/components/admin-ui";

export const Route = createFileRoute("/admin/consultoras")({
  head: () => ({
    meta: [
      { title: "Consultoras — Maria e Maria" },
      { name: "description", content: "Cadastro das consultoras que atendem pelo WhatsApp." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Consultoras — Maria e Maria" },
      { property: "og:description", content: "Cadastro das consultoras de atendimento." },
    ],
  }),
  component: ConsultorasAdmin,
});

type Consultant = {
  id: string;
  name: string;
  whatsapp: string;
  photo: string | null;
  custom_message: string | null;
  is_active: boolean;
  display_order: number;
};

function ConsultorasAdmin() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: consultants = [], isLoading } = useQuery({
    queryKey: ["admin", "consultants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultants")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Consultant[];
    },
  });

  const { data: storeNumber = "" } = useQuery({
    queryKey: ["admin", "settings", "whatsapp_number"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .maybeSingle();
      return data?.value ?? "";
    },
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "consultants"] });
    queryClient.invalidateQueries({ queryKey: ["site-content"] });
  }

  const create = useMutation({
    mutationFn: async () => {
      const name = newName.trim();
      const whatsapp = newNumber.replace(/\D/g, "");
      if (!name) throw new Error("Informe o nome da consultora.");
      if (whatsapp.length < 10) throw new Error("Informe o WhatsApp com DDI e DDD.");
      const order = Math.max(0, ...consultants.map((c) => c.display_order)) + 1;
      const { error } = await supabase
        .from("consultants")
        .insert({ name, whatsapp, display_order: order, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewName("");
      setNewNumber("");
      refresh();
      toast.success("Consultora cadastrada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Consultant> }) => {
      const { error } = await supabase.from("consultants").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => refresh(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("consultants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Consultora excluída.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function changePhoto(id: string, file: File) {
    setBusy(id);
    try {
      const url = await uploadPhoto(file);
      await update.mutateAsync({ id, values: { photo: url } });
      toast.success("Foto atualizada.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const current = consultants[index];
    const target = consultants[index + direction];
    if (!current || !target) return;
    update.mutate({ id: current.id, values: { display_order: target.display_order } });
    update.mutate({ id: target.id, values: { display_order: current.display_order } });
  }

  const active = consultants.filter((c) => c.is_active);

  return (
    <div>
      <PageTitle
        title="Consultoras"
        description="Quem aparece para a cliente escolher depois de clicar em “Quero esse look”."
      />

      {!active.length && !storeNumber && (
        <div className="mb-6 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Nenhuma consultora ativa e nenhum WhatsApp geral configurado. Cadastre uma consultora ou
          preencha o número na aba WhatsApp para o botão continuar funcionando.
        </div>
      )}
      {!active.length && storeNumber && (
        <div className="mb-6 border border-border bg-secondary p-4 text-sm text-muted-foreground">
          Sem consultoras ativas: os botões estão usando o WhatsApp geral da loja.
        </div>
      )}

      <Card>
        <p className={labelClass}>Adicionar consultora</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className={inputClass}
            placeholder="Nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="WhatsApp (ex.: 5567999999999)"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
          />
          <button
            className={buttonClass}
            disabled={create.isPending}
            onClick={() => create.mutate()}
          >
            Adicionar
          </button>
        </div>
      </Card>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}

      <div className="mt-8 space-y-6">
        {consultants.map((consultant, index) => (
          <Card key={consultant.id}>
            <div className="grid gap-6 md:grid-cols-[180px_1fr]">
              <PhotoSlot
                label="Foto"
                url={consultant.photo}
                busy={busy === consultant.id}
                onSelect={(file) => changePhoto(consultant.id, file)}
                onClear={() => update.mutate({ id: consultant.id, values: { photo: null } })}
                onError={(message) => toast.error(message)}
              />

              <div className="space-y-4">
                <label className="block">
                  <span className={labelClass}>Nome</span>
                  <input
                    className={`${inputClass} mt-2`}
                    defaultValue={consultant.name}
                    key={`name-${consultant.id}-${consultant.name}`}
                    onBlur={(e) =>
                      e.target.value.trim() &&
                      e.target.value !== consultant.name &&
                      update.mutate({ id: consultant.id, values: { name: e.target.value.trim() } })
                    }
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>WhatsApp (com DDI e DDD)</span>
                  <input
                    className={`${inputClass} mt-2`}
                    defaultValue={consultant.whatsapp}
                    key={`wa-${consultant.id}-${consultant.whatsapp}`}
                    onBlur={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value !== consultant.whatsapp) {
                        update.mutate({ id: consultant.id, values: { whatsapp: value } });
                      }
                    }}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>
                    Mensagem personalizada (opcional — use [NOME] e [REFERENCIA])
                  </span>
                  <textarea
                    className={`${inputClass} mt-2 h-24`}
                    defaultValue={consultant.custom_message ?? ""}
                    key={`msg-${consultant.id}-${consultant.custom_message ?? ""}`}
                    onBlur={(e) =>
                      e.target.value !== (consultant.custom_message ?? "") &&
                      update.mutate({
                        id: consultant.id,
                        values: { custom_message: e.target.value || null },
                      })
                    }
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className={ghostButtonClass}
                    onClick={() =>
                      update.mutate({
                        id: consultant.id,
                        values: { is_active: !consultant.is_active },
                      })
                    }
                  >
                    {consultant.is_active ? "Ativa — desativar" : "Inativa — ativar"}
                  </button>
                  <button
                    className={ghostButtonClass}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    className={ghostButtonClass}
                    disabled={index === consultants.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    Descer
                  </button>
                  <button
                    className={ghostButtonClass}
                    onClick={() =>
                      confirm(`Excluir ${consultant.name}?`) && remove.mutate(consultant.id)
                    }
                  >
                    Excluir
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

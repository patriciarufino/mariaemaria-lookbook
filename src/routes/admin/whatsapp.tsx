import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle, inputClass, labelClass } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp — Maria e Maria" },
      { name: "description", content: "Número e mensagens padrão do atendimento por WhatsApp." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "WhatsApp — Maria e Maria" },
      { property: "og:description", content: "Número e mensagens padrão do atendimento." },
    ],
  }),
  component: WhatsappAdmin,
});

const fields = [{ key: "whatsapp_button_text", label: "Texto do botão de cada look" }] as const;

function WhatsappAdmin() {
  const queryClient = useQueryClient();

  const { data: settings = {} } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return Object.fromEntries(data.map((row) => [row.key, row.value])) as Record<string, string>;
    },
  });

  const save = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_settings").upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Configuração salva.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageTitle
        title="WhatsApp"
        description="Todos os botões do lookbook levam a uma conversa no WhatsApp."
      />
      <Card>
        <div className="space-y-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className={labelClass}>{field.label}</span>
              <input
                className={`${inputClass} mt-2`}
                defaultValue={settings[field.key] ?? ""}
                key={`${field.key}-${settings[field.key] ?? ""}`}
                onBlur={(e) =>
                  e.target.value !== (settings[field.key] ?? "") &&
                  save.mutate({ key: field.key, value: e.target.value })
                }
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

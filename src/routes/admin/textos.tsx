import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle, inputClass, labelClass } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/textos")({
  head: () => ({
    meta: [
      { title: "Textos — Maria e Maria" },
      { name: "description", content: "Edição dos textos exibidos no lookbook Maria e Maria." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Textos — Maria e Maria" },
      { property: "og:description", content: "Edição dos textos exibidos no lookbook." },
    ],
  }),
  component: TextsAdmin,
});

function TextsAdmin() {
  const queryClient = useQueryClient();

  const { data: texts = [] } = useQuery({
    queryKey: ["admin", "texts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_texts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_texts").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Texto salvo.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = [...new Set(texts.map((t) => t.group_name))];

  return (
    <div>
      <PageTitle
        title="Textos"
        description="Altere qualquer texto do site. Trechos entre *asteriscos* aparecem em itálico."
      />

      <div className="space-y-6">
        {groups.map((group) => (
          <Card key={group}>
            <h2 className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
              {group}
            </h2>
            <div className="mt-5 space-y-5">
              {texts
                .filter((t) => t.group_name === group)
                .map((text) => (
                  <label key={text.key} className="block">
                    <span className={labelClass}>{text.label}</span>
                    <textarea
                      rows={text.value.length > 90 ? 3 : 1}
                      className={`${inputClass} mt-2`}
                      defaultValue={text.value}
                      onBlur={(e) =>
                        e.target.value !== text.value &&
                        update.mutate({ key: text.key, value: e.target.value })
                      }
                    />
                  </label>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

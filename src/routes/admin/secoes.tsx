import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/secoes")({
  head: () => ({
    meta: [
      { title: "Seções — Maria e Maria" },
      { name: "description", content: "Ative ou desative seções da página do lookbook." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Seções — Maria e Maria" },
      { property: "og:description", content: "Ative ou desative seções da página do lookbook." },
    ],
  }),
  component: SectionsAdmin,
});

function SectionsAdmin() {
  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery({
    queryKey: ["admin", "sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ key, is_active }: { key: string; is_active: boolean }) => {
      const { error } = await supabase.from("site_sections").update({ is_active }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Seção atualizada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageTitle title="Seções" description="Escolha o que aparece na página inicial." />
      <Card>
        <ul className="divide-y divide-border">
          {sections.map((section) => (
            <li key={section.key} className="flex items-center justify-between py-4">
              <span className="text-sm text-foreground">{section.name}</span>
              <button
                type="button"
                role="switch"
                aria-checked={section.is_active}
                onClick={() => toggle.mutate({ key: section.key, is_active: !section.is_active })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  section.is_active ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                    section.is_active ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

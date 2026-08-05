import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel — Maria e Maria" },
      { name: "description", content: "Visão geral do conteúdo do lookbook Maria e Maria." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel — Maria e Maria" },
      { property: "og:description", content: "Visão geral do conteúdo do lookbook." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [looks, published, admins] = await Promise.all([
        supabase.from("looks").select("id", { count: "exact", head: true }),
        supabase
          .from("looks")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        looks: looks.count ?? 0,
        published: published.count ?? 0,
        admins: admins.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Looks cadastrados", value: data?.looks ?? "—", to: "/admin/looks" },
    { label: "Looks publicados", value: data?.published ?? "—", to: "/admin/looks" },
    { label: "Administradores", value: `${data?.admins ?? "—"} / 3`, to: "/admin/administradores" },
  ] as const;

  return (
    <div>
      <PageTitle
        title="Painel"
        description="Gerencie os looks, os textos e as configurações do lookbook."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-3 font-serif text-4xl text-brand">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

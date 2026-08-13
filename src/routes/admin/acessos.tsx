import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/acessos")({
  head: () => ({
    meta: [
      { title: "Acessos — Maria e Maria" },
      { name: "description", content: "Quem acessou o lookbook Maria e Maria." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acessos — Maria e Maria" },
      { property: "og:description", content: "Relatório de acessos do lookbook." },
    ],
  }),
  component: AcessosAdmin,
});

type Visit = {
  id: string;
  path: string;
  referrer: string;
  device: string;
  language: string;
  country: string;
  visitor_key: string;
  created_at: string;
};

function fmt(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl text-brand">{value}</p>
    </Card>
  );
}

function AcessosAdmin() {
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ["admin", "visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_visits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Visit[];
    },
  });

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const last24h = visits.filter((v) => now - new Date(v.created_at).getTime() < day);
  const last7d = visits.filter((v) => now - new Date(v.created_at).getTime() < 7 * day);
  const uniqueVisitors = new Set(visits.map((v) => v.visitor_key)).size;

  return (
    <div>
      <PageTitle
        title="Acessos"
        description="Quem visitou o lookbook, quando e de onde veio. Nenhum dado pessoal é guardado."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Visitas (24h)" value={last24h.length} />
        <Stat label="Visitas (7 dias)" value={last7d.length} />
        <Stat label="Total registrado" value={visits.length} />
        <Stat label="Pessoas diferentes" value={uniqueVisitors} />
      </div>

      <div className="mt-6">
      <Card>
        <h2 className="font-serif text-xl text-brand">Últimos acessos</h2>
        {isLoading && <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && visits.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não há acessos registrados. Assim que alguém abrir o site, ele aparece aqui.
          </p>
        )}
        {visits.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-normal">Quando</th>
                  <th className="py-2 pr-4 font-normal">Página</th>
                  <th className="py-2 pr-4 font-normal">Aparelho</th>
                  <th className="py-2 pr-4 font-normal">Veio de</th>
                  <th className="py-2 pr-4 font-normal">Região</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 200).map((visit) => (
                  <tr key={visit.id} className="border-t border-border">
                    <td className="py-2 pr-4 text-muted-foreground">{fmt(visit.created_at)}</td>
                    <td className="py-2 pr-4">{visit.path}</td>
                    <td className="py-2 pr-4">{visit.device}</td>
                    <td className="max-w-[220px] truncate py-2 pr-4 text-muted-foreground">
                      {visit.referrer}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{visit.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}

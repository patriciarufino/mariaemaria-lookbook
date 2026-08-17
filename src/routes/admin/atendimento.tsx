import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Card, PageTitle } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/atendimento")({
  head: () => ({
    meta: [
      { title: "Atendimento — Maria e Maria" },
      { name: "description", content: "Cliques e contatos gerados pelo lookbook." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Atendimento — Maria e Maria" },
      { property: "og:description", content: "Conversões do lookbook por consultora e por look." },
    ],
  }),
  component: AtendimentoAdmin,
});

type Contact = {
  id: string;
  event_type: string;
  look_id: string | null;
  look_reference: string;
  consultant_id: string | null;
  consultant_name: string;
  created_at: string;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl text-brand">{value}</p>
    </Card>
  );
}

function countBy(list: Contact[], key: (item: Contact) => string) {
  const map = new Map<string, number>();
  for (const item of list) {
    const k = key(item) || "—";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function AtendimentoAdmin() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("look_contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data as Contact[];
    },
  });

  const clicks = events.filter((e) => e.event_type === "click");
  const contacts = events.filter((e) => e.event_type === "contact");

  const byConsultant = countBy(contacts, (e) => e.consultant_name);
  const byLookClicks = countBy(clicks, (e) => e.look_reference);
  const byLookContacts = new Map(countBy(contacts, (e) => e.look_reference));

  return (
    <div>
      <PageTitle
        title="Atendimento"
        description="Somente números reais registrados pelo lookbook."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Cliques em “Quero esse look”" value={clicks.length} />
        <Stat label="Contatos gerados" value={contacts.length} />
        <Stat
          label="Conversão"
          value={clicks.length ? `${Math.round((contacts.length / clicks.length) * 100)}%` : "—"}
        />
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Contatos por consultora
          </p>
          {byConsultant.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {byConsultant.map(([name, total]) => (
                <li key={name} className="flex justify-between border-b border-border pb-2">
                  <span className="text-foreground">{name}</span>
                  <span className="text-muted-foreground">{total}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum contato registrado ainda.</p>
          )}
        </Card>

        <Card>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Looks mais solicitados
          </p>
          {byLookClicks.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {byLookClicks.map(([reference, total]) => (
                <li key={reference} className="flex justify-between border-b border-border pb-2">
                  <span className="text-foreground">{reference}</span>
                  <span className="text-muted-foreground">
                    {total} cliques · {byLookContacts.get(reference) ?? 0} contatos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum clique registrado ainda.</p>
          )}
        </Card>
      </div>

      <div className="mt-8">
      <Card>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Últimos encaminhamentos
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-2">Quando</th>
                  <th className="py-2">Look</th>
                  <th className="py-2">Consultora</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 50).map((event) => (
                  <tr key={event.id} className="border-t border-border">
                    <td className="py-2 text-muted-foreground">
                      {new Date(event.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2">{event.look_reference}</td>
                    <td className="py-2">{event.consultant_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}

import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/rich-text";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Painel", exact: true },
  { to: "/admin/looks", label: "Looks" },
  { to: "/admin/textos", label: "Textos" },
  { to: "/admin/secoes", label: "Seções" },
  { to: "/admin/whatsapp", label: "Botão do look" },
  { to: "/admin/consultoras", label: "Consultoras" },
  { to: "/admin/atendimento", label: "Atendimento" },
  { to: "/admin/acessos", label: "Acessos" },
  { to: "/admin/administradores", label: "Administradores" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Brand className="font-serif text-[0.7rem] tracking-[0.18em] text-brand" />
          <div className="flex items-center gap-5 text-xs">
            <Link to="/" className="text-muted-foreground hover:opacity-60">
              Ver site
            </Link>
            <button onClick={signOut} className="text-muted-foreground hover:opacity-60">
              Sair
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1200px] flex-wrap gap-6 px-6 pb-3 text-[0.7rem] uppercase tracking-[0.22em]">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: "exact" in link }}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="pb-1 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

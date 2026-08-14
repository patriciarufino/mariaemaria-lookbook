import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { registerLogin } from "@/lib/admin.functions";
import { Brand } from "@/components/rich-text";

export const Route = createFileRoute("/auth")({
  ssr: false,
  // `next` preserva um destino interno (ex.: tela de consentimento OAuth).
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    const next = s["next"];
    return typeof next === "string" && next.startsWith("/") ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Acesso administrativo — Maria e Maria" },
      { name: "description", content: "Área restrita de administração do Lookbook Maria e Maria." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso administrativo — Maria e Maria" },
      { property: "og:description", content: "Área restrita de administração do Lookbook." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const goAfterLogin = () => {
    if (next) window.location.href = next;
    else void navigate({ to: "/admin", replace: true });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Rota sem renderização no servidor: só montamos o formulário após a hidratação.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goAfterLogin();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    try {
      await registerLogin();
    } catch {
      /* registro de acesso é opcional */
    }
    goAfterLogin();
  }

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-border bg-surface p-10"
      >
        <Brand className="block text-center font-serif text-xl tracking-[0.12em] text-brand" />
        <p className="mt-2 text-center text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
          Painel administrativo
        </p>

        <label className="mt-8 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-ring"
          />
        </label>

        <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-ring"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

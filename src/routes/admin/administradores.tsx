import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { createAdmin, deleteAdmin, listAdmins, updateAdmin } from "@/lib/admin.functions";
import {
  Card,
  PageTitle,
  buttonClass,
  ghostButtonClass,
  inputClass,
  labelClass,
} from "@/components/admin-ui";

export const Route = createFileRoute("/admin/administradores")({
  head: () => ({
    meta: [
      { title: "Administradores — Maria e Maria" },
      { name: "description", content: "Gestão dos acessos administrativos, limitados a três." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administradores — Maria e Maria" },
      { property: "og:description", content: "Gestão dos acessos administrativos." },
    ],
  }),
  component: AdminsPage,
});

function AdminsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { data } = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => listAdmins(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const onError = (e: Error) => toast.error(e.message.replace(/^Error:\s*/, ""));

  const add = useMutation({
    mutationFn: () => createAdmin({ data: form }),
    onSuccess: () => {
      setForm({ name: "", email: "", password: "" });
      refresh();
      toast.success("Administrador criado.");
    },
    onError,
  });

  const edit = useMutation({
    mutationFn: (input: Parameters<typeof updateAdmin>[0] extends never ? never : any) =>
      updateAdmin({ data: input }),
    onSuccess: () => {
      refresh();
      toast.success("Administrador atualizado.");
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAdmin({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Acesso removido.");
    },
    onError,
  });

  const admins = data?.admins ?? [];
  const full = admins.length >= (data?.max ?? 3);

  return (
    <div>
      <PageTitle
        title="Administradores"
        description={`Máximo de 3 acessos. Em uso: ${admins.length} de ${data?.max ?? 3}.`}
      />

      <div className="space-y-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label>
                <span className={labelClass}>Nome</span>
                <input
                  className={`${inputClass} mt-2`}
                  defaultValue={admin.name}
                  onBlur={(e) =>
                    e.target.value !== admin.name &&
                    edit.mutate({ id: admin.id, name: e.target.value })
                  }
                />
              </label>
              <label>
                <span className={labelClass}>E-mail</span>
                <input
                  className={`${inputClass} mt-2`}
                  defaultValue={admin.email}
                  onBlur={(e) =>
                    e.target.value !== admin.email &&
                    edit.mutate({ id: admin.id, email: e.target.value })
                  }
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={ghostButtonClass}
                  onClick={() => {
                    const password = prompt("Nova senha (mínimo 8 caracteres)");
                    if (password) edit.mutate({ id: admin.id, password });
                  }}
                >
                  Senha
                </button>
                {admin.role !== "principal" && (
                  <>
                    <button
                      className={ghostButtonClass}
                      onClick={() => edit.mutate({ id: admin.id, is_active: !admin.is_active })}
                    >
                      {admin.is_active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      className={ghostButtonClass}
                      onClick={() => {
                        if (confirm(`Remover o acesso de ${admin.name}?`)) remove.mutate(admin.id);
                      }}
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {admin.role === "principal" ? "Administrador principal" : "Administrador"} ·{" "}
              {admin.is_active ? "ativo" : "inativo"}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mt-8 text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
          Novo administrador
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label>
            <span className={labelClass}>Nome</span>
            <input
              className={`${inputClass} mt-2`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            <span className={labelClass}>E-mail</span>
            <input
              type="email"
              className={`${inputClass} mt-2`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            <span className={labelClass}>Senha</span>
            <input
              type="text"
              className={`${inputClass} mt-2`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
        </div>
        <button
          className={`${buttonClass} mt-6`}
          disabled={full || add.isPending}
          onClick={() => add.mutate()}
        >
          {full ? "Limite de 3 atingido" : "Criar acesso"}
        </button>
      </Card>
    </div>
  );
}

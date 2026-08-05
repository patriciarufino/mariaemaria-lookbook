import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_ADMINS = 3;

async function assertPrincipal(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("is_principal", {
    _user_id: context.userId,
  });
  if (error || !data) throw new Error("Apenas o administrador principal pode fazer isso.");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!allowed) throw new Error("Acesso negado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);

    const roleByUser = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    return {
      max: MAX_ADMINS,
      admins: (profiles ?? []).map((p) => ({
        ...p,
        role: roleByUser.get(p.id) ?? "admin",
      })),
    };
  });

export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertPrincipal(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) >= MAX_ADMINS) {
      throw new Error("Limite de 3 administradores atingido.");
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Não foi possível criar o acesso.");

    const userId = created.user.id;
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, name: data.name, email: data.email });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Limite de 3 administradores atingido.");
    }

    return { ok: true };
  });

export const updateAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(2).max(80).optional(),
        email: z.string().email().optional(),
        is_active: z.boolean().optional(),
        password: z.string().min(8).max(72).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertPrincipal(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id)
      .maybeSingle();

    if (role?.role === "principal" && data.is_active === false) {
      throw new Error("O administrador principal não pode ser desativado.");
    }

    const patch: { name?: string; email?: string; is_active?: boolean } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.email !== undefined) patch.email = data.email;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
    }


    if (data.email || data.password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, {
        ...(data.email ? { email: data.email } : {}),
        ...(data.password ? { password: data.password } : {}),
      });
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });

export const deleteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPrincipal(context);
    if (data.id === context.userId) throw new Error("Você não pode remover o seu próprio acesso.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id)
      .maybeSingle();
    if (role?.role === "principal") {
      throw new Error("O administrador principal não pode ser removido.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const registerLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", context.userId);
    return { ok: true };
  });

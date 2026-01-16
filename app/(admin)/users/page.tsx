/**
 * Users Management Page - Admin Only
 *
 * Complete user management with create, edit, and role assignment.
 * Follows Admin UI precision design system.
 */

import { Suspense } from "react";
import {
  Users,
  UserPlus,
  MagnifyingGlass,
  Shield,
  ShieldCheck,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { getUsers } from "@/lib/actions/users";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersList } from "./users-list";
import { CreateUserDialog } from "./create-user-dialog";

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { icon: typeof User; color: string; label: string }> = {
    SUPER_ADMIN: {
      icon: ShieldCheck,
      color: "text-violet-700 bg-violet-100",
      label: "Super Admin",
    },
    ADMIN: {
      icon: Shield,
      color: "text-sky-700 bg-sky-100",
      label: "Admin",
    },
    USER: {
      icon: User,
      color: "text-slate-700 bg-slate-100",
      label: "Usuário",
    },
  };

  const { icon: Icon, color, label } = config[role] || config.USER;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" weight="fill" />
      <span>{label}</span>
    </div>
  );
}

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const users = await getUsers();

  // Count by role
  const stats = {
    total: users.length,
    superAdmins: users.filter((u) => u.role === "SUPER_ADMIN").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    users: users.filter((u) => u.role === "USER").length,
    active: users.filter((u) => u.ativo).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-slate-50">
            Gerenciamento de Usuários
          </h1>
          <p className="mt-1 text-muted-foreground dark:text-slate-400">
            Crie, edite e gerencie os usuários do sistema
          </p>
        </div>
        <CreateUserDialog isSuperAdmin={session.role === "SUPER_ADMIN"} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" weight="duotone" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                {stats.total}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" weight="duotone" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                {stats.superAdmins}
              </p>
              <p className="text-xs text-muted-foreground">Super Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" weight="duotone" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                {stats.admins}
              </p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" weight="duotone" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                {stats.active}
              </p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-white/10 overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando...</div>}>
          <UsersList users={users} currentUserId={session.id} isSuperAdmin={session.role === "SUPER_ADMIN"} />
        </Suspense>
      </div>
    </div>
  );
}

export { RoleBadge };

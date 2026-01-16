"use client";

/**
 * Users List Component
 *
 * Client component for displaying and managing users table
 * with edit and delete functionality.
 */

import { useState } from "react";
import {
  DotsThree,
  PencilSimple,
  Key,
  Trash,
  CheckCircle,
  XCircle,
  User,
  Shield,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { deleteUser } from "@/lib/actions/users";

type UserData = {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  role: string;
  cargo: string | null;
  departamento: string | null;
  ativo: boolean;
  createdAt: Date;
  _count: {
    chatSessions: number;
  };
};

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { icon: typeof User; color: string; label: string }> = {
    SUPER_ADMIN: {
      icon: ShieldCheck,
      color: "text-violet-700 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
      label: "Super Admin",
    },
    ADMIN: {
      icon: Shield,
      color: "text-sky-700 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30",
      label: "Admin",
    },
    USER: {
      icon: User,
      color: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
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

interface UsersListProps {
  users: UserData[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

export function UsersList({ users, currentUserId, isSuperAdmin }: UsersListProps) {
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) return;
    
    setIsDeleting(userId);
    try {
      const result = await deleteUser(userId);
      if (result.error) {
        alert(result.error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Matrícula
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conversas
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-white/10">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${!user.ativo ? "opacity-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {user.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.nome}
                        {user.id === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono tabular-nums text-foreground">
                    {user.matricula}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {user.cargo || "—"}
                    </p>
                    {user.departamento && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.departamento}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  {user.ativo ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" weight="fill" />
                      <span className="text-xs font-medium">Ativo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400">
                      <XCircle className="w-4 h-4" weight="fill" />
                      <span className="text-xs font-medium">Inativo</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono tabular-nums text-muted-foreground">
                    {user._count.chatSessions}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <DotsThree className="w-5 h-5" weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        <PencilSimple className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setResetPasswordUser(user)}>
                        <Key className="w-4 h-4 mr-2" />
                        Redefinir Senha
                      </DropdownMenuItem>
                      {isSuperAdmin && user.id !== currentUserId && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-rose-600 focus:text-rose-600"
                            disabled={isDeleting === user.id}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            {isDeleting === user.id ? "Desativando..." : "Desativar"}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
        />
      )}
    </>
  );
}

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
  MagnifyingGlass,
  Eye,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  situacao: string | null;
  createdAt: Date;
  vacationPeriods: {
    diasSaldo: number;
    dataLimite: Date | null;
  }[];
  _count: {
    chatSessions: number;
  };
};

function StatusBadge({ status, isActive }: { status: string | null, isActive: boolean }) {
  if (!isActive) {
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
        Inativo
      </Badge>
    );
  }
  if (status === "Férias") {
    return (
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
        🏖️ Em Férias
      </Badge>
    );
  }
  if (status === "Trabalhando") {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        🟢 Ativo
      </Badge>
    );
  }
  if (status?.includes("Licença") || status?.includes("Auxílio")) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        🩺 {status}
      </Badge>
    );
  }
  return <Badge variant="secondary">{status || "Ativo"}</Badge>;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.matricula.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" ? true :
        statusFilter === "FERIAS" ? u.situacao === "Férias" :
          statusFilter === "ATIVO" ? u.situacao === "Trabalhando" :
            statusFilter === "AFASTADO" ? (u.situacao && u.situacao !== "Férias" && u.situacao !== "Trabalhando") :
              true;

    return matchesSearch && matchesStatus;
  });

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
      <div className="space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 rounded-t-xl">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou matrícula..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === "ALL" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("ATIVO")}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === "ATIVO" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter("FERIAS")}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === "FERIAS" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              Em Férias
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Saldo Férias
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Próx. Vencimento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cargo/Depto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/10">
              {filteredUsers.map((user) => {
                const latestPeriod = user.vacationPeriods[0];
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${!user.ativo ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
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
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-indigo-600 transition-colors">
                            {user.nome}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Mat: {user.matricula}
                          </p>
                        </div>
                      </Link>
                    </td>

                    {/* Situação */}
                    <td className="px-4 py-3">
                      <StatusBadge status={user.situacao} isActive={user.ativo} />
                    </td>

                    {/* Saldo */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono tabular-nums text-foreground">
                        {latestPeriod ? `${latestPeriod.diasSaldo}d` : "—"}
                      </span>
                    </td>

                    {/* Vencimento */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {latestPeriod?.dataLimite ? new Date(latestPeriod.dataLimite).toLocaleDateString("pt-BR") : "—"}
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
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <DotsThree className="w-5 h-5" weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/users/${user.id}`}>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                          </Link>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {
        editingUser && (
          <EditUserDialog
            user={editingUser}
            isSuperAdmin={isSuperAdmin}
            onClose={() => setEditingUser(null)}
          />
        )
      }

      {/* Reset Password Dialog */}
      {
        resetPasswordUser && (
          <ResetPasswordDialog
            user={resetPasswordUser}
            onClose={() => setResetPasswordUser(null)}
          />
        )
      }
    </>
  );
}

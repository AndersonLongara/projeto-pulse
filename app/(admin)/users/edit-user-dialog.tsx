"use client";

/**
 * Edit User Dialog
 *
 * Modal form for editing existing users.
 */

import { useState, useActionState, useEffect } from "react";
import { PencilSimple, X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateUser, type UserActionState } from "@/lib/actions/users";

type UserData = {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  role: string;
  cargo: string | null;
  departamento: string | null;
  ativo: boolean;
};

interface EditUserDialogProps {
  user: UserData;
  isSuperAdmin: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, isSuperAdmin, onClose }: EditUserDialogProps) {
  const [role, setRole] = useState(user.role);
  const [ativo, setAtivo] = useState(user.ativo);
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(
    updateUser,
    {}
  );

  // Close dialog on success
  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilSimple className="w-5 h-5 text-primary" weight="duotone" />
            Editar Usuário
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          {/* Hidden ID */}
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="ativo" value={ativo.toString()} />

          {/* Error Message */}
          {state.error && (
            <div className="p-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800/50">
              {state.error}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              name="nome"
              defaultValue={user.nome}
              required
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              disabled={isPending}
            />
          </div>

          {/* Matrícula */}
          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              name="matricula"
              defaultValue={user.matricula}
              required
              disabled={isPending}
              className="font-mono"
            />
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário *</Label>
            <Select value={role} onValueChange={setRole} disabled={isPending || !isSuperAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário (Colaborador)</SelectItem>
                <SelectItem value="ADMIN">Admin (Torre de Controle)</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            {!isSuperAdmin && (
              <p className="text-xs text-muted-foreground">
                Apenas Super Admin pode alterar tipos de usuário
              </p>
            )}
          </div>

          {/* Cargo e Departamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                name="cargo"
                defaultValue={user.cargo || ""}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                name="departamento"
                defaultValue={user.departamento || ""}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div>
              <Label htmlFor="ativo" className="text-sm font-medium">
                Usuário Ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Usuários inativos não podem fazer login
              </p>
            </div>
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
              disabled={isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

/**
 * Create User Dialog
 *
 * Modal form for creating new users with role assignment.
 */

import { useState, useActionState } from "react";
import { UserPlus, X, Eye, EyeSlash } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createUser, type UserActionState } from "@/lib/actions/users";

interface CreateUserDialogProps {
  isSuperAdmin: boolean;
}

export function CreateUserDialog({ isSuperAdmin }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER");
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(
    createUser,
    {}
  );

  // Close dialog on success
  if (state.success && open) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-5 h-5" weight="duotone" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" weight="duotone" />
            Criar Novo Usuário
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          {/* Error Message */}
          {state.error && (
            <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              {state.error}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="João da Silva"
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
              placeholder="joao@empresa.com"
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
              placeholder="12345"
              required
              disabled={isPending}
              className="font-mono"
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                disabled={isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeSlash className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário *</Label>
            <input type="hidden" name="role" value={role} />
            <Select value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário (Colaborador)</SelectItem>
                {isSuperAdmin && (
                  <>
                    <SelectItem value="ADMIN">Admin (Torre de Controle)</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "USER" && "Acesso ao SuperApp para tirar dúvidas"}
              {role === "ADMIN" && "Acesso à Torre de Controle para monitoramento"}
              {role === "SUPER_ADMIN" && "Acesso total ao sistema"}
            </p>
          </div>

          {/* Cargo (opcional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                name="cargo"
                placeholder="Analista"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                name="departamento"
                placeholder="TI"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

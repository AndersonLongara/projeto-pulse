"use client";

/**
 * Reset Password Dialog
 *
 * Modal for resetting a user's password.
 */

import { useState } from "react";
import { Key, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetUserPassword } from "@/lib/actions/users";

type UserData = {
  id: string;
  nome: string;
  email: string;
};

interface ResetPasswordDialogProps {
  user: UserData;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, onClose }: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsPending(true);
    try {
      const result = await resetUserPassword(user.id, password);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } finally {
      setIsPending(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
  };

  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" weight="fill" />
            </div>
            <h3 className="text-lg font-semibold">Senha Redefinida!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A nova senha foi definida com sucesso
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" weight="duotone" />
            Redefinir Senha
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-foreground font-medium">{user.nome}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              disabled={isPending}
            />
          </div>

          {/* Generate Password Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generatePassword}
            disabled={isPending}
            className="w-full"
          >
            Gerar Senha Aleatória
          </Button>

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
              {isPending ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
